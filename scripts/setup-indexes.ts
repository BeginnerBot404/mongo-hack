// Idempotent: creates collections, regular indexes, and the memories_vec vector index. Run: `bun run setup`.
import { MongoServerError } from "mongodb";
import { mongo, waypointsDb as db } from "../src/clients";
import { EMBED_DIMENSIONS, VECTOR_INDEX } from "../src/memory";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Nothing to do.");
  process.exit(1);
}

type SearchIndexInfo = { name: string; status?: string; queryable?: boolean };

const collections = ["objectives", "checkpoints", "decisions", "failures", "memories", "resumes", "policies"];
const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
for (const name of collections) {
  if (existing.has(name)) continue;
  try {
    await db.createCollection(name);
    console.log(`created collection ${name}`);
  } catch (err) {
    if (!(err instanceof MongoServerError && err.code === 48)) throw err; // 48 = NamespaceExists
  }
}

await db.collection("objectives").createIndex({ status: 1, updated_at: -1 });
for (const name of ["checkpoints", "decisions", "failures", "memories", "resumes", "policies"]) {
  await db.collection(name).createIndex({ objective_id: 1, created_at: -1 });
}
await db.collection("checkpoints").createIndex({ objective_id: 1, seq: -1 });
await db.collection("failures").createIndex({ objective_id: 1, class: 1, created_at: 1 });
await db.collection("policies").createIndex({ objective_id: 1, class: 1, version: -1 });
console.log("regular indexes ok");

const memories = db.collection("memories");
const [found] = (await memories.listSearchIndexes(VECTOR_INDEX).toArray()) as SearchIndexInfo[];
if (found) {
  console.log(`vector index ${VECTOR_INDEX} already exists (status ${found.status})`);
} else {
  await memories.createSearchIndex({
    name: VECTOR_INDEX,
    type: "vectorSearch",
    definition: {
      fields: [
        { type: "vector", path: "embedding", numDimensions: EMBED_DIMENSIONS, similarity: "cosine" },
        { type: "filter", path: "kind" },
        { type: "filter", path: "objective_id" },
      ],
    },
  });
  console.log(`creating vector index ${VECTOR_INDEX}...`);
}

const started = Date.now();
for (;;) {
  const [idx] = (await memories.listSearchIndexes(VECTOR_INDEX).toArray()) as SearchIndexInfo[];
  if (idx?.queryable) {
    console.log(`vector index ${VECTOR_INDEX} is queryable (status ${idx.status})`);
    break;
  }
  if (Date.now() - started > 5 * 60_000) {
    console.error(`timed out waiting for ${VECTOR_INDEX} (last status ${idx?.status})`);
    process.exitCode = 1;
    break;
  }
  console.log(`waiting for ${VECTOR_INDEX}: status ${idx?.status ?? "unknown"}`);
  await Bun.sleep(5000);
}

await mongo.close();
