// Wipe every document in the Waypoints collections so each rehearsal starts empty (no stale smoke-test
// objectives for the first `resume` to pick up). Touches only the Waypoints DB (WAYPOINTS_DB, default
// "waypoints"); never drops collections or indexes, never touches other databases.
//   bun run demo:clean   (then restores the fixture via demo/reset.sh)
import { mongo, waypointsDb as db } from "../src/clients";

const COLLECTIONS = ["objectives", "checkpoints", "decisions", "failures", "memories", "resumes", "policies"];

try {
  const counts: string[] = [];
  for (const name of COLLECTIONS) {
    const n = (await db.collection(name).deleteMany({})).deletedCount;
    if (n) counts.push(`${name}=${n}`);
  }
  console.log(`demo:clean · db "${db.databaseName}" · ${counts.join(" ") || "already empty"}`);
} finally {
  await mongo.close();
}
