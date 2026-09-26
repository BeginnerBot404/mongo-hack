// SSE: one snapshot of the newest objective, then every change in the waypoints DB.
// Events: `snapshot` (full state), `change` ({coll, op, id, doc}), `ping` (heartbeat), `error`.
import type { ChangeStream, Document, ObjectId } from "mongodb";
import { waypointsDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_OBJECTIVE = ["checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events"] as const;
const WATCHED = ["objectives", "harness_config", ...PER_OBJECTIVE];
const NO_EMBED = { projection: { embedding: 0 } };

async function snapshot(pinned?: ObjectId | null) {
  const db = waypointsDb();
  const objective = pinned
    ? await db.collection("objectives").findOne({ _id: pinned })
    : await db.collection("objectives").findOne({}, { sort: { updated_at: -1 } });
  const harness_config = await db.collection("harness_config").find({}, NO_EMBED).sort({ version: 1 }).limit(100).toArray();
  const out: Record<string, unknown> = { objective, harness_config, at: new Date() };
  if (!objective) {
    for (const c of PER_OBJECTIVE) out[c] = [];
    return out;
  }
  const limits: Record<string, number> = { checkpoints: 60, events: 150, taps: 40 };
  await Promise.all(
    PER_OBJECTIVE.map(async (c) => {
      const docs = await db
        .collection(c)
        .find({ objective_id: objective._id }, NO_EMBED)
        .sort({ created_at: -1 })
        .limit(limits[c] ?? 50)
        .toArray();
      out[c] = docs.reverse(); // oldest first
    }),
  );
  return out;
}

export async function GET(request: Request) {
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
        const db = waypointsDb();
        stream = db.watch(
          [
            { $match: { operationType: { $in: ["insert", "update", "replace", "delete"] }, "ns.coll": { $in: WATCHED } } },
            { $project: { "fullDocument.embedding": 0, updateDescription: 0 } },
          ],
          { fullDocument: "updateLookup" },
        );
        // Open the stream before the snapshot so nothing written in between is lost (client dedupes by _id).
        const first = await stream.tryNext();
        let snap = await snapshot();
        let currentId = (snap.objective as Document | null)?._id?.toString() ?? null;
        let currentUpdated = new Date(((snap.objective as Document | null)?.updated_at as Date | undefined) ?? 0);
        send("snapshot", snap);

        const handle = async (ch: Document) => {
          const coll = ch.ns?.coll as string;
          const doc = ch.fullDocument as Document | undefined;
          const id = String(ch.documentKey?._id ?? "");
          if (coll === "objectives") {
            if (ch.operationType === "delete") {
              if (id === currentId) {
                snap = await snapshot();
                currentId = (snap.objective as Document | null)?._id?.toString() ?? null;
                send("snapshot", snap);
              }
              return;
            }
            if (doc && id !== currentId) {
              const upd = new Date((doc.updated_at as Date | undefined) ?? 0);
              if (!currentId || ch.operationType === "insert" || upd >= currentUpdated) {
                snap = await snapshot(doc._id as ObjectId);
                currentId = id;
                currentUpdated = upd;
                send("snapshot", snap);
              }
              return;
            }
            if (doc) currentUpdated = new Date((doc.updated_at as Date | undefined) ?? 0);
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
