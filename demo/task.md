# Task: make the invoice fixture green

Working directory for the task: `demo/fixture/` (files: `invoice.ts`, `invoice.test.ts`).
Goal: every test in `invoice.test.ts` passes (`bun test` inside `demo/fixture`).
Fix bugs ONLY in `invoice.ts`. Never edit `invoice.test.ts`. One bug fix per edit, and run `bun test` after EVERY
edit (never two edits without a test run in between).

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
   `bun test` twice without a checkpoint in between. Pass objective_id, a one-line state_summary, open_threads (just
   the still-failing test names), a one-line next_action, bearings_current [{"name":"tests_passing","current":<pass count>}]
   (always), and waypoint_done (index, 0-based) when a waypoint's done_when is met.
4. Failures: `log_failure` once per BUG, not per test (a bug that breaks several tests is logged once). Use a short
   snake_case `class`: `off_by_one`, `unit_conversion`, `rounding`. If the postmortem says `is_recurring: true`,
   call `adapt` with that failure_id (it becomes a standing policy).
   Baseline: right after the baseline checkpoint, before the first fix, log exactly these two bugs, one call
   each: billableDays (off_by_one), then paginate (off_by_one; recurring -> `adapt`). The rest get logged when
   their fix comes up. Then start fixing.
   Later: right before fixing any bug that is not yet logged (see `recent_failures`), log it with one call
   (adapt if recurring). Also log a failure whenever a fix makes the pass count go down.
5. `log_decision` only for an actual edit, one call per edit, right before or right after that edit: decision = the exact change (one line), rationale = one short sentence, evidence = the failing assertion.
6. `recall` only if `resume` returned `recent_failures` or `policies` for this objective; then recall a class before
   fixing its first bug and apply what was learned. Otherwise do not call recall.
7. Be terse. Stop when all 10 tests pass and you have written a final checkpoint.
