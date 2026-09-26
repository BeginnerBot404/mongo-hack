// The Waypoints harness: a LangGraph.js agent whose memory is the Waypoints MCP server (agent role).
// The harness (not the model) owns the protocol: resume -> get_settings -> system prompt = task pack's base prompt +
// enabled fragment texts from harness_config (never model-written) -> work -> checkpoint with settings_version
// after every measurement -> on settings.reload: get_settings again and rebuild the prompt -> on tap: act.
// Task packs (demo/packs/): `outreach` (default: SDR first-touch emails graded by a deterministic QA gate; its own
// harness-driven loop in packs/outreach.ts), `sales` (deal-qualification rubric) and `invoice`.
//
//   bun run harness                 # resume the latest objective (sales)
//   bun run harness --fresh         # new objective
//   flags: --task outreach|sales|invoice  --max-steps N (outreach: submissions, default 80; sales: proposals, 15; invoice: turns, 40)
//          --die-after N (SIGKILL self after N tool calls)
//          --die-after-checkpoint N (SIGKILL self on the next tool result after the Nth checkpoint: mid-task, repeatable)
//   env:   DEMO_MODEL=<openrouter slug>   DEMO_PROVIDER=gb10 (GB10_BASE_URL, GB10_MODEL, GB10_API_KEY)
import { ChatOpenAI } from "@langchain/openai";
import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { resolve } from "node:path";
import { getFragments, SEED_SETTINGS, type Fragment } from "../src/fragments";
import { bold, clip, cyan, dim, green, log, magenta, blue, red, yellow, parse, textOf } from "./term";
import type { Counters, PackCtx, TaskPack } from "./packs/types";
export { runTests, corruption } from "./packs/invoice";

const AGENT = "waypoints-harness";
const REPO = resolve(import.meta.dir, "..");
// GLM everywhere. Its skipped checkpoints etc. are caught by the harness in code, logged as failures,
// and the sentinel answers with a gated settings change.
const GLM = "z-ai/glm-5.3-flash";
const DEFAULT_MODEL = GLM;
const TAP_WAIT_MS = Number(process.env.TAP_WAIT_MS ?? 30000);

// ---------- args ----------
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const num = (name: string, dflt: number) => {
  const i = argv.indexOf(name);
  const v = i >= 0 ? Number(argv[i + 1]) : NaN;
  return Number.isFinite(v) ? v : dflt;
};
const str = (name: string, dflt: string) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1]! : dflt;
};
const TASK = str("--task", "outreach");
const FRESH = flag("--fresh");
const MAX_STEPS = num("--max-steps", TASK === "sales" ? 15 : TASK === "outreach" ? 80 : 40); // outreach: max submissions
const DIE_AFTER = num("--die-after", 0);
const DIE_AFTER_CHECKPOINT = num("--die-after-checkpoint", 0); // SIGKILL on the first tool result after checkpoint #N

const WAYPOINT_TOOLS = new Set(["set_objective", "checkpoint", "resume", "log_decision", "log_failure", "recall", "get_settings", "list_policies"]);

// ---------- one-line summaries for the demo log ----------
function argSummary(pack: TaskPack, name: string, a: Record<string, any>): string {
  const p = pack.argSummary(name, a);
  if (p != null) return p;
  switch (name) {
    case "set_objective": return clip(a.objective ?? "", 80);
    case "checkpoint": return `${(a.bearings_current ?? []).map((b: any) => `${b.name}=${b.current}`).join(" ")} next: ${clip(a.next_action ?? "", 60)}`;
    case "log_decision": return clip(a.decision ?? "", 90);
    case "log_failure": return `[${a.class}] ${clip(a.failure ?? "", 80)}`;
    case "recall": return `"${clip(a.query ?? "", 70)}"${a.kind ? ` kind=${a.kind}` : ""}`;
    case "resume": return a.objective_id ? `objective ${a.objective_id}` : "latest objective";
    default: return clip(JSON.stringify(a), 80);
  }
}

function policyLines(j: any): string[] {
  return (j.policies ?? []).map((p: any) => {
    const src = `from failure ${String(p.from_failure_id).slice(-6)}${p.from_failure_agent ? `, by ${p.from_failure_agent}` : ""}`;
    return yellow(bold(`    ⚑ POLICY v${p.version} [${p.class}] (${src}): ${clip(String(p.rule), 110)}`));
  });
}

function resultSummary(pack: TaskPack, name: string, raw: string): string {
  const p = pack.resultSummary(name, raw);
  if (p != null) return p;
  let j: any;
  try { j = JSON.parse(raw); } catch { return clip(raw, 100); }
  if (j?.error) return red(clip(String(j.error), 100));
  switch (name) {
    case "resume": {
      if (!j.objective) return yellow("no objective found");
      const b = (j.bearings ?? []).map((x: any) => `${x.name} ${x.current ?? "?"}/${x.target}`).join(" ");
      const who = j.previous_agent ? ` from ${magenta(String(j.previous_agent))}` : "";
      const pol = Array.isArray(j.policies) && j.policies.length ? `  policies: ${j.policies.length}` : "";
      const fails = Array.isArray(j.recent_failures) && j.recent_failures.length
        ? `  failures: ${j.recent_failures.map((f: any) => `${f.class}${f.agent ? "@" + f.agent : ""}`).join(", ")}`
        : "";
      const seq = j.last_checkpoint?.seq != null ? ` (checkpoint #${j.last_checkpoint.seq})` : "";
      const lines = [`resumed${who}${seq}: ${b}${pol}${fails}  next: ${clip(String(j.next_action ?? "-"), 60)}`];
      for (const t of (j.open_threads ?? []).slice(0, 3)) lines.push(dim(`      open: ${clip(String(t), 100)}`));
      lines.push(...policyLines(j)); // Recursive Harnessing beat: rules learned from earlier failures, shown loudly.
      return lines.join("\n");
    }
    case "set_objective": return `objective_id ${j.objective_id}`;
    case "checkpoint": return `checkpoint #${j.seq}${j.settings?.current_version != null ? dim(` · settings v${j.settings.current_version}`) : ""}`;
    case "log_decision": return `decision ${j.decision_id}`;
    case "log_failure": return `failure ${j.failure_id}${j.postmortem ? dim(" · postmortem: " + clip(typeof j.postmortem === "string" ? j.postmortem : JSON.stringify(j.postmortem), 60)) : ""}`;
    case "recall": {
      const hits = Array.isArray(j) ? j : j.hits ?? j.results ?? [];
      const top = hits[0];
      const who = top ? ` · top: ${top.kind ?? "?"} by ${magenta(String(top.agent ?? "?"))} ` : "";
      return `${hits.length} hit(s)${who}${top ? dim(clip(String(top.text ?? JSON.stringify(top)), 80)) : ""}`;
    }
    default: return clip(raw, 100);
  }
}

// ---------- settings (harness_config) ----------
type Settings = { version: number; status: string; model: string | null; fragments: Fragment[]; ids: string[]; required: string[]; local: boolean; outcome?: { verdict: string; why: string } | null };

function systemPrompt(base: string, s: Settings): string {
  const rules = s.fragments.map((f) => `- [${f.id}] ${f.title}: ${f.text}`).join("\n");
  return `${base}\n\n## Harness settings v${s.version} (${s.status}): standing rules\n${rules || "- (none)"}`;
}

// ---------- models ----------
type Llm = Runnable<BaseMessage[], AIMessage>;
function chat(model: string, baseURL: string, apiKey: string, fast = { maxRetries: 1, timeout: 90_000 }) {
  return new ChatOpenAI({ model, apiKey, configuration: { baseURL }, ...fast, maxTokens: 3000 });
}
function buildLlm(settingsModel: string | null, tools: StructuredToolInterface[]): { llm: Llm; label: string } {
  const orKey = process.env.OPENROUTER_API_KEY!;
  const OR = "https://openrouter.ai/api/v1";
  const gb10 = process.env.DEMO_PROVIDER === "gb10";
  if (gb10) {
    // GB10 (local vLLM serving GLM) first; OpenRouter's GLM if it is unreachable.
    const m = process.env.GB10_MODEL || "gb10";
    // GB10 decodes ~30 tok/s: a stuck turn fails over to OpenRouter after 45s instead of 2 x 90s.
    // GB10 only (never OpenRouter): the fallback is one retry on GB10 itself.
    const primary = chat(m, process.env.GB10_BASE_URL || "http://localhost:8000/v1", process.env.GB10_API_KEY || "none", { maxRetries: 1, timeout: 90_000 }).bindTools(tools, { parallel_tool_calls: false });
    return { llm: primary as unknown as Llm, label: `gb10:${m} (retry once on GB10)` };
  }
  // GLM only: a non-GLM settings model (Sonnet/GPT from an old config) is ignored.
  const id = process.env.DEMO_MODEL || (settingsModel && settingsModel.startsWith("z-ai/") ? settingsModel : DEFAULT_MODEL);
  return { llm: chat(id, OR, orKey).bindTools(tools, { parallel_tool_calls: false }) as unknown as Llm, label: `openrouter:${id}` };
}
/** Which endpoint served a turn, from the response's model name. */
const endpointOf = (name: string) => (process.env.GB10_MODEL && name === process.env.GB10_MODEL ? `gb10:${name}` : `openrouter:${name}`);

// ---------- main ----------
async function main() {
  if (!process.env.OPENROUTER_API_KEY && process.env.DEMO_PROVIDER !== "gb10") throw new Error("OPENROUTER_API_KEY is not set (bun loads .env from the repo root)");
  if (TASK === "outreach") {
    const { runOutreach } = await import("./packs/outreach");
    return runOutreach({ fresh: FRESH, maxSteps: MAX_STEPS, dieAfter: DIE_AFTER, dieAfterCheckpoint: DIE_AFTER_CHECKPOINT, workers: num("--workers", 3) });
  }
  if (TASK !== "sales" && TASK !== "invoice") throw new Error(`--task must be outreach, sales or invoice (got ${TASK})`);
  const t0 = Date.now();

  const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => typeof e[1] === "string"));
  let settings: Settings | null = null;
  const mcp = new MultiServerMCPClient({
    throwOnLoadError: true,
    prefixToolNameWithServerName: false,
    useStandardContentBlocks: true,
    mcpServers: {
      waypoints: {
        transport: "stdio",
        command: "bun",
        args: ["run", "src/server.ts", "--role", "agent"],
        cwd: REPO,
        env, // the MCP SDK passes only a minimal env by default; the server needs MONGODB_URI/VOYAGE_API_KEY
        stderr: process.env.WAYPOINTS_DEBUG ? "inherit" : "ignore",
      },
    },
    // Stamp every Waypoints write with this harness's name (whatever the model sends) and the settings version it runs.
    beforeToolCall: ({ name, args }) => {
      if (name === "recall" || name === "list_policies" || name === "get_settings") return {};
      const a: Record<string, unknown> = { ...(args as Record<string, unknown>), agent: AGENT };
      if ((name === "checkpoint" || name === "resume") && settings && !settings.local) a.settings_version = settings.version;
      return { args: a };
    },
  });

  const mcpTools = await mcp.getTools();
  const byName = new Map(mcpTools.map((t) => [t.name, t]));
  const has = (n: string) => byName.has(n);
  const call = async (name: string, args: Record<string, unknown>) => {
    const t = byName.get(name);
    if (!t) return { error: `tool ${name} not available` };
    return parse(textOf(await t.invoke(args)));
  };

  // Discipline per settings version (this process), counters defined by the pack.
  const stats = new Map<number, Counters>();
  const stat = () => {
    const v = settings?.version ?? 0;
    if (!stats.has(v)) stats.set(v, {});
    return stats.get(v)!;
  };
  let objectiveId: string | null = null;
  const ctx: PackCtx = {
    agent: AGENT, objectiveId: () => objectiveId, settingsVersion: () => settings?.version,
    call, stat, fresh: FRESH, maxSteps: MAX_STEPS,
  };
  const pack: TaskPack = TASK === "invoice"
    ? await (await import("./packs/invoice")).invoicePack(ctx)
    : await (await import("./packs/sales")).salesPack(ctx);
  const disciplineLine = () => "discipline by settings version: " + [...stats.entries()].map(([v, x]) => pack.discipline(v, x)).join(" → ");

  // ----- settings: get_settings from the server; old server without it -> local seed v1, never reloads -----
  async function loadSettings(): Promise<Settings> {
    if (!has("get_settings")) {
      const ids = [...SEED_SETTINGS.prompt_fragments];
      return { version: 1, status: "seed (local)", model: SEED_SETTINGS.model, fragments: getFragments(ids), ids, required: [...SEED_SETTINGS.required_tools], local: true };
    }
    const j = await call("get_settings", {});
    if (j.error) throw new Error(`get_settings: ${j.error}`);
    const fragments: Fragment[] = j.fragments ?? [];
    return { version: j.version, status: j.status, model: j.settings?.model ?? null, fragments, ids: j.settings?.prompt_fragments ?? fragments.map((f) => f.id), required: j.settings?.required_tools ?? [], local: false, outcome: j.outcome ?? null };
  }

  let tools: StructuredToolInterface[] = [];
  let system = new SystemMessage("");
  let model = { llm: null as unknown as Llm, label: "" };
  let modelKey = "";

  function applySettings(s: Settings) {
    settings = s;
    system = new SystemMessage(systemPrompt(pack.basePrompt, s));
    const key = `${process.env.DEMO_PROVIDER ?? ""}|${process.env.DEMO_MODEL ?? ""}|${s.model ?? ""}`;
    if (key !== modelKey) {
      model = buildLlm(s.model, tools);
      modelKey = key;
      log(dim(`  ◆ model: ${model.label}`));
    }
  }

  async function reload(reason: string): Promise<string | null> {
    const prev = settings!;
    const next = await loadSettings();
    if (next.version === prev.version && next.status === prev.status) return null;
    if (next.version === prev.version && next.outcome) {
      const kept = next.outcome.verdict === "kept";
      log((kept ? green : red)(bold(`  ${kept ? "✔" : "✖"} PROBATION v${next.version} → ${next.outcome.verdict.toUpperCase()}: ${next.outcome.why}`)) + dim(`  [${reason}]`));
      log(dim(`    ${disciplineLine()}`));
      applySettings(next);
      return `Settings v${next.version} probation verdict: ${next.outcome.verdict} (${next.outcome.why}).`;
    }
    const added = next.ids.filter((id) => !prev.ids.includes(id)).map((id) => `+${id}`);
    const removed = prev.ids.filter((id) => !next.ids.includes(id)).map((id) => `-${id}`);
    const diff = [...added, ...removed].join(" ") || (next.model !== prev.model ? `model ${prev.model} → ${next.model}` : "no fragment change");
    log(cyan(bold(`  ⟳ SETTINGS v${prev.version} → v${next.version} (${next.status}): ${diff}`)) + dim(`  [${reason}]`));
    log(dim(`    ${disciplineLine()}`));
    applySettings(next);
    const newRules = next.fragments.filter((f) => added.includes(`+${f.id}`)).map((f) => `${f.title}: ${f.text}`);
    return `Harness settings reloaded v${prev.version} -> v${next.version} (${next.status}); ${diff}.` +
      (newRules.length ? ` New standing rule(s), now in your system prompt: ${newRules.join(" | ")}` : "");
  }

  let endStateShown = false;
  function showEndState(j: any) {
    const e = j?.end_state ?? j?.objective?.end_state;
    if (endStateShown || !e) return;
    endStateShown = true;
    log(bold(pack.endStateLine(e)));
  }

  /** Act on checkpoint/resume output: print the tap, run recall if asked, reload settings if the server says so. */
  async function handleServerSignals(j: any, objectiveId: string | null): Promise<string[]> {
    const notes: string[] = [];
    showEndState(j);
    if (j?.auto_failure) {
      const f = j.auto_failure;
      log(red(bold(`  ✖ server auto-logged [regression]: ${f.bearing} ${f.from} → ${f.to} (failure …${String(f.failure_id).slice(-6)})`)));
    }
    let tap = j?.tap;
    // A settings tap the harness already applied while waiting after a drop: acknowledged now, not replayed.
    if (tap?.settings_version_after != null && settings && tap.settings_version_after <= settings.version) tap = null;
    let reloadWanted = j?.settings?.reload === true;
    if (tap) {
      const action = tap.decision?.action ?? tap.action ?? "?";
      const after = tap.settings_version_after != null ? ` (v${tap.settings_version_after}${action === "adjust_settings" ? ", probation" : ""})` : "";
      const comp = tap.components ? dim(`  sim ${tap.components.similarity?.toFixed?.(2)} · recur ${tap.components.recurrence?.toFixed?.(2)} · trend ${tap.components.trend?.toFixed?.(2)}`) : "";
      log(red(bold(`  ▲ TAP risk ${Number(tap.risk).toFixed(2)} → ${action}${after}`)) + comp);
      if (action === "recall" && objectiveId) {
        const q = pack.name === "sales" ? "rubric change that overfit or lowered holdout AUC" : "regression: a fix broke a test that was passing before";
        log(`${magenta("→ recall       ")} "${q}" kind=failure ${dim("(tap)")}`);
        const r = await call("recall", { query: q, kind: "failure", objective_id: objectiveId });
        log(`  ${dim("↳")} ${resultSummary(pack, "recall", JSON.stringify(r))}`);
        notes.push(`Sentinel tap (risk ${tap.risk}) asked you to recall. Recall results: ${clip(JSON.stringify(r), 900)}`);
      } else if (action === "adapt" && objectiveId) {
        const pol = await call("list_policies", { objective_id: objectiveId });
        const list = Array.isArray(pol) ? pol : pol.policies ?? [];
        for (const line of policyLines({ policies: list.map((p: any) => ({ ...p, from_failure_id: p.from_failure_id ?? "?" })) })) log(line);
        notes.push(`Sentinel tap (risk ${tap.risk}) adopted a policy. Active policies (hard rules): ${list.map((p: any) => `[${p.class}] ${p.rule}`).join(" | ")}`);
      } else if (action === "rollback" || action === "adjust_settings") reloadWanted = true;
      else notes.push(`Sentinel tap (risk ${tap.risk}): ${action}.`);
    }
    if (reloadWanted) {
      const n = await reload(tap ? "tap" : "settings.reload");
      if (n) notes.push(n);
    }
    return notes;
  }

  // Checkpoint as the model sees it: same schema, but the harness stamps measured bearings and reads settings/tap first.
  let lastBearing: number | null = null;
  let checkpointsSeen = 0;
  let doCheckpoint: (args: any) => Promise<string> = async () => "{}";
  let enforced = 0;
  let carryNotes: string[] = [];
  const wrapped = mcpTools.map((t) => {
    if (t.name !== "checkpoint") return t;
    doCheckpoint = async (args: any) => {
      pack.owed = false;
      // The bearing is measured, not claimed: stamp it from the harness's last real measurement.
      const m = pack.measured();
      if (m) {
        const claimed = (args.bearings_current ?? []).find((b: any) => b.name === pack.bearing)?.current;
        if (claimed !== m[0]!.current && pack.name === "invoice")
          log(dim(`  ⛨ bearing stamped from the last test run: ${pack.bearing}=${m[0]!.current}${claimed == null ? " (model omitted it)" : ` (model said ${claimed})`}`));
        args = { ...args, bearings_current: m };
      }
      const raw = textOf(await t.invoke(args));
      const j = parse(raw);
      if (j.error) return raw;
      checkpointsSeen++;
      if (args.objective_id) objectiveId = args.objective_id;
      const bearing = (args.bearings_current ?? []).find((b: any) => b.name === pack.bearing)?.current;
      const dropped = typeof bearing === "number" && lastBearing != null && bearing < lastBearing;
      if (dropped) log(red(bold(`  ▼ BEARING DROP ${pack.bearing} ${lastBearing} → ${bearing}`)));
      if (typeof bearing === "number") lastBearing = bearing;
      const vBefore = settings?.version;
      const notes = await handleServerSignals(j, objectiveId);
      // A drop means the sentinel is likely scoring right now; wait briefly for its settings change so the
      // model's next step already runs under the new rules (read-only get_settings poll; the tap doc arrives with the next checkpoint).
      if (dropped && settings?.version === vBefore && has("get_settings") && settings && !settings.local) {
        log(dim(`  … waiting up to ${TAP_WAIT_MS / 1000}s for the sentinel`));
        const w0 = Date.now();
        while (Date.now() - w0 < TAP_WAIT_MS) {
          await Bun.sleep(1500);
          const g = await call("get_settings", {});
          if (g.version != null && g.version !== settings.version) {
            log(red(bold(`  ▲ TAP ${clip(String(g.reason?.summary ?? "sentinel"), 90)} → adjust_settings (v${g.version}, ${g.status})`)));
            const n = await reload("tap");
            if (n) notes.push(n);
            break;
          }
        }
      }
      return notes.length ? JSON.stringify({ ...j, harness_notes: notes }) : raw;
    };
    return tool(doCheckpoint, { name: t.name, description: t.description, schema: t.schema as any }) as unknown as StructuredToolInterface;
  });
  tools = [...wrapped, ...pack.tools];

  /** required_tools: checkpoint -> the harness writes the owed checkpoint itself (and logs skipped_checkpoint when `skipped`). */
  async function harnessCheckpoint(why: string, skipped: boolean) {
    const body = pack.autoCheckpoint();
    if (skipped) {
      enforced++;
      stat().skipped = (stat().skipped ?? 0) + 1;
      log(yellow(bold(`  ⛨ harness checkpoint (required_tools: checkpoint; model went to ${why}) → log_failure [skipped_checkpoint]`)));
      await call("log_failure", {
        objective_id: objectiveId,
        failure: `Model skipped the checkpoint after ${pack.skippedWhat()} and went to ${why}.`,
        class: "skipped_checkpoint",
        context: `${pack.skippedWhat()} under settings v${settings?.version}; harness wrote the checkpoint (required_tools)`,
        agent: AGENT,
      });
    } else log(dim(`  ⛨ harness checkpoint (${why})`));
    const raw = await doCheckpoint({ objective_id: objectiveId, ...body, agent: AGENT });
    const j = parse(raw);
    log(`  ${dim("↳")} ${resultSummary(pack, "checkpoint", raw)}`);
    if (Array.isArray(j.harness_notes)) carryNotes.push(...j.harness_notes);
  }

  // ----- protocol, harness-side: (set_objective) -> resume -> get_settings -> build prompt -----
  log(bold(cyan(`\n▶ waypoints harness · task=${pack.name} · agent=${AGENT} · ${FRESH ? "fresh objective" : "resume"} · max ${MAX_STEPS} ${pack.name === "sales" ? "proposals" : "steps"}`)));
  const boot = await loadSettings();
  if (FRESH) {
    log(`${magenta("→ set_objective".padEnd(15))} ${clip(pack.objective.objective, 80)}`);
    const so = await call("set_objective", { ...pack.objective, agent: AGENT });
    if (so.error) throw new Error(`set_objective: ${so.error}`);
    log(`  ${dim("↳")} objective_id ${so.objective_id}`);
    objectiveId = String(so.objective_id);
  }
  log(`${magenta("→ resume".padEnd(15))} ${objectiveId ? `objective ${objectiveId}` : "latest objective"}`);
  const resumed = await call("resume", { ...(objectiveId ? { objective_id: objectiveId } : {}), agent: AGENT, ...(boot.local ? {} : { settings_version: boot.version }) });
  if (resumed.error) throw new Error(`resume: ${resumed.error} (run with --fresh to start an objective)`);
  objectiveId = String(resumed.objective_id);
  const resumedText = `${resumed.objective?.objective ?? resumed.objective ?? ""}`;
  if (pack.name === "sales" && resumedText && !/\[sales\]|B2B deals/i.test(resumedText))
    throw new Error(`latest objective is not a sales objective ("${clip(resumedText, 60)}"): run with --fresh (or --task invoice)`);
  showEndState(resumed);
  if (!endStateShown) showEndState({ end_state: pack.objective.end_state });
  log(`  ${dim("↳")} ${resultSummary(pack, "resume", JSON.stringify(resumed))}`);
  lastBearing = (resumed.bearings ?? []).find((b: any) => b.name === pack.bearing)?.current ?? null;
  log(`${magenta("→ get_settings".padEnd(15))} ${boot.local ? dim("(server has no get_settings: local seed)") : ""}`);
  log(`  ${dim("↳")} v${boot.version} (${boot.status}): ${boot.ids.join(", ")}`);
  applySettings(boot);
  const kickNotes = await handleServerSignals({ tap: resumed.tap, settings: resumed.settings }, objectiveId);
  const packKick = await pack.init(ctx, resumed);

  const kickoff =
    (FRESH ? `New objective started. ` : `You are taking over from a harness that was killed mid-task. Continue exactly where it left off. `) +
    `The harness already called resume for you; here is its result:\n${JSON.stringify(resumed)}\n` +
    (kickNotes.length ? `\nHarness notes: ${kickNotes.join(" ")}\n` : "") + packKick +
    `\nobjective_id = ${objectiveId}. Go.`;

  let toolCalls = 0, turn = 0, nudges = 0, stopReason = "";
  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (s) => {
      const extra = carryNotes.length ? [new HumanMessage(`Harness notes: ${carryNotes.join(" ")}`)] : [];
      carryNotes = [];
      const ts = Date.now();
      const msg = await model.llm.invoke([system, ...s.messages, ...extra]);
      (msg as any).__ms = Date.now() - ts;
      const next = msg.tool_calls?.[0]?.name;
      // required_tools: checkpoint -> if the model moves on from a measurement without checkpointing, the harness does it.
      if (pack.owed && next !== "checkpoint" && pack.measured() && settings?.required.includes("checkpoint")) await harnessCheckpoint(next ?? "stop", true);
      // The model may not stop on its own before the end state (sales): nudge it back to work.
      if (!msg.tool_calls?.length && pack.name === "sales" && !pack.stop() && nudges < 3) {
        nudges++;
        return { messages: [...extra, msg, new HumanMessage("The end state is not reached yet. Continue: form one hypothesis, then propose_rubric.")] };
      }
      return { messages: [...extra, msg] };
    })
    .addNode("tools", new ToolNode(tools))
    // After each tool round: stop at the end state / step budget; write the owed checkpoint first.
    .addNode("gate", async () => {
      if (pack.stop()) {
        if (pack.owed && pack.measured()) await harnessCheckpoint("end of run", false);
        stopReason = "stop";
      }
      return { messages: [] };
    })
    .addEdge(START, "agent")
    .addConditionalEdges("agent", (s) => {
      const lastMsg = s.messages[s.messages.length - 1];
      if (lastMsg instanceof AIMessage && lastMsg.tool_calls?.length) return "tools";
      if (lastMsg instanceof HumanMessage) return "agent";
      return END;
    }, ["tools", "agent", END])
    .addEdge("tools", "gate")
    .addConditionalEdges("gate", () => (stopReason ? END : "agent"), ["agent", END])
    .compile();

  const pending = new Map<string, { name: string }>();
  try {
    const stream = await graph.stream({ messages: [new HumanMessage(kickoff)] as BaseMessage[] }, { streamMode: "updates", recursionLimit: pack.recursionLimit });
    for await (const update of stream) {
      for (const [node, patch] of Object.entries(update as Record<string, { messages?: BaseMessage[] }>)) {
        for (const msg of patch?.messages ?? []) {
          if (node === "agent" && msg instanceof AIMessage) {
            turn++;
            const secs = ((msg as any).__ms ?? 0) / 1000;
            log(dim(`  ◆ turn ${turn} · ${endpointOf(String(msg.response_metadata?.model_name ?? msg.response_metadata?.model ?? "?"))} · ${secs.toFixed(1)}s · settings v${(settings as Settings | null)?.version}`));
            const text = typeof msg.content === "string" ? msg.content : msg.content.map((p: any) => p.text ?? "").join("");
            if (text.trim()) {
              const mem = text.match(/MEMORY:[^\n]*/);
              if (mem) log(yellow(bold(`  ✦ ${clip(mem[0], 180)}`)));
              const rest = mem ? text.replace(mem[0], "") : text;
              const th = rest.trim() ? pack.thought(rest) : null;
              if (th) log(dim(`  💭 ${clip(th, 140)}`));
            }
            for (const tc of msg.tool_calls ?? []) {
              pending.set(tc.id ?? "", { name: tc.name });
              const color = WAYPOINT_TOOLS.has(tc.name) ? magenta : blue;
              log(`${color("→ " + tc.name.padEnd(13))} ${argSummary(pack, tc.name, tc.args as any)}`);
            }
          } else if (msg instanceof ToolMessage) {
            const name = pending.get(msg.tool_call_id)?.name ?? msg.name ?? "?";
            const raw = typeof msg.content === "string" ? msg.content : msg.content.map((p: any) => p.text ?? "").join("");
            const summary = msg.status === "error" ? red(clip(raw, 110)) : resultSummary(pack, name, raw);
            log(`  ${dim("↳")} ${summary}`);
            pack.onToolResult?.(name, raw);
            toolCalls++;
            if ((DIE_AFTER && toolCalls >= DIE_AFTER) || (DIE_AFTER_CHECKPOINT && name !== "checkpoint" && checkpointsSeen >= DIE_AFTER_CHECKPOINT)) {
              log(red(bold(`\n✖ ${DIE_AFTER ? `--die-after ${DIE_AFTER}` : `--die-after-checkpoint ${DIE_AFTER_CHECKPOINT}`}: kill -9 self (pid ${process.pid})`)));
              process.kill(process.pid, "SIGKILL");
            }
          }
        }
      }
    }
  } catch (e: any) {
    if (e?.name === "GraphRecursionError") log(yellow(`\n■ stopped: hit the step limit`));
    else {
      await mcp.close().catch(() => {});
      throw e;
    }
  }
  await pack.afterRun?.(doCheckpoint, reload, () => (settings as Settings).status, () => (settings as Settings).version);
  if (settings && (settings as Settings).status === "probation") await reload("end of run").catch(() => null);
  await mcp.close().catch(() => {});
  const fin = pack.finish();
  log(dim(`\n  ${disciplineLine()}`));
  for (const x of fin.extra ?? []) log(dim(`  ${x}`));
  if (enforced) log(dim(`  ${enforced} checkpoint(s) enforced by the harness`));
  log(fin.line + dim(`  · ${toolCalls} tool calls · ${turn} turns · ${Math.round((Date.now() - t0) / 1000)}s`));
  process.exit(fin.ok ? 0 : 1);
}

if (import.meta.main) {
  main().catch((e) => {
    const detail = e?.status ? ` ${e.status} ${JSON.stringify(e.error ?? e.message ?? "")}` : "";
    console.error(red(`\n✖${detail} ${e?.stack ?? e}`));
    process.exit(2);
  });
}
