# Waypoints — Build Design (handoff)
Status: hackathon build doc, Sept 26 2026. Written for an implementing agent (Claude Code). Scope is deliberately loose — build what's specified, use judgment elsewhere, ask rather than invent scope.

> **Decisions made at 11:10 that override the original text below** (original kept for history):
> - **Language: TypeScript on bun**, not Python. Official MCP TS SDK (`@modelcontextprotocol/sdk`), stdio transport. Deps: mongodb, voyageai, zod.
> - **Embeddings: Voyage client-side** (`voyage-4`, 1024-dim, inputType document/query) + `rerank-2.5`. NOT Atlas Automated Embedding (preview; 3 req/min cap on unpaid orgs would stall the demo).
> - **One `memories` collection** holds the embedded text of every checkpoint/decision/failure (with `kind` + `source_id` back-reference) under ONE vector index `memories_vec`. M0 allows only 3 search indexes total.
> - **Demo harnesses:** Hermes Agent (Nous Research, third-party, on OpenRouter) works the task → kill -9 → a LangGraph.js agent we write (OpenRouter) calls `resume` and continues. Fallback: LangGraph agent kills/resumes itself.

## What this is
An MCP server that gives any agent harness long-horizon memory and self-modification policy. MongoDB Atlas is the substrate; MCP is the only interface. The harness stays somebody else's — we are the layer it mounts.
- Problem statement: Long Horizon Engineering (primary), Recursive Harnessing (via the `adapt` tool — cuttable, see milestones).
- Hard rules: MongoDB Atlas Sandbox cluster is the only Atlas target. All code written today. No dashboard in the product; the demo surface is a terminal.
- Language: ~~Python~~ TypeScript (see decisions above).

## Tool surface (six tools, one server)
1. `set_objective(objective, bearings[], waypoints[])` — write the goal tree + measurable bearings to Atlas. Bearings are measurable (number + unit), not vibes.
2. `checkpoint(state_summary, open_threads[], next_action)` — compact working-state snapshot, called when context fills or at task boundaries.
3. `resume(objective_id)` — reconstruct: objective, current waypoint, open threads, last decision, recent failures. This is the tool a restarted session calls first.
4. `log_decision(decision, rationale, evidence)` — append-only decision ledger.
5. `log_failure(failure, class, context)` — append + triggers a postmortem doc. Failures are typed so they're retrievable.
6. `recall(query, kind)` — Voyage embeddings over checkpoints/postmortems/decisions, Atlas Vector Search, rerank top results before returning.

Cuttable extension (do NOT build unless milestones say so): `adapt(policy_patch)` — converts a postmortem into a versioned policy document with provenance (which failure, what change, reversible). The harness reads policies at session start. Deterministic review gate, never model-decided.

## Data model (Atlas collections, one database `waypoints`)
- `objectives` — goal tree, bearings, waypoints, status
- `checkpoints` — state summaries, session id, timestamp, token estimate
- `decisions` — ledger, append-only
- `failures` — typed failure records + postmortem body
- `memories` — embedded text for recall (see decisions)
Schemas: keep documents simple and self-describing. A doc should be readable in Compass by a judge with zero explanation.

## Milestones (submissions 5:00 PM, demo freeze ~3:45)
1. **By 13:00** — server live with `checkpoint`, `resume`, `log_decision`, `recall` against the Sandbox cluster. A scripted agent loop exercises all four.
2. **By 14:30** — kill/restart demo works: kill the client process mid-task, restart, `resume` reconstructs state, `recall` retrieves an earlier failure.
3. **By 15:00** — `adapt` (only if 1–2 are solid): log_failure → postmortem → policy patch → next session's behavior differs. If not solid by 15:00, cut it.
4. **15:00–15:45** — record 1-minute demo video, README, public repo, submit before 17:00.

## Demo script
1. Kill -9 mid-task → restart → resumes exactly where it left off (long horizon).
2. Same failure class recurs → behavior differs because the postmortem is now standing policy (recursive). Only if milestone 3 landed.

## Non-goals
No UI. No auth beyond the sandbox connection string. No multi-tenancy. No HTTP transport if stdio works. No fine-tuning, no decision-model integration (leave the `classify()` seam in design notes only).
