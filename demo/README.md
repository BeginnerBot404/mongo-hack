# Waypoints harness demo: kill, resume, trap, tap, reload, 10/10

Task: fix the 4 planted bugs in `demo/fixture/invoice.ts` so all 10 tests pass (`demo/task.md`). Bearing `tests_passing`, end state 10 (immutable).
The trap: `pageStart` in invoice.ts looks wrong (it is), but `statement.ts` (read-only) compensates for it. Fixing the helper takes 9 → 8 (the server logs `regression`); the right fix is `paginate` calling `pageStart(page - 1, size)`.
Needs `MONGODB_URI`, `VOYAGE_API_KEY` and `OPENROUTER_API_KEY` in the repo `.env`.

1. `bun run demo:clean`: wipes every Waypoints document (including taps, events and harness_config), then resets the fixture.
2. `bun run setup`: re-seeds harness_config v1 (idempotent).
3. `bun run sentinel` in a second pane: scores failures and checkpoints, taps, and enables fragments on probation.
4. `bun run harness --fresh --die-after 10`: new objective, SIGKILLs itself mid-task (or `kill -9` it by hand).
5. `bun run harness`: resumes from the last checkpoint and finishes. Watch for:
   - `◎ END STATE`: printed at start.
   - `▼ BEARING DROP`: the trap fix lands.
   - `▲ TAP risk … → adjust_settings`: the sentinel reacts.
   - `⟳ SETTINGS v1 → v2 (probation): +verify_whole_suite`: the harness reloads its prompt.
   - `✔ all green`.
6. `bun run demo:reset`: restores the buggy fixture only.

Protocol, handled by the harness rather than the model: resume → get_settings → system prompt = base prompt + fragment texts → checkpoint (with `settings_version`) after every test run. If the model skips a checkpoint, the harness writes it (`⛨`, required_tools).
Flags: `--fresh`, `--die-after N`, `--max-steps N` (default 40). `bun run demo:langgraph` is an alias.
Models: `anthropic/claude-sonnet-5` with fallback `openai/gpt-5.5` (pinned; GLM skipped checkpoints in rehearsal).
- `DEMO_MODEL=z-ai/glm-5.3-flash`: use GLM, with a Sonnet fallback.
- `DEMO_PROVIDER=gb10`: use `GB10_BASE_URL`, `GB10_MODEL` and `GB10_API_KEY`.
- `WAYPOINTS_DEBUG=1`: show the server's stderr.
- `TAP_WAIT_MS`: after a drop, how long to wait for the sentinel (default 15000).
