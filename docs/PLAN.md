# Waypoints: final plan (2026-09-26, sales direction)

Task: B2B deal-qualification rubric (`docs/SALES-PACK.md`), end state holdout AUC ≥ 0.89, locked. Judging is a 3-minute live demo plus 2 minutes of Q&A.

## Timeline
| By | Milestone | Gate |
|---|---|---|
| now–16:10 | History runs finish in Atlas; README/PLAN match the code; one rehearsal of the beats below | fix only what breaks the demo |
| 16:10 | **Freeze.** No code changes after this. | |
| 16:10–16:40 | Record the 1-min video (script in SUBMISSION.md), upload unlisted, check the link in a private window | |
| 16:50 | **Submit** on Cerebral Valley (repo, video, description) | portal closes 17:00 |
| 17:15 | Judging | |

## Demo (3 minutes)
Setup before walking up: `bun run demo:layout` (harness pane with the command pre-typed, `view:prompt`, `view:rubric`, `view:atlas`; sentinel running in its tab). Flight recorder at http://localhost:3100/?replay=1&speed=20, paused. Backup: the recorded video.

1. **(0:00–0:20) Problem.** Sales teams qualify deals with checklists nobody validates. An agent could tune one overnight, but left alone agents overfit, crash and lose state, or quietly move the goal.
2. **(0:20–1:10) What happened this afternoon (replay).** Unpause the flight recorder.
   - 448 real deals, public CC-BY dataset. The agent writes a points rubric; an Atlas aggregation grades it on holdout deals it never sees.
   - End state holdout AUC ≥ 0.89, set once, never editable.
   - Point at the score line climbing, the `overfit-segment` failure, the alert with its risk components, the playbook change (`+min_support_15` on trial) and the verdict with before/after counts.
3. **(1:10–2:10) Live: crash and resume.**
   - Run the pre-typed `bun run harness --fresh --die-after-checkpoint 3`. Point at `◎ END STATE`, proposals landing in `view:rubric`, inserts streaming in `view:atlas`.
   - It kills itself after checkpoint 3 (or `kill -9` by hand). "Everything in its context window is gone."
   - `bun run harness`: `resume` hands back a bounded working state; it continues from the best rubric.
   - If the sentinel alerts live, point at `view:prompt`: the system prompt changes mid-run, one fragment, from the fixed library.
4. **(2:10–2:50) Why it's safe.** Three walls: the end state no tool can edit; a `$jsonSchema` validator that allows only four settings fields; the agent has no settings-writing tools, only the sentinel's surgeon does. Trials roll back automatically, in a transaction. Nothing is deleted.
5. **(2:50–3:00) Close.** "Memory, playbook and guardrails in Atlas. It gets better on a long task without moving the goalposts. It can change its route, never its destination."

**If the live run fails:** "Let me show the recording." Don't debug on stage.

## Q&A prep (answers ≤ 25 words)
- **Isn't this just RAG?** No. Recall is one tool of eight. The core is crash recovery, a hard metric that logs its own failures, and gated self-modification with rollback.
- **Billions of tokens?** We didn't run billions today and don't claim to. Resume returns the same bounded payload at checkpoint 5 or 5,000. Atlas holds everything else.
- **What stops it rewriting its goal?** End state is written once, no tool edits it. The validator only allows four settings fields. The agent has no settings-writing tools at all.
- **What if the sentinel is wrong?** Every change runs on trial. After two checkpoints it's kept only if the score held and the failure didn't recur. Otherwise it rolls back automatically.
- **Why deterministic?** Every alert is explainable from stored components: fixed weights, action chosen in code. Reproducible on stage, auditable afterward. The LLM never decides its own guardrails.
- **Why not AutoML or logistic regression?** You could, and it'd probably match the AUC. The rubric is the test task. The product is the harness that improves safely on any metric.
- **Is 448 deals enough?** It's small, which is the point: overfitting is real. Fixed holdout the agent never sees, minimum 15-deal support per rule, gap flag over 0.08.
- **Why Atlas?** Documents, vector search, aggregation scoring, schema validation, transactions and change streams in one place. The sentinel, flight recorder and terminal views all run on change streams.
- **How does this generalize?** Any long task with a hard metric. We started on a code-fixing task (still `--task invoice`); the sales task reused the same roles, gate and sentinel.
- **Built today vs. used?** All code written today, from 10:37. We used LangGraph.js, the MCP SDK, Next.js, Voyage, OpenRouter and a public CC-BY dataset.
- **Why GLM / OpenRouter?** GLM Flash is fast and cheap for many iterations. The model is one gated playbook setting; GB10 runs GLM locally for background history runs.
- **More time?** Call-transcript signals, the sentinel on Atlas Stream Processing, multi-day runs, an Atlas custom role locking settings for the agent's DB user.

## Cut order (first cut first)
1. GB10 anything on stage (OpenRouter GLM only)
2. Jev advisor
3. The Claude Code moment
4. Flight-recorder extras beyond the story view and replay
5. Live sentinel alert (show it in the replay instead)

**Never cut:** kill → resume, the replay showing alert → trial → verdict, the immutable end state, video time.

## Risks and fallbacks
- **Model skips checkpoints:** the harness writes them itself and logs `skipped-checkpoint`; the sentinel answers with `checkpoint_every_eval`.
- **Voyage rate-limited:** memories are stored without a vector; the sentinel's similarity falls back to term overlap.
- **Flight recorder not live:** the `view:*` panes, or `bun run watch`.
- **Live demo fails:** play the recorded video.
