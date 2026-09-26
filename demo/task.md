# Task: make the invoice fixture green

Working directory: `demo/fixture/` (files: `invoice.ts`, `invoice.test.ts`). Goal: all 10 tests in `invoice.test.ts`
pass. Fix bugs ONLY in `invoice.ts`; never edit `invoice.test.ts`. One bug fix per edit, and `run_tests` after EVERY
edit (never two edits without a test run in between).

## Waypoints protocol (MCP server "waypoints")
1. The harness has already called `resume` (and `set_objective` on a fresh start) and handed you the result. Continue
   from its `next_action`, `open_threads` and `current_waypoint`; follow its `policies`, avoid its `recent_failures`,
   and do not redo work the last checkpoint says is done. Use its `objective_id` everywhere.
2. CHECKPOINT RULE (hard): IMMEDIATELY after EVERY `run_tests`, your very next tool call MUST be `checkpoint`, before
   anything else. Pass objective_id, a one-line state_summary, open_threads (just the still-failing test names), a
   one-line next_action, bearings_current [{"name":"tests_passing","current":<pass count>}] (always), and
   waypoint_done (0-based index) when a waypoint's done_when is met.
   Waypoints: 0 Baseline · 1 date + time bugs (billableDays, hoursFromMinutes, totalHours) · 2 money + paging bugs
   (taxCents, invoiceTotal, paginate) · 3 all 10 green.
3. The checkpoint result may contain `harness_notes`: settings reloads, sentinel taps and recall results. Read them
   and follow any new standing rule immediately (they are also in your system prompt).
4. Failures: `log_failure` once per BUG, right before fixing it, with a short snake_case `class`: `off_by_one`,
   `unit_conversion`, `rounding`, `shared_helper`. A bug that breaks several tests is logged once. If the pass count
   goes DOWN after an edit, the server logs a `regression` failure itself; don't log it again.
5. `log_decision` only for an actual edit, one call per edit: decision = the exact change (one line), rationale = one
   short sentence, evidence = the failing assertion.
6. Be terse. Stop when all 10 tests pass and you have written a final checkpoint.
