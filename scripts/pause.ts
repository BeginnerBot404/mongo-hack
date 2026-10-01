// bun run pause — stop the live run cleanly. Deletes nothing.
// Stops harness, sentinel and the snapshot loop; releases claimed accounts back to the queue;
// marks the NOW WRITING strip idle; takes a final snapshot of the live DB.
import { $ } from "bun";
import { MongoClient } from "mongodb";

for (const pattern of ["demo/harness.ts", "src/sentinel.ts", "scripts/snapshot-loop.ts"]) {
  await $`pkill -TERM -f ${pattern}`.nothrow().quiet();
}
await Bun.sleep(3000);
const left = (await $`pgrep -f ${"demo/harness.ts|src/sentinel.ts|scripts/snapshot-loop.ts"}`.nothrow().quiet().text()).trim();
if (left) console.warn(`still running (pids ${left.split("\n").join(", ")}); run pause again in a few seconds`);

const client = new MongoClient(process.env.MONGODB_URI!);
try {
  const db = client.db("waypoints");
  const r = await db.collection("accounts").updateMany(
    { status: "in_progress" },
    { $set: { status: "pending" }, $unset: { claimed_by: "", claimed_at: "" } },
  );
  await db.collection("inflight").updateMany({}, { $set: { phase: "idle", updated_at: new Date() } });
  const drafts = await db.collection("drafts").countDocuments();
  const playbook = (await db.collection("harness_config").find().sort({ version: -1 }).limit(1).next())?.version;
  const bar = (await db.collection("bars").find().sort({ version: -1 }).limit(1).next())?.version;
  console.log(`⏸  paused · released ${r.modifiedCount} claim(s) · ${drafts} drafts · playbook v${playbook} · bar v${bar}`);
} finally {
  await client.close();
}
await $`bun ${process.env.HOME}/waypoints-backups/snapshot.ts`.nothrow();
console.log("resume with: bun run resume");
