# Waypoints demo: kill one harness, resume in another

Task: fix the 5 planted bugs in `demo/fixture/invoice.ts` so all 10 tests pass (2x `off_by_one`, 2x `unit_conversion`, 1x `rounding`).
Spec both harnesses follow: `demo/task.md`. Bearing: `tests_passing` (target 10). Needs `MONGODB_URI`, `VOYAGE_API_KEY`, and `OPENROUTER_API_KEY` in the repo `.env`.

1. `bun run demo:reset` restores the buggy fixture from `demo/fixture-template/`.
2. `bun run demo:hermes` starts Hermes Agent (Nous Research) on OpenRouter. It mounts the Waypoints MCP server, calls resume, then set_objective, and checkpoints after each test run. The script prints its pid.
3. After a checkpoint or two, run `kill -9 <pid>` from a second terminal. That simulates a crash: no graceful shutdown and no handoff.
4. `bun run demo:langgraph` starts our LangGraph.js agent. It calls `resume` (previous_agent=hermes), reads the last checkpoint, open threads, failures, and policies, then finishes the job.
   - `--fresh`: new objective.
   - `--max-steps N`: step limit.
   - `--die-after N`: SIGKILL itself; fallback demo without Hermes.
   - `DEMO_MODEL=<slug>`: override `openrouter/auto` (default; auto-router restricted to `anthropic/claude-sonnet-5` and `openai/gpt-5.5`).
   - `WAYPOINTS_DEBUG=1`: show server stderr.

Hermes runs with an isolated `HERMES_HOME` (`demo/hermes/.home`, gitignored), built from `demo/hermes/config.yaml`. It never touches `~/.hermes/config.yaml`.
Its MCP server runs with cwd set to the repo root, so bun loads `.env` itself. Hermes only passes PATH/HOME-type variables through to MCP servers.
