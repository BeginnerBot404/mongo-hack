// Default: archive every open (status "active") objective so the next `bun run harness --fresh` starts a new one,
// and keep everything else: history (checkpoints, failures, taps, events...), harness_config and rubrics carry over,
// so the next run's baseline is the best rubric learned so far and the flight recorder can replay real history.
//   bun run demo:clean           archive open objectives only
//   bun run demo:clean --hard    wipe every Waypoints document (incl. rubrics) and reseed harness_config v1
// Touches only the Waypoints DB (WAYPOINTS_DB, default "waypoints"); never drops collections or indexes.
// Never touches `opportunities` (the sales dataset). Outreach: both modes reset the queue (first QUEUE_SIZE accounts
// pending, the rest reserve) and clear drafts via resetOutreach(); --hard also clears taps/events/rubrics.
import { mongo, waypointsDb as db } from "../src/clients";
import { seedConfig } from "../src/settings";
import { resetOutreach } from "../src/outreach/tools";

const HARD = process.argv.includes("--hard");
const COLLECTIONS = ["objectives", "checkpoints", "decisions", "failures", "memories", "resumes", "policies", "taps", "events", "harness_config", "rubrics", "drafts"];

try {
  if (HARD) {
    const counts: string[] = [];
    for (const name of COLLECTIONS) {
      const n = (await db.collection(name).deleteMany({})).deletedCount;
      if (n) counts.push(`${name}=${n}`);
    }
    const seed = seedConfig();
    await db.collection("harness_config").insertOne(seed);
    const q = await resetOutreach(db);
    console.log(`demo:clean --hard · outreach queue ${q.pending} pending`);
    console.log(`demo:clean --hard · db "${db.databaseName}" · ${counts.join(" ") || "already empty"} · harness_config reset to v1 (threshold ${seed.settings.sentinel_threshold})`);
  } else {
    const r = await db.collection("objectives").updateMany({ status: "active" }, { $set: { status: "archived", archived_at: new Date() } });
    const cfg = await db.collection("harness_config").find({}, { projection: { version: 1 } }).sort({ version: -1 }).limit(1).next();
    const rubrics = await db.collection("rubrics").countDocuments();
    const q = await resetOutreach(db);
    console.log(`demo:clean · outreach queue reset: ${q.pending} pending, ${q.drafts_deleted} draft(s) cleared`);
    console.log(`demo:clean · db "${db.databaseName}" · archived ${r.modifiedCount} open objective(s) · kept history, harness_config (latest v${cfg?.version ?? "-"}) and ${rubrics} rubric(s)`);
  }
} finally {
  await mongo.close();
}
