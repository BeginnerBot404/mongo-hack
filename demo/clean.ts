// Delete Waypoints documents that belong to demo objectives (the invoice fixture task), so each rehearsal starts
// empty. Touches only the Waypoints DB (WAYPOINTS_DB, default "waypoints"); never drops collections or indexes.
//   bun run demo:clean   (then restores the fixture via demo/reset.sh)
import { mongo, waypointsDb as db } from "../src/clients";

const DEMO_OBJECTIVE = /demo\/fixture\/invoice/;
const CHILD_COLLECTIONS = ["checkpoints", "decisions", "failures", "policies", "resumes", "memories"];

try {
  const ids = (await db.collection("objectives").find({ objective: DEMO_OBJECTIVE }, { projection: { _id: 1 } }).toArray()).map((o) => o._id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    for (const name of CHILD_COLLECTIONS) {
      counts[name] = (await db.collection(name).deleteMany({ objective_id: { $in: ids } })).deletedCount;
    }
    counts.objectives = (await db.collection("objectives").deleteMany({ _id: { $in: ids } })).deletedCount;
  }
  const summary = Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" ") || "nothing to delete";
  console.log(`demo:clean · db "${db.databaseName}" · ${ids.length} demo objective(s) · ${summary}`);
} finally {
  await mongo.close();
}
