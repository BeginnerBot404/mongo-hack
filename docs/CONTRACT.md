# Waypoints v2 contract (13:40): shared by the server, harness and flight-recorder subagents

Direction: the LangGraph agent becomes **the Waypoints harness** (the product). Waypoints (MCP) is its memory. The **sentinel** watches. The **surgeon** changes harness settings through a deterministic gate. The **flight recorder** shows everything.
Freeze at 15:45. Submit by 16:15. Hermes code stays in the repo, unused.

## Ownership (no overlapping files)
- **A (server):** `src/**` (except `src/watch*`), `scripts/**`
- **B (harness):** `demo/**`
- **C (flight recorder):** `flight-recorder/**`, with its own package.json and lockfile. Never touch the root package.json or bun.lock.
- Commit only your own paths, in small commits. **Don't push**; the orchestrator pushes. Run `bun run typecheck` before each commit (C runs its own typecheck in its folder).
- The root package.json `scripts` block may be edited by A (`sentinel`, `server:*`) and B (`harness*`). Edit only your own keys, and re-read the file right before editing it.

## Database: `waypoints` (WAYPOINTS_DB)
Existing collections are unchanged: objectives, checkpoints, decisions, failures, memories, resumes, policies.

### objectives gains `end_state` (immutable)
`end_state: { description: string, bearing: string, target: number }`. Set once by `set_objective` (default = the first bearing's target). No tool can change it, and harness_config has no field that can express it. "Change the route, never the destination."

### `harness_config` (NEW): one document per version
```js
{
  _id, version: 3,
  status: "active" | "probation" | "kept" | "rolled_back" | "superseded",
  settings: {
    prompt_fragments: ["checkpoint_every_test", "verify_whole_suite"], // ids from the FIXED library in src/fragments.ts
    required_tools: ["checkpoint", "recall"],                           // subset of agent-role tool names
    sentinel_threshold: 0.6,                                            // 0..1
    model: "z-ai/glm-5.3-flash"                                         // enum, see below
  },
  parent_version: 2,
  change: { field: "prompt_fragments", from: [...], to: [...] },        // exactly one field per version
  reason: { kind: "failure" | "tap" | "manual_seed", id: ObjectId | null, summary: string },
  probation: { checkpoints_required: 2, baseline_bearing: 5, watch_class: "regression", started_seq: 7 } | null,
  outcome: { decided_at, verdict: "kept" | "rolled_back", why: string } | null,
  created_by: "surgeon" | "seed",
  created_at
}
```
- **The "current" config** is the highest version with status `active`, `probation` or `kept`.
- **The `$jsonSchema` validator** (applied by `bun run setup`):
  - `settings` has `additionalProperties: false`.
  - Fragment ids and `model` are enums.
  - `sentinel_threshold` is between 0 and 1.
  - No `end_state`, objective or bearing field can exist anywhere in the document.
- **Version switches run in a transaction:** insert the new version, mark the previous one `superseded`, or on rollback mark the probation version `rolled_back` and re-insert the parent's settings as a new `active` version.
- **Model enum:** `z-ai/glm-5.3-flash`, `anthropic/claude-sonnet-5`, `openai/gpt-5.5`, `gb10`.

### `src/fragments.ts` (A owns; B imports it read-only)
A fixed library of `{ id, title, text }`. The model never writes prompt text. Initial ids:
- `checkpoint_every_test`: checkpoint right after every test run
- `recall_before_edit`: recall the failure class before editing
- `verify_whole_suite`: after a fix, run the whole suite and compare pass counts. If any previously passing test fails, revert or fix it before moving on. **This one addresses the trap bug.**
- `one_change_per_edit`: one bug per edit
- `read_policies_first`: restate active policies before the first edit

**Seed config v1:** `["checkpoint_every_test", "read_policies_first"]`, required_tools `["checkpoint"]`, threshold 0.6, model `z-ai/glm-5.3-flash`.

### `taps` (NEW)
```js
{ _id, objective_id, risk: 0.72,
  components: { similarity: 0.81, recurrence: 0.5, trend: 1.0 },   // each 0..1
  weights: { similarity: 0.4, recurrence: 0.3, trend: 0.3 },
  trigger: { kind: "failure" | "checkpoint", id },
  advisor: { model: "typesafe/jev-router", tap: true, action: "recall", probability: 0.7, raw: string } | null,
  decision: { tap: boolean, action: "recall" | "rollback" | "adjust_settings" | "handoff" | "delegate", decided_by: "deterministic" },
  settings_version_after: 4 | null,
  status: "open" | "acknowledged",
  created_at }
```

### `events` (NEW): anything the flight recorder should narrate that isn't already a document
`{ objective_id, kind: "recall" | "settings_reload" | "tap_acknowledged" | "probation_verdict" | "auto_failure", agent, detail: object, text: string /* plain English */, created_at }`

## MCP server roles (A)
`bun run src/server.ts --role agent|surgeon` (default `agent`).
- **The agent role** (what the harness mounts):
  - Tools: `set_objective`, `checkpoint`, `resume`, `log_decision`, `log_failure`, `recall`, `get_settings`, `list_policies`.
  - `adapt` is **removed** from this role.
  - `get_settings()` returns `{ version, status, settings, fragments: [{id, title, text}] }` for the enabled fragments.
- **The surgeon role:** `adapt`, `apply_settings_change({objective_id, field, value, reason})`, `rollback_settings({reason})`, `evaluate_probation({objective_id})`. Mounted only by the sentinel process.

**Changes to `checkpoint` and `resume`:**
- They accept an optional `settings_version`, the version the harness is currently running.
- They return:
  - `settings: { current_version, reload: boolean }`, where `reload` is true when current_version ≠ the version passed in.
  - `tap`: the latest `open` tap for this objective, or null. It's marked `acknowledged` when returned, and that writes an event.
  - `end_state`
- **Auto-failure:** if a checkpoint's bearing is **lower** than the previous checkpoint's, the server itself inserts a failure with class `regression` (plus a memory and an `auto_failure` event).
- **`recall`** inserts a `recall` event.

## Sentinel (A): `bun run sentinel`
- Runs in the background on a change stream (failures and checkpoints). It isn't an MCP server itself; it **mounts the surgeon role as an MCP client**.
- **Risk score** = weighted sum of three parts:
  - **similarity:** max `$vectorSearch` score of the new failure against earlier failures on this objective
  - **recurrence:** `min(1, (count of class − 1) / 2)`
  - **trend:** regression = 1, stall (bearing flat for 3 checkpoints) = 0.6, otherwise 0
- **When risk ≥ the current config's `sentinel_threshold`:** optionally ask Jev (`typesafe/jev-router` on OpenRouter; advisory, 5s timeout, failures ignored), then decide deterministically:
  - trend = regression and `verify_whole_suite` is off → `apply_settings_change` to enable `verify_whole_suite`, in **probation**
  - the class recurs → `adapt` the policy
  - otherwise → `recall`
- **Writes** a tap.
- **On each checkpoint:** calls `evaluate_probation`. After `checkpoints_required` checkpoints, the probation version is kept if the bearing ≥ baseline and the watched class didn't recur; otherwise it's rolled back. Either way it records an `outcome` and a `probation_verdict` event.

## Harness (B): `bun run harness` (was demo:langgraph)
- Calls `resume` first and `get_settings`. The system prompt = base prompt + the enabled fragments' text.
- Sends `settings_version` with every checkpoint. When `settings.reload` is true, it calls `get_settings` again and rebuilds the prompt; it logs a `settings_reload` event through the server response.
- Prints tap banners: `▲ TAP risk 0.72 → adjust_settings (v4, probation)`.
- **Models:**
  - Default `z-ai/glm-5.3-flash` on OpenRouter, with a fallback to `anthropic/claude-sonnet-5`.
  - `DEMO_PROVIDER=gb10` uses `GB10_BASE_URL`, `GB10_MODEL`, `GB10_API_KEY`.
  - If GLM skips checkpoints in rehearsal, pin Sonnet 5.
- `--fresh`, `--die-after N`, `--max-steps N`
- **Trap bug** in the fixture: the obvious fix to one bug breaks another test that was passing. That makes the bearing drop, so the server logs a `regression` failure and the sentinel taps.

## Flight recorder (C): `flight-recorder/` (Next.js)
- One cached MongoClient on `globalThis`, so dev hot-reloads don't pile up connections. A route handler streams change events as server-sent events.
- Shows: a timeline of settings and policy changes (one diff card per version, with its probation status), a risk meter plus tap banners, bearings with the immutable end state, and a plain-English event stream.
- Minimal styling. It's the view into the harness, not the product. **Fallback:** `bun run watch`, if it isn't showing live data by 14:45.

## Demo
Harness works the fixture → `kill -9` → harness resumes → trap fix → regression → sentinel tap → surgeon enables `verify_whole_suite` on probation → harness reloads settings → bearing recovers → probation **kept** (or rolled back) → 10/10.
Optional: 15s of Claude Code mounting Waypoints (`claude mcp add`) and calling `resume`.

## Cut order (first cut first)
1. GB10 as primary
2. Helper sub-graph (cut at 14:30)
3. Jev
4. The Claude Code moment
5. Flight-recorder extras
6. Tool-level enforcement beyond prompt fragments

**Never cut:** kill → resume, sentinel score → tap, a gated settings change with automatic rollback, the timeline (or the watch pane), video time.
