// v2 end-to-end smoke: agent role over MCP stdio + in-process sentinel (change stream + surgeon MCP role).
// Runs in its own database (default waypoints_smoke) so it never touches the demo's data or settings history.
// Run: `bun run smoke:v2`.
process.env.WAYPOINTS_DB = process.env.SMOKE_DB || "waypoints_smoke";
const DB = process.env.WAYPOINTS_DB;

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = new URL("..", import.meta.url).pathname;
const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => e[1] !== undefined));

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

let failures = 0;
function check(ok: boolean, what: string) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${what}`);
  if (!ok) failures++;
}

console.log(`== setup (${DB}) ==`);
const setup = Bun.spawnSync([process.execPath, "run", "scripts/setup-indexes.ts"], { cwd: root, env, stdout: "inherit", stderr: "inherit" });
if (setup.exitCode !== 0) throw new Error("setup failed");

const { mongo, waypointsDb: db } = await import("../src/clients");
const { seedConfig } = await import("../src/settings");
const { Sentinel } = await import("../src/sentinel");
const { ObjectId } = await import("mongodb");

// Fresh settings history in the smoke DB only.
await db.collection("harness_config").deleteMany({});
await db.collection("harness_config").insertOne(seedConfig());

// Validator: no end_state / objective field can be stored in harness_config.
try {
  await db.collection("harness_config").insertOne({ ...seedConfig(), version: 999, end_state: { target: 1 } } as any);
  check(false, "validator rejects end_state in harness_config");
} catch (err: any) {
  check(err?.code === 121, `validator rejects end_state in harness_config (code ${err?.code})`);
}
try {
  await db.collection("harness_config").insertOne({ ...seedConfig(), version: 998, settings: { ...seedConfig().settings, model: "evil/model" } } as any);
  check(false, "validator rejects unknown model");
} catch (err: any) {
  check(err?.code === 121, "validator rejects unknown model");
}

async function mount(role: "agent" | "surgeon") {
  const client = new Client({ name: `smoke-${role}`, version: "0.1.0" });
  await client.connect(
    new StdioClientTransport({ command: process.execPath, args: ["run", "src/server.ts", "--role", role], cwd: root, env, stderr: "inherit" }),
  );
  return client;
}
function caller(client: Client) {
  return async (name: string, args: Record<string, unknown>): Promise<any> => {
    const res = await client.callTool({ name, arguments: args });
    const text = (res.content as { type: string; text?: string }[])[0]?.text ?? "";
    if (res.isError) throw new Error(`${name} failed: ${text}`);
    return JSON.parse(text);
  };
}
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

const agentClient = await mount("agent");
const surgeonClient = await mount("surgeon");
const agent = caller(agentClient);
const surgeon = caller(surgeonClient);
const sentinel = await Sentinel.create();
sentinel.start();
await Bun.sleep(1500); // let the change stream open

try {
  const agentTools = (await agentClient.listTools()).tools.map((t) => t.name);
  const surgeonTools = (await surgeonClient.listTools()).tools.map((t) => t.name);
  check(!agentTools.includes("adapt") && agentTools.includes("get_settings"), `agent role tools: ${agentTools.join(", ")}`);
  check(surgeonTools.includes("apply_settings_change") && surgeonTools.includes("adapt"), `surgeon role tools: ${surgeonTools.join(", ")}`);

  // ---------------- kept path ----------------
  console.log("\n== kept path ==");
  const tag = new ObjectId().toHexString().slice(-6);
  const obj = await agent("set_objective", {
    objective: `smoke-v2 ${tag}: make all 10 invoice tests pass`,
    bearings: [{ name: "tests passing", target: 10, unit: "tests", current: 3 }],
    waypoints: [{ title: "Fix the invoice module", done_when: "10/10 tests pass" }],
    agent: "smoke",
  });
  const oid = obj.objective_id as string;
  check(obj.end_state?.bearing === "tests passing" && obj.end_state?.target === 10, `end_state defaulted: ${JSON.stringify(obj.end_state)}`);

  const s1 = await agent("get_settings", {});
  check(s1.version === 1 && s1.fragments.length === 2, `get_settings v${s1.version} fragments ${s1.fragments.map((f: any) => f.id)}`);

  await agent("log_failure", {
    objective_id: oid,
    // Close to the server's auto-regression text so similarity is high even when embeddings are rate-limited.
    failure: 'Regression: "tests passing" dropped from 5 to 3 at checkpoint 1. A change broke something that was working.',
    class: "broken-test",
    context: "Checkpoint 1: fixed the rounding bug; now 3/10 passing",
    agent: "smoke",
  });
  const cp = (current: number, version: number, summary: string) =>
    agent("checkpoint", {
      objective_id: oid,
      state_summary: summary,
      open_threads: [],
      next_action: "keep fixing",
      bearings_current: [{ name: "tests passing", current }],
      settings_version: version,
      agent: "smoke",
    });
  await cp(5, 1, "5/10 passing");
  await cp(6, 1, "6/10 passing");
  const reg = await cp(4, 1, "Fixed the discount bug; now 4/10 passing");
  check(reg.auto_failure?.from === 6 && reg.auto_failure?.to === 4, `auto regression failure logged: ${JSON.stringify(reg.auto_failure)}`);
  check(reg.end_state?.target === 10 && typeof reg.settings?.current_version === "number", `checkpoint returns end_state + settings ${JSON.stringify(reg.settings)}`);

  const tap = await until("tap on regression", () =>
    db.collection("taps").findOne({ objective_id: new ObjectId(oid), "trigger.kind": "failure", "decision.tap": true }),
  );
  console.log(`      tap risk ${tap.risk} components ${JSON.stringify(tap.components)} action ${tap.decision.action}`);
  check(tap.decision.action === "adjust_settings" && tap.settings_version_after === 2, "sentinel tapped → adjust_settings v2");
  const v2 = await config(2);
  check(v2?.status === "probation" && v2?.settings.prompt_fragments.includes("verify_whole_suite"), `v2 on probation: ${JSON.stringify(v2?.change)}`);
  check(v2?.probation?.baseline_bearing === 4, `baseline bearing ${v2?.probation?.baseline_bearing}`);

  await agent("recall", { query: "what broke when fixing a bug?", kind: "failure", objective_id: oid, limit: 2, agent: "smoke" });

  const r1 = await cp(5, 1, "Reverted part of the fix; 5/10");
  check(r1.settings?.reload === true && r1.settings?.current_version === 2, `reload flag with old version: ${JSON.stringify(r1.settings)}`);
  // The sentinel can be fast enough that the regression checkpoint's own response already carries the tap.
  const delivered = reg.tap ?? r1.tap;
  check(delivered?.decision?.action === "adjust_settings", `checkpoint delivered the tap (${reg.tap ? "same" : "next"} checkpoint)`);
  const acked = await db.collection("taps").findOne({ _id: tap._id });
  check(acked?.status === "acknowledged", "tap marked acknowledged");
  const s2 = await agent("get_settings", {});
  check(s2.fragments.some((f: any) => f.id === "verify_whole_suite"), "get_settings now includes verify_whole_suite");
  const r2 = await cp(7, 2, "7/10 passing, whole suite verified");
  check(r2.settings?.reload === false, "no reload when running current version");

  await until("v2 kept", async () => (await config(2))?.status === "kept");
  const v2k = await config(2);
  check(v2k?.outcome?.verdict === "kept", `v2 KEPT: ${v2k?.outcome?.why}`);

  const kinds = await db.collection("events").distinct("kind", { objective_id: new ObjectId(oid) });
  check(
    ["auto_failure", "recall", "settings_reload", "tap_acknowledged", "probation_verdict"].every((k) => kinds.includes(k)),
    `events written: ${kinds.join(", ")}`,
  );

  // ---------------- rollback path ----------------
  console.log("\n== rollback path ==");
  const objB = await agent("set_objective", {
    objective: `smoke-v2 ${tag}-B: rollback path`,
    bearings: [{ name: "tests passing", target: 10, unit: "tests", current: 3 }],
    waypoints: [{ title: "Fix", done_when: "10/10" }],
    agent: "smoke",
  });
  const oidB = objB.objective_id as string;
  const cpB = (current: number, summary: string) =>
    agent("checkpoint", {
      objective_id: oidB,
      state_summary: summary,
      open_threads: [],
      next_action: "continue",
      bearings_current: [{ name: "tests passing", current }],
      settings_version: 2,
      agent: "smoke",
    });
  await cpB(5, "5/10");
  const denied = await surgeon("apply_settings_change", {
    objective_id: oidB,
    field: "end_state",
    value: "0",
    reason: "smoke: try to move the destination",
  });
  check(denied.applied === false, `gate refuses field end_state: ${denied.gate?.why}`);
  const denied2 = await surgeon("apply_settings_change", { objective_id: oidB, field: "model", value: "evil/model", reason: "smoke" });
  check(denied2.applied === false, `gate refuses unknown model: ${denied2.gate?.why}`);
  const v3 = await surgeon("apply_settings_change", {
    objective_id: oidB,
    field: "model",
    value: "anthropic/claude-sonnet-5",
    reason: { kind: "tap", id: null, summary: "smoke: manual probation for the rollback path" },
    watch_class: "regression",
    agent: "smoke",
  });
  check(v3.applied === true && v3.version === 3, `v3 on probation: ${v3.text}`);
  await sentinel.idle();
  await cpB(3, "Broke things: 3/10");
  await cpB(6, "6/10");
  await until("v3 rolled back", async () => (await config(3))?.status === "rolled_back");
  const v3r = await config(3);
  const v4 = await config(4);
  check(v3r?.outcome?.verdict === "rolled_back", `v3 ROLLED BACK: ${v3r?.outcome?.why}`);
  check(
    v4?.status === "active" && JSON.stringify(v4?.settings) === JSON.stringify(v2k?.settings),
    `parent (v2) settings re-activated as v4: model ${v4?.settings.model}`,
  );
  const cur = await agent("get_settings", {});
  check(cur.version === 4, `current settings version ${cur.version}`);
} finally {
  await sentinel.idle();
  await sentinel.stop();
  await agentClient.close();
  await surgeonClient.close();
  await mongo.close();
}

console.log(failures ? `\nsmoke v2: ${failures} FAILED` : "\nsmoke v2 passed");
process.exit(failures ? 1 : 0);
