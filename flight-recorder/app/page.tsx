"use client";
// Flight recorder: one live view over the waypoints DB via /api/stream (SSE).
import { useEffect, useMemo, useState } from "react";

type Doc = Record<string, any>;
type State = {
  objective: Doc | null;
  harness_config: Doc[];
  checkpoints: Doc[];
  decisions: Doc[];
  failures: Doc[];
  resumes: Doc[];
  policies: Doc[];
  taps: Doc[];
  events: Doc[];
};
const LISTS = ["harness_config", "checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events"] as const;
type ListKey = (typeof LISTS)[number];
const EMPTY: State = { objective: null, harness_config: [], checkpoints: [], decisions: [], failures: [], resumes: [], policies: [], taps: [], events: [] };

const t = (d: unknown) => new Date(String(d ?? 0)).getTime();
const hhmmss = (d: unknown) => new Date(typeof d === "number" ? d : String(d ?? 0)).toTimeString().slice(0, 8);
const short = (id: unknown) => String(id ?? "").slice(-6);
const one = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
const pct = (x: number) => `${Math.max(0, Math.min(100, x * 100))}%`;
const num = (x: unknown, d = 2) => (typeof x === "number" ? x.toFixed(d) : "?");

function upsert(list: Doc[], doc: Doc, sortKey: string): Doc[] {
  const i = list.findIndex((d) => d._id === doc._id);
  const next = i >= 0 ? list.map((d, j) => (j === i ? doc : d)) : [...list, doc];
  return sortKey === "version"
    ? next.sort((a, b) => (a.version ?? 0) - (b.version ?? 0))
    : next.sort((a, b) => t(a.created_at) - t(b.created_at));
}

function reduce(s: State, ch: { coll: string; op: string; id: string; doc: Doc | null }): State {
  if (ch.coll === "objectives") {
    if (ch.doc && s.objective && ch.doc._id === s.objective._id) return { ...s, objective: ch.doc };
    return s;
  }
  if (!(LISTS as readonly string[]).includes(ch.coll)) return s;
  const key = ch.coll as ListKey;
  if (ch.op === "delete") return { ...s, [key]: s[key].filter((d) => d._id !== ch.id) };
  if (!ch.doc) return s;
  if (key !== "harness_config" && (!s.objective || ch.doc.objective_id !== s.objective._id)) return s;
  return { ...s, [key]: upsert(s[key], ch.doc, key === "harness_config" ? "version" : "created_at") };
}

function currentConfig(cfgs: Doc[]): Doc | null {
  return [...cfgs].reverse().find((c) => ["active", "probation", "kept"].includes(c.status)) ?? null;
}

function diffText(change: Doc | null | undefined): string {
  if (!change) return "seed";
  const { field, from, to } = change;
  if (Array.isArray(from) || Array.isArray(to)) {
    const f: string[] = Array.isArray(from) ? from : [];
    const tt: string[] = Array.isArray(to) ? to : [];
    const parts = [...tt.filter((x) => !f.includes(x)).map((x) => `+${x}`), ...f.filter((x) => !tt.includes(x)).map((x) => `−${x}`)];
    return parts.length ? parts.join("  ") : `${field}: unchanged`;
  }
  return `${field}: ${JSON.stringify(from)} → ${JSON.stringify(to)}`;
}

function bearingAt(cp: Doc | undefined, name?: string): string {
  const snap: Doc[] = cp?.bearings_snapshot ?? [];
  const b = (name ? snap.find((x) => x.name === name) : undefined) ?? snap[0];
  return b ? `${b.current ?? "?"}/${b.target}` : "";
}

type Line = { key: string; at: number; cls: string; text: string };

function narrate(s: State): Line[] {
  const out: Line[] = [];
  const cpBySeq = new Map(s.checkpoints.map((c) => [c.seq, c]));
  const failById = new Map(s.failures.map((f) => [f._id, f]));
  const es = s.objective?.end_state?.bearing as string | undefined;
  if (s.objective) out.push({ key: "obj", at: t(s.objective.created_at), cls: "obj", text: `${s.objective.agent ?? "?"} set the objective: ${one(s.objective.objective)}` });
  for (const c of s.checkpoints) {
    const wp = c.waypoint_completed_index != null ? ` · waypoint ${c.waypoint_completed_index} done` : "";
    out.push({ key: c._id, at: t(c.created_at), cls: "cp", text: `${c.agent} checkpoint #${c.seq} (${bearingAt(c, es)})${wp} → ${one(c.next_action)}` });
  }
  for (const d of s.decisions) out.push({ key: d._id, at: t(d.created_at), cls: "dec", text: `${d.agent} decided: ${one(d.decision)}` });
  for (const f of s.failures) {
    const rec = f.postmortem?.is_recurring ? ` (×${f.postmortem.occurrences_of_class}, recurring)` : "";
    out.push({ key: f._id, at: t(f.created_at), cls: "fail", text: `${f.agent} hit a ${f.class} failure${rec}: ${one(f.failure)}` });
  }
  for (const r of s.resumes) {
    const who = r.resumed_by ?? r.agent;
    const how =
      r.from_checkpoint_seq == null ? "" : !r.previous_agent || r.previous_agent === who ? " after crash" : ` (took over from ${r.previous_agent})`;
    const cp = r.from_checkpoint_seq != null ? cpBySeq.get(r.from_checkpoint_seq) : undefined;
    const from = r.from_checkpoint_seq != null ? `from checkpoint #${r.from_checkpoint_seq}${cp ? ` (${bearingAt(cp, es)})` : ""}` : "(no checkpoint yet, fresh start)";
    out.push({ key: r._id, at: t(r.created_at), cls: "res", text: `⟳ ${who} resumed${how} ${from}` });
  }
  for (const p of s.policies) {
    const src = failById.get(p.from_failure_id);
    out.push({ key: p._id, at: t(p.created_at), cls: "pol", text: `★ policy v${p.version} [${p.class}] adopted by ${p.agent ?? "?"}${src ? ` from ${src.agent}'s failure` : ""}: ${one(p.rule)}` });
  }
  for (const tp of s.taps) {
    const d = tp.decision ?? {};
    const v = tp.settings_version_after != null ? ` (v${tp.settings_version_after})` : "";
    out.push({ key: tp._id, at: t(tp.created_at), cls: d.tap ? "tap" : "dim", text: `▲ sentinel tap: risk ${num(tp.risk)} → ${d.tap ? d.action : "no tap"}${v}` });
  }
  for (const c of s.harness_config) {
    if (c.version === 1 && c.created_by === "seed") continue;
    out.push({ key: `cfg${c._id}`, at: t(c.created_at), cls: "cfg", text: `✂ settings v${c.version} (${c.status}): ${diffText(c.change)}${c.reason?.summary ? ` because ${one(c.reason.summary)}` : ""}` });
    if (c.outcome?.decided_at) out.push({ key: `out${c._id}`, at: t(c.outcome.decided_at), cls: c.outcome.verdict === "kept" ? "ok" : "fail", text: `settings v${c.version} ${c.outcome.verdict === "kept" ? "KEPT" : "ROLLED BACK"}: ${one(c.outcome.why)}` });
  }
  for (const e of s.events) out.push({ key: e._id, at: t(e.created_at), cls: `ev-${e.kind}`, text: `${e.agent ? `${e.agent}: ` : ""}${one(e.text)}` });
  return out.sort((a, b) => a.at - b.at);
}

function useStream() {
  const [s, setS] = useState<State>(EMPTY);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.addEventListener("snapshot", (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      setS({ ...EMPTY, ...d });
      setStatus("live");
      setLoaded(true);
      setErr("");
    });
    es.addEventListener("change", (e) => setS((prev) => reduce(prev, JSON.parse((e as MessageEvent).data))));
    es.addEventListener("ping", () => setStatus("live"));
    es.addEventListener("error", (e) => {
      const data = (e as MessageEvent).data;
      if (data) setErr(JSON.parse(data).message);
      setStatus("error");
    });
    return () => es.close();
  }, []);
  return { s, status, err, loaded };
}

function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return now;
}

const fresh = (at: unknown, now: number) => now - t(at) < 8000;

export default function Page() {
  const { s, status, err, loaded } = useStream();
  const now = useNow();
  const cfg = currentConfig(s.harness_config);
  const lines = useMemo(() => narrate(s), [s]);
  const o = s.objective;
  const endState = o?.end_state as Doc | undefined;
  const latestTap = s.taps[s.taps.length - 1];
  const threshold = typeof cfg?.settings?.sentinel_threshold === "number" ? cfg.settings.sentinel_threshold : 0.6;
  const failById = new Map(s.failures.map((f) => [f._id, f]));

  const surgery = [
    ...s.harness_config.map((c) => ({ kind: "cfg" as const, at: t(c.created_at), doc: c })),
    ...s.policies.map((p) => ({ kind: "pol" as const, at: t(p.created_at), doc: p })),
  ].sort((a, b) => b.at - a.at);

  const primary = endState?.bearing ?? o?.bearings?.[0]?.name;
  const trail = s.checkpoints.map((c) => ({ seq: c.seq, b: ((c.bearings_snapshot ?? []) as Doc[]).find((x) => x.name === primary) })).filter((x) => x.b);

  return (
    <main>
      <header>
        <div className="row between">
          <span className="brand">WAYPOINTS · flight recorder</span>
          <span className={`conn ${status}`}>{status === "live" ? "● live (change stream)" : status === "connecting" ? "○ connecting…" : `○ reconnecting… ${err}`}</span>
        </div>
        {!loaded ? (
          <h1 className="dim">connecting to Atlas…</h1>
        ) : !o ? (
          <h1 className="dim">No objective yet. Waiting for set_objective…</h1>
        ) : (
          <>
            <h1>{one(o.objective)}</h1>
            <div className="row wrap">
              {endState ? (
                <span className="badge end">
                  🔒 END STATE (immutable): {endState.bearing} = {endState.target}
                  {endState.description ? ` · ${one(endState.description)}` : ""}
                </span>
              ) : (
                <span className="badge dim">end state: not set</span>
              )}
              {cfg ? (
                <span className={`badge st-${cfg.status}`}>
                  settings v{cfg.version} · {cfg.status} · {cfg.settings?.model}
                </span>
              ) : (
                <span className="badge dim">settings: no harness_config yet</span>
              )}
              {o.status === "completed" && <span className="badge st-kept">COMPLETED</span>}
              <span className="dim small">
                …{short(o._id)} · {o.checkpoints_count ?? 0} checkpoints · last writer {o.last_agent ?? "?"}
              </span>
            </div>
          </>
        )}
      </header>

      {o && (
        <div className="grid">
          <section>
            <h2>Bearings</h2>
            {((o.bearings ?? []) as Doc[]).map((b) => {
              const isEnd = endState?.bearing === b.name;
              const goal = isEnd ? endState!.target : b.target;
              const scale = Math.max(b.target || 1, goal || 1);
              const cur = typeof b.current === "number" ? b.current : null;
              const done = cur !== null && cur >= goal;
              return (
                <div key={b.name} className="bearing">
                  <div className="row between">
                    <span>{b.name}</span>
                    <span className={done ? "ok big" : "big"}>
                      {cur ?? "?"}/{goal} {b.unit && b.unit !== "count" ? b.unit : ""}
                    </span>
                  </div>
                  <div className="bar">
                    <div className={`fill ${done ? "okbg" : ""}`} style={{ width: pct((cur ?? 0) / scale) }} />
                    <div className="target" style={{ left: pct(goal / scale) }} title="end state" />
                  </div>
                </div>
              );
            })}
            {trail.length > 0 && (
              <div className="trail" title={`${primary} per checkpoint`}>
                {trail.map((x, i) => {
                  const prev = trail[i - 1]?.b?.current;
                  const dropped = typeof prev === "number" && typeof x.b!.current === "number" && x.b!.current < prev;
                  return (
                    <div key={x.seq} className="tcol">
                      <div className={`tbar ${dropped ? "failbg" : ""}`} style={{ height: pct((x.b!.current ?? 0) / Math.max(1, x.b!.target)) }} />
                      <span className="tiny">#{x.seq}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="waypoints">
              {((o.waypoints ?? []) as Doc[]).map((w) => (
                <div key={w.index} className={w.status === "done" ? "dim" : w.status === "active" ? "active" : "dim2"}>
                  {w.status === "done" ? "✔" : w.status === "active" ? "▶" : "·"} {w.index}. {one(w.title)}
                </div>
              ))}
            </div>

            <h2>Sentinel risk</h2>
            <div className="meter">
              <div className={`fill ${latestTap && latestTap.risk >= threshold ? "failbg" : "warnbg"}`} style={{ width: pct(latestTap?.risk ?? 0) }} />
              <div className="target thr" style={{ left: pct(threshold) }} />
              <span className="meterlabel">
                {latestTap ? `risk ${num(latestTap.risk)}` : "no taps yet"} · threshold {num(threshold)}
              </span>
            </div>
            {[...s.taps]
              .reverse()
              .slice(0, 3)
              .map((tp) => (
                <div key={tp._id} className={`tapbanner ${tp.decision?.tap ? "" : "quiet"} ${fresh(tp.created_at, now) ? "flash" : ""}`}>
                  <div className="big">
                    ▲ TAP risk {num(tp.risk)} → {tp.decision?.tap ? tp.decision.action : "no tap"}
                    {tp.settings_version_after != null ? ` (v${tp.settings_version_after})` : ""}
                    <span className="dim small"> {hhmmss(tp.created_at)} · {tp.status}</span>
                  </div>
                  <div className="small">
                    similarity {num(tp.components?.similarity)} · recurrence {num(tp.components?.recurrence)} · trend {num(tp.components?.trend)}
                    {tp.trigger ? ` · on ${tp.trigger.kind} …${short(tp.trigger.id)}` : ""}
                  </div>
                  {tp.advisor && (
                    <div className="small dim">
                      advisor {tp.advisor.model}: {tp.advisor.tap ? "tap" : "no tap"} → {tp.advisor.action} (p={num(tp.advisor.probability)}) · decided by {tp.decision?.decided_by}
                    </div>
                  )}
                </div>
              ))}
          </section>

          <section>
            <h2>Brain surgery</h2>
            {surgery.length === 0 && <div className="dim">No settings or policy changes yet.</div>}
            {surgery.map((it) =>
              it.kind === "cfg" ? (
                <div key={it.doc._id} className={`card st-${it.doc.status} ${fresh(it.doc.created_at, now) ? "flash" : ""}`}>
                  <div className="row between">
                    <span className="big">settings v{it.doc.version}</span>
                    <span className={`chip st-${it.doc.status}`}>
                      {it.doc.outcome?.verdict ? `probation → ${it.doc.outcome.verdict === "kept" ? "kept" : "rolled back"}` : it.doc.status}
                    </span>
                  </div>
                  <div className="diff">{it.doc.version === 1 && !it.doc.change ? `seed: ${(it.doc.settings?.prompt_fragments ?? []).join(", ")}` : diffText(it.doc.change)}</div>
                  <div className="small">
                    reason:{" "}
                    {it.doc.reason?.kind === "tap"
                      ? `tap …${short(it.doc.reason.id)}`
                      : it.doc.reason?.kind === "failure"
                        ? `failure ${failById.get(it.doc.reason.id)?.class ?? `…${short(it.doc.reason.id)}`}`
                        : (it.doc.reason?.kind ?? "?")}
                    {it.doc.reason?.summary ? ` · ${one(it.doc.reason.summary)}` : ""}
                  </div>
                  {it.doc.probation && !it.doc.outcome && (
                    <div className="small warn">
                      probation: needs {it.doc.probation.checkpoints_required} checkpoints, bearing ≥ {it.doc.probation.baseline_bearing}, no {it.doc.probation.watch_class}
                    </div>
                  )}
                  {it.doc.outcome && <div className={`small ${it.doc.outcome.verdict === "kept" ? "ok" : "fail"}`}>why: {one(it.doc.outcome.why)}</div>}
                  <div className="tiny dim">
                    by {it.doc.created_by} · {hhmmss(it.doc.created_at)}
                    {it.doc.parent_version != null ? ` · parent v${it.doc.parent_version}` : ""}
                  </div>
                </div>
              ) : (
                <div key={it.doc._id} className={`card pol st-${it.doc.status} ${fresh(it.doc.created_at, now) ? "flash" : ""}`}>
                  <div className="row between">
                    <span className="big">★ policy v{it.doc.version} [{it.doc.class}]</span>
                    <span className={`chip st-${it.doc.status}`}>{it.doc.status}</span>
                  </div>
                  <div className="diff">{one(it.doc.rule)}</div>
                  <div className="tiny dim">
                    from failure by {failById.get(it.doc.from_failure_id)?.agent ?? "?"} · adopted by {it.doc.agent ?? "?"} · {hhmmss(it.doc.created_at)}
                  </div>
                </div>
              ),
            )}
          </section>
        </div>
      )}

      {o && (
        <section className="feed">
          <h2>What happened</h2>
          {lines
            .slice(-18)
            .reverse()
            .map((l) => (
              <div key={l.key} className={`line ${l.cls} ${now - l.at < 8000 ? "flash" : ""}`}>
                <span className="dim">{hhmmss(l.at)}</span> {l.text}
              </div>
            ))}
        </section>
      )}
    </main>
  );
}
