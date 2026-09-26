"use client";
// Flight recorder: one live view over the waypoints DB via /api/stream (SSE).
// Presenter mode is the default (?present=0 shows more detail). ?objective=<id> pins one objective. ?demoFixture=1 replays a script locally.
import { useEffect, useMemo, useRef, useState } from "react";
import { fixture } from "./fixture";

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
type Change = { coll: string; op: string; id: string; doc: Doc | null };

const t = (d: unknown) => new Date(String(d ?? 0)).getTime();
const hhmmss = (d: unknown) => new Date(typeof d === "number" ? d : String(d ?? 0)).toTimeString().slice(0, 8);
const one = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
const num = (x: unknown, d = 2) => (typeof x === "number" ? x.toFixed(d) : "?");
const VCOL = ["#60a5fa", "#fbbf24", "#34d399", "#f472b6", "#c084fc", "#fb923c"];
const vcol = (v: number | null | undefined) => VCOL[((v ?? 1) - 1 + VCOL.length * 10) % VCOL.length];

function upsert(list: Doc[], doc: Doc, sortKey: string): Doc[] {
  const i = list.findIndex((d) => d._id === doc._id);
  const next = i >= 0 ? list.map((d, j) => (j === i ? doc : d)) : [...list, doc];
  return sortKey === "version"
    ? next.sort((a, b) => (a.version ?? 0) - (b.version ?? 0))
    : next.sort((a, b) => t(a.created_at) - t(b.created_at));
}

function reduce(s: State, ch: Change): State {
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

function fragDiff(change: Doc | null | undefined): { add: string[]; del: string[]; other: string | null } {
  if (!change) return { add: [], del: [], other: null };
  const { field, from, to } = change;
  if (Array.isArray(from) || Array.isArray(to)) {
    const f: string[] = Array.isArray(from) ? from : [];
    const tt: string[] = Array.isArray(to) ? to : [];
    return { add: tt.filter((x) => !f.includes(x)), del: f.filter((x) => !tt.includes(x)), other: null };
  }
  return { add: [], del: [], other: `${field}: ${JSON.stringify(from)} → ${JSON.stringify(to)}` };
}
const diffLabel = (c: Doc) => {
  const d = fragDiff(c.change);
  if (d.other) return d.other;
  const parts = [...d.add.map((x) => `+${x}`), ...d.del.map((x) => `−${x}`)];
  return parts.length ? parts.join(" ") : c.version === 1 ? "seed" : "restore";
};

function bearingOf(cp: Doc | undefined, name?: string): { current: number | null; target: number | null } {
  const snap: Doc[] = cp?.bearings_snapshot ?? [];
  const b = (name ? snap.find((x) => x.name === name) : undefined) ?? snap[0];
  return { current: typeof b?.current === "number" ? b.current : null, target: typeof b?.target === "number" ? b.target : null };
}

/** Settings version in force at time `at` (by harness_config created_at ordering). */
function versionAt(cfgs: Doc[], at: number): number | null {
  let v: number | null = null;
  for (const c of cfgs) if (t(c.created_at) <= at && (v === null || c.version > v)) v = c.version;
  return v ?? cfgs[0]?.version ?? null;
}
function failureVersion(cfgs: Doc[], f: Doc): number | null {
  const m = /settings v(\d+)/.exec(String(f.context ?? "") + " " + String(f.failure ?? ""));
  return m ? Number(m[1]) : versionAt(cfgs, t(f.created_at));
}

// ---------- moments (banners) ----------
type Moment = { key: string; kind: string; title: string; sub?: string; bars?: Doc; at: number };

function moments(s: State, primary?: string): Moment[] {
  const out: Moment[] = [];
  const cps = s.checkpoints;
  for (const r of s.resumes) {
    if (r.from_checkpoint_seq == null) continue;
    const cp = cps.find((c) => c.seq === r.from_checkpoint_seq);
    const b = bearingOf(cp, primary);
    out.push({ key: `res:${r._id}`, kind: "resumed", title: `⟳ RESUMED FROM ATLAS @ checkpoint #${r.from_checkpoint_seq}`, sub: `${b.current ?? "?"}/${b.target ?? "?"} tests · state, bearing and next action rebuilt from Atlas`, at: t(r.created_at) });
  }
  for (const f of s.failures) {
    if (f.class !== "regression") continue;
    const m = /from (\d+) to (\d+)/.exec(String(f.failure ?? ""));
    out.push({ key: `reg:${f._id}`, kind: "regression", title: `▼ REGRESSION ${m ? `${m[1]} → ${m[2]}` : ""}`, sub: "the obvious fix broke a passing test · server logged it itself", at: t(f.created_at) });
  }
  for (const tp of s.taps) {
    if (!tp.decision?.tap) continue;
    out.push({ key: `tap:${tp._id}`, kind: "tap", title: `▲ SENTINEL TAP ${num(tp.risk)}`, sub: `→ ${tp.decision.action}${tp.settings_version_after != null ? ` (v${tp.settings_version_after})` : ""}`, bars: tp.components, at: t(tp.created_at) });
  }
  for (const c of s.harness_config) {
    if (c.created_by === "seed" || c.version === 1) continue;
    if (c.probation) out.push({ key: `ver:${c._id}`, kind: "settings", title: `✚ SETTINGS v${c.version} PROBATION`, sub: diffLabel(c), at: t(c.created_at) });
    if (c.outcome?.verdict)
      out.push({
        key: `out:${c._id}`,
        kind: c.outcome.verdict === "kept" ? "kept" : "rolled",
        title: c.outcome.verdict === "kept" ? `✔ v${c.version} KEPT` : `↩ v${c.version} ROLLED BACK`,
        sub: one(c.outcome.why),
        at: t(c.outcome.decided_at),
      });
  }
  const last = cps[cps.length - 1];
  const lb = bearingOf(last, primary);
  if (last && lb.current !== null && lb.target !== null && lb.current >= lb.target)
    out.push({ key: `green:${last._id}`, kind: "kept", title: `✔ ALL GREEN ${lb.current}/${lb.target}`, sub: "end state reached · destination never changed", at: t(last.created_at) });
  return out.sort((a, b) => a.at - b.at);
}

// ---------- narration ----------
type Line = { key: string; at: number; cls: string; text: string };
function narrate(s: State, present: boolean, primary?: string): Line[] {
  const out: Line[] = [];
  for (const c of s.checkpoints) {
    const b = bearingOf(c, primary);
    out.push({ key: c._id, at: t(c.created_at), cls: "cp", text: `checkpoint #${c.seq} · ${b.current ?? "?"}/${b.target ?? "?"} · ${one(c.next_action)}` });
  }
  if (!present) for (const d of s.decisions) out.push({ key: d._id, at: t(d.created_at), cls: "dec", text: `decided: ${one(d.decision)}` });
  for (const f of s.failures) out.push({ key: f._id, at: t(f.created_at), cls: f.class === "regression" ? "fail" : f.class === "skipped_checkpoint" || f.class === "corrupt_write" ? "warn" : "fail2", text: `✗ ${f.class}: ${one(f.failure)}` });
  for (const r of s.resumes) out.push({ key: r._id, at: t(r.created_at), cls: "res", text: r.from_checkpoint_seq != null ? `⟳ resumed from Atlas @ checkpoint #${r.from_checkpoint_seq}` : "◎ fresh start" });
  for (const p of s.policies) out.push({ key: p._id, at: t(p.created_at), cls: "pol", text: `★ policy [${p.class}]: ${one(p.rule)}` });
  for (const tp of s.taps) out.push({ key: tp._id, at: t(tp.created_at), cls: tp.decision?.tap ? "tap" : "dim", text: `▲ tap risk ${num(tp.risk)} → ${tp.decision?.tap ? tp.decision.action : "no tap"}` });
  for (const c of s.harness_config) {
    if (c.version === 1 && c.created_by === "seed") continue;
    out.push({ key: `cfg${c._id}`, at: t(c.created_at), cls: "cfg", text: `✚ settings v${c.version}: ${diffLabel(c)}` });
  }
  for (const e of s.events) if (e.kind !== "tap_acknowledged" || !present) out.push({ key: e._id, at: t(e.created_at), cls: `ev-${e.kind}`, text: one(e.text) });
  return out.sort((a, b) => a.at - b.at);
}

// ---------- data hooks ----------
function useParams() {
  const [p, setP] = useState<{ present: boolean; objective: string | null; fixture: boolean }>({ present: true, objective: null, fixture: false });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setP({ present: q.get("present") !== "0", objective: q.get("objective"), fixture: q.get("demoFixture") === "1" });
  }, []);
  return p;
}

function useStream(objective: string | null, fx: boolean, ready: boolean) {
  const [s, setS] = useState<State>(EMPTY);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [loaded, setLoaded] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(0);
  const [fxAlive, setFxAlive] = useState<boolean | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (fx) {
      const { snapshot, steps } = fixture(Date.now());
      setS({ ...EMPTY, ...(snapshot as Partial<State>) });
      setStatus("live");
      setLoaded(true);
      setLastEventAt(Date.now());
      const timers = steps.map((st) =>
        setTimeout(() => {
          if (st.alive !== undefined) setFxAlive(st.alive);
          if (st.change) {
            setS((prev) => reduce(prev, st.change as Change));
            setLastEventAt(Date.now());
          }
        }, st.after * 1000),
      );
      return () => timers.forEach(clearTimeout);
    }
    const es = new EventSource(`/api/stream${objective ? `?objective=${encodeURIComponent(objective)}` : ""}`);
    es.addEventListener("snapshot", (e) => {
      setS({ ...EMPTY, ...JSON.parse((e as MessageEvent).data) });
      setStatus("live");
      setLoaded(true);
      setLastEventAt(Date.now());
    });
    es.addEventListener("change", (e) => {
      setS((prev) => reduce(prev, JSON.parse((e as MessageEvent).data)));
      setLastEventAt(Date.now());
    });
    es.addEventListener("ping", () => setStatus("live"));
    es.addEventListener("error", () => setStatus("error"));
    return () => es.close();
  }, [objective, fx, ready]);
  return { s, status, loaded, lastEventAt, fxAlive };
}

function useNow(ms = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return now;
}

/** Harness process liveness (pgrep on the server). null = unknown. */
function useAlive(enabled: boolean) {
  const [alive, setAlive] = useState<boolean | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch("/api/alive", { cache: "no-store" });
        const j = await r.json();
        if (!stop) setAlive(j.alive);
      } catch {
        if (!stop) setAlive(null);
      }
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => {
      stop = true;
      clearInterval(i);
    };
  }, [enabled]);
  return alive;
}

// ---------- components ----------
function Bars({ c }: { c: Doc }) {
  return (
    <div className="bars">
      {(["similarity", "recurrence", "trend"] as const).map((k) => (
        <div key={k} className="barrow">
          <span className="barlabel">{k}</span>
          <span className="bartrack">
            <span className="barfill" style={{ width: `${Math.max(0, Math.min(1, c?.[k] ?? 0)) * 100}%` }} />
          </span>
          <span className="barval">{num(c?.[k])}</span>
        </div>
      ))}
    </div>
  );
}

function Banner({ m, crash }: { m: Moment | null; crash: { secs: number; seq: number | null } | null }) {
  if (crash)
    return (
      <div className="banner b-crashed">
        <div className="bmain">
          <div className="btitle">✖ HARNESS CRASHED · {crash.secs}s</div>
          <div className="bsub">process gone · everything it knew is safe in Atlas{crash.seq != null ? ` @ checkpoint #${crash.seq}` : ""}</div>
        </div>
      </div>
    );
  if (!m) return null;
  return (
    <div className={`banner b-${m.kind}`} key={m.key}>
      <div className="bmain">
        <div className="btitle">{m.title}</div>
        {m.sub && <div className="bsub">{m.sub}</div>}
      </div>
      {m.bars && <Bars c={m.bars} />}
    </div>
  );
}

function Route({ s, primary, target, present }: { s: State; primary?: string; target: number; present: boolean }) {
  const cps = s.checkpoints;
  const W = 920;
  const H = 215;
  const padL = 44, padR = 24, top = 52, bottom = 36;
  const vals = cps.map((c) => bearingOf(c, primary).current).filter((x): x is number => x !== null);
  const yMin = Math.max(0, Math.min(target, ...vals) - 2);
  const y = (v: number) => top + (1 - (v - yMin) / Math.max(1, target - yMin)) * (H - top - bottom);
  const n = Math.max(cps.length, 6);
  const x = (i: number) => padL + (i + 0.5) * ((W - padL - padR) / n);
  const pts = cps.map((c, i) => ({ c, i, v: bearingOf(c, primary).current ?? yMin, ver: versionAt(s.harness_config, t(c.created_at)) }));
  const resumedAfter = new Set(s.resumes.filter((r) => r.from_checkpoint_seq != null).map((r) => r.from_checkpoint_seq));
  const bends: { i: number; c: Doc }[] = [];
  for (const cfg of s.harness_config) {
    if (cfg.version === 1 && cfg.created_by === "seed") continue;
    const i = pts.findIndex((p) => t(p.c.created_at) >= t(cfg.created_at));
    bends.push({ i: i < 0 ? pts.length : i, c: cfg });
  }
  return (
    <svg className="route" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="bearing path toward the immutable end state">
      {/* destination */}
      <line x1={padL - 10} x2={W - padR} y1={y(target)} y2={y(target)} className="goal" />
      <g transform={`translate(${W - padR - 6}, ${y(target) - 12})`}>
        <text textAnchor="end" className="goaltxt">
          ◎ END STATE {target}/{target} · IMMUTABLE 🔒
        </text>
      </g>
      <text x={padL - 14} y={y(target) + 6} textAnchor="end" className="axis">{target}</text>
      <text x={padL - 14} y={y(yMin) + 6} textAnchor="end" className="axis">{yMin}</text>
      {/* settings bends */}
      {bends.map(({ i, c }) => {
        const bx = i < pts.length ? x(i) - (W - padL - padR) / n / 2 : x(Math.max(0, pts.length - 1)) + 20;
        return (
          <g key={c._id}>
            <line x1={bx} x2={bx} y1={top - 8} y2={H - bottom + 6} stroke={vcol(c.version)} className="bend" />
            <text x={bx > W * 0.6 ? bx - 6 : bx + 6} y={H - 10} textAnchor={bx > W * 0.6 ? "end" : "start"} className="bendtxt" fill={vcol(c.version)}>
              v{c.version} {diffLabel(c)}
            </text>
          </g>
        );
      })}
      {/* path segments */}
      {pts.slice(1).map((p, k) => {
        const a = pts[k];
        const gap = resumedAfter.has(a.c.seq);
        const dip = p.v < a.v;
        return (
          <g key={p.c._id}>
            <line x1={x(a.i)} y1={y(a.v)} x2={x(p.i)} y2={y(p.v)} className={gap ? "seg gap" : dip ? "seg dip" : "seg"} stroke={dip ? "#fb7185" : vcol(p.ver)} />
            {gap && (
              <text x={(x(a.i) + x(p.i)) / 2 + 12} y={(y(a.v) + y(p.v)) / 2 + 22} textAnchor="start" className="gaptxt">
                ✖ kill → ⟳ resume
              </text>
            )}
          </g>
        );
      })}
      {pts.map((p) => (
        <g key={p.c._id}>
          <circle cx={x(p.i)} cy={y(p.v)} r={present ? 11 : 9} fill={vcol(p.ver)} className="node" />
          <text x={x(p.i)} y={y(p.v) + 28} textAnchor="middle" className="nodetxt">#{p.c.seq}</text>
        </g>
      ))}
      {pts.length === 0 && (
        <text x={W / 2} y={H / 2} textAnchor="middle" className="axis">waiting for the first checkpoint…</text>
      )}
    </svg>
  );
}

function ConfigCard({ c, s, primary, present }: { c: Doc; s: State; primary?: string; present: boolean }) {
  const [raw, setRaw] = useState(false);
  const d = fragDiff(c.change);
  const tap = c.reason?.kind === "tap" ? s.taps.find((x) => x._id === c.reason.id) : null;
  const trig = tap ? s.failures.find((f) => f._id === tap.trigger?.id) : null;
  const since = c.probation ? s.checkpoints.filter((x) => x.seq > c.probation.started_seq).length : 0;
  const req = c.probation?.checkpoints_required ?? 0;
  const seed = c.version === 1 && !c.change;
  const verdict = c.outcome?.verdict;
  const chip = verdict === "kept" ? "✔ KEPT" : verdict === "rolled_back" ? "↩ ROLLED BACK" : c.status === "probation" ? "PROBATION" : c.status.toUpperCase().replace("_", " ");
  return (
    <div className={`card st-${c.status}`} style={{ borderLeftColor: vcol(c.version) }}>
      <div className="row between">
        <span className="cardtitle" style={{ color: vcol(c.version) }}>settings v{c.version}</span>
        <span className="row">
          <span className={`chip st-${verdict ?? c.status}`}>{chip}</span>
          <button className="rawbtn" onClick={() => setRaw(!raw)}>{raw ? "hide" : "raw document"}</button>
        </span>
      </div>
      {raw ? (
        <pre className="raw">{JSON.stringify(c, null, 2)}</pre>
      ) : (
        <>
          <div className="code">
            {seed && (c.settings?.prompt_fragments ?? []).map((f: string) => <div key={f} className="ctx">  {f}</div>)}
            {d.add.map((f) => <div key={`a${f}`} className="add">+ {f}</div>)}
            {d.del.map((f) => <div key={`d${f}`} className="del">- {f}</div>)}
            {d.other && <div className="add">~ {d.other}</div>}
          </div>
          <div className="reason">
            {seed ? "seed" : tap ? `tap ${num(tap.risk)} ← ${trig?.class ?? tap.trigger?.kind ?? "?"}` : c.reason?.kind === "failure" ? "failure" : c.reason?.kind}
            {!present || !tap ? ` · ${one(c.reason?.summary)}` : ""}
          </div>
          {c.probation && !verdict && (
            <div className="prob">
              <span>probation</span>
              {Array.from({ length: req }, (_, k) => (
                <span key={k} className={`pip ${k < since ? "on" : ""}`} />
              ))}
              <span>
                checkpoint {Math.min(since, req)} of {req} · keep if bearing ≥ {c.probation.baseline_bearing} and no {c.probation.watch_class}
              </span>
            </div>
          )}
          {c.outcome?.why && <div className={verdict === "kept" ? "why ok" : "why fail"}>{one(c.outcome.why)}</div>}
        </>
      )}
    </div>
  );
}

// ---------- page ----------
export default function Page() {
  const params = useParams();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const { s, status, loaded, lastEventAt, fxAlive } = useStream(params.objective, params.fixture, ready);
  const liveAlive = useAlive(ready && !params.fixture);
  const alive = params.fixture ? fxAlive : liveAlive;
  const now = useNow();
  const present = params.present;
  const o = s.objective;
  const endState = o?.end_state as Doc | undefined;
  const primary: string | undefined = endState?.bearing ?? o?.bearings?.[0]?.name;
  const target: number = endState?.target ?? o?.bearings?.[0]?.target ?? 10;
  const cfg = currentConfig(s.harness_config);
  const lastCp = s.checkpoints[s.checkpoints.length - 1];
  const latestTap = s.taps[s.taps.length - 1];
  const threshold: number = typeof cfg?.settings?.sentinel_threshold === "number" ? cfg.settings.sentinel_threshold : 0.6;

  // ---- banner queue: only moments that arrive after the first snapshot ----
  const all = useMemo(() => moments(s, primary), [s, primary]);
  const seen = useRef<Set<string> | null>(null);
  const objKey = useRef<string | null>(null);
  const [queue, setQueue] = useState<{ m: Moment; start: number | null }[]>([]);
  useEffect(() => {
    if (!loaded) return;
    const ok = o?._id ?? null;
    if (seen.current === null || objKey.current !== ok) {
      seen.current = new Set(all.map((m) => m.key));
      objKey.current = ok;
      return;
    }
    const fresh = all.filter((m) => !seen.current!.has(m.key));
    if (!fresh.length) return;
    fresh.forEach((m) => seen.current!.add(m.key));
    setQueue((q) => [...q, ...fresh.map((m) => ({ m, start: null }))]);
  }, [all, loaded, o?._id]);
  useEffect(() => {
    if (!queue.length) return;
    const head = queue[0];
    if (head.start === null) {
      setQueue((q) => [{ ...q[0], start: Date.now() }, ...q.slice(1)]);
      return;
    }
    const dur = queue.length > 1 ? 4000 : 6000;
    if (now - head.start > dur) setQueue((q) => q.slice(1));
  }, [queue, now]);

  // ---- crash: harness process gone (or, if unknown, silent > 6s after recent writes) ----
  const everAlive = useRef(false);
  if (alive) everAlive.current = true;
  const downSince = useRef<number | null>(null);
  const lastWrite = Math.max(
    0,
    ...[s.checkpoints, s.failures, s.events, s.decisions, s.taps, s.resumes].map((l) => t(l[l.length - 1]?.created_at)),
  );
  let crashed = false;
  if (o && o.status !== "completed") {
    if (alive === false && everAlive.current) crashed = true;
    else if (alive === null && !params.fixture && now - lastWrite > 6000 && now - lastWrite < 120000 && lastCp && bearingOf(lastCp, primary).current !== target) crashed = true;
  }
  if (crashed && downSince.current === null) downSince.current = alive === false ? now : lastWrite;
  if (!crashed) downSince.current = null;
  // After 60s down it's probably a deliberate stop, not the demo's kill: fall back to the idle banner (header badge still says down).
  if (crashed && downSince.current !== null && now - downSince.current > 60000) crashed = false;
  const crash = crashed ? { secs: Math.max(0, Math.round((now - (downSince.current ?? now)) / 1000)), seq: lastCp?.seq ?? null } : null;
  const banner = queue[0]?.start != null ? queue[0].m : null;

  // ---- hero metrics ----
  const hero = useMemo(() => {
    const cfgs = s.harness_config;
    const cur = currentConfig(cfgs);
    const afterV = cur?.version ?? null;
    const beforeV = cur?.parent_version ?? (afterV !== null && afterV > 1 ? afterV - 1 : null);
    const skipsBy = new Map<number, number>();
    const regBy = new Map<number, number>();
    const cpsBy = new Map<number, number>();
    for (const f of s.failures) {
      const v = failureVersion(cfgs, f);
      if (v === null) continue;
      if (f.class === "skipped_checkpoint" || f.class === "corrupt_write") skipsBy.set(v, (skipsBy.get(v) ?? 0) + 1);
      if (f.class === "regression") regBy.set(v, (regBy.get(v) ?? 0) + 1);
    }
    for (const c of s.checkpoints) {
      const v = versionAt(cfgs, t(c.created_at));
      if (v !== null) cpsBy.set(v, (cpsBy.get(v) ?? 0) + 1);
    }
    const vals = s.checkpoints.map((c) => bearingOf(c, primary).current).filter((x): x is number => x !== null);
    let low: number | null = null;
    for (let i = 1; i < vals.length; i++) if (vals[i] < vals[i - 1]) low = vals[i];
    const nowTests = vals.length ? vals[vals.length - 1] : (o?.bearings?.[0]?.current ?? null);
    const verdictCfg = [...cfgs].reverse().find((c) => c.outcome?.why);
    return { beforeV, afterV, skipsBy, regBy, cpsBy, low, first: vals[0] ?? null, nowTests, why: verdictCfg ? `v${verdictCfg.version} ${verdictCfg.outcome.verdict === "kept" ? "kept" : "rolled back"}: ${one(verdictCfg.outcome.why)}` : null };
  }, [s, primary, o]);

  const lines = useMemo(() => narrate(s, present, primary), [s, present, primary]);
  const age = lastEventAt ? Math.max(0, Math.round((now - lastEventAt) / 1000)) : null;
  const counts: [string, number][] = [
    ["checkpoints", s.checkpoints.length],
    ["failures", s.failures.length],
    ["taps", s.taps.length],
    ["harness_config", s.harness_config.length],
    ["events", s.events.length],
    ["resumes", s.resumes.length],
  ];
  const cfgCards = [...s.harness_config].reverse().slice(0, present ? 3 : 20);

  const testsFrom = hero.low ?? hero.first;
  const cmp = (label: string, by: Map<number, number>) => {
    const { beforeV, afterV } = hero;
    if (afterV === null) return null;
    const before = beforeV !== null ? (by.get(beforeV) ?? 0) : null;
    const after = by.get(afterV) ?? 0;
    if (!before && !after) return null;
    return (
      <div className="tile">
        <div className="tlabel">{label}</div>
        <div className="tnum">
          {before !== null && (
            <>
              <span className="bad">{before}</span>
              <span className="arrow">→</span>
            </>
          )}
          <span className={after === 0 ? "good" : "bad"}>{after}</span>
        </div>
        <div className="tfoot">
          {before !== null ? `v${beforeV} (${hero.cpsBy.get(beforeV!) ?? 0} cp) → v${afterV} (${hero.cpsBy.get(afterV) ?? 0} cp)` : `under v${afterV}`}
        </div>
      </div>
    );
  };

  return (
    <main className={present ? "present" : ""}>
      <header>
        <div className="row between top">
          <span className="brand">WAYPOINTS · flight recorder{params.fixture ? " · DEMO FIXTURE (not live)" : ""}</span>
          <span className={`conn ${status}`}>
            {status === "live" ? "●" : "○"} {status === "live" ? "live · Atlas change stream" : status === "connecting" ? "connecting…" : "reconnecting…"}
            {age !== null && status === "live" ? <span className="age"> · last event {age}s ago</span> : null}
          </span>
        </div>
        {!loaded ? (
          <h1 className="dimtxt">connecting to Atlas…</h1>
        ) : !o ? (
          <h1 className="dimtxt">No objective yet. Waiting for set_objective…</h1>
        ) : (
          <>
            <h1 title={one(o.objective)}>{one(o.objective)}</h1>
            <div className="row wrap">
              {endState ? (
                <span className="badge end">
                  🔒 END STATE · {endState.bearing} = {endState.target} · IMMUTABLE
                </span>
              ) : (
                <span className="badge">end state: not set</span>
              )}
              {cfg && (
                <span className="badge" style={{ borderColor: vcol(cfg.version), color: vcol(cfg.version) }}>
                  running settings v{cfg.version} · {cfg.status}
                </span>
              )}
              {alive !== null && !params.fixture && <span className={`badge ${alive ? "alive" : "dead"}`}>{alive ? "harness ● running" : "harness ✖ down"}</span>}
              {params.fixture && alive !== null && <span className={`badge ${alive ? "alive" : "dead"}`}>{alive ? "harness ● running" : "harness ✖ down"}</span>}
            </div>
          </>
        )}
      </header>

      {o && (
        <>
          <div className="bannerslot">
            {crash || banner ? (
              <Banner m={banner} crash={crash} />
            ) : (
              <div className="banner b-idle">
                <div className="bmain">
                  <div className="btitle">
                    {lastCp ? `checkpoint #${lastCp.seq} · ${bearingOf(lastCp, primary).current ?? "?"}/${target} tests` : "waiting for the first checkpoint"}
                  </div>
                  <div className="bsub">{lastCp ? `next: ${one(lastCp.next_action)}` : ""}</div>
                </div>
              </div>
            )}
          </div>

          <section className="hero">
            <div className="tile">
              <div className="tlabel">tests passing</div>
              <div className="tnum">
                {testsFrom !== null && testsFrom !== hero.nowTests && (
                  <>
                    <span className="bad">{testsFrom}</span>
                    <span className="arrow">→</span>
                  </>
                )}
                <span className={hero.nowTests === target ? "good" : "neutral"}>{hero.nowTests ?? "?"}</span>
                <span className="of">/{target}</span>
              </div>
              <div className="tfoot">{hero.low !== null ? "from the regression low" : "since the first checkpoint"}</div>
            </div>
            {cmp("skipped checkpoints", hero.skipsBy)}
            {cmp("regressions", hero.regBy)}
            {!(hero.skipsBy.size && hero.regBy.size) && (
              <div className="tile">
                <div className="tlabel">sentinel risk</div>
                <div className="tnum">
                  <span className={latestTap && latestTap.risk >= threshold ? "bad" : "neutral"}>{latestTap ? num(latestTap.risk) : "—"}</span>
                  <span className="of"> ≥{num(threshold)}</span>
                </div>
                <div className="tfoot">{latestTap ? `→ ${latestTap.decision?.tap ? latestTap.decision.action : "no tap"}` : "no taps yet"} · threshold taps</div>
              </div>
            )}
          </section>
          {hero.why && <div className="verdictline">{hero.why}</div>}

          <section className="routebox">
            <div className="row between">
              <h2>route vs destination</h2>
              <span className="tagline">change the route, never the destination</span>
            </div>
            <Route s={s} primary={primary} target={target} present={present} />
          </section>

          <section>
            <h2>settings versions · every change is one field, gated, on probation</h2>
            <div className="cards">
              {cfgCards.map((c) => (
                <ConfigCard key={c._id} c={c} s={s} primary={primary} present={present} />
              ))}
              {cfgCards.length === 0 && <div className="dimtxt">no harness_config yet</div>}
            </div>
          </section>

          <section className="feed">
            <h2>what happened</h2>
            {lines
              .slice(present ? (hero.why ? -4 : -5) : -20)
              .reverse()
              .map((l) => (
                <div key={l.key} className={`line ${l.cls} ${now - l.at < 6000 ? "flash" : ""}`}>
                  <span className="ts">{hhmmss(l.at)}</span> {l.text}
                </div>
              ))}
          </section>

          <footer className="proof">
            <span className={`conn ${status}`}>● Atlas · db waypoints</span>
            {counts.map(([k, v]) => (
              <span key={k}>
                {k} <b>{v}</b>
              </span>
            ))}
          </footer>
        </>
      )}
    </main>
  );
}
