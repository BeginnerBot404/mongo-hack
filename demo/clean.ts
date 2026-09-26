// Wipe every document in the Waypoints collections so each rehearsal starts empty (no stale objectives for the
// first `resume`, a clean flight recorder), then reset harness_config to exactly one seed v1 document
// (SEED_SETTINGS from src/fragments.ts). Touches only the Waypoints DB (WAYPOINTS_DB, default "waypoints");
// never drops collections or indexes, never touches other databases.
//   bun run demo:clean   (then restores the fixture via demo/reset.sh)
import { mongo, waypointsDb as db } from "../src/clients";
import { seedConfig } from "../src/settings";

const COLLECTIONS = ["objectives", "checkpoints", "decisions", "failures", "memories", "resumes", "policies", "taps", "events", "harness_config"];

try {
  const counts: string[] = [];
  for (const name of COLLECTIONS) {
    const n = (await db.collection(name).deleteMany({})).deletedCount;
    if (n) counts.push(`${name}=${n}`);
  }
  const seed = seedConfig();
  await db.collection("harness_config").insertOne(seed);
  console.log(`demo:clean · db "${db.databaseName}" · ${counts.join(" ") || "already empty"} · harness_config reset to v1 (threshold ${seed.settings.sentinel_threshold})`);
} finally {
  await mongo.close();
}
