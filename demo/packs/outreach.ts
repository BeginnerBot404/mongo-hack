// Outreach task (docs/OUTREACH-PACK.md, the demo default): an SDR agent works an outbound queue, one first-touch email
// per account, graded by a deterministic QA gate (src/outreach/qa.ts). The harness owns the protocol and rebuilds
// ITSELF from harness_config every account: prompt fragments (rules), context_sources (what the model sees about the
// account), granted_tools (which tools the model can call), required_tools (precheck_email is enforced in code) and
// reasoning (vLLM enable_thinking). The loop is harness-driven so GB10 turns go to writing, not bookkeeping:
//   next_account (harness) -> model: [granted tools] -> submit_email -> (QA fail: one retry)
//   -> harness: log_failure per QA class -> checkpoint (bearings from getQueueStats) -> settings reload / tap / verdicts.
import { ChatOpenAI } from "@langchain/openai";
import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import * as z from "zod";
import { resolve } from "node:path";
import * as T from "../../src/outreach/tools";
import { queueSize } from "../../src/outreach/data";
import { configs } from "../../src/settings";
import { bold, clip, cyan, dim, green, log, magenta, red, yellow, parse, textOf } from "../term";

const AGENT = "waypoints-harness";
const REPO = resolve(import.meta.dir, "../..");
const TAG = "[outreach]";
const OBJECTIVE = "Work the outbound queue: write a first-touch email for every account that passes QA.";
const T_PASS = 80;
const DEFAULT_CONTEXT = ["account_name", "product_catalog"];
const OPTIONAL_TOOLS = ["outline_email", "precheck_email", "lookup_account"] as const;
const MAX_TURNS_PER_ATTEMPT = 5;

export type OutreachOpts = { fresh: boolean; maxSteps: number; dieAfter: number; dieAfterCheckpoint: number; workers: number };

type Shape = {
  version: number;
  status: string;
  fragments: { id: string; title: string; text: string }[];
  ids: string[];
  required: string[];
  context: string[];
  granted: string[];
  reasoning: "on" | "off";
};

const pct = (x: number | null | undefined) => (typeof x === "number" ? `${Math.round(x)}%` : "—");
const draftKey = (subject: string, body: string) => `${String(subject ?? "").trim()}\n${String(body ?? "").trim()}`;
const words = (s: string) => String(s ?? "").trim().split(/\s+/).filter(Boolean).length;

// ---------- model (GB10 only when DEMO_PROVIDER=gb10: its "fallback" is one GB10 retry, never OpenRouter) ----------
function buildModel(reasoning: "on" | "off", tools: StructuredToolInterface[]) {
  const think = reasoning === "on";
  const gb10 = process.env.DEMO_PROVIDER === "gb10";
  const model = gb10 ? process.env.GB10_MODEL || "gb10" : process.env.DEMO_MODEL || "z-ai/glm-5.3-flash";
  const m = new ChatOpenAI({
    model,
    apiKey: gb10 ? process.env.GB10_API_KEY || "none" : process.env.OPENROUTER_API_KEY,
    configuration: { baseURL: gb10 ? process.env.GB10_BASE_URL || "http://localhost:8000/v1" : "https://openrouter.ai/api/v1" },
    maxRetries: 1,
    timeout: think ? 240_000 : 150_000,
    maxTokens: think ? 4000 : 1500,
    temperature: 0.7,
    // vLLM chat-template switch (GLM): reasoning "on" = enable_thinking. modelKwargs is spread into the request body.
    ...(gb10 ? { modelKwargs: { chat_template_kwargs: { enable_thinking: think } } } : {}),
  });
  return { llm: m.bindTools(tools, { parallel_tool_calls: false }), label: `${gb10 ? "gb10" : "openrouter"}:${model} · reasoning ${reasoning}` };
}

export async function runOutreach(o: OutreachOpts): Promise<void> {
  const t0 = Date.now();
  const QUEUE = queueSize();
  const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => typeof e[1] === "string"));
  let shape: Shape | null = null;
  const mcp = new MultiServerMCPClient({
    throwOnLoadError: true,
    prefixToolNameWithServerName: false,
    useStandardContentBlocks: true,
    mcpServers: {
      waypoints: {
        transport: "stdio", command: "bun", args: ["run", "src/server.ts", "--role", "agent"], cwd: REPO, env,
        stderr: process.env.WAYPOINTS_DEBUG ? "inherit" : "ignore",
      },
    },
    beforeToolCall: ({ name, args }) => {
      if (name === "recall" || name === "list_policies" || name === "get_settings") return {};
      const a: Record<string, unknown> = { ...(args as Record<string, unknown>), agent: AGENT };
      if ((name === "checkpoint" || name === "resume") && shape) a.settings_version = shape.version;
      return { args: a };
    },
  });
  const byName = new Map((await mcp.getTools()).map((t) => [t.name, t]));
  const call = async (name: string, args: Record<string, unknown>) => {
    const t = byName.get(name);
    if (!t) return { error: `tool ${name} not available` };
    return parse(textOf(await t.invoke(args)));
  };

  // ---------- objective ----------
  log(bold(cyan(`\n▶ waypoints harness · task=outreach · agent=${AGENT} · ${o.fresh ? "fresh objective" : "resume"} · queue ${QUEUE}`)));
  let objectiveId: string | null = null;
  if (o.fresh) {
    const so = await call("set_objective", {
      objective: `${TAG} ${OBJECTIVE}`,
      task: "outreach",
      bearings: [
        { name: "qa_pass_rate", target: T_PASS, unit: "%", current: 0 },
        { name: "accounts_done", target: QUEUE, unit: "count", current: 0 },
      ],
      waypoints: [
        { title: "First drafts", done_when: "the first accounts are drafted and graded" },
        { title: "Harness adapts", done_when: "QA failures drove at least one kept harness change" },
        { title: "Queue worked", done_when: `all ${QUEUE} accounts done` },
        { title: "Reach end state", done_when: `every account done and first-try pass rate ≥ ${T_PASS}%` },
      ],
      end_state: { description: `Every account in the queue done AND whole-queue first-try QA pass rate ≥ ${T_PASS}%`, bearing: "qa_pass_rate", target: T_PASS },
      agent: AGENT,
    });
    if (so.error) throw new Error(`set_objective: ${so.error}`);
    objectiveId = String(so.objective_id);
    log(`${magenta("→ set_objective".padEnd(15))} ${clip(OBJECTIVE, 90)}  ${dim(objectiveId)}`);
  }
  const resumed = await call("resume", { ...(objectiveId ? { objective_id: objectiveId } : {}), agent: AGENT });
  if (resumed.error) throw new Error(`resume: ${resumed.error} (run with --fresh to start an objective)`);
  objectiveId = String(resumed.objective_id);
  const objText = String(resumed.objective?.objective ?? resumed.objective ?? "");
  if (!objText.includes(TAG)) throw new Error(`latest objective is not an outreach objective ("${clip(objText, 60)}"): run with --fresh`);
  log(bold(`◎ END STATE every account done AND first-try pass rate ≥ ${T_PASS}% — immutable`));

  // ---------- settings -> harness shape ----------
  async function loadShape(): Promise<Shape> {
    const j = await call("get_settings", {});
    if (j.error) throw new Error(`get_settings: ${j.error}`);
    const s = j.settings ?? {};
    return {
      version: j.version, status: j.status,
      fragments: j.fragments ?? [], ids: s.prompt_fragments ?? [],
      required: s.required_tools ?? [],
      context: s.context_sources ?? DEFAULT_CONTEXT,
      granted: s.granted_tools ?? [],
      reasoning: s.reasoning === "on" ? "on" : "off",
    };
  }
  /** What the model can call: submit_email + granted tools (+ precheck_email when required). */
  const visibleTools = (s: Shape) => {
    const extra = OPTIONAL_TOOLS.filter((t) => s.granted.includes(t) || (t === "precheck_email" && s.required.includes("precheck_email")));
    return [...extra, "submit_email"];
  };
  const shapeLine = (s: Shape) =>
    dim(`    tools: ${visibleTools(s).map((t) => (s.required.includes(t) ? `${t}🔒` : t)).join(", ")} · context: ${s.context.join(", ")} · reasoning ${s.reasoning} · rules: ${s.ids.join(", ") || "-"}`);

  const catalog = T.productCatalogText();
  function systemPrompt(s: Shape): string {
    const rules = s.fragments.map((f) => `- ${f.title}: ${f.text}`).join("\n");
    const tools = visibleTools(s);
    return (
      `You are an SDR at Northwind Forge, a (fictional) hardware vendor. You write first-touch cold emails to B2B accounts.\n` +
      (s.context.includes("product_catalog") ? `\nProducts and list prices:\n${catalog}\n` : "") +
      `\nStyle: short, friendly, specific to the account. One email per account: a subject line and a plain-text body, signed "Alex, Northwind Forge".\n` +
      `Work through tools only (${tools.join(", ")}). Do not explain or plan in text: your reply is a tool call. Finish every account with submit_email.\n` +
      (s.required.includes("precheck_email") ? `submit_email is refused unless precheck_email passed on that exact subject and body first.\n` : "") +
      `\n## Harness settings v${s.version} (${s.status}): standing rules\n${rules || "- (none)"}`
    );
  }

  // ---------- per-worker task tools (the model sees only visibleTools; account + objective are filled in by the harness) ----------
  const failCounts: Record<string, number> = {};
  let refusals = 0;
  const logFailure = (cls: string, failure: string, context: string) =>
    call("log_failure", { objective_id: objectiveId, class: cls, failure, context, agent: AGENT });
  const draftSchema = z.object({ subject: z.string().describe("subject line, ≤ 60 characters"), body: z.string().describe("plain-text email body") });
  type W = { id: number; tag: string; current: any; lastSubmit: any; tools: Record<string, StructuredToolInterface>; llm: any; key: string };
  function makeTools(w: W): Record<string, StructuredToolInterface> {
    const t = (fn: (a: any) => Promise<string>, name: string, description: string, schema: z.ZodObject<any>) =>
      tool(fn, { name, description, schema }) as unknown as StructuredToolInterface;
    return {
      outline_email: t(async () => JSON.stringify(await T.outline_email({ account: w.current.account })), "outline_email",
        "A 3-line skeleton for this account's email: a hook from a record fact, the matching product, a CTA question.", z.object({})),
      lookup_account: t(async () => JSON.stringify(await T.lookup_account({ account: w.current.account })), "lookup_account",
        "The full CRM record for this account.", z.object({})),
      precheck_email: t(async (a) => {
        const r: any = await T.precheck_email({ subject: a.subject, body: a.body, account: w.current.account });
        log(dim(`    ${w.tag} ⛨ precheck ${r?.pass ? green("clean") : red((r?.failures ?? []).map((f: any) => f.class).join(", "))}`));
        return JSON.stringify(r);
      }, "precheck_email", "Run the QA gate on a draft WITHOUT submitting it. Returns {pass, failures}.", draftSchema),
      submit_email: t(async (a) => {
        const d = { account: w.current.account, subject: String(a.subject ?? ""), body: String(a.body ?? "") };
        if (shape!.required.includes("precheck_email") && !T.wasPrechecked(d)) {
          refusals++;
          log(yellow(bold(`    ${w.tag} ⛨ submit REFUSED: required_tools has precheck_email, draft not prechecked → log_failure [skipped-precheck]`)));
          await serial(() => logFailure("skipped-precheck", `submit_email refused for ${d.account}: precheck_email was not run on this exact draft.`,
            `account ${d.account}; settings v${shape!.version}; required_tools includes precheck_email`));
          return JSON.stringify({ refused: true, error: "Refused by the harness: call precheck_email on this exact subject and body first, fix any failures, then submit_email the same text." });
        }
        const r: any = await T.submit_email({ objective_id: objectiveId!, ...d, agent: AGENT, worker: w.tag, settings_version: shape!.version } as any);
        if (r.refused) return JSON.stringify({ refused: true, error: r.why });
        w.lastSubmit = { ...r, subject: d.subject, body: d.body };
        return JSON.stringify({ pass: r.pass, failures: r.failures });
      }, "submit_email", "Submit the final email for this account. It is graded by the QA gate; returns {pass, failures}.", draftSchema),
    };
  }

  // ---------- one mutex: checkpoint, log_failure, reloads and verdict prints go through it in order ----------
  let chain: Promise<unknown> = Promise.resolve();
  function serial<X>(fn: () => Promise<X>): Promise<X> {
    const run = chain.then(fn, fn);
    chain = run.catch(() => {});
    return run;
  }

  let system = "";
  let modelLabel = "";
  const shapeKey = (s: Shape) => `${s.reasoning}|${visibleTools(s).join(",")}`;
  function apply(s: Shape) {
    shape = s;
    system = systemPrompt(s);
  }
  /** Each worker rebinds its model when the shared shape (reasoning / visible tools) changed. */
  function llmFor(w: W) {
    const key = shapeKey(shape!);
    if (key !== w.key) {
      const m = buildModel(shape!.reasoning, visibleTools(shape!).map((t) => w.tools[t]!));
      w.llm = m.llm; w.key = key; modelLabel = m.label;
    }
    return w.llm;
  }

  // ---------- verdicts + rebuilds ----------
  const seenOutcomes = new Set<number>();
  for (const d of await configs().find({ outcome: { $ne: null } }, { projection: { version: 1 } }).toArray()) seenOutcomes.add(d.version);
  const AXIS: Record<string, string> = { guardrail: "tools", prompt_fragments: "rules", context_sources: "context", granted_tools: "tools", required_tools: "required", reasoning: "reasoning", sentinel_threshold: "threshold", model: "model" };
  function describeChange(ch: any): string {
    if (!ch) return "no change";
    if (ch.also) return `${describeChange({ ...ch, also: undefined, field: ch.field === "guardrail" ? "granted_tools" : ch.field })}  ${describeChange(ch.also)}`;
    const axis = AXIS[ch.field] ?? ch.field;
    if (Array.isArray(ch.from) && Array.isArray(ch.to)) {
      const add = ch.to.filter((x: string) => !ch.from.includes(x)), rem = ch.from.filter((x: string) => !ch.to.includes(x));
      return [add.length ? `${axis} += ${add.join(", ")}` : "", rem.length ? `${axis} -= ${rem.join(", ")}` : ""].filter(Boolean).join("  ") || `${axis} unchanged`;
    }
    return `${axis} ${ch.from} → ${ch.to}`;
  }
  async function verdicts() {
    const docs = await configs().find({ outcome: { $ne: null } }).sort({ version: 1 }).toArray();
    for (const d of docs) {
      if (seenOutcomes.has(d.version)) continue;
      seenOutcomes.add(d.version);
      const kept = d.outcome!.verdict === "kept";
      log((kept ? green : yellow)(bold(`  ${kept ? "✔ KEPT" : "↩ UNDONE"}  v${d.version} ${describeChange(d.change)}  — ${d.outcome!.why}`)));
    }
  }
  async function reload(why: string): Promise<boolean> {
    const next = await loadShape();
    const prev = shape!;
    if (next.version === prev.version && next.status === prev.status) return false;
    await verdicts();
    if (next.version !== prev.version) {
      const doc: any = await configs().findOne({ version: next.version });
      const rollback = /^Rollback of/.test(String(doc?.reason?.summary ?? ""));
      const watch = doc?.probation?.watch_class as string | undefined;
      const tag = watch ? `  [${watch}${failCounts[watch] ? ` ×${failCounts[watch]}` : ""}]` : "";
      const what = rollback ? `restored v${doc.parent_version}'s settings` : describeChange(doc?.change);
      log(cyan(bold(`  ⟳ HARNESS REBUILT v${prev.version} → v${next.version} (${next.status === "probation" ? "trial" : next.status}): ${what}${tag}`)) + dim(`  [${why}]`));
      log(shapeLine(next));
    }
    apply(next);
    return true;
  }
  async function signals(j: any) {
    if (j?.auto_failure) log(red(`  ✖ server logged [regression] ${j.auto_failure.bearing} ${j.auto_failure.from} → ${j.auto_failure.to}`));
    const tap = j?.tap;
    if (tap) {
      const action = tap.decision?.action ?? tap.action ?? "?";
      const after = tap.settings_version_after != null ? ` (v${tap.settings_version_after})` : "";
      log(red(bold(`  ▲ TAP risk ${Number(tap.risk).toFixed(2)} → ${action}${after}`)));
    }
    if (j?.settings?.reload || tap) await reload(tap ? "tap" : "settings.reload");
    await verdicts();
  }

  // ---------- queue stats / checkpoint ----------
  let stats: T.QueueStats | null = null;
  let checkpoints = 0;
  const readStats = async () => (stats = await T.getQueueStats({ objective_id: objectiveId! }));
  const rollingRate = () => stats?.rolling_pass_rate_10 ?? 0;
  const firstTryRate = () => stats?.first_try_pass_rate ?? 0;
  const doneCount = () => stats?.done ?? 0;
  const total = () => stats?.total || QUEUE;
  const reached = () => !!stats && stats.total > 0 && stats.done >= stats.total && stats.first_try_pass_rate >= T_PASS;
  /** Always called inside serial(). */
  async function checkpoint(summary: string) {
    await readStats();
    const raw = textOf(await byName.get("checkpoint")!.invoke({
      objective_id: objectiveId,
      state_summary: summary,
      open_threads: reached() ? [] : [`${total() - doneCount()} account(s) left; first-try pass rate ${pct(firstTryRate())}`],
      next_action: reached() ? "End state reached." : "next_account",
      bearings_current: [{ name: "qa_pass_rate", current: rollingRate() }, { name: "accounts_done", current: doneCount() }],
      settings_version: shape!.version,
      agent: AGENT,
    }));
    checkpoints++;
    const j = parse(raw);
    if (j.error) log(red(`  checkpoint error: ${clip(String(j.error), 100)}`));
    else await signals(j);
    if (o.dieAfterCheckpoint && checkpoints >= o.dieAfterCheckpoint) {
      log(red(bold(`\n✖ --die-after-checkpoint ${o.dieAfterCheckpoint}: kill -9 self (pid ${process.pid})`)));
      process.kill(process.pid, "SIGKILL");
    }
  }

  // ---------- boot ----------
  const boot = await loadShape();
  apply(boot);
  log(`${magenta("→ get_settings".padEnd(15))} v${boot.version} (${boot.status})`);
  log(shapeLine(boot));
  log(dim(`  ◆ model: ${buildModel(boot.reasoning, []).label} · ${o.workers} worker(s)`));
  await serial(() => signals({ tap: resumed.tap, settings: resumed.settings }));
  await readStats();
  if (doneCount()) log(dim(`  ◆ resuming: ${doneCount()}/${total()} done · first-try ${pct(firstTryRate())}`));

  // ---------- one attempt = one short conversation ending in submit_email ----------
  let turns = 0, submits = 0, toolCalls = 0;
  const secsPerAccount: number[] = [];
  const trajectory: string[] = [];
  let stopReason = "";
  async function attempt(w: W, ctxText: string, retryNote: string): Promise<any | null> {
    w.lastSubmit = null;
    const msgs: BaseMessage[] = [
      new SystemMessage(system),
      new HumanMessage(`${ctxText}\n\n${retryNote || "Write the first-touch email for this account and submit it."}`),
    ];
    const llm = llmFor(w);
    for (let i = 0; i < MAX_TURNS_PER_ATTEMPT && !w.lastSubmit && !stopReason; i++) {
      const ts = Date.now();
      let msg: AIMessage;
      try { msg = (await llm.invoke(msgs)) as AIMessage; }
      catch (e: any) { log(red(`    ${w.tag} model error: ${clip(String(e?.message ?? e), 100)}`)); return null; }
      turns++;
      const secs = (Date.now() - ts) / 1000;
      msgs.push(msg);
      const calls = msg.tool_calls ?? [];
      log(dim(`    ${w.tag} ◆ ${secs.toFixed(1)}s · ${msg.usage_metadata?.output_tokens ?? "?"} tok · v${shape!.version}${calls.length ? ` → ${calls.map((c) => c.name).join(", ")}` : " (no tool call)"}`));
      if (!calls.length) {
        msgs.push(new HumanMessage("Call a tool now. The email must be sent with submit_email (subject, body)."));
        continue;
      }
      for (const tc of calls) {
        const t = w.tools[tc.name];
        const visible = visibleTools(shape!).includes(tc.name);
        const out = t && visible ? String(await t.invoke(tc.args as any)) : JSON.stringify({ error: `tool ${tc.name} is not available to you` });
        toolCalls++;
        msgs.push(new ToolMessage({ content: out, tool_call_id: tc.id ?? "", name: tc.name }));
        if (o.dieAfter && toolCalls >= o.dieAfter) {
          log(red(bold(`\n✖ --die-after ${o.dieAfter}: kill -9 self (pid ${process.pid})`)));
          process.kill(process.pid, "SIGKILL");
        }
        if (w.lastSubmit) break;
      }
    }
    return w.lastSubmit;
  }

  const failLine = (r: any) =>
    (r.failures ?? []).map((f: any) => `${f.class}${f.detail ? dim(` (${clip(String(f.detail), 70)})`) : ""}`).join(red("  ✘ "));
  const viewText = (v: Record<string, string | number>) => Object.entries(v).map(([k, x]) => `${k}: ${x}`).join("\n");

  async function worker(w: W) {
    while (!stopReason) {
      if (submits >= o.maxSteps) { stopReason ||= `--max-steps ${o.maxSteps}`; break; }
      if (reached()) { stopReason ||= "end state"; break; }
      // All workers share one settings object: pick up a new version before every account.
      await serial(() => reload("before next account").catch(() => false));
      const na = await T.next_account({ objective_id: objectiveId!, context_sources: shape!.context, worker: w.tag });
      if (na.done || !na.account) { stopReason ||= "queue empty"; break; }
      const acc = na.account;
      w.current = acc;
      const n = (acc.queue_index ?? 0) + 1;
      const ta = Date.now();
      let prev: any = na.attempt > 1 && na.previous_failures.length ? { failures: na.previous_failures, subject: "", body: "" } : null;
      for (let tryNo = na.attempt; tryNo <= T.MAX_ATTEMPTS && !stopReason; tryNo++) {
        const ctxText = `Account #${n}:\n${viewText(T.accountView(acc, shape!.context))}`;
        const retryNote = !prev ? "" :
          `Your previous draft FAILED QA:\n${(prev.failures ?? []).map((f: any) => `- ${f.class}: ${f.detail}`).join("\n")}\n` +
          (prev.body ? `Previous subject: ${prev.subject}\nPrevious body:\n${prev.body}\n` : "") +
          `\nFix every failure and submit_email again (last try for this account).`;
        const r = await attempt(w, ctxText, retryNote);
        if (!r) { log(yellow(`  ${w.tag} ✉ #${n} ${acc.account}  — no submission`)); break; }
        submits++;
        const secs = Math.round((Date.now() - ta) / 1000);
        const head = `  ${w.tag} ✉ #${String(n).padEnd(3)}${tryNo > 1 ? "↻ " : ""}${bold(String(acc.account).padEnd(18))}`;
        if (r.pass) log(`${head} ${green(bold("✔ pass"))}  ${dim(`${words(r.body)}w · ${secs}s · v${shape!.version}`)}`);
        else log(`${head} ${red(bold("✘ "))}${red(failLine(r))}  ${dim(`${secs}s · v${shape!.version}`)}`);
        // The harness (not the model) logs one failure per QA class, then checkpoints with measured bearings. Serialized.
        await serial(async () => {
          for (const f of r.failures ?? []) {
            failCounts[f.class] = (failCounts[f.class] ?? 0) + 1;
            await logFailure(f.class, `QA ${f.class} on ${acc.account} (attempt ${tryNo}): ${clip(String(f.detail ?? ""), 200)}`,
              `${String(f.detail ?? "")} · account ${acc.account} (${acc.sector}, ${acc.office_location}) · settings v${shape!.version} · context ${shape!.context.join("+")}`);
          }
          await checkpoint(`Account #${n} ${acc.account} attempt ${tryNo}: QA ${r.pass ? "pass" : "fail (" + (r.failures ?? []).map((f: any) => f.class).join(", ") + ")"}.`);
          log(dim(`    pass rate ${pct(rollingRate())} (${Math.min(stats?.submissions ?? submits, 10)}) · first-try ${pct(firstTryRate())} · ${doneCount()}/${total()} done`));
          trajectory.push(pct(rollingRate()));
        });
        if (r.pass || !r.retry_allowed) break;
        prev = r;
      }
      secsPerAccount.push((Date.now() - ta) / 1000);
    }
  }

  const tw = Date.now();
  const workers: W[] = Array.from({ length: Math.max(1, o.workers) }, (_, i) => {
    const w: W = { id: i + 1, tag: `w${i + 1}`, current: null, lastSubmit: null, tools: {}, llm: null, key: "" };
    w.tools = makeTools(w);
    return w;
  });
  await Promise.all(workers.map((w, i) => Bun.sleep(i * 1500).then(() => worker(w))));
  const wall = (Date.now() - tw) / 1000;

  if (shape && (shape as Shape).status === "probation") await serial(() => reload("end of run")).catch(() => false);
  await readStats().catch(() => null);
  await verdicts().catch(() => null);
  await mcp.close().catch(() => {});
  const avg = secsPerAccount.length ? secsPerAccount.reduce((a, b) => a + b, 0) / secsPerAccount.length : 0;
  log(dim(`\n  pass-rate trajectory: ${trajectory.join(" → ") || "-"}`));
  log(dim(`  failures by class: ${Object.entries(failCounts).map(([k, v]) => `${k} ×${v}`).join(", ") || "none"}${refusals ? ` · ${refusals} submit(s) refused (skipped-precheck)` : ""}`));
  log(dim(`  ${secsPerAccount.length} accounts · ${avg.toFixed(1)}s per account per worker · ${(secsPerAccount.length ? wall / secsPerAccount.length : 0).toFixed(1)}s wall per account · ${o.workers} worker(s) · ${turns} model turns · ${submits} submissions · settings v${boot.version} → v${(shape as Shape | null)?.version}`));
  const ok = reached();
  log(ok
    ? green(bold(`■ END STATE REACHED: ${doneCount()}/${total()} done, first-try pass rate ${pct(firstTryRate())} ≥ ${T_PASS}%`))
    : yellow(bold(`■ stopped (${stopReason}): ${doneCount()}/${total()} done, first-try pass rate ${pct(firstTryRate())} (end state ${T_PASS}%)`)) +
      dim(`  · ${Math.round((Date.now() - t0) / 1000)}s`));
  process.exit(ok ? 0 : 1);
}
