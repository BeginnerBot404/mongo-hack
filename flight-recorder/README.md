# Flight recorder

- Install: `cd flight-recorder && bun install && ln -sf ../.env .env.local` (reads `MONGODB_URI`, optional `WAYPOINTS_DB`).
- Run: `bun run dev`, then open http://localhost:3100. The live feed is served as SSE at `/api/stream`.
- Shows the newest objective: the immutable end state, bearings, the "brain surgery" timeline of settings versions and policies, sentinel risk and taps, and a plain-English event stream. Everything updates live from a MongoDB change stream.
- Fallback: run `bun run watch` from the repo root for the terminal view.
