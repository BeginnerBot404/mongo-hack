# Teammate onboarding (delete `team/` before submission)

**Ryan is the lead.** Claude Code on Ryan's machine orchestrates the build. You're joining to help: pick a lane below and check with Ryan before touching `src/`.

## What we're building (30-second version)
**Waypoints** is an MCP server that gives *any* agent crash-proof, long-horizon memory, stored in MongoDB Atlas. The agent records its goal and measurable "bearings", checkpoints its state, and logs decisions and typed failures. After a crash or context reset, `resume` rebuilds exactly where it was, **even in a different agent**.
- Recurring failures become versioned policies (`adapt`), and the agent reads them at the next resume.
- Tracks: Long Horizon Engineering (main), Recursive Harnessing (`adapt`).
- **Demo:** Hermes Agent works a task → `kill -9` → our LangGraph agent resumes it from Atlas and finishes.

Read next, in order: `docs/PLAN.md` (timeline and demo script) → `docs/waypoints-design.md` (tool contract) → `demo/README.md` (running the demo).

## Setup (≈10 min)
```bash
brew install oven-sh/bun/bun   # or: bun upgrade. Needs bun >= 1.4
git clone https://github.com/BeginnerBot404/mongo-hack && cd mongo-hack
bun install                     # also turns on the secret-blocking pre-commit hook
cp .env.example .env            # get values from Ryan via DM/AirDrop, never in a commit or public channel
bun run check                   # MongoDB, OpenRouter, Voyage should all show ✔
bun run smoke                   # runs all 8 Waypoints tools against Atlas
```
- **Atlas:** we use Ryan's sandbox cluster, so use Ryan's `MONGODB_URI`. Don't create your own cluster; the project must be built in *one* sandbox.
- **Claude Code (optional but recommended):** the repo's `CLAUDE.md` and `docs/refs/` (official doc snapshots) keep it accurate. Useful MCP servers:
  - `claude mcp add --transport http docs-langchain https://docs.langchain.com/mcp`
  - `claude mcp add --transport http openrouter https://mcp.openrouter.ai/mcp`

## Commands
| Command | What |
|---|---|
| `bun run check` | Credential smoke test |
| `bun run setup` | Create collections and the `memories_vec` vector index (idempotent) |
| `bun run smoke` | Exercise all 8 MCP tools end to end |
| `bun run server` | The MCP server (stdio). Agents spawn it; you rarely run it directly |
| `bun run demo:reset` | Restore the buggy practice codebase |
| `bun run demo:hermes` | Agent #1 (Hermes, on OpenRouter) |
| `bun run demo:langgraph` | Agent #2 (our LangGraph.js agent). Flags: `--fresh`, `--die-after N`, `--max-steps N` |
| `bun run typecheck` | Run before every commit |

## Repo map
- `src/server.ts`: MCP tool definitions. `src/waypoints.ts`: tool logic. `src/memory.ts`: Voyage embeddings, vector search, rerank.
- `scripts/`: index setup and the smoke test.
- `demo/`: practice codebase (`fixture/`, pristine copy in `fixture-template/`), the LangGraph agent, the Hermes harness, and the shared task spec (`task.md`).
- `docs/`: plan, design, `STACK.md` (verified API notes), `refs/` (official docs to grep).

## Lanes (pick one and tell Ryan)
1. **Demo operator:** own the Hermes → kill -9 → LangGraph run. Rehearse until it's reliable, and time it to fit the 3-minute slot.
2. **Story and submission:** README (what, why, how, what was built today), the 1-minute video (screen recording plus voiceover, not a pitch), the Cerebral Valley form. The CV walkthrough is at 4 PM.
3. **Q&A prep:** play judge. Ask the hard questions in `docs/PLAN.md`, and find weak spots in the demo.
4. **Evidence:** Atlas UI views that show the ledger, resume events and policies, plus LangSmith traces if we turn them on.

## Rules (breaking these can disqualify us)
- **Only code written today.** Nothing pasted from earlier projects, yours or anyone's.
- **Never commit `.env` or keys.** The pre-commit hook blocks it; don't use `--no-verify`.
- **Small commits, with `git pull --rebase` before every push.** Commit timestamps are our proof the work was done at the event.
- Don't edit `src/` or `demo/` while Claude is working on them. Ask Ryan first.
- No dashboard as the main feature. The demo is terminal only.

## Event logistics
- **Submissions due 17:00.** Demo freeze is 15:45.
- **Judging:** 3 minutes of live demo plus 2 minutes of Q&A, hard cut at 5 minutes. Back rooms are cleared at 4:30–4:45.
- **Ryan must add you to the Cerebral Valley submission page.** Also join the event Discord.
- **If we make the finals:** someone must be at MongoDB.local NYC (Pier 36) on **Wed 9/30 from 10 AM**, and the top 3 teams present at 4:30 PM.
