# Task: make the invoice fixture green

Working directory for the task: `demo/fixture/` (files: `invoice.ts`, `invoice.test.ts`).
Goal: every test in `invoice.test.ts` passes (`bun test` inside `demo/fixture`).
Fix bugs ONLY in `invoice.ts`. Never edit `invoice.test.ts`. One bug fix per edit.

## Waypoints protocol (MCP server "waypoints")
1. FIRST call `resume` (pass your agent name). If it returns an objective for this task, continue from its
   `next_action`, `open_threads` and `current_waypoint`. Read its `policies`, `recent_failures` and
   `last_decisions` and follow/avoid them. Do not redo work that the last checkpoint says is done.
2. If there is no objective (or you were told to start fresh), call `set_objective` with EXACTLY:
   objective: "Make every test in demo/fixture/invoice.test.ts pass by fixing bugs in invoice.ts"
   bearings: [{"name":"tests_passing","target":10,"unit":"tests","current":0}]
   waypoints: [
     {"title":"Baseline","done_when":"bun test has been run and every failing test is listed"},
     {"title":"Fix date + paging bugs","done_when":"billableDays and paginate tests pass"},
     {"title":"Fix time + money bugs","done_when":"hoursFromMinutes, totalHours, lineTotal, taxCents tests pass"},
     {"title":"All green","done_when":"all 10 tests pass"}]
3. CHECKPOINT RULE (hard): IMMEDIATELY after EVERY `bun test` run, your very next tool call MUST be `checkpoint`,
   before any other action (no log_failure, log_decision, read, edit or second test run first). Never run
   `bun test` twice without a checkpoint in between. Pass objective_id, a short state_summary, open_threads (the
   still-failing tests), next_action, bearings_current [{"name":"tests_passing","current":<pass count>}] (always),
   and waypoint_done (index, 0-based) when a waypoint's done_when is met.
4. Before each fix call `log_decision` (decision = the exact change, rationale = why, evidence = the failing
   assertion).
5. Call `log_failure` with a `class` (use short snake_case classes such as `off_by_one`, `unit_conversion`,
   `rounding`) once per failing test that reveals a bug of that class (so a class can be logged more than once),
   and whenever a fix attempt makes the pass count go down. If the returned postmortem has `is_recurring: true`,
   call `adapt` with that failure_id so it becomes a standing policy.
   If a class already appears in `recent_failures` or `policies`, use `recall` on it first and apply what
   was learned.
6. Stop when all 10 tests pass and you have written a final checkpoint.
