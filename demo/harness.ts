// The Waypoints harness: a LangGraph.js coding agent whose memory is the Waypoints MCP server (agent role).
// The harness (not the model) owns the protocol: resume -> get_settings -> system prompt = fixed base prompt +
// enabled fragment texts from harness_config (never model-written) -> work -> checkpoint with settings_version
// after every test run -> on settings.reload: get_settings again and rebuild the prompt -> on tap: act.
//
//   bun run harness                 # resume the latest objective
//   bun run harness --fresh         # new objective (fixture should be reset first)
//   flags: --max-steps N (default 40)  --die-after N (SIGKILL self after N tool calls)
//   env:   DEMO_MODEL=<openrouter slug>   DEMO_PROVIDER=gb10 (GB10_BASE_URL, GB10_MODEL, GB10_API_KEY)
import { ChatOpenAI } from "@langchain/openai";
import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import type { Runnable } from "@langchain/core/runnables";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as z from "zod";
import { resolve, relative, dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { getFragments, SEED_SETTINGS, type Fragment } from "../src/fragments";

const AGENT = "waypoints-harness";
const REPO = resolve(import.meta.dir, "..");
const FIXTURE = join(REPO, "demo", "fixture");
// GLM everywhere. Its skipped checkpoints and corrupt writes are caught by the harness in code, logged as failures
// (skipped-checkpoint / corrupt-write), and the sentinel answers with a gated settings change.
const GLM = "z-ai/glm-5.3-flash";
const DEFAULT_MODEL = GLM;
const TAP_WAIT_MS = Number(process.env.TAP_WAIT_MS ?? 30000);

const OBJECTIVE = {
  objective: "Make every test in demo/fixture/invoice.test.ts pass by fixing bugs in invoice.ts",
  bearings: [{ name: "tests_passing", target: 10, unit: "tests", current: 0 }],
  waypoints: [
    { title: "Baseline", done_when: "bun test has been run and every failing test is listed" },
    { title: "Fix date + time bugs", done_when: "billableDays, hoursFromMinutes and totalHours tests pass" },
    { title: "Fix money + paging bugs", done_when: "taxCents, invoiceTotal and paginate tests pass" },
    { title: "All green", done_when: "all 10 tests pass" },
  ],
  end_state: { description: "All 10 invoice tests pass", bearing: "tests_passing", target: 10 },
};

// ---------- args ----------
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(name);
const num = (name: string, dflt: number) => {
  const i = argv.indexOf(name);
  const v = i >= 0 ? Number(argv[i + 1]) : NaN;
  return Number.isFinite(v) ? v : dflt;
};
const FRESH = flag("--fresh");
const MAX_STEPS = num("--max-steps", 40);
const DIE_AFTER = num("--die-after", 0);

// ---------- terminal log ----------
const c = (code: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = c(2), bold = c(1), red = c(31), green = c(32), yellow = c(33), blue = c(34), magenta = c(35), cyan = c(36);
const clip = (s: string, n = 110) => {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? one.slice(0, n - 1) + "…" : one;
};
const WAYPOINT_TOOLS = new Set(["set_objective", "checkpoint", "resume", "log_decision", "log_failure", "recall", "get_settings", "list_policies"]);
const log = (s: string) => console.log(s);

// ---------- local tools (scoped to demo/fixture) ----------
function scoped(p: string): string {
  const abs = resolve(FIXTURE, p.replace(/^demo\/fixture\//, ""));
  const rel = relative(FIXTURE, abs);
  if (rel.startsWith("..") || rel === "" || resolve(abs) !== abs) throw new Error(`path outside demo/fixture: ${p}`);
  return abs;
}

type TestReport = { pass: number; fail: number; total: number; all_green: boolean; failures: { test: string; detail: string }[] };

export async function runTests(): Promise<TestReport> {
  const proc = Bun.spawn(["bun", "test"], { cwd: FIXTURE, stdout: "pipe", stderr: "pipe", env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  await proc.exited;
  const text = `${out}\n${err}`;
  const pass = Number(text.match(/^\s*(\d+) pass/m)?.[1] ?? 0);
  const fail = Number(text.match(/^\s*(\d+) fail/m)?.[1] ?? 0);
  // bun prints each failure's error block *before* its "(fail) name" line.
  const failures: TestReport["failures"] = [];
  let block: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/);
    if (m) {
      const keep = block.filter((l) => /error:|Expected|Received|^\s*[-+] /.test(l) && !/Expected\s+-|Received\s+\+/.test(l));
      failures.push({ test: m[1]!, detail: keep.map((l) => l.trim()).slice(0, 8).join(" | ") });
      block = [];
    } else if (/^\(pass\)/.test(line)) block = [];
    else block.push(line);
  }
  if (pass + fail === 0) failures.push({ test: "(no tests ran)", detail: clip(text, 600) });
  return { pass, fail, total: pass + fail, all_green: fail === 0 && pass > 0, failures };
}

// The last test report, and whether a checkpoint is owed for it (required_tools enforcement).
let lastReport: TestReport | null = null;
let checkpointOwed = false;
const runTestsTool = tool(async () => {
  lastReport = await runTests();
  checkpointOwed = true;
  return JSON.stringify(lastReport);
}, {
  name: "run_tests",
  description: "Run `bun test` in demo/fixture. Returns JSON {pass, fail, total, all_green, failures:[{test, detail}]}.",
  schema: z.object({}),
});

const readFileTool = tool(async ({ path }) => await Bun.file(scoped(path)).text(), {
  name: "read_file",
  description: "Read a file inside demo/fixture (e.g. 'invoice.ts', 'invoice.test.ts').",
  schema: z.object({ path: z.string().describe("path relative to demo/fixture") }),
});

// Corrupt-write guard (deterministic): the new invoice.ts must parse and keep every export of the original.
const TEMPLATE_EXPORTS = new Bun.Transpiler({ loader: "ts" }).scan(await Bun.file(join(REPO, "demo", "fixture-template", "invoice.ts")).text()).exports;
export function corruption(content: string): string | null {
  let exports: string[];
  try { exports = new Bun.Transpiler({ loader: "ts" }).scan(content).exports; } catch (e: any) { return `does not parse: ${clip(String(e?.message ?? e), 120)}`; }
  const missing = TEMPLATE_EXPORTS.filter((x) => !exports.includes(x));
  return missing.length ? `drops export(s) ${missing.join(", ")}` : null;
}
let onCorruptWrite: (why: string) => Promise<void> = async () => {};
const writeFileTool = tool(
  async ({ path, content }) => {
    const abs = scoped(path);
    if (relative(FIXTURE, abs) !== "invoice.ts") throw new Error("only invoice.ts is writable: fix bugs in invoice.ts");
    const bad = corruption(content);
    if (bad) {
      await onCorruptWrite(bad);
      return `write REJECTED by the harness (corrupt write: new invoice.ts ${bad}); invoice.ts is unchanged. Write the FULL file again.`;
    }
    await mkdir(dirname(abs), { recursive: true });
    await Bun.write(abs, content);
    return `wrote ${relative(FIXTURE, abs)} (${content.length} bytes)`;
  },
  {
    name: "write_file",
    description: "Overwrite demo/fixture/invoice.ts with the FULL new content. Every other file is read-only.",
    schema: z.object({ path: z.string().describe("path relative to demo/fixture"), content: z.string() }),
  },
);

// ---------- one-line summaries for the demo log ----------
function argSummary(name: string, a: Record<string, any>): string {
  switch (name) {
    case "set_objective": return clip(a.objective ?? "", 80);
    case "checkpoint": return `${(a.bearings_current ?? []).map((b: any) => `${b.name}=${b.current}`).join(" ")} next: ${clip(a.next_action ?? "", 60)}`;
    case "log_decision": return clip(a.decision ?? "", 90);
    case "log_failure": return `[${a.class}] ${clip(a.failure ?? "", 80)}`;
    case "recall": return `"${clip(a.query ?? "", 70)}"${a.kind ? ` kind=${a.kind}` : ""}`;
    case "resume": return a.objective_id ? `objective ${a.objective_id}` : "latest objective";
    case "read_file": case "write_file": return a.path ?? "";
    default: return clip(JSON.stringify(a), 80);
  }
}

function policyLines(j: any): string[] {
  return (j.policies ?? []).map((p: any) => {
    const src = `from failure ${String(p.from_failure_id).slice(-6)}${p.from_failure_agent ? `, by ${p.from_failure_agent}` : ""}`;
    return yellow(bold(`    ⚑ POLICY v${p.version} [${p.class}] (${src}): ${clip(String(p.rule), 110)}`));
  });
}

function resultSummary(name: string, raw: string): string {
  let j: any;
  try { j = JSON.parse(raw); } catch { return clip(raw, 100); }
  if (j?.error) return red(clip(String(j.error), 100));
  switch (name) {
    case "run_tests": {
      const s = `${j.pass}/${j.total} passing`;
      return j.all_green ? green(bold(s + " ✔ all green")) : (j.fail ? yellow(s) : s) + dim(`  failing: ${clip(j.failures.map((f: any) => f.test.split(" > ").pop()).join(", "), 80)}`);
    }
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
      for (const t of j.open_threads ?? []) lines.push(dim(`      open: ${clip(String(t), 100)}`));
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

/** MCP tool results come back as a string or as content blocks; flatten to text. */
function textOf(r: unknown): string {
  if (typeof r === "string") return r;
  if (Array.isArray(r)) return r.map(textOf).join("");
  if (r && typeof r === "object") {
    const o = r as any;
    if (typeof o.text === "string") return o.text;
    if (o.content !== undefined) return textOf(o.content);
  }
  return JSON.stringify(r);
}
const parse = (s: string): any => { try { return JSON.parse(s); } catch { return { error: s }; } };

// ---------- settings (harness_config) ----------
type Settings = { version: number; status: string; model: string | null; fragments: Fragment[]; ids: string[]; required: string[]; local: boolean; outcome?: { verdict: string; why: string } | null };

const BASE_PROMPT = (task: string) =>
  `You are the "${AGENT}" coding agent. You work through tools only; be terse between tool calls.\n` +
  `Your agent name for every Waypoints tool is "${AGENT}".\n\n${task}\n\n` +
  `Tool notes: read_file/write_file paths are relative to demo/fixture. write_file needs the FULL file content. ` +
  `run_tests returns JSON pass/fail counts. Treat policies returned by resume as hard rules.\n\n` +
  `CROSS-AGENT MEMORY: if resume returned recent_failures or policies, call recall with kind "failure" for a class ` +
  `before fixing its first bug, then write one line of plain text starting with "MEMORY:" naming the earlier ` +
  `failure (class and id), the agent that logged it, and how it shapes your fix. If recall finds nothing, skip the MEMORY line.`;

function systemPrompt(task: string, s: Settings): string {
  const rules = s.fragments.map((f) => `- [${f.id}] ${f.title}: ${f.text}`).join("\n");
  return `${BASE_PROMPT(task)}\n\n## Harness settings v${s.version} (${s.status}): standing rules\n${rules || "- (none)"}`;
}

// ---------- models ----------
type Llm = Runnable<BaseMessage[], AIMessage>;
function chat(model: string, baseURL: string, apiKey: string) {
  return new ChatOpenAI({ model, apiKey, configuration: { baseURL }, maxRetries: 1, timeout: 90_000, maxTokens: 3000 });
}
function buildLlm(settingsModel: string | null, tools: StructuredToolInterface[]): { llm: Llm; label: string } {
  const orKey = process.env.OPENROUTER_API_KEY!;
  const OR = "https://openrouter.ai/api/v1";
  const gb10 = process.env.DEMO_PROVIDER === "gb10" || (!process.env.DEMO_MODEL && settingsModel === "gb10");
  if (gb10) {
    // GB10 (local vLLM serving GLM) first; OpenRouter's GLM if it is unreachable.
    const m = process.env.GB10_MODEL || "gb10";
    const primary = chat(m, process.env.GB10_BASE_URL || "http://localhost:8000/v1", process.env.GB10_API_KEY || "none").bindTools(tools);
    return { llm: primary.withFallbacks([chat(GLM, OR, orKey).bindTools(tools)]) as unknown as Llm, label: `gb10:${m} → fallback openrouter:${GLM}` };
  }
  const id = process.env.DEMO_MODEL || (settingsModel && settingsModel !== "gb10" ? settingsModel : DEFAULT_MODEL);
  return { llm: chat(id, OR, orKey).bindTools(tools) as unknown as Llm, label: `openrouter:${id}` };
}
/** Which endpoint served a turn, from the response's model name. */
const endpointOf = (name: string) => (process.env.GB10_MODEL && name === process.env.GB10_MODEL ? `gb10:${name}` : `openrouter:${name}`);

// ---------- main ----------
async function main() {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not set (bun loads .env from the repo root)");

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

  const task = await Bun.file(join(REPO, "demo", "task.md")).text();
  const localTools = [runTestsTool, readFileTool, writeFileTool];
  let tools: StructuredToolInterface[] = [];
  let system = new SystemMessage("");
  let model = { llm: null as unknown as Llm, label: "" };
  let modelKey = "";

  function applySettings(s: Settings) {
    settings = s;
    system = new SystemMessage(systemPrompt(task, s));
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

  // Discipline per settings version (this process): test runs, skipped checkpoints, writes, corrupt writes.
  const stats = new Map<number, { tests: number; skipped: number; writes: number; corrupt: number }>();
  const stat = () => {
    const v = settings?.version ?? 0;
    if (!stats.has(v)) stats.set(v, { tests: 0, skipped: 0, writes: 0, corrupt: 0 });
    return stats.get(v)!;
  };
  const disciplineLine = () =>
    "discipline by settings version: " +
    [...stats.entries()].map(([v, x]) => `v${v} ${x.skipped} skipped checkpoint(s)/${x.tests} test runs, ${x.corrupt} corrupt/${x.writes} writes`).join(" → ");
  onCorruptWrite = async (why: string) => {
    stat().corrupt++;
    log(red(bold(`  ⛨ corrupt write rejected (${why}) → log_failure [corrupt_write]`)));
    if (!objectiveId) return;
    await call("log_failure", {
      objective_id: objectiveId,
      failure: `Model's full-file write of invoice.ts was corrupt: ${why}. The harness rejected it.`,
      class: "corrupt_write",
      context: `write_file under settings v${settings?.version}; test run ${testRuns}`,
      agent: AGENT,
    });
  };

  let endStateShown = false;
  function showEndState(j: any) {
    const e = j?.end_state ?? j?.objective?.end_state;
    if (endStateShown || !e) return;
    endStateShown = true;
    log(bold(`◎ END STATE: ${e.description} (${e.bearing} ≥ ${e.target}) — immutable`));
  }

  /** Act on checkpoint/resume output: print the tap, run recall if asked, reload settings if the server says so. */
  async function handleServerSignals(j: any, objectiveId: string | null): Promise<string[]> {
    const notes: string[] = [];
    showEndState(j);
    if (j?.auto_failure) {
      const f = j.auto_failure;
      log(red(bold(`  ✖ server auto-logged [regression]: ${f.bearing} ${f.from} → ${f.to} (failure …${String(f.failure_id).slice(-6)})`)));
    }
    const tap = j?.tap;
    let reloadWanted = j?.settings?.reload === true;
    if (tap) {
      const action = tap.decision?.action ?? tap.action ?? "?";
      const after = tap.settings_version_after != null ? ` (v${tap.settings_version_after}${action === "adjust_settings" ? ", probation" : ""})` : "";
      const comp = tap.components ? dim(`  sim ${tap.components.similarity?.toFixed?.(2)} · recur ${tap.components.recurrence?.toFixed?.(2)} · trend ${tap.components.trend?.toFixed?.(2)}`) : "";
      log(red(bold(`  ▲ TAP risk ${Number(tap.risk).toFixed(2)} → ${action}${after}`)) + comp);
      if (action === "recall" && objectiveId) {
        const q = "regression: a fix broke a test that was passing before";
        log(`${magenta("→ recall       ")} "${q}" kind=failure ${dim("(tap)")}`);
        const r = await call("recall", { query: q, kind: "failure", objective_id: objectiveId });
        log(`  ${dim("↳")} ${resultSummary("recall", JSON.stringify(r))}`);
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

  // Checkpoint as the model sees it: same schema, but the harness reads settings/tap from the response first.
  let objectiveId: string | null = null;
  let lastBearing: number | null = null;
  let checkpointsAfterTests = 0, testRuns = 0, skipped = 0, awaitingCheckpoint = false;
  let doCheckpoint: (args: any) => Promise<string> = async () => "{}";
  let enforced = 0;
  let carryNotes: string[] = [];
  const wrapped = mcpTools.map((t) => {
    if (t.name !== "checkpoint") return t;
    doCheckpoint = async (args: any) => {
        checkpointOwed = false;
        const raw = textOf(await t.invoke(args));
        const j = parse(raw);
        if (j.error) return raw;
        if (args.objective_id) objectiveId = args.objective_id;
        const bearing = (args.bearings_current ?? []).find((b: any) => b.name === "tests_passing")?.current;
        const dropped = typeof bearing === "number" && lastBearing != null && bearing < lastBearing;
        if (dropped) log(red(bold(`  ▼ BEARING DROP tests_passing ${lastBearing} → ${bearing}`)));
        if (typeof bearing === "number") lastBearing = bearing;
        const vBefore = settings?.version;
        const notes = await handleServerSignals(j, objectiveId);
        // A drop means the sentinel is likely scoring right now; wait briefly for its settings change so the
        // model's next edit already runs under the new rules (read-only get_settings poll, then one resume for the tap).
        if (dropped && settings?.version === vBefore && has("get_settings") && settings && !settings.local) {
          log(dim(`  … waiting up to ${TAP_WAIT_MS / 1000}s for the sentinel`));
          const t0 = Date.now();
          while (Date.now() - t0 < TAP_WAIT_MS) {
            await Bun.sleep(1500);
            const g = await call("get_settings", {});
            if (g.version != null && g.version !== settings.version) {
              const r = await call("resume", { objective_id: objectiveId, agent: AGENT, settings_version: settings.version });
              notes.push(...(await handleServerSignals(r, objectiveId)));
              break;
            }
          }
        }
        return notes.length ? JSON.stringify({ ...j, harness_notes: notes }) : raw;
    };
    return tool(doCheckpoint, { name: t.name, description: t.description, schema: t.schema as any }) as unknown as StructuredToolInterface;
  });
  tools = [...wrapped, ...localTools];

  // ----- protocol, harness-side: (set_objective) -> resume -> get_settings -> build prompt -----
  log(bold(cyan(`\n▶ waypoints harness · agent=${AGENT} · ${FRESH ? "fresh objective" : "resume"} · max ${MAX_STEPS} steps`)));
  const boot = await loadSettings();
  if (FRESH) {
    log(`${magenta("→ set_objective".padEnd(15))} ${clip(OBJECTIVE.objective, 80)}`);
    const so = await call("set_objective", { ...OBJECTIVE, agent: AGENT });
    if (so.error) throw new Error(`set_objective: ${so.error}`);
    log(`  ${dim("↳")} objective_id ${so.objective_id}`);
    objectiveId = String(so.objective_id);
  }
  log(`${magenta("→ resume".padEnd(15))} ${objectiveId ? `objective ${objectiveId}` : "latest objective"}`);
  const resumed = await call("resume", { ...(objectiveId ? { objective_id: objectiveId } : {}), agent: AGENT, ...(boot.local ? {} : { settings_version: boot.version }) });
  if (resumed.error) throw new Error(`resume: ${resumed.error} (run with --fresh to start an objective)`);
  objectiveId = String(resumed.objective_id);
  showEndState(resumed);
  if (!endStateShown) showEndState({ end_state: OBJECTIVE.end_state });
  log(`  ${dim("↳")} ${resultSummary("resume", JSON.stringify(resumed))}`);
  lastBearing = (resumed.bearings ?? []).find((b: any) => b.name === "tests_passing")?.current ?? null;
  log(`${magenta("→ get_settings".padEnd(15))} ${boot.local ? dim("(server has no get_settings: local seed)") : ""}`);
  log(`  ${dim("↳")} v${boot.version} (${boot.status}): ${boot.ids.join(", ")}`);
  applySettings(boot);
  const kickNotes = await handleServerSignals({ tap: resumed.tap, settings: resumed.settings }, objectiveId);

  const kickoff =
    (FRESH ? `New objective started (fixture reset to its buggy state). ` : `You are taking over from a harness that was killed mid-task. Continue exactly where it left off. `) +
    `The harness already called resume for you; here is its result:\n${JSON.stringify(resumed)}\n` +
    (kickNotes.length ? `\nHarness notes: ${kickNotes.join(" ")}\n` : "") +
    `\nobjective_id = ${objectiveId}. Go.`;

  let toolCalls = 0, turn = 0;
  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (s) => {
      const extra = carryNotes.length ? [new HumanMessage(`Harness notes: ${carryNotes.join(" ")}`)] : [];
      carryNotes = [];
      const msg = await model.llm.invoke([system, ...s.messages, ...extra]);
      // required_tools: checkpoint -> if the model moves on from a test run without checkpointing, the harness does it.
      const next = msg.tool_calls?.[0]?.name;
      if (checkpointOwed && next !== "checkpoint" && lastReport && settings?.required.includes("checkpoint")) {
        enforced++;
        const r = lastReport;
        stat().skipped++;
        log(yellow(bold(`  ⛨ harness checkpoint (required_tools: checkpoint; model went to ${next ?? "stop"}) tests_passing=${r.pass} → log_failure [skipped_checkpoint]`)));
        await call("log_failure", {
          objective_id: objectiveId,
          failure: `Model skipped the checkpoint after test run ${testRuns} (${r.pass}/${r.total} passing) and went to ${next ?? "stop"}.`,
          class: "skipped_checkpoint",
          context: `test run ${testRuns} under settings v${settings?.version}; harness wrote the checkpoint (required_tools)`,
          agent: AGENT,
        });
        const raw = await doCheckpoint({
          objective_id: objectiveId,
          state_summary: `Harness auto-checkpoint after a test run: ${r.pass}/${r.total} passing (model skipped checkpoint).`,
          open_threads: r.failures.map((f) => f.test),
          next_action: r.all_green ? "Objective complete." : `Fix: ${r.failures[0]?.test ?? "remaining failures"}`,
          bearings_current: [{ name: "tests_passing", current: r.pass }],
          agent: AGENT,
        });
        const j = parse(raw);
        log(`  ${dim("↳")} ${resultSummary("checkpoint", raw)}`);
        if (Array.isArray(j.harness_notes)) carryNotes.push(...j.harness_notes);
      }
      return { messages: [msg] };
    })
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();

  const pending = new Map<string, { name: string }>();
  let green_ = false;
  try {
    const stream = await graph.stream({ messages: [new HumanMessage(kickoff)] as BaseMessage[] }, { streamMode: "updates", recursionLimit: MAX_STEPS * 2 + 1 });
    for await (const update of stream) {
      for (const [node, patch] of Object.entries(update as Record<string, { messages?: BaseMessage[] }>)) {
        for (const msg of patch?.messages ?? []) {
          if (node === "agent" && msg instanceof AIMessage) {
            turn++;
            log(dim(`  ◆ turn ${turn} · ${endpointOf(String(msg.response_metadata?.model_name ?? msg.response_metadata?.model ?? "?"))} · settings v${(settings as Settings | null)?.version}`));
            const text = typeof msg.content === "string" ? msg.content : msg.content.map((p: any) => p.text ?? "").join("");
            if (text.trim()) {
              const mem = text.match(/MEMORY:[^\n]*/);
              if (mem) log(yellow(bold(`  ✦ ${clip(mem[0], 180)}`)));
              const rest = mem ? text.replace(mem[0], "") : text;
              if (rest.trim()) log(dim(`  💭 ${clip(rest, 140)}`));
            }
            for (const tc of msg.tool_calls ?? []) {
              if (awaitingCheckpoint && tc.name !== "checkpoint") skipped++;
              if (tc.name === "checkpoint" && awaitingCheckpoint) checkpointsAfterTests++;
              awaitingCheckpoint = false;
              pending.set(tc.id ?? "", { name: tc.name });
              const color = WAYPOINT_TOOLS.has(tc.name) ? magenta : blue;
              log(`${color("→ " + tc.name.padEnd(13))} ${argSummary(tc.name, tc.args as any)}`);
            }
          } else if (msg instanceof ToolMessage) {
            const name = pending.get(msg.tool_call_id)?.name ?? msg.name ?? "?";
            const raw = typeof msg.content === "string" ? msg.content : msg.content.map((p: any) => p.text ?? "").join("");
            const summary = msg.status === "error" ? red(clip(raw, 110)) : resultSummary(name, raw);
            log(`  ${dim("↳")} ${summary}`);
            if (name === "write_file" && !/REJECTED/.test(raw)) stat().writes++;
            if (name === "run_tests") {
              stat().tests++;
              testRuns++;
              awaitingCheckpoint = true;
              try { green_ = JSON.parse(raw).all_green === true; } catch {}
            }
            toolCalls++;
            if (DIE_AFTER && toolCalls >= DIE_AFTER) {
              log(red(bold(`\n✖ --die-after ${DIE_AFTER}: kill -9 self (pid ${process.pid})`)));
              process.kill(process.pid, "SIGKILL");
            }
          }
        }
      }
    }
  } catch (e: any) {
    if (e?.name === "GraphRecursionError") log(yellow(`\n■ stopped: hit --max-steps ${MAX_STEPS}`));
    else {
      await mcp.close().catch(() => {});
      throw e;
    }
  }
  // Probation needs checkpoints under the new settings. If the task finished first, the harness verifies the suite
  // (a real test run + checkpoint) until the sentinel rules, so the verdict lands on stage instead of next session.
  for (let i = 0; green_ && settings && (settings as Settings).status === "probation" && i < 3; i++) {
    const s0 = settings as Settings;
    const r = await runTests();
    stat().tests++;
    log(`${blue("→ run_tests    ")} ${dim(`(harness verification, v${s0.version} on probation)`)}`);
    log(`  ${dim("↳")} ${resultSummary("run_tests", JSON.stringify(r))}`);
    const raw = await doCheckpoint({
      objective_id: objectiveId,
      state_summary: `Harness verification run while settings v${s0.version} is on probation: ${r.pass}/${r.total} passing.`,
      open_threads: r.failures.map((f) => f.test),
      next_action: r.all_green ? "Objective complete." : `Fix: ${r.failures[0]?.test}`,
      bearings_current: [{ name: "tests_passing", current: r.pass }],
      agent: AGENT,
    });
    log(`${magenta("→ checkpoint   ")} tests_passing=${r.pass}`);
    log(`  ${dim("↳")} ${resultSummary("checkpoint", raw)}`);
    for (let t = 0; t < 8 && (settings as Settings).status === "probation" && (settings as Settings).version === s0.version; t++) {
      await Bun.sleep(1000);
      await reload("probation");
    }
  }
  await mcp.close().catch(() => {});
  if (awaitingCheckpoint) skipped++;
  log(dim(`\n  ${disciplineLine()}`));
  log(dim(`  checkpoint discipline: ${checkpointsAfterTests}/${testRuns} test runs followed by a model checkpoint${skipped ? `, ${skipped} skipped` : ""}${enforced ? `, ${enforced} enforced by the harness` : ""}`));
  log(green_ ? green(bold(`■ done: all tests green after ${toolCalls} tool calls`)) : yellow(`■ finished after ${toolCalls} tool calls (tests not all green)`));
  process.exit(green_ ? 0 : 1);
}

if (import.meta.main) {
  main().catch((e) => {
    const detail = e?.status ? ` ${e.status} ${JSON.stringify(e.error ?? e.message ?? "")}` : "";
    console.error(red(`\n✖${detail} ${e?.stack ?? e}`));
    process.exit(2);
  });
}
