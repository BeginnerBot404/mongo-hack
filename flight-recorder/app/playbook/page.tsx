// /playbook: the harness rebuilding itself — one card per harness_config version, oldest first.
import type { Document } from "mongodb";
import { waypointsDb } from "@/lib/mongo";
import { fragment } from "@/lib/fragments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Waypoints · Playbook" };

const arr = (x: unknown): string[] => (Array.isArray(x) ? x.map(String) : []);
const ms = (d: unknown) => (d ? new Date(d as string).getTime() : 0);
const hm = (d: unknown) => new Date(d as string).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : "—");
const FIELD_AXIS: Record<string, string> = { prompt_fragments: "rules", context_sources: "context policy", reasoning: "reasoning mode", required_tools: "guardrail", granted_tools: "tool access", model: "model", sentinel_threshold: "sentinel" };
const FIELD_NAME: Record<string, string> = { prompt_fragments: "rule", context_sources: "context", granted_tools: "tool", required_tools: "required tool", reasoning: "reasoning", model: "model", sentinel_threshold: "sentinel threshold" };

type Line = { sign: "+" | "−" | "~"; label: string; text: string };
function diff(a: Document, b: Document): { lines: Line[]; fields: string[] } {
  const lines: Line[] = [];
  const fields: string[] = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
    fields.push(k);
    if (Array.isArray(a[k]) || Array.isArray(b[k])) {
      for (const x of arr(b[k]).filter((x) => !arr(a[k]).includes(x)))
        lines.push({ sign: "+", label: `${FIELD_NAME[k] ?? k}${k === "required_tools" ? " 🔒" : ""}`, text: k === "prompt_fragments" ? `“${fragment(x)?.text ?? x}”` : x });
      for (const x of arr(a[k]).filter((x) => !arr(b[k]).includes(x)))
        lines.push({ sign: "−", label: `${FIELD_NAME[k] ?? k}${k === "required_tools" ? " 🔒" : ""}`, text: k === "prompt_fragments" ? `“${fragment(x)?.text ?? x}”` : x });
    } else lines.push({ sign: "~", label: FIELD_NAME[k] ?? k, text: `${String(a[k] ?? "∅")} → ${String(b[k])}` });
  }
  return { lines, fields };
}

export default async function Playbook({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const db = waypointsDb(sp.db);
  const q = sp.db ? `db=${encodeURIComponent(sp.db)}` : "";
  const [cfgs, taps, failures, drafts, latest] = await Promise.all([
    db.collection("harness_config").find({}, { projection: { embedding: 0 } }).sort({ version: 1 }).toArray(),
    db.collection("taps").find({}, { projection: { embedding: 0 } }).toArray(),
    db.collection("failures").find({}, { projection: { class: 1, objective_id: 1, created_at: 1 } }).toArray(),
    db.collection("drafts").find({}, { projection: { settings_version: 1, attempt: 1, qa: 1, objective_id: 1 } }).toArray(),
    db.collection("objectives").findOne({}, { sort: { created_at: -1 } }),
  ]);
  const cur = [...cfgs].reverse().find((c) => ["active", "probation", "kept"].includes(c.status));
  const st: Document = cur?.settings ?? {};
  const end = latest?.end_state as Document | undefined;
  const cards = cfgs.map((c) => {
    const parent = cfgs.find((x) => x.version === c.parent_version);
    const { lines, fields } = diff(parent?.settings ?? {}, c.settings ?? {});
    const tap = c.reason?.kind === "tap" ? taps.find((x) => String(x._id) === String(c.reason.id)) : null;
    const trig = tap ? failures.find((f) => String(f._id) === String(tap.trigger?.id)) : null;
    const cls: string | null = trig?.class ?? c.probation?.watch_class ?? null;
    const n = cls ? failures.filter((f) => f.class === cls && ms(f.created_at) <= ms(c.created_at) + 1000).length : 0;
    const seed = c.created_by === "seed" || c.parent_version == null;
    const restore = !seed && !c.probation;
    let axis = tap?.axis ? String(tap.axis) : fields.includes("required_tools") && fields.includes("granted_tools") ? "guardrail" : FIELD_AXIS[fields[0] ?? ""] ?? "settings";
    if (restore) axis = "restore";
    if (seed) axis = "seed";
    const mine = drafts.filter((d) => d.settings_version === c.version && (d.attempt ?? 1) <= 1);
    const mp = mine.filter((d) => d.qa?.pass).length;
    const hit = (ds: Document[]) => (cls ? ds.filter((d) => (d.qa?.failures ?? []).some((f: Document) => f.class === cls)).length : 0);
    const pd = parent ? drafts.filter((d) => d.settings_version === parent.version && (d.attempt ?? 1) <= 1) : [];
    const verdict = seed ? "seed" : restore ? "restore" : c.outcome?.verdict === "kept" ? "kept" : c.outcome?.verdict ? "undone" : c.status === "probation" ? "on trial" : c.status;
    const link = trig?.objective_id ? `/runs/${String(trig.objective_id)}?${q ? `${q}&` : ""}class=${encodeURIComponent(cls ?? "")}` : null;
    return { c, lines, axis, cls, n, mine, mp, pd, pdHit: hit(pd), myHit: hit(mine), verdict, link, words: tap?.change_words ? String(tap.change_words) : null };
  });
  return (
    <main className="console playbook">
      <section className="pbtop">
        <div className="goalcard">
          <div className="gk">🔒 Locked goal · never changes</div>
          <div className="gv">{end?.description ? String(end.description) : "every account done · first-try QA pass ≥ 80%"}</div>
        </div>
        <div className="pbnow">
          <div className="gk">Shape now · v{cur?.version ?? "?"} {cur?.status === "probation" ? "(on trial)" : cur?.status ?? ""}</div>
          <div className="pbnowrow">
            <span><em>rules</em> {arr(st.prompt_fragments).length}</span>
            <span><em>context</em> {arr(st.context_sources).join(", ") || "—"}</span>
            <span><em>tools</em> {arr(st.granted_tools).join(", ") || "—"}</span>
            <span><em>guardrails</em> {arr(st.required_tools).map((x) => `🔒 ${x}`).join(", ") || "—"}</span>
            <span><em>reasoning</em> {String(st.reasoning ?? "off")}</span>
          </div>
        </div>
      </section>
      <h2 className="pbh">How the harness rebuilt itself <span className="psub">— {cfgs.length} versions · change the route, never the destination</span></h2>
      <div className="pbcards">
        {cards.map((k) => (
          <article key={String(k.c._id)} className={`pbcard v-${k.verdict.replace(/\s/g, "")}`}>
            <header>
              <span className="pbv">v{k.c.version}</span>
              <span className="pbaxis">{k.axis.toUpperCase()}</span>
              <span className={`pbchip ${k.verdict.replace(/\s/g, "")}`}>{k.verdict}</span>
              <span className="pbtime">{hm(k.c.created_at)}</span>
            </header>
            {k.words && <div className="pbwords">It {k.words}.</div>}
            <div className="pbdiff">
              {k.lines.length === 0 && <div className="pbline"><span className="lbl">starting shape</span> {arr(k.c.settings?.prompt_fragments).map((x) => fragment(x)?.text ?? x).join(" ")}</div>}
              {k.lines.map((l, i) => (
                <div key={i} className={`pbline s${l.sign === "+" ? "plus" : l.sign === "−" ? "minus" : "set"}`}>
                  <span className="sg">{l.sign}</span> <span className="lbl">{l.label}</span> {l.text}
                </div>
              ))}
            </div>
            <div className="pbfacts">
              {k.cls && k.axis !== "seed" && (
                <div>
                  <em>why</em> {k.cls} ×{k.n}
                  {k.link && (
                    <>
                      {" "}· <a href={k.link}>see the drafts →</a>
                    </>
                  )}
                </div>
              )}
              {k.mine.length > 0 && (
                <div>
                  <em>evidence</em> first-try under v{k.c.version}: {k.mp}/{k.mine.length} ({pct(k.mp, k.mine.length)})
                  {k.cls && k.pd.length > 0 && k.axis !== "restore" && (
                    <> · {k.cls}: {pct(k.pdHit, k.pd.length)} of drafts before → {pct(k.myHit, k.mine.length)} under v{k.c.version}</>
                  )}
                </div>
              )}
              {k.c.outcome?.why && (
                <div>
                  <em>verdict</em> {String(k.c.outcome.why)}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
