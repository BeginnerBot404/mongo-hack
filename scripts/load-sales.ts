// Idempotent loader: data/b2b_sales.csv → waypoints.opportunities (upsert by row). Run: `bun run load:sales`.
import { mongo } from "../src/clients";
import { FEATURES, opportunities, parseSalesCsv } from "../src/sales/data";

const rows = await parseSalesCsv();
const coll = opportunities();
const res = await coll.bulkWrite(rows.map((r) => ({ replaceOne: { filter: { row: r.row }, replacement: r, upsert: true } })));
await coll.deleteMany({ row: { $gt: rows.length } });
await coll.createIndex({ row: 1 }, { unique: true });
await coll.createIndex({ split: 1, won: 1 });
await coll.createIndex({ won: 1 });
await coll.createIndex({ split: 1 });
const count = (split: string, won?: boolean) => rows.filter((r) => r.split === split && (won === undefined || r.won === won)).length;
console.log(
  `opportunities: ${rows.length} rows (${FEATURES.length} features), upserted ${res.upsertedCount}, modified ${res.modifiedCount}; ` +
    `train ${count("train")} (${count("train", true)} won), holdout ${count("holdout")} (${count("holdout", true)} won)`,
);
await mongo.close();
