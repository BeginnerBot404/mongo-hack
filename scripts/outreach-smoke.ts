// Outreach pack smoke (docs/OUTREACH-PACK.md): QA gate self-test, then the loop against a live Atlas smoke DB:
// load → failing draft (invented-fact) → failure logged → in-process sentinel → settings v2 (context_sources +
// account_record_full) on probation → 3 passing submissions → kept. Plus: atomic claims, precheck enforcement,
// the guardrail macro (two fields, one version) and its rollback. No LLM calls. Run: `bun run outreach:smoke`.
process.env.WAYPOINTS_DB = process.env.SMOKE_DB || "waypoints_smoke";
process.env.QUEUE_SIZE = "6";
const DB = process.env.WAYPOINTS_DB;

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { QaAccount } from "../src/outreach/qa";

const root = new URL("..", import.meta.url).pathname;
const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => e[1] !== undefined));
let failures = 0;
function check(ok: boolean, what: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}`);
  if (!ok) failures++;
}

// Dynamic imports only: a static import of anything touching src/clients would bind the real "waypoints" DB
// before WAYPOINTS_DB is set above (ESM hoists static imports).
const { qa } = await import("../src/outreach/qa");

// ---------------- QA gate self-test (pure) ----------------
console.log("== QA gate ==");
const acme: QaAccount = {
  account: "Acme Corporation",
  sector: "technology",
  year_established: 1996,
  revenue_musd: 1100.04,
  employees: 2822,
  office_location: "United States",
  subsidiary_of: "",
};
const clean = {
  subject: "Acme Corporation: GTX Plus Pro for your team",
  body:
    "Hi team,\nAcme Corporation has run its technology business from the United States since 1996. " +
    "With 2,822 people and $1.1B in revenue, teams like yours use our GTX Plus Pro at $5,482 to keep up. " +
    "Would a 15-minute call next week work?\nCheers,\nSam",
};
const r0 = qa(clean, acme);
check(r0.pass, `clean draft passes ${JSON.stringify(r0.failures)}`);
const cases: [string, { subject: string; body: string }][] = [
  ["invented-fact", { ...clean, body: clean.body.replace("$1.1B", "$1.2B") }],
  ["invented-fact", { ...clean, body: clean.body.replace("since 1996", "since 1998") }],
  ["invented-fact", { ...clean, body: clean.body.replace("to keep up.", "to keep up, like your Berlin office.") }],
  ["missing-personalization", { ...clean, body: clean.body.replace("Acme Corporation has run its technology business from the United States since 1996.", "Hope your week is going well.") }],
  ["forbidden-promise", { ...clean, body: clean.body.replace("to keep up.", "with guaranteed uptime.") }],
  ["placeholder-left", { ...clean, body: clean.body.replace("Sam", "[Your Name]") }],
  ["too-long", { ...clean, body: clean.body.replace("to keep up.", "to keep up. " + "We help teams move faster every day. ".repeat(15)) }],
  ["missing-cta", { ...clean, body: clean.body.replace("Would a 15-minute call next week work?", "We look forward to hearing from you soon.") }],
  ["missing-subject", { ...clean, subject: "" }],
  ["missing-subject", { ...clean, subject: "x".repeat(61) }],
];
for (const [cls, d] of cases) {
  const r = qa(d, acme);
  const classes = r.failures.map((f) => f.class);
  check(!r.pass && classes.length === 1 && classes[0] === cls, `${cls} → ${JSON.stringify(r.failures)}`);
}
check(qa({ ...clean, body: clean.body.replace("$1.1B", "$1,100 million") }, acme).pass, "$1,100 million matches revenue 1100.04 (±1%)");

// ---------------- live loop ----------------
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}
console.log(`\n== setup + load (${DB}, QUEUE_SIZE 6) ==`);
for (const args of [["run", "scripts/setup-indexes.ts"], ["run", "scripts/load-accounts.ts", "--reset"]]) {
  const p = Bun.spawnSync([process.execPath, ...args], { cwd: root, env, stdout: "inherit", stderr: "inherit" });
  if (p.exitCode !== 0) throw new Error(`${args[1]} failed`);
}

const { mongo, waypointsDb: db } = await import("../src/clients");
if (db.databaseName !== DB) throw new Error(`refusing to run: bound to ${db.databaseName}, expected ${DB}`);
const { seedConfig, applySettingsChange, rollbackSettings, gateChange } = await import("../src/settings");
const { Sentinel } = await import("../src/sentinel");
const T = await import("../src/outreach/tools");

await db.collection("harness_config").deleteMany({});
await db.collection("harness_config").insertOne(seedConfig());
check((await db.collection("accounts").countDocuments({ status: "pending" })) === 6, "6 accounts pending, rest reserve");

const client = new Client({ name: "outreach-smoke", version: "0.1.0" });
await client.connect(new StdioClientTransport({ command: process.execPath, args: ["run", "src/server.ts", "--role", "agent"], cwd: root, env, stderr: "inherit" }));
const agent = async (name: string, args: Record<string, unknown>): Promise<any> => {
  const res = await client.callTool({ name, arguments: args });
  const text = (res.content as { type: string; text?: string }[])[0]?.text ?? "";
  if (res.isError) throw new Error(`${name} failed: ${text}`);
  return JSON.parse(text);
};
async function until<T>(what: string, fn: () => Promise<T | null | undefined | false>, ms = 45_000): Promise<T> {
  const started = Date.now();
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() - started > ms) throw new Error(`timed out waiting for ${what}`);
    await Bun.sleep(400);
  }
}
const config = (version: number) => db.collection("harness_config").findOne({ version });
const sentinel = await Sentinel.create();
sentinel.start();
await Bun.sleep(1500);

try {
  const s1 = await agent("get_settings", {});
  check(
    s1.settings.model === "gb10" && s1.settings.reasoning === "off" && JSON.stringify(s1.settings.context_sources) === '["account_name","product_catalog"]' && s1.settings.granted_tools.length === 0,
    `seed v1: ${JSON.stringify(s1.settings)}`,
  );
  check(!gateChange("context_sources", ["account_record_full", "the_internet"], s1.settings).passed, "gate refuses unknown context source");
  check(!gateChange("reasoning", "max", s1.settings).passed, "gate refuses reasoning 'max'");

  const obj = await agent("set_objective", {
    objective: "outreach smoke: one QA-clean email per account",
    bearings: [
      { name: "qa_pass_rate", target: 80, unit: "%", current: 0 },
      { name: "accounts_done", target: 6, unit: "accounts", current: 0 },
    ],
    waypoints: [{ title: "Work the queue", done_when: "every account done, first-try pass rate >= 80%" }],
    agent: "smoke",
  });
  const oid = obj.objective_id as string;
  const cp = async (version: number) => {
    const st = await T.getQueueStats(oid);
    return agent("checkpoint", {
      objective_id: oid,
      state_summary: `${st.done}/${st.total} done, rolling pass ${st.rolling_pass_rate_10}%`,
      open_threads: [],
      next_action: "next_account",
      bearings_current: [
        { name: "qa_pass_rate", current: st.rolling_pass_rate_10 },
        { name: "accounts_done", current: st.done },
      ],
      settings_version: version,
      agent: "smoke",
    });
  };
  const cleanDraft = async (account: string) => {
    const o = (await T.outline_email({ account })) as { hook: string; value: string; cta: string; subject: string };
    return { subject: o.subject, body: `Hi team,\n${o.hook} ${o.value} ${o.cta}\nCheers,\nSam` };
  };

  // Claims are atomic per worker.
  const [a, b] = await Promise.all([T.next_account({ objective_id: oid, worker: "w1" }), T.next_account({ objective_id: oid, worker: "w2" })]);
  check(!!a.account && !!b.account && a.account.account !== b.account.account, `two workers claim different accounts: ${a.account?.account} / ${b.account?.account}`);
  check(JSON.stringify(Object.keys(a.view ?? {})) === '["account"]', `seed context shows only the name: ${JSON.stringify(a.view)}`);

  // 1. failing draft: the lean context makes the agent invent a fact.
  const acc1 = a.account!;
  const bad = { subject: `${acc1.account}: a quick idea`, body: `Hi team,\n${acc1.account} grew revenue 40% last year across Germany and Brazil. Our GTX Pro at $4,821 helps. Would a 15-minute call work?` };
  const refused = await T.submit_email({ objective_id: oid, account: acc1.account, ...bad, agent: "smoke", worker: "w1", require_precheck: true });
  check(refused.refused === true, "submit refused without precheck when required");
  const r1 = await T.submit_email({ objective_id: oid, account: acc1.account, ...bad, agent: "smoke", worker: "w1", settings_version: 1 });
  check(!r1.refused && !r1.pass && r1.failures.some((f) => f.class === "invented-fact") && r1.retry_allowed, `failing draft: ${JSON.stringify(!r1.refused && r1.failures)}`);
  await cp(1);
  for (const f of r1.refused ? [] : r1.failures)
    await agent("log_failure", { objective_id: oid, failure: `QA ${f.class} on ${acc1.account}`, class: f.class, context: f.detail, agent: "harness" });

  const v2 = await until("v2 on probation", () => config(2));
  check(
    v2.status === "probation" && v2.change?.field === "context_sources" && v2.settings.context_sources.includes("account_record_full") && v2.probation?.checkpoints_required === 3,
    `v2 probation: ${JSON.stringify(v2.change)} (${v2.reason?.summary})`,
  );
  const full = T.accountView(acc1, v2.settings.context_sources);
  check("revenue_musd" in full && "office_location" in full, "account_record_full → next_account shows every field");

  // 2. three passing submissions (the retry of acc1, then two more) → kept.
  const retry = await T.next_account({ objective_id: oid, worker: "w1", context_sources: v2.settings.context_sources });
  check(retry.account?.account === acc1.account && retry.attempt === 2 && retry.previous_failures.length > 0, `retry returns the same account, attempt ${retry.attempt}`);
  const names = [acc1.account, b.account!.account];
  const n3 = await T.next_account({ objective_id: oid, worker: "w3" });
  names.push(n3.account!.account);
  for (const [i, name] of names.entries()) {
    const d = await cleanDraft(name);
    await T.precheck_email({ ...d, account: name });
    const r = await T.submit_email({ objective_id: oid, account: name, ...d, agent: "smoke", worker: `w${i + 1}`, settings_version: 2, require_precheck: true });
    check(!r.refused && r.pass && r.account_status === "done", `${name}: clean draft passes (${JSON.stringify(!r.refused && r.failures)})`);
    await cp(2);
  }
  await until("v2 decided", async () => ((await config(2))?.outcome ? true : null));
  const v2d = await config(2);
  check(v2d?.status === "kept", `v2 ${v2d?.status}: ${v2d?.outcome?.why}`);
  const stats = await T.getQueueStats({ objective_id: oid });
  check(stats.done === 3 && stats.total === 6 && stats.first_try_pass_rate === 66.7, `stats ${JSON.stringify(stats)}`);
  await sentinel.idle();

  // 3. guardrail macro: granted_tools + required_tools in ONE version, and its rollback restores both.
  const g = await applySettingsChange({ objective_id: oid, field: "guardrail", value: "precheck_email", reason: { kind: "manual_seed", summary: "smoke: guardrail macro" }, agent: "smoke" });
  const v3 = await config(3);
  check(
    g.applied === true && v3?.settings.granted_tools.includes("precheck_email") && v3?.settings.required_tools.includes("precheck_email") && v3?.change?.also?.field === "required_tools",
    `guardrail v3: ${g.text}`,
  );
  const rb = await rollbackSettings({ reason: "smoke: undo guardrail", objective_id: oid, agent: "smoke" });
  const v4 = await config(4);
  check(rb.rolled_back === true && !v4?.settings.granted_tools.includes("precheck_email") && !v4?.settings.required_tools.includes("precheck_email") && v4?.change?.also?.to?.length === 1, `rollback restores both fields: v${v4?.version}`);

  const reset = await T.resetOutreach(db);
  check(reset.pending === 6 && (await db.collection("drafts").countDocuments({})) === 0, `resetOutreach: ${JSON.stringify(reset)}`);
} finally {
  await sentinel.idle();
  await sentinel.stop();
  await client.close();
  await mongo.close();
}
console.log(failures ? `\noutreach smoke: ${failures} FAILED` : "\noutreach smoke passed");
process.exit(failures ? 1 : 0);
