// Sentinel: watches failures + checkpoints on a change stream, scores risk, decides deterministically,
// writes taps, and makes every harness_config/policy write through the surgeon MCP role.
// Run: `bun run sentinel`. Optional advisor: SENTINEL_ADVISOR=jev (typesafe/jev-router on OpenRouter, advisory only).
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { ObjectId, type ChangeStream, type Document } from "mongodb";
import { llm, mongo, waypointsDb as db } from "./clients";
import { VECTOR_INDEX } from "./memory";
import { GUARDRAIL_MACRO, bearingValue, currentConfig, isOutreach, trackedBearingName, type HarnessConfig } from "./settings";
import type { FragmentId, HarnessSettings } from "./fragments";

export const WEIGHTS = { similarity: 0.4, recurrence: 0.3, trend: 0.3 };
const OUTREACH_SIM_METHOD = "not computed (outreach: QA class map; risk = 0.3·recurrence + 0.3·trend)";
export const JEV_MODEL = "typesafe/jev-router";

type Action = "recall" | "rollback" | "adjust_settings" | "handoff" | "delegate" | "adapt";

/** Deterministic failure class → prompt fragment the surgeon enables (classes are stored lowercase-kebab). Invoice task. */
export const FIX_FOR: Record<string, string> = {
  regression: "verify_whole_suite",
  "skipped-checkpoint": "checkpoint_every_test",
  "corrupt-write": "one_change_per_edit",
};
/** Sales task (docs/SALES-PACK.md). */
export const SALES_FIX_FOR: Record<string, string> = {
  "overfit-segment": "min_support_15",
  regression: "one_change_per_iteration",
  "skipped-checkpoint": "checkpoint_every_eval",
  "invalid-rubric": "check_schema_first",
};
export type TaskKind = "sales" | "invoice" | "outreach";
/** objective.task when set, else inferred from the bearing names (qa_pass_rate → outreach; holdout_auc / a_grade_win_rate → sales). */
export function taskOf(objective: Document | null): TaskKind {
  if (objective?.task === "sales" || objective?.task === "invoice" || objective?.task === "outreach") return objective.task;
  if (isOutreach(objective)) return "outreach";
  const names = [objective?.end_state?.bearing, ...((objective?.bearings as Document[] | undefined) ?? []).map((b) => b?.name)];
  return names.some((n) => n === "holdout_auc" || n === "a_grade_win_rate") ? "sales" : "invoice";
}
export function fixMapFor(objective: Document | null): Record<string, string> {
  return taskOf(objective) === "sales" ? SALES_FIX_FOR : FIX_FOR;
}
// ---- outreach: failure class → architectural change (docs/OUTREACH-PACK.md) --------------------

export type OutreachAxis = "rules" | "context policy" | "guardrail" | "tool access" | "reasoning mode";
export interface PlannedChange {
  field: string; // a settings field, or GUARDRAIL_MACRO ("guardrail": granted_tools + required_tools in one version)
  value: unknown;
  axis: OutreachAxis;
  words: string; // what the harness changes about itself, in plain English
}
export const OUTREACH_QA_CLASSES = [
  "invented-fact",
  "missing-personalization",
  "forbidden-promise",
  "placeholder-left",
  "too-long",
  "missing-cta",
  "missing-subject",
  // rising bar (src/outreach/bar.ts): level 2-4 QA checks
  "generic-opener",
  "subject-not-personal",
  "no-sector-fit",
  "no-specific-number",
  "weak-cta",
] as const;
/** Outreach stall: qa_pass_rate within ±STALL_POINTS for STALL_CHECKPOINTS checkpoints (and below the objective's target). */
export const STALL_POINTS = 2;
/** The objective's current target (the bar it works under): objective.target → end_state.target → 80. */
export function stallTarget(objective: Document | null | undefined): number {
  const t = typeof objective?.target === "number" ? objective.target : objective?.end_state?.target;
  return typeof t === "number" && Number.isFinite(t) ? t : 80;
}
export const STALL_CHECKPOINTS = 4;

export function reasoningOn(s: HarnessSettings): PlannedChange | null {
  return s.reasoning === "on" ? null : { field: "reasoning", value: "on", axis: "reasoning mode", words: "switched reasoning on (thinking mode)" };
}

/** Deterministic plan for a QA failure class under the current settings; null when its fix is already in place. */
export function planOutreachChange(cls: string, s: HarnessSettings): PlannedChange | null {
  switch (cls) {
    case "missing-personalization":
      return s.prompt_fragments.includes("open_with_record_fact")
        ? null
        : { field: "prompt_fragments", value: [...s.prompt_fragments, "open_with_record_fact"], axis: "rules", words: "added the rule: open with a record fact" };
    case "invented-fact":
      return s.context_sources.includes("account_record_full")
        ? null
        : { field: "context_sources", value: [...s.context_sources, "account_record_full"], axis: "context policy", words: "gave itself the full account record as context" };
    case "forbidden-promise":
    case "placeholder-left":
      return s.granted_tools.includes("precheck_email") && s.required_tools.includes("precheck_email")
        ? null
        : { field: GUARDRAIL_MACRO, value: "precheck_email", axis: "guardrail", words: "gave itself a pre-send check tool and made it mandatory" };
    case "too-long":
    case "missing-cta":
    case "missing-subject":
      if (!s.granted_tools.includes("outline_email"))
        return { field: "granted_tools", value: [...s.granted_tools, "outline_email"], axis: "tool access", words: "gave itself an email-outline tool" };
      if (cls === "missing-cta" && !s.prompt_fragments.includes("plain_cta"))
        return { field: "prompt_fragments", value: [...s.prompt_fragments, "plain_cta"], axis: "rules", words: "added the rule: end with a plain 15-minute-call question" };
      return null;
    // ---- rising bar classes ----
    case "generic-opener":
      return addFragment(s, "specific_opener", "added the rule: open with a concrete fact, never a pleasantry");
    case "subject-not-personal":
      return addFragment(s, "personal_subject", "added the rule: put the account's name in the subject line");
    case "no-sector-fit":
      if (!s.context_sources.includes("account_summary") && !s.context_sources.includes("account_record_full"))
        return { field: "context_sources", value: [...s.context_sources, "account_summary"], axis: "context policy", words: "gave itself the account's sector and size as context" };
      return addFragment(s, "sector_fit", "added the rule: tie one product to their sector");
    case "no-specific-number":
      if (!s.context_sources.includes("account_record_full"))
        return { field: "context_sources", value: [...s.context_sources, "account_record_full"], axis: "context policy", words: "gave itself the full account record as context" };
      return addFragment(s, "cite_one_number", "added the rule: cite one exact number from the record");
    case "weak-cta":
      return addFragment(s, "specific_time_cta", "added the rule: propose a specific day and time for the call");
    default:
      return null;
  }
}

function addFragment(s: HarnessSettings, id: FragmentId, words: string): PlannedChange | null {
  return s.prompt_fragments.includes(id) ? null : { field: "prompt_fragments", value: [...s.prompt_fragments, id], axis: "rules", words };
}

/** Continuous bearings (AUC): a drop of at least this much is a regression; within FLAT_EPS for 3 checkpoints is a stall. */
export const REGRESSION_EPS = 0.005;
export const FLAT_EPS = 0.003;
/** Harness-detected protocol violations always score full trend (the harness logs them from code, never the model). */
const PROTOCOL_CLASSES = new Set(["skipped-checkpoint", "corrupt-write", "overfit-segment", "invalid-rubric", ...OUTREACH_QA_CLASSES]);

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
  if (failureClass && PROTOCOL_CLASSES.has(failureClass)) return { score: 1, label: "protocol" };
  const objective = await db.collection("objectives").findOne({ _id: objectiveId });
  if (!objective) return { score: 0, label: "none" };
  const name = trackedBearingName(objective);
  const last = await db.collection("checkpoints").find({ objective_id: objectiveId }).sort({ seq: -1 }).limit(3).toArray();
  const values = last.map((c) => bearingValue(c, name));
  const [latest, previous] = values;
  // Integer bearings (pass counts) behave as before; continuous ones (AUC) ignore noise below the epsilons.
  if (latest != null && previous != null && previous - latest >= REGRESSION_EPS) return { score: 1, label: "regression" };
  if (values.length === 3 && values.every((v) => v !== null && Math.abs(v - values[0]!) <= FLAT_EPS)) return { score: 0.6, label: "stall" };
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
  /** One probation at a time: a fragment change that arrives during probation waits here until the verdict. */
  private queued: { objectiveId: ObjectId; fragment: string; watch_class: string; tapId: ObjectId; risk: number } | null = null;
  /** Outreach: every change that arrives during a probation waits here (FIFO), re-planned against the settings at apply time. */
  private outreachQueue: { objectiveId: ObjectId; watch_class: string; tapId: ObjectId; risk: number; stall?: boolean }[] = [];
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

  /** Apply an outreach change through the surgeon. Returns the new version or null (queued / refused / nothing to do). */
  private async applyOutreach(q: { objectiveId: ObjectId; watch_class: string; tapId: ObjectId; risk: number; stall?: boolean }, config: HarnessConfig, queued = false) {
    const plan = q.stall ? reasoningOn(config.settings) : await this.planFor(q.objectiveId, q.watch_class, config);
    if (!plan) return { version: null as number | null, detail: "" };
    if (config.status === "probation") {
      if (!this.outreachQueue.some((x) => x.watch_class === q.watch_class && x.objectiveId.equals(q.objectiveId)) && config.probation?.watch_class !== q.watch_class)
        this.outreachQueue.push(q);
      return { version: null, detail: ` (${plan.axis}: ${plan.words} — queued, v${config.version} is on probation)` };
    }
    const r = await surgeon(this.client, "apply_settings_change", {
      objective_id: q.objectiveId.toHexString(),
      field: plan.field,
      value: plan.value,
      reason: { kind: "tap", id: q.tapId.toHexString(), summary: `${q.watch_class}${queued ? " (queued)" : ""} → ${plan.axis}: ${plan.words}` },
      watch_class: q.watch_class,
    });
    if (!r.applied) return { version: null, detail: ` (settings gate refused ${plan.field}: ${r.gate?.why})` };
    await db.collection("taps").updateOne(
      { _id: q.tapId },
      { $set: { settings_version_after: r.version, "decision.action": "adjust_settings", axis: plan.axis, change_words: plan.words, status: "open" } },
    );
    return { version: r.version as number, detail: ` (${plan.axis}: ${plan.words} → v${r.version}, probation)` };
  }

  /** The class's own fix, or reasoning on when the class recurs after its fix was kept. */
  private async planFor(objectiveId: ObjectId, cls: string, config: HarnessConfig): Promise<PlannedChange | null> {
    const plan = planOutreachChange(cls, config.settings);
    if (plan) return plan;
    const keptFix = await db.collection("harness_config").findOne({ status: { $in: ["kept", "superseded"] }, "outcome.verdict": "kept", "probation.watch_class": cls });
    return keptFix ? reasoningOn(config.settings) : null;
  }

  private async evaluate(objectiveId: ObjectId, why: string) {
    const r = await surgeon(this.client, "evaluate_probation", { objective_id: objectiveId.toHexString() });
    if (r.evaluated) say(`probation v${r.version} → ${r.verdict.toUpperCase()} (${r.why}) [${why}]`);
    if (r.evaluated && this.outreachQueue.length) {
      while (this.outreachQueue.length) {
        const q = this.outreachQueue.shift()!;
        const a = await this.applyOutreach(q, await currentConfig(), true);
        say(`queued ${q.watch_class}:${a.detail || " nothing left to change"}`);
        if (a.version) break; // one probation at a time
      }
      return;
    }
    if (r.evaluated && this.queued) {
      const q = this.queued;
      this.queued = null;
      const config = await currentConfig();
      if (config.settings.prompt_fragments.includes(q.fragment as never)) return;
      const a = await surgeon(this.client, "apply_settings_change", {
        objective_id: q.objectiveId.toHexString(),
        field: "prompt_fragments",
        value: [...config.settings.prompt_fragments, q.fragment],
        reason: { kind: "tap", id: q.tapId.toHexString(), summary: `${q.watch_class} (risk ${q.risk.toFixed(2)}, queued): enable ${q.fragment}` },
        watch_class: q.watch_class,
      });
      if (a.applied) {
        await db.collection("taps").updateOne({ _id: q.tapId }, { $set: { settings_version_after: a.version, "decision.action": "adjust_settings", status: "open" } });
        say(`queued change applied: +${q.fragment} → v${a.version} (probation)`);
      } else say(`queued change +${q.fragment} refused: ${a.gate?.why}`);
    }
  }

  async onCheckpoint(cp: Document) {
    const objective = await db.collection("objectives").findOne({ _id: cp.objective_id });
    const name = objective ? trackedBearingName(objective) : null;
    if (isOutreach(objective)) return this.onOutreachCheckpoint(cp, name);
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

  /**
   * Outreach failures carry a deterministic QA class, so the failure → axis map needs no nearest-neighbour recall:
   * the similarity component is not computed (recorded as 0) and risk = 0.3·recurrence + 0.3·trend. The failure's
   * memory IS embedded (Voyage) and searchable; it's just not part of the outreach tap score.
   */
  /** Outreach: judge probation on every checkpoint; a flat qa_pass_rate for 4 checkpoints → reasoning on. */
  private async onOutreachCheckpoint(cp: Document, name: string | null) {
    await this.evaluate(cp.objective_id, `checkpoint ${cp.seq}`);
    const last = await db.collection("checkpoints").find({ objective_id: cp.objective_id }).sort({ seq: -1 }).limit(STALL_CHECKPOINTS).toArray();
    const values = last.map((c) => bearingValue(c, name));
    if (values.length < STALL_CHECKPOINTS || values.some((v) => v === null)) return;
    const vs = values as number[];
    const flat = Math.max(...vs) - Math.min(...vs) <= 2 * STALL_POINTS && vs.every((v) => Math.abs(v - vs[0]!) <= STALL_POINTS);
    if (!flat) return;
    const objective = await db.collection("objectives").findOne({ _id: cp.objective_id }, { projection: { target: 1, end_state: 1 } });
    if (vs[0]! >= stallTarget(objective)) return;
    const config = await currentConfig();
    if (config.settings.reasoning === "on") return;
    const tapId = new ObjectId();
    const risk = WEIGHTS.trend * 0.6;
    await this.writeTap({
      _id: tapId,
      objective_id: cp.objective_id,
      risk,
      components: { similarity: 0, recurrence: 0, trend: 0.6 },
      trigger: { kind: "checkpoint", id: cp._id },
      advisor: null,
      action: "recall",
      settings_version_after: null,
      tap: true,
      similarity_method: "not computed (stall: checkpoint trigger, trend only)",
      hint: `Stall: ${name} stayed within ±${STALL_POINTS} points for ${STALL_CHECKPOINTS} checkpoints (${vs.slice().reverse().join(" → ")}).`,
    });
    const a = await this.applyOutreach({ objectiveId: cp.objective_id, watch_class: "stall", tapId, risk, stall: true }, config);
    say(`checkpoint ${cp.seq}: stall (${vs.slice().reverse().join(" → ")}) → TAP${a.detail}`);
  }

  private async onOutreachFailure(failure: Document) {
    const objectiveId = failure.objective_id as ObjectId;
    const [count, config] = await Promise.all([
      db.collection("failures").countDocuments({ objective_id: objectiveId, class: failure.class }),
      currentConfig(),
    ]);
    const qaClass = (OUTREACH_QA_CLASSES as readonly string[]).includes(failure.class);
    const components = { similarity: 0, recurrence: Math.min(1, Math.max(0, (count - 1) / 2)), trend: qaClass || PROTOCOL_CLASSES.has(failure.class) ? 1 : 0 };
    const risk = Number((WEIGHTS.recurrence * components.recurrence + WEIGHTS.trend * components.trend).toFixed(3));
    const tapId = new ObjectId();
    const tap = risk >= config.settings.sentinel_threshold;
    await this.writeTap({
      _id: tapId,
      objective_id: objectiveId,
      risk,
      components,
      trigger: { kind: "failure", id: failure._id },
      advisor: null,
      action: "recall",
      settings_version_after: null,
      tap,
      hint: tap ? `QA failure ${failure.class}: ${String(failure.context ?? failure.failure ?? "").slice(0, 160)}` : null,
      similarity_method: OUTREACH_SIM_METHOD,
    });
    if (!tap) return say(`failure ${failure.class}: risk ${risk} (rec ${components.recurrence}, trend ${components.trend}; sim not computed) < ${config.settings.sentinel_threshold} → no tap`);
    const a = qaClass ? await this.applyOutreach({ objectiveId, watch_class: failure.class, tapId, risk }, config) : { version: null, detail: "" };
    say(`failure ${failure.class}: risk ${risk.toFixed(2)} (rec ${components.recurrence}, trend ${components.trend}; sim not computed) → TAP ${a.version ? "adjust_settings" : "recall"}${a.detail}`);
  }

  async onFailure(failure: Document) {
    const objectiveId = failure.objective_id as ObjectId;
    if (isOutreach(await db.collection("objectives").findOne({ _id: objectiveId }))) return this.onOutreachFailure(failure);
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
      const fixes = fixMapFor(await db.collection("objectives").findOne({ _id: objectiveId }));
      const fragment = fixes[failure.class] ?? (trend.label === "regression" ? fixes.regression! : null);
      if (fragment && !config.settings.prompt_fragments.includes(fragment as never)) {
        if (config.status === "probation") {
          if (!this.queued) this.queued = { objectiveId, fragment, watch_class: failure.class, tapId, risk };
          detail = ` (+${fragment} queued: v${config.version} is on probation, one change at a time)`;
        } else {
          const r = await surgeon(this.client, "apply_settings_change", {
            objective_id: objectiveId.toHexString(),
            field: "prompt_fragments",
            value: [...config.settings.prompt_fragments, fragment],
            reason: { kind: "tap", id: tapId.toHexString(), summary: `${failure.class} (risk ${risk.toFixed(2)}): enable ${fragment}` },
            watch_class: failure.class,
          });
          if (r.applied) {
            action = "adjust_settings";
            versionAfter = r.version;
            detail = ` (+${fragment} → v${r.version}, probation)`;
          } else {
            detail = ` (settings gate refused: ${r.gate?.why})`;
          }
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
        hint: detail.includes("queued") ? detail.trim() : sim.nearest ? `Similar earlier failure: ${String(sim.nearest.text).split("\n")[0]}` : null,
        similarity_method: sim.method,
      });
      const jev = advisor ? ` [jev: tap=${advisor.tap} ${advisor.action} p=${advisor.probability}]` : "";
      say(
        `${label}: risk ${risk.toFixed(2)} (sim ${components.similarity} ${sim.method}, rec ${components.recurrence}, trend ${components.trend}) ≥ ${threshold} → TAP ${action}${detail}${jev}`,
      );
    }

    // A regression failure may decide a pending probation that watches regressions (the checkpoint handler deferred
    // it). A probation watching another class is judged at the next non-dropping checkpoint instead.
    if (failure.class === "regression" && (await currentConfig()).probation?.watch_class === "regression") await this.evaluate(objectiveId, `after ${label}`);
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
