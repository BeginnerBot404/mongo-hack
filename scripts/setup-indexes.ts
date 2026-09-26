// Idempotent: creates collections, regular indexes, and the memories_vec vector index. Run: `bun run setup`.
import { MongoServerError } from "mongodb";
import { mongo, waypointsDb as db } from "../src/clients";
import { EMBED_DIMENSIONS, VECTOR_INDEX } from "../src/memory";
import { HARNESS_CONFIG_SCHEMA, seedConfig } from "../src/settings";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set. Nothing to do.");
  process.exit(1);
}

type SearchIndexInfo = { name: string; status?: string; queryable?: boolean };

const collections = ["objectives", "checkpoints", "decisions", "failures", "memories", "resumes", "policies", "events", "taps"];
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
await db.collection("events").createIndex({ objective_id: 1, created_at: -1 });
await db.collection("events").createIndex({ created_at: -1 });
await db.collection("taps").createIndex({ objective_id: 1, status: 1, created_at: -1 });
console.log("regular indexes ok");

// harness_config: $jsonSchema validator (collMod when the collection already exists), indexes, seed v1.
const validation = { validator: { $jsonSchema: HARNESS_CONFIG_SCHEMA }, validationLevel: "strict", validationAction: "error" } as const;
if (existing.has("harness_config")) {
  await db.command({ collMod: "harness_config", ...validation });
  console.log("harness_config validator updated (collMod)");
} else {
  await db.createCollection("harness_config", validation);
  console.log("created collection harness_config with validator");
}
const harness = db.collection("harness_config");
await harness.createIndex({ version: -1 }, { unique: true });
await harness.createIndex({ status: 1, version: -1 });
if ((await harness.countDocuments({})) === 0) {
  await harness.insertOne(seedConfig());
  console.log("seeded harness_config v1");
} else {
  console.log("harness_config already seeded");
}

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
