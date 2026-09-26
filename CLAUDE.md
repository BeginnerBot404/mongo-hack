# mongo-hack

## Event

Harness Engineering & Model Wrangling Hackathon (MongoDB / Cerebral Valley), 2026-09-26. Hacking started 10:30AM.

- Submissions due **5:00PM** today.
- Finals: MongoDB.local NYC, 9/30 from 10AM.

## Hard constraints

- Atlas Hackathon Sandbox must be a **core** component, not a side detail.
- Public repo.
- Original work only. Demo only what was built today.
- Submit on Cerebral Valley: repo link, ~1-minute screen-recording video with voiceover (a demo, not a pitch), and a description. One person submits; all teammates added.

## Banned project types

Basic RAG, Streamlit apps, dashboard-as-main-feature, image analyzers, and bots for education, mental health, nutrition, medical, sports, job screening, or personality.

## Judging

- Technical demo 35%
- Implementation difficulty 30%
- Impact 20%
- Creativity 15%

Live: 3-minute demo + 2-minute Q&A, hard cut at 5 minutes.

## Tracks

1. **Recursive Harnessing**: a self-improving harness that evolves its own rules, context policies, guardrails, and tool access.
2. **Long Horizon Engineering**: coherent memory across billions of tokens / multi-day tasks; optimizes toward long-term goals from hard metric signals.

## Stack

- bun + TypeScript. Bun auto-loads `.env`; do not add dotenv.
- `src/clients.ts` exports `mongo`, `db`, `llm` (OpenAI SDK pointed at OpenRouter), `model`, `voyage`. Import from there.
- `bun run check` smoke-tests MongoDB, OpenRouter, and Voyage credentials.
- `bun run typecheck` before committing.
- Requires bun >= 1.4 (bson 7.3 crashes on import under bun 1.3.x).
- MongoDB MCP server + skills come from the `mongodb-atlas` Claude plugin.

## Working rules

- Never copy code from prior projects. Everything here is written fresh today.
- Commit small and often.
- Never read, print, or commit `.env`.
- Don't bypass the pre-commit hook (`.githooks/pre-commit`).

## Reference docs (check before writing integration code — avoid API drift)
- `docs/STACK.md` — verified TS quick-reference: OpenRouter routers & cost fields, Atlas vector search + autoEmbed, Voyage, LangGraph.js, Strands.
- `docs/refs/` — raw official doc snapshots (see its README for sources).
- Live docs via MCP: `docs-langchain`, `langchain-reference`, `openrouter`, `strands-agents`, MongoDB plugin.

## Team (remove before submission)
Ryan leads; a teammate may join. Onboarding: `team/ONBOARDING.md`. If you're a Claude session on the teammate's machine: don't edit `src/` or `demo/` without Ryan's OK (another agent owns them), `git pull --rebase` before every push, commit small.
