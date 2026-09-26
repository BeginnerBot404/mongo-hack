// Idempotent loader: data/accounts.csv → waypoints.accounts (upsert by account). Run: `bun run load:accounts`.
// The first QUEUE_SIZE accounts by queue_index (default 24) are the work queue; the rest are "reserve".
// Progress (done/failed) is preserved on re-run; pass --reset to put the queue back to pending and clear drafts.
import { mongo } from "../src/clients";
import { accounts, parseAccountsCsv, queueSize } from "../src/outreach/data";
import { ensureOutreachIndexes, resetOutreach } from "../src/outreach/tools";
import { waypointsDb as db } from "../src/clients";

const rows = parseAccountsCsv();
const size = queueSize();
const existing = new Map((await accounts().find({}, { projection: { account: 1, status: 1 } }).toArray()).map((a) => [a.account, a.status]));
const res = await accounts().bulkWrite(
  rows.map((r) => {
    const prev = existing.get(r.account);
    const inQueue = r.queue_index < size;
    const status = !inQueue ? "reserve" : prev === "done" || prev === "failed" ? prev : "pending"; // an in_progress claim from a dead run goes back to pending
    return { replaceOne: { filter: { account: r.account }, replacement: { ...r, status }, upsert: true } };
  }),
);
await accounts().deleteMany({ account: { $nin: rows.map((r) => r.account) } });
await ensureOutreachIndexes(db);
if (process.argv.includes("--reset")) await resetOutreach(db);
const counts = await accounts().aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray();
console.log(
  `accounts: ${rows.length} rows, upserted ${res.upsertedCount}, modified ${res.modifiedCount}; queue size ${size}; ` +
    counts.map((c) => `${c._id} ${c.n}`).join(", "),
);
await mongo.close();
