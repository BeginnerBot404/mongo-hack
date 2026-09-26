# Waypoints: build plan (2026-09-26)

Hard deadline: **submit by 17:00**. Demo freeze at 15:45. Judging is a 3-minute live terminal demo followed by 2 minutes of Q&A.

## Timeline
| By | Milestone | Owner | Gate |
|---|---|---|---|
| 11:45 | Credentials in `.env`; `bun run check` all ✔ | Ryan (PUNCHLIST.md) | blocks everything live |
| 12:15 | `bun run setup` builds `memories_vec`; `bun run smoke` passes all 8 tools against Atlas | Claude (server subagent) | fix what breaks |
| 13:00 | **M1**: LangGraph agent completes the practice codebase task end-to-end with checkpoints, decisions and recall | Claude (demo subagent) | if not, cut Hermes; LangGraph is the only agent |
| 13:45 | **M2**: kill -9 mid-task → restart → `resume` continues from the right waypoint; recall surfaces the earlier failure | Claude | the demo's core beat; don't move on until it's reliable |
| 14:15 | Hermes beat: Hermes works the task → kill -9 → LangGraph resumes with `previous_agent: hermes` | Claude + Ryan (Hermes login if needed) | hard cut at 14:15 if Hermes is flaky |
| 15:00 | **M3** `adapt`: a recurring failure class becomes a policy → the next session behaves differently (visible in the log) | Claude | cut without ceremony if not solid |
| 15:30 | README (what/why/how, what was built today, architecture), demo script rehearsed 2× | Claude drafts, Ryan edits | |
| 15:45 | Record 1-min video (screen + voiceover), upload unlisted, check the link in a private window | Ryan | |
| 16:15 | Submit on Cerebral Valley (repo, video, description). Buffer until 17:00. | Ryan | |

## Demo (3 minutes, terminal only)
1. **(20s) Problem:** agents lose everything on a crash or context reset. Waypoints is an MCP server any agent mounts; Atlas is the memory.
2. **(60s) Long horizon:**
   - Hermes starts fixing the practice codebase and checkpoints, with bearings at 3/8 tests passing.
   - `kill -9`.
   - The LangGraph agent starts, calls `resume`, and shows the objective, waypoint, open threads and "previous_agent: hermes".
   - It continues, and the bearing climbs.
3. **(45s) Recursive:**
   - The same bug class hits twice.
   - `log_failure` produces a postmortem and `adapt` turns it into a versioned policy.
   - The next session reads the policy at `resume` and checks for that class first.
4. **(30s) Atlas proof:** show the documents in Atlas: the ledger, the resume events, the policy and where it came from. Then run `recall` live with reranked hits.
5. **(25s) Impact:** any MCP agent (Claude Code, Hermes, LangGraph) gets crash-proof memory plus policies learned from its own failures.

## Q&A prep (Ryan)
- **Why not just a long context window?**
  - Crashes and context resets wipe it.
  - Cost grows with every token.
  - The context belongs to one agent and can't be shared.
- **Why Atlas?**
  - Documents plus vector search plus the ledger live in one store.
  - Everything can be queried by objective.
- **Why is policy deterministic?**
  - The model proposes; code approves.
  - That makes it auditable and reversible.
- **Isn't this RAG?**
  - Recall is one tool out of eight.
  - The core is state reconstruction, measurable bearings, and failure-to-policy.

## Risks and fallbacks
- **Atlas not ready by 12:00:** ask the tech table right away. Nothing live can happen without it.
- **Vector index lag:** smoke waits 5s. In the demo, recall targets memories written more than a minute earlier.
- **OpenRouter auto-router picks a weak tool-caller:** pin `DEMO_MODEL` to a strong tool-calling model and restrict the auto-router candidate list.
- **Hermes won't connect over MCP by 14:15:** use Claude Code as the second agent instead. It already speaks MCP, so it's a one-line `claude mcp add`.
- **Live demo fails in the room:** keep a recorded backup run (asciinema or screen recording) ready to play.

## Orchestration
Claude orchestrates; subagents build. One subagent per area (server `src/`, demo `demo/`) so they don't overlap. Claude pushes, and every commit happens after 10:30.
