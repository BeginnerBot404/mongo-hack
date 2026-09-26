// End-to-end smoke test over real MCP stdio. Run: `bun run smoke`.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const env = Object.fromEntries(Object.entries(process.env).filter((e): e is [string, string] => e[1] !== undefined));
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["run", "src/server.ts"],
  cwd: new URL("..", import.meta.url).pathname,
  env,
  stderr: "inherit",
});
const client = new Client({ name: "waypoints-smoke", version: "0.1.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log(`tools (${tools.length}): ${tools.map((t) => t.name).join(", ")}`);

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  const text = (res.content as { type: string; text?: string }[])[0]?.text ?? "";
  console.log(`\n=== ${name}${res.isError ? " (ERROR)" : ""} ===\n${text}`);
  if (res.isError) throw new Error(`${name} failed`);
  return JSON.parse(text);
}

if (!process.env.MONGODB_URI) {
  console.log("\nMONGODB_URI not set: listed tools only. Set it and run `bun run setup` then `bun run smoke` for the full flow.");
  await client.close();
  process.exit(0);
}

try {
  const objective = await call("set_objective", {
    objective: "Smoke test: migrate the billing service to the new payments API",
    bearings: [
      { name: "endpoints migrated", target: 12, unit: "endpoints", current: 0 },
      { name: "integration tests passing", target: 40, unit: "tests", current: 10 },
    ],
    waypoints: [
      { title: "Inventory endpoints", done_when: "every endpoint listed with its new API equivalent" },
      { title: "Migrate read endpoints", done_when: "all GET endpoints use the new API and tests pass" },
      { title: "Migrate write endpoints", done_when: "all POST/PUT endpoints use the new API and tests pass" },
    ],
    agent: "smoke",
  });
  const objective_id = objective.objective_id as string;

  await call("checkpoint", {
    objective_id,
    state_summary: "Inventoried 12 endpoints. Read endpoints mapped. Started on GET /invoices.",
    open_threads: ["GET /invoices pagination differs in new API", "Need sandbox credentials for write tests"],
    next_action: "Deploy the GET /invoices migration to staging",
    bearings_current: [{ name: "endpoints migrated", current: 3 }],
    waypoint_done: 0,
    agent: "smoke",
  });
  await call("log_decision", {
    objective_id,
    decision: "Use cursor pagination for /invoices",
    rationale: "New API only supports cursors; offset emulation doubles latency",
    evidence: "Benchmark: offset emulation p95 820ms vs cursor 390ms",
    agent: "smoke",
  });
  await call("log_failure", {
    objective_id,
    failure: "Staging deploy failed: new API returned 429 Too Many Requests",
    class: "Rate Limit",
    context: "Deploying GET /invoices migration to staging",
    agent: "smoke",
  });
  const second = await call("log_failure", {
    objective_id,
    failure: "Integration tests hit 429 from payments API during batch run",
    class: "rate_limit",
    context: "Running the full integration suite",
    agent: "smoke",
  });

  console.log("\n(waiting 5s for the vector index to catch up)");
  await Bun.sleep(5000);
  await call("recall", { query: "what went wrong with the payments API rate limits?", kind: "any", objective_id, limit: 3 });

  if (tools.some((t) => t.name === "adapt")) {
    await call("adapt", { objective_id, failure_id: second.failure_id, agent: "smoke" });
  }
  await call("resume", { objective_id, agent: "smoke-resumer" });
  console.log("\nsmoke test passed");
} finally {
  await client.close();
}
