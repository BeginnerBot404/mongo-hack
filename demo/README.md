# Waypoints harness demo

Default task (`--task sales`, docs/SALES-PACK.md): improve a B2B deal-qualification rubric. A deterministic scorer in Atlas
grades every proposal on held-out real Won/Lost deals the agent never sees. Bearings `holdout_auc` and `a_grade_win_rate`;
end state `holdout_auc ≥ T_AUC` (src/sales/targets.ts), immutable. History carries over: a fresh run starts from the best
rubric learned in earlier runs. The original invoice fixture is `--task invoice` (`bun run harness:invoice`).
Needs `MONGODB_URI`, `VOYAGE_API_KEY` and `OPENROUTER_API_KEY` in the repo `.env`, and `bun run load:sales` once.

## Run order
1. `bun run demo:clean`: archives the open objective only (history, harness_config and rubrics are kept).
   `bun run demo:clean --hard` wipes everything (incl. rubrics) and reseeds harness_config v1: once, before history begins.
2. `bun run sentinel` in the background (second pane): scores failures and checkpoints, taps, puts fragments on probation.
3. Flight recorder (`flight-recorder/`, see its README).
4. `DEMO_PROVIDER= bun run harness --fresh --die-after-checkpoint 3`: new objective; SIGKILLs itself on the first tool call
   after checkpoint 3 (or `kill -9` it by hand).
5. `DEMO_PROVIDER= bun run harness`: resumes from the last checkpoint and iterates to the end state (or `--max-steps`, default 15 proposals).

What the terminal shows (one line per meaningful step):
- `◎ END STATE holdout AUC ≥ 0.875 — immutable`
- `◆ starting from rubric vN (holdout AUC 0.xxx) learned in an earlier run`
- `✎ v5  + up_sale=Yes (+2)   holdout AUC 0.710 → 0.740   A-win 68%  gap 0.03`: every proposal, with its time.
- `⚠ OVERFIT v6 seller=Seller 3 (7 deals) gap 0.11 → logged`: the harness logs `overfit_segment` itself.
- `▼ BEARING DROP` (the server logs `regression`), `▲ TAP … → adjust_settings (vN, probation)`, `⟳ SETTINGS v3 → v4`,
  `✔/✖ PROBATION … KEPT/ROLLED_BACK`, `⛨ harness checkpoint … → log_failure [skipped_checkpoint]`.
- `💭` only when the model states a hypothesis; `◆ turn N · <provider:model> · 7.6s · settings vN` per turn.

Protocol, handled by the harness rather than the model: resume → get_settings → system prompt = pack base prompt +
fragment texts → after every `propose_rubric`, a checkpoint with `settings_version` and bearings stamped from the
**holdout** metrics (never the model's claim). If the model moves on without checkpointing, the harness writes it (`⛨`,
required_tools) and logs `skipped_checkpoint`. Invalid proposals log `invalid_rubric`.

Flags: `--task sales|invoice`, `--fresh`, `--die-after N`, `--die-after-checkpoint N`, `--max-steps N`.
Models (GLM only): OpenRouter `z-ai/glm-5.3-flash` when `DEMO_PROVIDER` is empty; `DEMO_PROVIDER=gb10` uses `GB10_BASE_URL`,
`GB10_MODEL`, `GB10_API_KEY` with OpenRouter GLM as fallback (slow, ~30 tok/s: background history runs only).
`DEMO_MODEL=<slug>` overrides. `WAYPOINTS_DEBUG=1` shows the server's stderr. `TAP_WAIT_MS` (default 30000): after a
drop, how long to wait for the sentinel.
