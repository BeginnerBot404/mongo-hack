// /runs: every objective on this db — duration, queue progress, first-try pass rate start→end, and the harness versions it tried.
import type { Document } from "mongodb";
import { waypointsDb } from "@/lib/mongo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Waypoints · Runs" };

const AXIS: Record<string, string> = { prompt_fragments: "rules", context_sources: "context", reasoning: "reasoning", required_tools: "guardrail", granted_tools: "tools", model: "model", sentinel_threshold: "sentinel" };
const ms = (d: unknown) => (d ? new Date(d as string).getTime() : 0);
const hm = (d: unknown) => new Date(d as string).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const dur = (a: number, b: number) => {
  const s = Math.max(0, Math.round((b - a) / 1000));
  return s < 90 ? `${s}s` : s < 5400 ? `${Math.round(s / 60)}m` : `${(s / 3600).toFixed(1)}h`;
};
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");

function axisOf(c: Document): string {
  if (c.change?.also || c.change?.field === "guardrail") return "guardrail";
  return AXIS[String(c.change?.field)] ?? String(c.change?.field ?? "?");
}

export default async function Runs({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const db = waypointsDb(sp.db);
  const [objectives, cfgs] = await Promise.all([
    db.collection("objectives").find({}, { projection: { embedding: 0 } }).sort({ created_at: -1 }).limit(40).toArray(),
    db.collection("harness_config").find({}, { projection: { embedding: 0 } }).sort({ version: 1 }).toArray(),
  ]);
  const ids = objectives.map((o) => o._id);
  const drafts = await db
    .collection("drafts")
    .find({ objective_id: { $in: ids } }, { projection: { objective_id: 1, account: 1, attempt: 1, "qa.pass": 1, created_at: 1 } })
    .sort({ created_at: 1 })
    .toArray();
  const chron = [...objectives].sort((a, b) => ms(a.created_at) - ms(b.created_at));
  const rows = objectives.map((o) => {
    const start = ms(o.created_at);
    const next = chron.find((x) => ms(x.created_at) > start);
    const endBound = next ? ms(next.created_at) : Infinity;
    const mine = drafts.filter((d) => String(d.objective_id) === String(o._id));
    const ft = mine.filter((d) => (d.attempt ?? 1) <= 1);
    const half = Math.max(1, Math.ceil(ft.length / 2));
    const early = ft.slice(0, Math.min(half, 6));
    const late = ft.slice(-Math.min(half, 6));
    const done = new Set(mine.filter((d) => d.qa?.pass || (d.attempt ?? 1) >= 2).map((d) => d.account)).size;
    const last = Math.max(ms(o.updated_at), ...mine.map((d) => ms(d.created_at)), start);
    const versions = cfgs.filter((c) => c.change && ms(c.created_at) >= start && ms(c.created_at) < endBound && c.created_by !== "seed");
    const accTarget = ((o.bearings ?? []) as Document[]).find((b) => b.name === "accounts_done")?.target;
    const vAt = (at: number) => [...cfgs].filter((c) => ms(c.created_at) <= at + 1000).sort((a, b) => b.version - a.version)[0]?.version ?? null;
    return { o, start, last, ft, early, late, done, accTarget, versions, n: mine.length, v0: vAt(start), v1: vAt(last) };
  });
  return (
    <main className="console runs">
      <div className="runshead">
        <h2>Runs</h2>
        <span className="psub">db {sp.db ?? process.env.WAYPOINTS_DB ?? "waypoints"} · newest first · first-try pass = first 6 drafts → last 6</span>
      </div>
      <table className="rtable">
        <thead>
          <tr>
            <th>Task</th>
            <th>Started</th>
            <th>Duration</th>
            <th>Accounts</th>
            <th>First-try pass</th>
            <th>Playbook</th>
            <th>Harness changes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.o._id)}>
              <td className="rtask">
                <b>{r.o.batch != null ? `Batch ${r.o.batch}` : String(r.o.task ?? (r.n ? "outreach" : "—"))}</b>
                {r.o.campaign ? <span className="rsub"> · {String(r.o.campaign)}</span> : null}
                <div className="rsub">{String(r.o.objective ?? "").slice(0, 90)}</div>
              </td>
              <td>{hm(r.o.created_at)}</td>
              <td>{dur(r.start, r.last)}</td>
              <td>
                {r.done}
                {r.accTarget ? <span className="of">/{r.accTarget}</span> : null}
              </td>
              <td className="rate">
                {r.ft.length ? (
                  <>
                    <span>{pct(r.early.filter((d) => d.qa?.pass).length, r.early.length)}</span> →{" "}
                    <b>{pct(r.late.filter((d) => d.qa?.pass).length, r.late.length)}</b>
                    <div className="rsub">overall {pct(r.ft.filter((d) => d.qa?.pass).length, r.ft.length)} of {r.ft.length}</div>
                  </>
                ) : (
                  "—"
                )}
              </td>
              <td className="rate">
                v{r.v0 ?? "?"} → <b>v{r.v1 ?? "?"}</b>
              </td>
              <td>
                <div className="vchips">
                  {r.versions.length === 0 && <span className="rsub">none</span>}
                  {r.versions.map((c) => {
                    const v = c.outcome?.verdict as string | undefined;
                    return (
                      <span key={String(c._id)} className={`vchip ${v === "kept" ? "kept" : v ? "undone" : c.status === "probation" ? "trial" : ""}`}>
                        v{c.version} {c.probation ? axisOf(c) : "restore"} · {v === "kept" ? "kept" : v ? "undone" : c.status === "probation" ? "trial" : c.probation ? c.status : `v${c.parent_version ?? "?"}`}
                      </span>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
