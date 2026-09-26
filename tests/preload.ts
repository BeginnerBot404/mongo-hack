// Preloaded by `bun run test:all`. bun test shares one module registry across files, and src/clients.ts
// reads WAYPOINTS_DB once at import time, so point it at a throwaway db BEFORE anything imports it.
// DB tests also assert the db name starts with "waypoints_test_" and refuse to run otherwise.
if (!process.env.WAYPOINTS_DB?.startsWith("waypoints_test_")) {
  process.env.WAYPOINTS_DB = `waypoints_test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
