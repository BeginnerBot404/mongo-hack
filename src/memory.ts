// Embedded memory for recall: one `memories` collection, one vector index.
import { ObjectId, type Document } from "mongodb";
import { voyage, waypointsDb } from "./clients";
import { log } from "./log";

export const EMBED_MODEL = "voyage-4";
export const RERANK_MODEL = "rerank-2.5";
export const VECTOR_INDEX = "memories_vec";
export const EMBED_DIMENSIONS = 1024;

export type MemoryKind = "checkpoint" | "decision" | "failure";

// Fail fast: a rate-limited or slow Voyage must never stall an agent's tool call.
const VOYAGE_REQUEST = { timeoutInSeconds: 4, maxRetries: 0 };
let voyagePausedUntil = 0;
function voyageAvailable(): boolean {
  return Date.now() >= voyagePausedUntil;
}
function noteVoyageError(err: unknown) {
  if (/429|rate/i.test(err instanceof Error ? err.message : String(err))) voyagePausedUntil = Date.now() + 60_000;
}

async function embed(text: string, inputType: "document" | "query"): Promise<number[] | null> {
  if (!process.env.VOYAGE_API_KEY) {
    log("VOYAGE_API_KEY not set; skipping embedding");
    return null;
  }
  if (!voyageAvailable()) return null;
  try {
    const res = await voyage.embed({ input: [text], model: EMBED_MODEL, inputType, outputDimension: EMBED_DIMENSIONS }, VOYAGE_REQUEST);
    const vector = res.data?.[0]?.embedding;
    if (!vector?.length) throw new Error("Voyage returned no embedding");
    return vector;
  } catch (err) {
    noteVoyageError(err);
    log("embedding failed:", err instanceof Error ? err.message : String(err));
    return null;
  }
}

/** Store a memory. Never throws for embedding problems: the memory is saved without a vector. */
export async function remember(input: {
  kind: MemoryKind;
  source_id: ObjectId;
  objective_id: ObjectId;
  text: string;
  agent: string;
  created_at: Date;
}): Promise<void> {
  const embedding = await embed(input.text, "document");
  const doc: Document = { ...input, embedding_model: embedding ? EMBED_MODEL : null };
  if (embedding) doc.embedding = embedding;
  await waypointsDb.collection("memories").insertOne(doc);
}

export async function recall(input: {
  query: string;
  kind?: "checkpoint" | "decision" | "failure" | "any";
  objective_id?: ObjectId;
  limit: number;
}) {
  const memories = waypointsDb.collection("memories");
  const filters: Document[] = [];
  if (input.kind && input.kind !== "any") filters.push({ kind: input.kind });
  if (input.objective_id) filters.push({ objective_id: input.objective_id });
  const filter = filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { $and: filters };

  const projection = { _id: 0, memory_id: "$_id", kind: 1, source_id: 1, objective_id: 1, text: 1, agent: 1, created_at: 1 };

  const queryVector = await embed(input.query, "query");
  let candidates: Document[];
  let method: string;
  if (queryVector) {
    candidates = await memories
      .aggregate([
        {
          $vectorSearch: {
            index: VECTOR_INDEX,
            path: "embedding",
            queryVector,
            numCandidates: 100,
            limit: 20,
            ...(filter ? { filter } : {}),
          },
        },
        { $project: { ...projection, vector_score: { $meta: "vectorSearchScore" } } },
      ])
      .toArray();
    method = `vector search (${EMBED_MODEL})`;
  } else {
    // Degraded mode: no query embedding available. Return the most recent matching memories.
    candidates = await memories
      .aggregate([{ $match: filter ?? {} }, { $sort: { created_at: -1 } }, { $limit: 20 }, { $project: projection }])
      .toArray();
    method = "most recent (embedding unavailable)";
  }

  if (candidates.length === 0) return { query: input.query, method, results: [] };

  try {
    if (!process.env.VOYAGE_API_KEY) throw new Error("VOYAGE_API_KEY not set");
    if (!voyageAvailable()) throw new Error("Voyage paused after a rate limit");
    const reranked = await voyage.rerank({
      query: input.query,
      documents: candidates.map((c) => String(c.text ?? "")),
      model: RERANK_MODEL,
      topK: Math.min(input.limit, candidates.length),
    }, VOYAGE_REQUEST);
    const results = (reranked.data ?? []).map((r) => ({
      ...candidates[r.index ?? 0],
      relevance_score: r.relevanceScore ?? null,
    }));
    return { query: input.query, method: `${method} + ${RERANK_MODEL} rerank`, results };
  } catch (err) {
    noteVoyageError(err);
    log("rerank failed:", err instanceof Error ? err.message : String(err));
    return { query: input.query, method: `${method} (rerank unavailable)`, results: candidates.slice(0, input.limit) };
  }
}
