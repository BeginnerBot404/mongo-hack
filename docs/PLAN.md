# Waypoints harness: build plan, v2 (2026-09-26)

Source of truth: `docs/CONTRACT.md`. Code freeze **15:45**. Video **15:15–15:45**. Submit on Cerebral Valley **by 16:15** (portal closes 17:00; the rest is buffer). Judging is a 3-minute live demo followed by 2 minutes of Q&A.

## Timeline
| By | Milestone | Owner | Gate |
|---|---|---|---|
| 14:30 | Helper sub-graph in or cut | Claude (harness) | cut at 14:30 if not working |
| 14:45 | Flight recorder shows live data (timeline, risk meter, bearings + end state, event stream) | Claude (flight recorder) | if not, use `bun run watch` as the view |
| 15:00 | Full demo run end to end twice: kill → resume → trap → regression → tap → probation → kept → 10/10 | Claude + Ryan | fix only what breaks the run |
| 15:15 | README and PLAN match the code; rehearsal done | Claude drafts, Ryan edits | |
| 15:15–15:45 | Record the 1-min video (screen + voiceover), upload unlisted, check the link in a private window | Ryan | |
| 15:45 | **Freeze.** No code changes after this. | everyone | |
| 16:15 | Submit on Cerebral Valley (repo, video, description), all teammates added | Ryan | buffer until 17:00 |

## Demo (3 minutes)
Panes: harness, sentinel, flight recorder (or `bun run watch`).

1. **(20s) Problem.** Long agent runs lose their state on a crash, and "self-improving" harnesses let the model rewrite its own goal. The Waypoints harness keeps its memory, settings and guardrails in Atlas. It can change its route, never its destination.
2. **(40s) Kill and resume.**
   - `bun run harness --fresh`: `◎ END STATE` (10/10 tests, immutable), checkpoints after each test run.
   - `kill -9` mid-task.
   - `bun run harness`: `resume` rebuilds the objective, bearing, open threads and next action from Atlas, and the run continues.
3. **(60s) The trap and the tap.**
   - The obvious fix lands: `▼ BEARING DROP 9 → 8`. The server logs a `regression` failure on its own.
   - The sentinel scores it (similarity, recurrence, trend) and taps: `▲ TAP risk … → adjust_settings`.
   - The surgeon enables `verify_whole_suite` as settings v2 on probation. The flight recorder shows the diff card.
   - The harness reloads: `⟳ SETTINGS v1 → v2 (probation): +verify_whole_suite`.
4. **(40s) Probation.** The bearing recovers. After 2 checkpoints the sentinel keeps v2 (or rolls it back automatically). Show the verdict event and the `harness_config` versions in Atlas. The run reaches `✔ all green`, 10/10.
5. **(20s) Why it matters.** Every change is one field, versioned, gated in code, judged by the metric and reversible. Any MCP client can mount the agent role (optional 15s: Claude Code calling `resume`).

## Q&A prep (Ryan)
- **What stops the agent rewriting its goal?**
  - The end state is written once by `set_objective`, and no tool updates it.
  - The agent role has no settings-writing tools; only the sentinel mounts the surgeon role.
  - `harness_config` can't hold an end state: the `$jsonSchema` validator allows only the four settings fields, and the gate only accepts those four.
  - The prompt comes from a fixed fragment library; the model never writes prompt text.
- **What if the sentinel is wrong?**
  - Every change starts on probation with a bearing baseline.
  - After 2 checkpoints it's kept only if the bearing held and the watched failure class didn't recur. Otherwise it's rolled back automatically, in a transaction.
  - Only one version can be on probation at a time, and nothing is deleted: the rolled-back version stays in history.
- **Why deterministic?**
  - The score is a fixed weighted sum (0.4 similarity, 0.3 recurrence, 0.3 trend) and the action is chosen in code, so every tap can be explained from the stored components.
  - Jev is advisory only: its answer is recorded on the tap and never decides.
  - Reproducible in a demo and auditable afterwards.
- **Isn't this RAG?**
  - `recall` is one tool out of eight on the agent role.
  - The core is state reconstruction after a crash, a hard metric that logs its own failures, and gated, versioned self-modification with automatic rollback.
- **Billions of tokens?**
  - We didn't run billions of tokens today, and we don't claim to.
  - The agent's working context stays bounded: `resume` returns the latest checkpoint, the last 3 decisions and failures and the active policies, whatever the history length.
  - Atlas holds the unbounded history, `recall` fetches it on demand, and bearings plus the sentinel keep the run pointed at the end state.
- **Why Atlas?**
  - Documents, vector search, schema validation, transactions and change streams in one store. The sentinel and flight recorder are both driven by change streams.

## Cut order (first cut first)
1. GB10 as primary
2. Helper sub-graph (cut at 14:30)
3. Jev
4. The Claude Code moment
5. Flight-recorder extras
6. Tool-level enforcement beyond prompt fragments

**Never cut:** kill → resume, sentinel score → tap, a gated settings change with automatic rollback, the timeline (or the watch pane), video time.

## Risks and fallbacks
- **Model skips checkpoints:** the harness writes the checkpoint itself (`required_tools`). Sonnet 5 is pinned over GLM after rehearsal.
- **Voyage rate-limited:** memories are stored without a vector, recall falls back to most recent, and the sentinel's similarity falls back to term overlap.
- **Flight recorder not live:** `bun run watch`.
- **Live demo fails in the room:** play the recorded video.

## Orchestration
Claude orchestrates; subagents own separate paths (server `src/`, harness `demo/`, flight recorder `flight-recorder/`). Commit small; the orchestrator pushes.
