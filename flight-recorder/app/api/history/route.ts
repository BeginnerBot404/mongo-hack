// Replay source: real Atlas history (objectives in the last N hours + everything attached to them). Read-only.
import type { Document } from "mongodb";
import { dbParam, waypointsDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_OBJECTIVE = ["checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events", "rubrics"];
const GLOBAL = ["harness_config"];
const NO_EMBED = { projection: { embedding: 0 } };

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const hp = q.get("hours");
  const hours = Number(hp ?? 12) || 12;
  // ?since=HH:MM (today, local) or an ISO date; ?hours=N the last N hours; default: start of the current
  // --continuous series (newest batch-1 objective), so replay loads one series, not half a day of runs.
  const sp = q.get("since");
  const db = waypointsDb(dbParam(request));
  let since = new Date(Date.now() - hours * 3600_000);
  if (!sp && !hp) {
    const start = await db.collection("objectives").findOne({ batch: 1 }, { sort: { created_at: -1 }, projection: { created_at: 1 } });
    if (start?.created_at) since = new Date(start.created_at as Date);
  }
  if (sp && /^\d{1,2}:\d{2}$/.test(sp)) {
    const [h, m] = sp.split(":").map(Number);
    since = new Date();
    since.setHours(h, m, 0, 0);
  } else if (sp && !Number.isNaN(Date.parse(sp))) since = new Date(sp);
  const objectives = await db.collection("objectives").find({ created_at: { $gte: since } }, NO_EMBED).sort({ created_at: 1 }).limit(50).toArray();
  const ids = objectives.map((o) => o._id);
  const out: Record<string, Document[]> = { objectives };
  await Promise.all([
    ...PER_OBJECTIVE.map(async (c) => {
      out[c] = await db.collection(c).find({ objective_id: { $in: ids } }, NO_EMBED).sort({ created_at: 1 }).limit(3000).toArray();
    }),
    ...GLOBAL.map(async (c) => {
      out[c] = await db.collection(c).find({}, NO_EMBED).sort({ version: 1 }).limit(200).toArray();
    }),
  ]);
  return Response.json(out, { headers: { "Cache-Control": "no-store" } });
}
