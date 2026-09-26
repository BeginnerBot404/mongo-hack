// Waypoints demo harness #2: a LangGraph.js agent on OpenRouter that mounts the Waypoints MCP server,
// resumes whatever objective the previous harness (Hermes) left behind, and keeps fixing the fixture.
//
//   bun run demo:langgraph             # resume the latest objective
//   bun run demo:langgraph --fresh     # start a new objective (still reads policies via resume)
//   flags: --max-steps N (default 40)  --die-after N (SIGKILL self after N tool calls; fallback demo)
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as z from "zod";
import { resolve, relative, dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";

const AGENT = "langgraph";
const REPO = resolve(import.meta.dir, "..");
const FIXTURE = join(REPO, "demo", "fixture");

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
const ROUTER_CANDIDATES = ["anthropic/claude-sonnet-5", "openai/gpt-5.5"];

// ---------- terminal log ----------
const c = (code: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = c(2), bold = c(1), red = c(31), green = c(32), yellow = c(33), blue = c(34), magenta = c(35), cyan = c(36);
const clip = (s: string, n = 110) => {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? one.slice(0, n - 1) + "…" : one;
};
const WAYPOINT_TOOLS = new Set(["set_objective", "checkpoint", "resume", "log_decision", "log_failure", "recall", "adapt", "list_policies"]);
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

const runTestsTool = tool(async () => JSON.stringify(await runTests()), {
  name: "run_tests",
  description: "Run `bun test` in demo/fixture. Returns JSON {pass, fail, total, all_green, failures:[{test, detail}]}.",
  schema: z.object({}),
});

const readFileTool = tool(async ({ path }) => await Bun.file(scoped(path)).text(), {
  name: "read_file",
  description: "Read a file inside demo/fixture (e.g. 'invoice.ts', 'invoice.test.ts').",
  schema: z.object({ path: z.string().describe("path relative to demo/fixture") }),
});

const writeFileTool = tool(
  async ({ path, content }) => {
    const abs = scoped(path);
    if (/\.test\.ts$/.test(abs)) throw new Error("test files are read-only: fix invoice.ts instead");
    await mkdir(dirname(abs), { recursive: true });
    await Bun.write(abs, content);
    return `wrote ${relative(FIXTURE, abs)} (${content.length} bytes)`;
  },
  {
    name: "write_file",
    description: "Overwrite a file inside demo/fixture with the FULL new content. Test files are read-only.",
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
      const fails = Array.isArray(j.recent_failures) && j.recent_failures.length ? `  failures: ${j.recent_failures.length}` : "";
      return `resumed${who}: ${b}${pol}${fails}  next: ${clip(String(j.next_action ?? "-"), 60)}`;
    }
    case "set_objective": return `objective_id ${j.objective_id}`;
    case "checkpoint": return `checkpoint #${j.seq}`;
    case "log_decision": return `decision ${j.decision_id}`;
    case "log_failure": return `failure ${j.failure_id}${j.postmortem ? dim(" · postmortem: " + clip(typeof j.postmortem === "string" ? j.postmortem : JSON.stringify(j.postmortem), 60)) : ""}`;
    case "recall": {
      const hits = Array.isArray(j) ? j : j.hits ?? j.results ?? [];
      return `${hits.length} hit(s)${hits[0] ? dim(" · " + clip(JSON.stringify(hits[0]), 70)) : ""}`;
    }
    default: return clip(raw, 100);
  }
}

// ---------- main ----------
async function main() {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not set (bun loads .env from the repo root)");

  const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => typeof e[1] === "string"));
  const mcp = new MultiServerMCPClient({
    throwOnLoadError: true,
    prefixToolNameWithServerName: false,
    useStandardContentBlocks: true,
    mcpServers: {
      waypoints: {
        transport: "stdio",
        command: "bun",
        args: ["run", "src/server.ts"],
        cwd: REPO,
        env, // the MCP SDK passes only a minimal env by default; the server needs MONGODB_URI/VOYAGE_API_KEY
        stderr: process.env.WAYPOINTS_DEBUG ? "inherit" : "ignore",
      },
    },
    // Stamp every Waypoints write with this harness's name, whatever the model sends.
    beforeToolCall: ({ name, args }) =>
      name === "recall" || name === "list_policies" ? {} : { args: { ...(args as Record<string, unknown>), agent: AGENT } },
  });

  const mcpTools = await mcp.getTools();
  const tools = [...mcpTools, runTestsTool, readFileTool, writeFileTool];

  const modelId = process.env.DEMO_MODEL || "openrouter/auto";
  const modelKwargs: Record<string, unknown> = { session_id: `waypoints-${AGENT}-${process.pid}` };
  if (modelId === "openrouter/auto") {
    // Keep the auto router, but only let it choose between strong tool-callers (IDs verified on /api/v1/models).
    modelKwargs.plugins = [{ id: "auto-router", allowed_models: ROUTER_CANDIDATES }];
  }
  const llm = new ChatOpenAI({
    model: modelId,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: { baseURL: "https://openrouter.ai/api/v1" },
    modelKwargs,
  }).bindTools(tools);

  const task = await Bun.file(join(REPO, "demo", "task.md")).text();
  const system = new SystemMessage(
    `You are the "${AGENT}" coding agent. You work through tools only; be terse between tool calls.\n` +
      `Your agent name for every Waypoints tool is "${AGENT}".\n\n${task}\n\n` +
      `Tool notes: read_file/write_file paths are relative to demo/fixture. write_file needs the FULL file content. ` +
      `run_tests returns JSON pass/fail counts. Treat policies returned by resume as hard rules.`,
  );
  const kickoff = FRESH
    ? `Start FRESH: call resume first only to read policies and recent failures, then call set_objective for a NEW objective (ignore any previous objective's progress). The fixture was reset to its buggy state.`
    : `You are taking over from another harness that was killed mid-task. Call resume now and continue exactly where it left off.`;

  let toolCalls = 0;
  let lastModel = "";
  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", async (s) => ({ messages: [await llm.invoke(s.messages)] }))
    .addNode("tools", new ToolNode(tools))
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition, ["tools", END])
    .addEdge("tools", "agent")
    .compile();

  log(bold(cyan(`\n▶ waypoints · harness=${AGENT} · model=${modelId}${modelId === "openrouter/auto" ? ` [${ROUTER_CANDIDATES.join(" | ")}]` : ""} · ${FRESH ? "fresh objective" : "resume"} · max ${MAX_STEPS} steps\n`)));

  const pending = new Map<string, { name: string }>();
  let green_ = false;
  try {
    const stream = await graph.stream(
      { messages: [system, new HumanMessage(kickoff)] as BaseMessage[] },
      { streamMode: "updates", recursionLimit: MAX_STEPS * 2 + 1 },
    );
    for await (const update of stream) {
      for (const [node, patch] of Object.entries(update as Record<string, { messages?: BaseMessage[] }>)) {
        for (const msg of patch?.messages ?? []) {
          if (node === "agent" && msg instanceof AIMessage) {
            const chosen = String(msg.response_metadata?.model_name ?? "");
            if (chosen && chosen !== lastModel) {
              log(dim(`  ◆ OpenRouter chose ${bold(chosen)}`));
              lastModel = chosen;
            }
            const text = typeof msg.content === "string" ? msg.content : msg.content.map((p: any) => p.text ?? "").join("");
            if (text.trim()) log(dim(`  💭 ${clip(text, 140)}`));
            for (const tc of msg.tool_calls ?? []) {
              pending.set(tc.id ?? "", { name: tc.name });
              const color = WAYPOINT_TOOLS.has(tc.name) ? magenta : blue;
              log(`${color("→ " + tc.name.padEnd(13))} ${argSummary(tc.name, tc.args as any)}`);
            }
          } else if (msg instanceof ToolMessage) {
            const name = pending.get(msg.tool_call_id)?.name ?? msg.name ?? "?";
            const raw = typeof msg.content === "string" ? msg.content : msg.content.map((p: any) => p.text ?? "").join("");
            const summary = msg.status === "error" ? red(clip(raw, 110)) : resultSummary(name, raw);
            log(`  ${dim("↳")} ${summary}`);
            if (name === "run_tests") {
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
    else throw e;
  } finally {
    await mcp.close().catch(() => {});
  }
  log(green_ ? green(bold(`\n■ done: all tests green after ${toolCalls} tool calls`)) : yellow(`\n■ finished after ${toolCalls} tool calls (tests not all green)`));
  process.exit(green_ ? 0 : 1);
}

if (import.meta.main) {
  main().catch((e) => {
    console.error(red(`\n✖ ${e?.stack ?? e}`));
    process.exit(2);
  });
}
