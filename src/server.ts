// Waypoints MCP server. Run: `bun run src/server.ts [--role agent|surgeon]` (stdio transport).
// agent (default): what the harness mounts. surgeon: settings/policy writes, mounted only by the sentinel.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { log } from "./log";
import { recall } from "./memory";
import { applySettingsChange, evaluateProbation, getSettings, rollbackSettings } from "./settings";
import { adapt, checkpoint, listPolicies, logDecision, logFailure, resume, setObjective, toObjectId, writeEvent } from "./waypoints";

const roleArg = process.argv.indexOf("--role");
const role = roleArg >= 0 ? process.argv[roleArg + 1] : "agent";
if (role !== "agent" && role !== "surgeon") {
  log(`unknown --role "${role}" (expected agent or surgeon)`);
  process.exit(2);
}

const server = new McpServer({ name: role === "surgeon" ? "waypoints-surgeon" : "waypoints", version: "0.2.0" });

const agent = z.string().optional().describe('Which harness is calling, e.g. "hermes" or "langgraph". Default "unknown".');
const objectiveId = z.string().describe("The objective_id returned by set_objective.");
const settingsVersion = z
  .number()
  .int()
  .optional()
  .describe("The harness_config version the harness is currently running. The response says whether to reload.");

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

function registerAgentTools() {
  server.registerTool(
    "set_objective",
    {
      description:
        "Start a long-horizon objective: the goal, measurable bearings (numeric targets), and ordered waypoints. The first waypoint becomes active. The end_state (immutable) defaults to the first bearing's target. Returns objective_id.",
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
        end_state: z
          .object({ description: z.string().optional(), bearing: z.string().optional(), target: z.number().optional() })
          .optional()
          .describe("The destination. Set once, never changes. Default: the first bearing reaching its target."),
        agent,
      },
    },
    (args) => respond("set_objective", () => setObjective({ ...args, agent: args.agent ?? "unknown" })),
  );

  server.registerTool(
    "checkpoint",
    {
      description:
        "Save a compact working-state snapshot. Call at task boundaries or before your context fills. Optionally update bearing values and mark a waypoint done (advances the active waypoint). Returns settings {current_version, reload}, the latest sentinel tap (or null), and the end_state.",
      inputSchema: {
        objective_id: objectiveId,
        state_summary: z.string().describe("What has been done and what the current state is."),
        open_threads: z.array(z.string()).describe("Unfinished items another session would need to know about."),
        next_action: z.string().describe("The very next concrete step."),
        bearings_current: z.array(z.object({ name: z.string(), current: z.number() })).optional(),
        waypoint_done: z.number().int().optional().describe("Index of a waypoint to mark done."),
        settings_version: settingsVersion,
        agent,
      },
    },
    (args) => respond("checkpoint", () => checkpoint({ ...args, agent: args.agent ?? "unknown" })),
  );

  server.registerTool(
    "resume",
    {
      description:
        "Call this FIRST in a new or restarted session. Reconstructs the objective, end_state, bearings, current waypoint, last checkpoint, open threads, next action, recent decisions, recent failures with postmortems, active policies, settings version and any sentinel tap. Omit objective_id to resume the most recently updated active objective.",
      inputSchema: { objective_id: objectiveId.optional(), settings_version: settingsVersion, agent },
    },
    (args) =>
      respond("resume", () =>
        resume({ objective_id: args.objective_id, settings_version: args.settings_version, agent: args.agent ?? "unknown" }),
      ),
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
        agent,
      },
    },
    (args) =>
      respond("recall", async () => {
        const objective_id = args.objective_id ? toObjectId(args.objective_id) : undefined;
        const result = await recall({ query: args.query, kind: args.kind, objective_id, limit: args.limit ?? 5 });
        const who = args.agent ?? "unknown";
        await writeEvent(
          objective_id ?? null,
          "recall",
          who,
          { query: args.query, kind: args.kind ?? "any", results: result.results.length, method: result.method },
          `${who} recalled "${args.query}" and got ${result.results.length} memories back.`,
        );
        return result;
      }),
  );

  server.registerTool(
    "get_settings",
    {
      description: "Current harness settings: version, status, settings, and the enabled prompt fragments ({id, title, text}).",
      inputSchema: {},
    },
    () => respond("get_settings", () => getSettings()),
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
}

function registerSurgeonTools() {
  server.registerTool(
    "adapt",
    {
      description:
        "Turn a failure's suggested policy into a standing, versioned, reversible policy for this objective. Deterministic gate: the failure class must have occurred at least twice, or explicit_approval must be true.",
      inputSchema: {
        objective_id: objectiveId,
        failure_id: z.string(),
        explicit_approval: z.boolean().optional(),
        agent,
      },
    },
    (args) => respond("adapt", () => adapt({ ...args, agent: args.agent ?? "surgeon" })),
  );

  server.registerTool(
    "apply_settings_change",
    {
      description:
        "Change ONE harness setting through the deterministic gate. field must be prompt_fragments, required_tools, sentinel_threshold or model; value is validated against the fixed enums. The new version starts on probation with the last checkpoint's bearing as baseline.",
      inputSchema: {
        objective_id: objectiveId,
        field: z.string(),
        value: z.union([z.array(z.string()), z.number(), z.string()]),
        reason: z.union([
          z.string(),
          z.object({ kind: z.enum(["failure", "tap", "manual_seed"]), id: z.string().nullable().optional(), summary: z.string() }),
        ]),
        agent,
      },
    },
    (args) =>
      respond("apply_settings_change", () =>
        applySettingsChange({
          objective_id: args.objective_id,
          field: args.field,
          value: args.value,
          reason: typeof args.reason === "string" ? { kind: "tap", id: null, summary: args.reason } : args.reason,
          agent: args.agent ?? "surgeon",
        }),
      ),
  );

  server.registerTool(
    "rollback_settings",
    {
      description: "Roll back the current settings version: mark it rolled_back and re-activate its parent's settings as a new active version.",
      inputSchema: { reason: z.string(), objective_id: objectiveId.optional(), agent },
    },
    (args) => respond("rollback_settings", () => rollbackSettings({ ...args, agent: args.agent ?? "surgeon" })),
  );

  server.registerTool(
    "evaluate_probation",
    {
      description:
        "Judge the settings version on probation. After checkpoints_required checkpoints: kept if the bearing is >= baseline and the watched class did not recur, otherwise rolled back.",
      inputSchema: { objective_id: objectiveId, agent },
    },
    (args) => respond("evaluate_probation", () => evaluateProbation({ objective_id: args.objective_id, agent: args.agent ?? "surgeon" })),
  );
}

if (role === "agent") registerAgentTools();
else registerSurgeonTools();

await server.connect(new StdioServerTransport());
log(`server ready (role ${role}, db "${process.env.WAYPOINTS_DB || "waypoints"}", mongo ${process.env.MONGODB_URI ? "configured" : "NOT configured"})`);
