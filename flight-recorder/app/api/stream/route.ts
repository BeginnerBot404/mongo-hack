// SSE: one snapshot of the newest objective, then every change in the waypoints DB.
// Events: `snapshot` (full state), `change` ({coll, op, id, doc}), `ping` (heartbeat), `error`.
import { ObjectId, type ChangeStream, type Document } from "mongodb";
import { dbParam, waypointsDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_OBJECTIVE = ["checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events", "rubrics", "drafts"] as const;
const GLOBAL = ["harness_config", "bars"] as const;
// inflight: one row per harness worker, rewritten ≤ every 300 ms while the model streams (NOW WRITING strip)
const WATCHED = ["objectives", "accounts", "inflight", ...GLOBAL, ...PER_OBJECTIVE];
const NO_EMBED = { projection: { embedding: 0 } };

/** ?series=1: every objective since the latest batch-1 objective (the harness's --continuous batches share one global playbook). */
async function seriesOf(db: ReturnType<typeof waypointsDb>, objective: Document): Promise<Document[]> {
  const start = await db
    .collection("objectives")
    .findOne({ batch: 1, created_at: { $lte: objective.created_at } }, { sort: { created_at: -1 }, projection: { created_at: 1 } });
  if (!start && objective.batch == null) return [objective];
  const from = start?.created_at ?? objective.created_at;
  const list = await db
    .collection("objectives")
    .find({ created_at: { $gte: from, $lte: objective.created_at } }, NO_EMBED)
    .sort({ created_at: -1 })
    .limit(40)
    .toArray();
  return list.reverse();
}

async function snapshot(pinned?: ObjectId | null, dbName?: string | null, series = false) {
  const db = waypointsDb(dbName);
  const objective = pinned
    ? await db.collection("objectives").findOne({ _id: pinned })
    : await db.collection("objectives").findOne({}, { sort: { created_at: -1 } });
  const out: Record<string, unknown> = { objective, at: new Date() };
  for (const g of GLOBAL) out[g] = await db.collection(g).find({}, NO_EMBED).sort({ version: 1 }).limit(100).toArray();
  out.inflight = await db.collection("inflight").find({}).sort({ worker: 1 }).limit(32).toArray();
  // the queue in play (reserve accounts are loaded but not queued)
  out.accounts = await db
    .collection("accounts")
    .find({ status: { $in: ["pending", "in_progress", "done", "failed"] } }, { projection: { embedding: 0 } })
    .sort({ queue_index: 1 })
    .limit(200)
    .toArray();
  if (!objective) {
    for (const c of PER_OBJECTIVE) out[c] = [];
    return out;
  }
  const objs = series ? await seriesOf(db, objective) : [objective];
  out.objectives = objs;
  const ids = objs.map((o) => o._id);
  const k = series ? 4 : 1;
  const limits: Record<string, number> = { checkpoints: 60 * k, events: 150 * k, taps: 40 * k, drafts: 200 * k, failures: 200 * k, resumes: 50 * k };
  await Promise.all(
    PER_OBJECTIVE.map(async (c) => {
      const docs = await db
        .collection(c)
        .find({ objective_id: { $in: ids } }, NO_EMBED)
        .sort({ created_at: -1 })
        .limit(limits[c] ?? 50)
        .toArray();
      out[c] = docs.reverse(); // oldest first
    }),
  );
  return out;
}

export async function GET(request: Request) {
  const pinParam = new URL(request.url).searchParams.get("objective");
  const pinned = pinParam && ObjectId.isValid(pinParam) ? new ObjectId(pinParam) : null;
  const dbName = dbParam(request);
  const series = new URL(request.url).searchParams.get("series") === "1";
  const enc = new TextEncoder();
  let stream: ChangeStream | null = null;
  let hb: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          closed = true;
        }
      };
      const cleanup = async () => {
        if (closed && !stream) return;
        closed = true;
        if (hb) clearInterval(hb);
        const s = stream;
        stream = null;
        try {
          await s?.close();
        } catch {}
        try {
          controller.close();
        } catch {}
      };
      request.signal.addEventListener("abort", () => void cleanup());

      controller.enqueue(enc.encode(`retry: 2000\n\n`));
      hb = setInterval(() => send("ping", { at: new Date() }), 15_000);

      try {
        const db = waypointsDb(dbName);
        stream = db.watch(
          [
            { $match: { operationType: { $in: ["insert", "update", "replace", "delete"] }, "ns.coll": { $in: WATCHED } } },
            { $project: { "fullDocument.embedding": 0, updateDescription: 0 } },
          ],
          { fullDocument: "updateLookup" },
        );
        // Open the stream before the snapshot so nothing written in between is lost (client dedupes by _id).
        // open the stream (tryNext) concurrently with the snapshot: the snapshot goes out as soon as it is read
        const firstP = stream.tryNext();
        let snap = await snapshot(pinned, dbName, series);
        let currentId = (snap.objective as Document | null)?._id?.toString() ?? null;
        let currentUpdated = new Date(((snap.objective as Document | null)?.updated_at as Date | undefined) ?? 0);
        send("snapshot", snap);
        const first = await firstP;

        const handle = async (ch: Document) => {
          const coll = ch.ns?.coll as string;
          const doc = ch.fullDocument as Document | undefined;
          const id = String(ch.documentKey?._id ?? "");
          if (coll === "objectives") {
            if (ch.operationType === "delete") {
              if (id === currentId && !pinned) {
                snap = await snapshot(null, dbName, series);
                currentId = (snap.objective as Document | null)?._id?.toString() ?? null;
                send("snapshot", snap);
              }
              return;
            }
            if (doc && id !== currentId) {
              if (pinned) return;
              const upd = new Date((doc.updated_at as Date | undefined) ?? 0);
              if (!currentId || ch.operationType === "insert") {
                snap = await snapshot(doc._id as ObjectId, dbName, series);
                currentId = id;
                currentUpdated = upd;
                send("snapshot", snap);
              }
              return;
            }
            if (doc) currentUpdated = new Date((doc.updated_at as Date | undefined) ?? 0);
            // a fresh --continuous run marks its first objective batch 1 after insert: restart the series there
            const inSnap = (snap.objectives as Document[] | undefined) ?? [];
            if (series && doc?.batch === 1 && inSnap.length > 1) {
              snap = await snapshot(doc._id as ObjectId, dbName, series);
              send("snapshot", snap);
              return;
            }
          }
          send("change", { coll, op: ch.operationType, id, doc: doc ?? null });
        };

        if (first) await handle(first);
        for await (const ch of stream) {
          if (closed) break;
          await handle(ch as Document);
        }
      } catch (err) {
        if (!closed) send("error", { message: err instanceof Error ? err.message : String(err) });
      } finally {
        await cleanup();
      }
    },
    async cancel() {
      closed = true;
      if (hb) clearInterval(hb);
      try {
        await stream?.close();
      } catch {}
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
