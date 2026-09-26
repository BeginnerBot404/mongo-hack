// Sentinel: watches failures + checkpoints on a change stream, scores risk, decides deterministically,
// writes taps, and makes every harness_config/policy write through the surgeon MCP role.
// Run: `bun run sentinel`. Optional advisor: SENTINEL_ADVISOR=jev (typesafe/jev-router on OpenRouter, advisory only).
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ObjectId, type ChangeStream, type Document } from "mongodb";
import { llm, mongo, waypointsDb as db } from "./clients";
import { VECTOR_INDEX } from "./memory";
import { bearingValue, currentConfig, trackedBearingName } from "./settings";

export const WEIGHTS = { similarity: 0.4, recurrence: 0.3, trend: 0.3 };
export const JEV_MODEL = "typesafe/jev-router";

type Action = "recall" | "rollback" | "adjust_settings" | "handoff" | "delegate" | "adapt";

function say(line: string) {
  console.log(`[sentinel ${new Date().toISOString().slice(11, 19)}] ${line}`);
}

// ---- surgeon MCP client ------------------------------------------------------------------------

async function mountSurgeon(): Promise<Client> {
  const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => e[1] !== undefined));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["run", "src/server.ts", "--role", "surgeon"],
    cwd: new URL("..", import.meta.url).pathname,
    env,
    stderr: "inherit",
  });
  const client = new Client({ name: "waypoints-sentinel", version: "0.1.0" });
  await client.connect(transport);
  return client;
}

async function surgeon(client: Client, name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: { ...args, agent: "surgeon" } });
  const text = (res.content as { type: string; text?: string }[])[0]?.text ?? "{}";
  const parsed = JSON.parse(text);
  if (res.isError) throw new Error(`${name}: ${parsed.error ?? text}`);
  return parsed;
}

// ---- risk components ---------------------------------------------------------------------------

async function waitForMemory(sourceId: ObjectId, ms = 10_000): Promise<Document | null> {
  const started = Date.now();
  for (;;) {
    const m = await db.collection("memories").findOne({ source_id: sourceId });
    if (m) return m;
    if (Date.now() - started > ms) return null;
    await Bun.sleep(300);
  }
}

function termCounts(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []) counts.set(w, (counts.get(w) ?? 0) + 1);
  return counts;
}

function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const [w, c] of a) {
    na += c * c;
    dot += c * (b.get(w) ?? 0);
  }
  for (const c of b.values()) nb += c * c;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** Degraded similarity when the failure has no embedding (e.g. Voyage rate-limited): term-frequency cosine. */
async function lexicalSimilarity(failure: Document, memory: Document | null) {
  const text = String(memory?.text ?? `Failure (${failure.class}): ${failure.failure}\nContext: ${failure.context}`);
  const earlier = await db
    .collection("memories")
    .find({ kind: "failure", objective_id: failure.objective_id, source_id: { $ne: failure._id }, created_at: { $lt: failure.created_at } })
    .project({ source_id: 1, text: 1, created_at: 1 })
    .toArray();
  const mine = termCounts(text);
  let best: Document | null = null;
  let bestScore = 0;
  for (const m of earlier) {
    const score = cosine(mine, termCounts(String(m.text ?? "")));
    if (score > bestScore) [best, bestScore] = [{ ...m, score }, score];
  }
  return { score: bestScore, nearest: best, method: "lexical (no embedding)" };
}

async function similarity(failure: Document): Promise<{ score: number; nearest: Document | null; method: string }> {
  const memory = await waitForMemory(failure._id);
  if (!memory?.embedding) return lexicalSimilarity(failure, memory);
  const hits = await db
    .collection("memories")
    .aggregate([
      {
        $vectorSearch: {
          index: VECTOR_INDEX,
          path: "embedding",
          queryVector: memory.embedding,
          numCandidates: 100,
          limit: 10,
          filter: { $and: [{ kind: "failure" }, { objective_id: failure.objective_id }] },
        },
      },
      { $project: { source_id: 1, text: 1, created_at: 1, score: { $meta: "vectorSearchScore" } } },
      { $match: { source_id: { $ne: failure._id }, created_at: { $lt: failure.created_at } } },
      { $sort: { score: -1 } },
      { $limit: 1 },
    ])
    .toArray();
  return { score: hits[0]?.score ?? 0, nearest: hits[0] ?? null, method: "vector" };
}

/** regression = 1, stall (tracked bearing flat for 3 checkpoints) = 0.6, else 0. */
async function trendOf(objectiveId: ObjectId, failureClass?: string): Promise<{ score: number; label: string }> {
  if (failureClass === "regression") return { score: 1, label: "regression" };
  const objective = await db.collection("objectives").findOne({ _id: objectiveId });
  if (!objective) return { score: 0, label: "none" };
  const name = trackedBearingName(objective);
  const last = await db.collection("checkpoints").find({ objective_id: objectiveId }).sort({ seq: -1 }).limit(3).toArray();
  const values = last.map((c) => bearingValue(c, name));
  const [latest, previous] = values;
  if (latest != null && previous != null && latest < previous) return { score: 1, label: "regression" };
  if (values.length === 3 && values.every((v) => v !== null && v === values[0])) return { score: 0.6, label: "stall" };
  return { score: 0, label: "none" };
}

// ---- Jev advisor (optional, advisory only) -----------------------------------------------------

async function askJev(summary: Document): Promise<Document | null> {
  if (process.env.SENTINEL_ADVISOR !== "jev") return null;
  try {
    const res = await llm.chat.completions.create(
      {
        model: JEV_MODEL,
        messages: [
          {
            role: "system",
            content:
              'You advise a coding-agent sentinel. Reply with JSON only: {"tap": boolean, "action": "recall"|"rollback"|"adjust_settings"|"handoff"|"delegate", "probability": number between 0 and 1}.',
          },
          { role: "user", content: JSON.stringify(summary) },
        ],
        max_tokens: 1000, // jev-router may route to a reasoning model; 200 truncated the JSON
      },
      { timeout: 5000, maxRetries: 0 },
    );
    const raw = res.choices[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    let parsed: Document = {};
    try {
      parsed = match ? JSON.parse(match[0]) : {};
    } catch {
      parsed = {};
    }
    return {
      model: JEV_MODEL,
      tap: typeof parsed.tap === "boolean" ? parsed.tap : null,
      action: typeof parsed.action === "string" ? parsed.action : null,
      probability: typeof parsed.probability === "number" ? parsed.probability : null,
      raw,
    };
  } catch (err) {
    say(`jev advisor unavailable (${err instanceof Error ? err.message : String(err)}); continuing without it`);
    return null;
  }
}

// ---- decisions ---------------------------------------------------------------------------------

export class Sentinel {
  private stream: ChangeStream | null = null;
  private queue: Promise<void> = Promise.resolve();
  private stopped = false;
  constructor(private client: Client) {}

  static async create(): Promise<Sentinel> {
    return new Sentinel(await mountSurgeon());
  }

  start() {
    this.stream = db.watch([{ $match: { operationType: "insert", "ns.coll": { $in: ["failures", "checkpoints"] } } }]);
    this.stream.on("change", (change: Document) => {
      const doc = change.fullDocument as Document;
      const coll = change.ns.coll as string;
      this.queue = this.queue
        .then(() => (coll === "failures" ? this.onFailure(doc) : this.onCheckpoint(doc)))
        .catch((err) => say(`error handling ${coll} ${doc?._id}: ${err instanceof Error ? err.message : String(err)}`));
    });
    this.stream.on("error", (err) => {
      if (this.stopped) return;
      say(`change stream error: ${err.message}; restarting in 2s`);
      setTimeout(() => !this.stopped && this.start(), 2000);
    });
    say(`watching ${db.databaseName}.failures + checkpoints (advisor: ${process.env.SENTINEL_ADVISOR === "jev" ? JEV_MODEL : "off"})`);
  }

  async idle() {
    await this.queue;
  }

  async stop() {
    this.stopped = true;
    await this.stream?.close();
    await this.queue;
    await this.client.close();
  }

  private async evaluate(objectiveId: ObjectId, why: string) {
    const r = await surgeon(this.client, "evaluate_probation", { objective_id: objectiveId.toHexString() });
    if (r.evaluated) say(`probation v${r.version} → ${r.verdict.toUpperCase()} (${r.why}) [${why}]`);
  }

  async onCheckpoint(cp: Document) {
    const objective = await db.collection("objectives").findOne({ _id: cp.objective_id });
    const name = objective ? trackedBearingName(objective) : null;
    const prev = await db.collection("checkpoints").findOne({ objective_id: cp.objective_id, seq: { $lt: cp.seq } }, { sort: { seq: -1 } });
    const before = bearingValue(prev, name);
    const after = bearingValue(cp, name);
    const dropped = before !== null && after !== null && after < before;
    // A dropped bearing means the server is about to log a regression failure; judge probation after that lands.
    if (!dropped) await this.evaluate(cp.objective_id, `checkpoint ${cp.seq}`);

    const trend = await trendOf(cp.objective_id);
    if (trend.label !== "stall") return;
    const config = await currentConfig();
    const risk = WEIGHTS.trend * trend.score;
    if (risk < config.settings.sentinel_threshold) {
      say(`checkpoint ${cp.seq}: stall, risk ${risk.toFixed(2)} < ${config.settings.sentinel_threshold} → no tap`);
      return;
    }
    await this.writeTap({
      objective_id: cp.objective_id,
      risk,
      components: { similarity: 0, recurrence: 0, trend: trend.score },
      trigger: { kind: "checkpoint", id: cp._id },
      advisor: await askJev({ trigger: "checkpoint", trend: trend.label, risk }),
      action: "recall",
      settings_version_after: null,
      tap: true,
      hint: `Progress stalled: ${name} flat for 3 checkpoints.`,
    });
  }

  async onFailure(failure: Document) {
    const objectiveId = failure.objective_id as ObjectId;
    const [sim, count, trend, config] = await Promise.all([
      similarity(failure),
      db.collection("failures").countDocuments({ objective_id: objectiveId, class: failure.class }),
      trendOf(objectiveId, failure.class),
      currentConfig(),
    ]);
    const components = {
      similarity: Number(sim.score.toFixed(3)),
      recurrence: Math.min(1, Math.max(0, (count - 1) / 2)),
      trend: trend.score,
    };
    const risk = Number(
      (WEIGHTS.similarity * components.similarity + WEIGHTS.recurrence * components.recurrence + WEIGHTS.trend * components.trend).toFixed(3),
    );
    const threshold = config.settings.sentinel_threshold;
    const tapId = new ObjectId();
    const label = `failure ${failure.class}`;

    if (risk < threshold) {
      await this.writeTap({
        _id: tapId,
        objective_id: objectiveId,
        risk,
        components,
        trigger: { kind: "failure", id: failure._id },
        advisor: null,
        action: "recall",
        settings_version_after: null,
        tap: false,
        hint: null,
        similarity_method: sim.method,
      });
      say(`${label}: risk ${risk.toFixed(2)} (sim ${components.similarity} ${sim.method}, rec ${components.recurrence}, trend ${components.trend}) < ${threshold} → no tap`);
    } else {
      const advisor = await askJev({
        failure: failure.failure,
        class: failure.class,
        occurrences: count,
        trend: trend.label,
        risk,
        components,
        verify_whole_suite_on: config.settings.prompt_fragments.includes("verify_whole_suite"),
      });

      let action: Action = "recall";
      let versionAfter: number | null = null;
      let detail = "";
      if (trend.label === "regression" && !config.settings.prompt_fragments.includes("verify_whole_suite")) {
        const r = await surgeon(this.client, "apply_settings_change", {
          objective_id: objectiveId.toHexString(),
          field: "prompt_fragments",
          value: [...config.settings.prompt_fragments, "verify_whole_suite"],
          reason: { kind: "tap", id: tapId.toHexString(), summary: `Regression (risk ${risk.toFixed(2)}): verify the whole suite after each fix` },
          watch_class: failure.class,
        });
        if (r.applied) {
          action = "adjust_settings";
          versionAfter = r.version;
          detail = ` (v${r.version}, probation)`;
        } else {
          detail = ` (settings gate refused: ${r.gate?.why})`;
        }
      }
      if (action === "recall" && count >= 2) {
        const r = await surgeon(this.client, "adapt", { objective_id: objectiveId.toHexString(), failure_id: failure._id.toHexString() });
        if (r.adopted) {
          action = "adapt";
          detail = ` (policy v${r.version}: ${r.rule})`;
        }
      }
      await this.writeTap({
        _id: tapId,
        objective_id: objectiveId,
        risk,
        components,
        trigger: { kind: "failure", id: failure._id },
        advisor,
        action,
        settings_version_after: versionAfter,
        tap: true,
        hint: sim.nearest ? `Similar earlier failure: ${String(sim.nearest.text).split("\n")[0]}` : null,
        similarity_method: sim.method,
      });
      const jev = advisor ? ` [jev: tap=${advisor.tap} ${advisor.action} p=${advisor.probability}]` : "";
      say(
        `${label}: risk ${risk.toFixed(2)} (sim ${components.similarity} ${sim.method}, rec ${components.recurrence}, trend ${components.trend}) ≥ ${threshold} → TAP ${action}${detail}${jev}`,
      );
    }

    // A regression failure may decide a pending probation (the checkpoint handler deferred it).
    if (failure.class === "regression") await this.evaluate(objectiveId, `after ${label}`);
  }

  private async writeTap(t: {
    _id?: ObjectId;
    objective_id: ObjectId;
    risk: number;
    components: { similarity: number; recurrence: number; trend: number };
    trigger: { kind: "failure" | "checkpoint"; id: ObjectId };
    advisor: Document | null;
    action: Action;
    settings_version_after: number | null;
    tap: boolean;
    hint: string | null;
    similarity_method?: string;
  }) {
    await db.collection("taps").insertOne({
      _id: t._id ?? new ObjectId(),
      objective_id: t.objective_id,
      risk: t.risk,
      components: t.components,
      weights: WEIGHTS,
      trigger: t.trigger,
      advisor: t.advisor,
      decision: { tap: t.tap, action: t.action, decided_by: "deterministic" },
      settings_version_after: t.settings_version_after,
      // Below-threshold scores are recorded for the risk meter but never delivered to the harness.
      status: t.tap ? "open" : "acknowledged",
      hint: t.hint,
      similarity_method: t.similarity_method ?? null,
      created_at: new Date(),
    });
  }
}

if (import.meta.main) {
  const sentinel = await Sentinel.create();
  sentinel.start();
  const shutdown = async () => {
    say("stopping");
    await sentinel.stop();
    await mongo.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
