// Waypoints MCP server. Run: `bun run src/server.ts` (stdio transport).
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { log } from "./log";
import { recall } from "./memory";
import { adapt, checkpoint, listPolicies, logDecision, logFailure, resume, setObjective, toObjectId } from "./waypoints";

const server = new McpServer({ name: "waypoints", version: "0.1.0" });

const agent = z.string().optional().describe('Which harness is calling, e.g. "hermes" or "langgraph". Default "unknown".');
const objectiveId = z.string().describe("The objective_id returned by set_objective.");

async function respond(tool: string, run: () => Promise<unknown>) {
  try {
    const result = await run();
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`${tool} failed:`, message);
    return { isError: true, content: [{ type: "text" as const, text: JSON.stringify({ error: message, tool }, null, 2) }] };
  }
}

server.registerTool(
  "set_objective",
  {
    description:
      "Start a long-horizon objective: the goal, measurable bearings (numeric targets), and ordered waypoints. The first waypoint becomes active. Returns objective_id.",
    inputSchema: {
      objective: z.string().describe("The overall goal, in one or two sentences."),
      bearings: z
        .array(
          z.object({
            name: z.string(),
            target: z.number(),
            unit: z.string(),
            current: z.number().optional(),
          }),
        )
        .describe("Measurable progress signals, e.g. {name: 'tests passing', target: 40, unit: 'tests', current: 12}."),
      waypoints: z.array(z.object({ title: z.string(), done_when: z.string() })).describe("Ordered milestones, each with a concrete done condition."),
      agent,
    },
  },
  (args) => respond("set_objective", () => setObjective({ ...args, agent: args.agent ?? "unknown" })),
);

server.registerTool(
  "checkpoint",
  {
    description:
      "Save a compact working-state snapshot. Call at task boundaries or before your context fills. Optionally update bearing values and mark a waypoint done (advances the active waypoint).",
    inputSchema: {
      objective_id: objectiveId,
      state_summary: z.string().describe("What has been done and what the current state is."),
      open_threads: z.array(z.string()).describe("Unfinished items another session would need to know about."),
      next_action: z.string().describe("The very next concrete step."),
      bearings_current: z.array(z.object({ name: z.string(), current: z.number() })).optional(),
      waypoint_done: z.number().int().optional().describe("Index of a waypoint to mark done."),
      agent,
    },
  },
  (args) => respond("checkpoint", () => checkpoint({ ...args, agent: args.agent ?? "unknown" })),
);

server.registerTool(
  "resume",
  {
    description:
      "Call this FIRST in a new or restarted session. Reconstructs the objective, bearings, current waypoint, last checkpoint, open threads, next action, recent decisions, recent failures with postmortems, and active policies. Omit objective_id to resume the most recently updated active objective.",
    inputSchema: { objective_id: objectiveId.optional(), agent },
  },
  (args) => respond("resume", () => resume({ objective_id: args.objective_id, agent: args.agent ?? "unknown" })),
);

server.registerTool(
  "log_decision",
  {
    description: "Append a decision to the objective's decision ledger (append-only).",
    inputSchema: {
      objective_id: objectiveId,
      decision: z.string(),
      rationale: z.string(),
      evidence: z.string().optional(),
      agent,
    },
  },
  (args) => respond("log_decision", () => logDecision({ ...args, agent: args.agent ?? "unknown" })),
);

server.registerTool(
  "log_failure",
  {
    description:
      "Record a typed failure. Returns a deterministic postmortem: occurrences of this failure class so far, prior failures of the same class, and a suggested policy.",
    inputSchema: {
      objective_id: objectiveId,
      failure: z.string().describe("What went wrong."),
      class: z.string().describe('Failure class, e.g. "rate-limit" or "stale-cache". Normalized to lowercase-kebab.'),
      context: z.string().describe("What you were doing when it failed."),
      agent,
    },
  },
  (args) => respond("log_failure", () => logFailure({ ...args, agent: args.agent ?? "unknown" })),
);

server.registerTool(
  "recall",
  {
    description:
      "Semantic search over past checkpoints, decisions and failures (Voyage embeddings + Atlas Vector Search + Voyage rerank). Use to find earlier failures or reasoning.",
    inputSchema: {
      query: z.string(),
      kind: z.enum(["checkpoint", "decision", "failure", "any"]).optional(),
      objective_id: objectiveId.optional(),
      limit: z.number().int().min(1).max(20).optional().describe("Default 5."),
    },
  },
  (args) =>
    respond("recall", () =>
      recall({
        query: args.query,
        kind: args.kind,
        objective_id: args.objective_id ? toObjectId(args.objective_id) : undefined,
        limit: args.limit ?? 5,
      }),
    ),
);

server.registerTool(
  "adapt",
  {
    description:
      "Turn a failure's suggested policy into a standing, versioned, reversible policy for this objective. Deterministic gate: the failure class must have occurred at least twice, or explicit_approval must be true. resume returns active policies.",
    inputSchema: {
      objective_id: objectiveId,
      failure_id: z.string(),
      explicit_approval: z.boolean().optional(),
      agent,
    },
  },
  (args) => respond("adapt", () => adapt({ ...args, agent: args.agent ?? "unknown" })),
);

server.registerTool(
  "list_policies",
  {
    description: "List policies (default: active only), optionally for one objective.",
    inputSchema: {
      objective_id: objectiveId.optional(),
      status: z.enum(["active", "superseded", "any"]).optional(),
    },
  },
  (args) => respond("list_policies", () => listPolicies({ objective_id: args.objective_id, status: args.status ?? "active" })),
);

await server.connect(new StdioServerTransport());
log(`server ready (db "${process.env.WAYPOINTS_DB || "waypoints"}", mongo ${process.env.MONGODB_URI ? "configured" : "NOT configured"})`);
