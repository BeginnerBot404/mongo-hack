// Replay source: real Atlas history (objectives in the last N hours + everything attached to them). Read-only.
import type { Document } from "mongodb";
import { waypointsDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PER_OBJECTIVE = ["checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events", "rubrics"];
const GLOBAL = ["harness_config"];
const NO_EMBED = { projection: { embedding: 0 } };

export async function GET(request: Request) {
  const hours = Number(new URL(request.url).searchParams.get("hours") ?? 12) || 12;
  // ?since=HH:MM (today, local) or an ISO date; else the last `hours` hours.
  const sp = new URL(request.url).searchParams.get("since");
  let since = new Date(Date.now() - hours * 3600_000);
  if (sp && /^\d{1,2}:\d{2}$/.test(sp)) {
    const [h, m] = sp.split(":").map(Number);
    since = new Date();
    since.setHours(h, m, 0, 0);
  } else if (sp && !Number.isNaN(Date.parse(sp))) since = new Date(sp);
  const db = waypointsDb();
  const objectives = await db.collection("objectives").find({ created_at: { $gte: since } }).sort({ created_at: 1 }).limit(50).toArray();
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
