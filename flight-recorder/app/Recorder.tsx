"use client";
// Flight recorder: one live view over the waypoints DB via /api/stream (SSE).
// Presenter mode is the default (?present=0 shows more detail). ?objective=<id> pins one objective. ?demoFixture=1 replays a script locally.
import { useEffect, useMemo, useRef, useState } from "react";
import { fixture, fixtureOutreach } from "./fixture";

export type { Doc, State, Change };

type Doc = Record<string, any>;
type State = {
  objective: Doc | null;
  harness_config: Doc[];
  rubrics: Doc[];
  checkpoints: Doc[];
  decisions: Doc[];
  failures: Doc[];
  resumes: Doc[];
  policies: Doc[];
  taps: Doc[];
  events: Doc[];
};
const LISTS = ["harness_config", "rubrics", "checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events"] as const;
type ListKey = (typeof LISTS)[number];
export const EMPTY: State = { objective: null, harness_config: [], rubrics: [], checkpoints: [], decisions: [], failures: [], resumes: [], policies: [], taps: [], events: [] };
type Change = { coll: string; op: string; id: string; doc: Doc | null };

export const t = (d: unknown) => new Date(String(d ?? 0)).getTime();
export const hhmmss = (d: unknown) => new Date(typeof d === "number" ? d : String(d ?? 0)).toTimeString().slice(0, 8);
const hhmm = (ms: number) => new Date(ms).toTimeString().slice(0, 5);
export const one = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
const num = (x: unknown, d = 2) => (typeof x === "number" ? x.toFixed(d) : "?");
const VCOL = ["#60a5fa", "#fbbf24", "#34d399", "#f472b6", "#c084fc", "#fb923c"];
const vcol = (v: number | null | undefined) => VCOL[((v ?? 1) - 1 + VCOL.length * 10) % VCOL.length];

export function upsert(list: Doc[], doc: Doc, sortKey: string): Doc[] {
  const i = list.findIndex((d) => d._id === doc._id);
  const next = i >= 0 ? list.map((d, j) => (j === i ? doc : d)) : [...list, doc];
  return sortKey === "version"
    ? next.sort((a, b) => (a.version ?? 0) - (b.version ?? 0))
    : next.sort((a, b) => t(a.created_at) - t(b.created_at));
}

export function reduce(s: State, ch: Change): State {
  if (ch.coll === "objectives") {
    if (ch.doc && s.objective && ch.doc._id === s.objective._id) return { ...s, objective: ch.doc };
    return s;
  }
  if (!(LISTS as readonly string[]).includes(ch.coll)) return s;
  const key = ch.coll as ListKey;
  if (ch.op === "delete") return { ...s, [key]: s[key].filter((d) => d._id !== ch.id) };
  if (!ch.doc) return s;
  const global = key === "harness_config";
  if (!global && (!s.objective || ch.doc.objective_id !== s.objective._id)) return s;
  return { ...s, [key]: upsert(s[key], ch.doc, global || key === "rubrics" ? "version" : "created_at") };
}

export function currentConfig(cfgs: Doc[]): Doc | null {
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
const diffLabel = (c: Doc): string => {
  // guardrail versions carry a second field: change.also = {field, from, to}
  if (c.change?.also) return [diffLabel({ ...c, change: { ...c.change, also: undefined } }), diffLabel({ ...c, change: c.change.also })].join(" · ");
  const d = fragDiff(c.change);
  if (d.other) return d.other;
  const parts = [...d.add.map((x) => `+${x}`), ...d.del.map((x) => `−${x}`)];
  return parts.length ? parts.join(" ") : c.version === 1 ? "seed" : "restore";
};

export function bearingOf(cp: Doc | undefined, name?: string): { current: number | null; target: number | null } {
  const snap: Doc[] = cp?.bearings_snapshot ?? [];
  const b = (name ? snap.find((x) => x.name === name) : undefined) ?? snap[0];
  return { current: typeof b?.current === "number" ? b.current : null, target: typeof b?.target === "number" ? b.target : null };
}
/** Format a bearing value: integers as-is, decimals with 2 places (or 1 if large), % unit appended. */
export function fmtB(v: number | null | undefined, unit?: string): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "?";
  const pctUnit = unit === "%" || unit === "pct" || unit === "percent";
  const s = Number.isInteger(v) ? String(v) : Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : Math.abs(v) < 1 ? v.toFixed(3) : v.toFixed(2);
  return pctUnit ? `${s}%` : s;
}
export const lowerBetter = (dir: unknown) => typeof dir === "string" && /down|lower|min|decrease/i.test(dir);
const reached = (v: number | null, target: number, down: boolean) => v !== null && (down ? v <= target : v >= target);
const worse = (a: number, b: number, down: boolean) => (down ? b > a : b < a);
const pretty = (name?: string) => String(name ?? "bearing").replace(/_/g, " ");

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

export const fclass = (f: Doc) => String(f?.class ?? "").replace(/-/g, "_");

// ---------- moments (banners) ----------
type Moment = { key: string; kind: string; title: string; sub?: string; bars?: Doc; at: number };

function moments(s: State, primary?: string, unit?: string, down = false): Moment[] {
  const out: Moment[] = [];
  const cps = s.checkpoints;
  for (const r of s.resumes) {
    if (r.from_checkpoint_seq == null) continue;
    const cp = cps.find((c) => c.seq === r.from_checkpoint_seq);
    const b = bearingOf(cp, primary);
    out.push({ key: `res:${r._id}`, kind: "resumed", title: "⟳ RESUMED where it left off", sub: `from save point #${r.from_checkpoint_seq} (score ${fmtB(b.current, unit)}) — everything came back from Atlas`, at: t(r.created_at) });
  }
  for (const f of s.failures) {
    if (fclass(f) !== "regression") continue;
    const m = /from (-?[\d.]+%?) to (-?[\d.]+%?)/.exec(String(f.failure ?? ""));
    out.push({ key: `reg:${f._id}`, kind: "regression", title: `▼ PROBLEM: score dropped${m ? ` ${fmtB(Number(m[1].replace("%", "")), unit)} → ${fmtB(Number(m[2].replace("%", "")), unit)}` : ""}`, sub: "its last change made things worse — caught automatically", at: t(f.created_at) });
  }
  for (const tp of s.taps) {
    if (!tp.decision?.tap) continue;
    out.push({ key: `tap:${tp._id}`, kind: "tap", title: `▲ ALERT · risk ${num(tp.risk)}`, sub: tp.decision.action === "adjust_settings" ? "the watcher says: change the playbook" : tp.decision.action === "adapt" ? "the watcher says: add a rule for this" : "the watcher says: look at what happened last time", bars: tp.components, at: t(tp.created_at) });
  }
  for (const c of s.harness_config) {
    if (c.created_by === "seed" || c.version === 1) continue;
    if (c.probation) out.push({ key: `ver:${c._id}`, kind: "settings", title: "✚ HARNESS CHANGED ITSELF", sub: (() => { const d = fragDiff(c.change); return d.add.length ? `new playbook rule (on trial): “${play(d.add[0])}”` : d.del.length ? `removed: “${play(d.del[0])}”` : diffLabel(c); })(), at: t(c.created_at) });
    if (c.outcome?.verdict)
      out.push({
        key: `out:${c._id}`,
        kind: c.outcome.verdict === "kept" ? "kept" : "rolled",
        title: c.outcome.verdict === "kept" ? "✔ KEPT — the change worked" : "↩ UNDONE — the change didn't help",
        sub: c.outcome.verdict === "kept" ? "the playbook change stays" : "automatically rolled back to the previous playbook",
        at: t(c.outcome.decided_at),
      });
  }
  for (const r of s.rubrics) {
    const flags: string[] = r.flags ?? [];
    if (flags.some((x) => /overfit/.test(x)))
      out.push({ key: `rub:${r._id}`, kind: "regression", title: "⚠ PROBLEM: overfitting", sub: `a rule that fits past deals but not new ones — caught automatically`, at: t(r.created_at) });
  }
  const last = cps[cps.length - 1];
  const lb = bearingOf(last, primary);
  if (last && lb.current !== null && lb.target !== null && reached(lb.current, lb.target, down))
    out.push({ key: `green:${last._id}`, kind: "kept", title: `✔ GOAL REACHED · ${fmtB(lb.current, unit)}`, sub: "the goal never changed — only the route did", at: t(last.created_at) });
  return out.sort((a, b) => a.at - b.at);
}

// ---------- narration ----------
type Line = { key: string; at: number; cls: string; text: string };
function narrate(s: State, present: boolean, primary?: string, unit?: string): Line[] {
  const out: Line[] = [];
  for (const c of s.checkpoints) {
    const b = bearingOf(c, primary);
    out.push({ key: c._id, at: t(c.created_at), cls: "cp", text: `checkpoint #${c.seq} · ${fmtB(b.current, unit)} · ${one(c.next_action)}` });
  }
  if (!present) for (const d of s.decisions) out.push({ key: d._id, at: t(d.created_at), cls: "dec", text: `decided: ${one(d.decision)}` });
  for (const f of s.failures) out.push({ key: f._id, at: t(f.created_at), cls: fclass(f) === "regression" ? "fail" : fclass(f) === "skipped_checkpoint" || fclass(f) === "corrupt_write" ? "warn" : "fail2", text: `✗ ${f.class}: ${one(f.failure)}` });
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
type Params = { present: boolean; objective: string | null; fixture: boolean; replay: boolean; speed: number; hours: number; since?: string | null };

// ---------- replay over real Atlas history ----------
type RunSummary = { id: string; title: string; at: number; startVersion: number | null; endVersion: number | null; first: number | null; last: number | null; unit?: string; cps: number; failures: Record<string, number> };
type ReplayInfo = { from: number; to: number; speed: number; done: boolean; runs: RunSummary[] };

function buildReplay(h: Record<string, Doc[]>) {
  const items: { at: number; coll: string; doc: Doc }[] = [];
  for (const o of h.objectives ?? []) items.push({ at: t(o.created_at), coll: "objectives", doc: o });
  for (const coll of ["checkpoints", "decisions", "failures", "resumes", "policies", "taps", "events", "rubrics"])
    for (const d of h[coll] ?? []) items.push({ at: t(d.created_at), coll, doc: d });
  for (const coll of ["harness_config"])
    for (const d of h[coll] ?? []) {
      const at = t(d.created_at);
      if (d.outcome?.decided_at) {
        items.push({ at, coll, doc: { ...d, outcome: null, status: d.probation ? "probation" : "active" } });
        items.push({ at: t(d.outcome.decided_at), coll, doc: d });
      } else items.push({ at, coll, doc: d });
    }
  items.sort((a, b) => a.at - b.at);
  const objs = h.objectives ?? [];
  const cfgs = h.harness_config ?? [];
  const runs: RunSummary[] = objs.map((o) => {
    const name = o.end_state?.bearing ?? o.bearings?.[0]?.name;
    const unit = ((o.bearings ?? []) as Doc[]).find((b) => b.name === name)?.unit;
    const cps = (h.checkpoints ?? []).filter((c) => c.objective_id === o._id);
    const vals = cps.map((c) => bearingOf(c, name).current).filter((x): x is number => x !== null);
    const failures: Record<string, number> = {};
    for (const f of h.failures ?? []) if (f.objective_id === o._id) failures[f.class] = (failures[f.class] ?? 0) + 1;
    const lastAt = cps.length ? t(cps[cps.length - 1].created_at) : t(o.created_at);
    return { id: o._id, title: one(o.objective), at: t(o.created_at), startVersion: versionAt(cfgs, t(o.created_at)), endVersion: versionAt(cfgs, lastAt), first: vals[0] ?? null, last: vals[vals.length - 1] ?? null, unit, cps: cps.length, failures };
  });
  // Tick marks for key moments (colour-coded like the banners).
  const ends = new Map<string, { name?: string; target?: number; down: boolean }>();
  for (const o of objs) ends.set(o._id, { name: o.end_state?.bearing ?? o.bearings?.[0]?.name, target: o.end_state?.target ?? o.bearings?.[0]?.target, down: lowerBetter(o.end_state?.direction) });
  const ticks: Tick[] = [];
  const seenCfg = new Set<string>();
  items.forEach((it, k) => {
    const d = it.doc;
    const add = (kind: string, label: string) => ticks.push({ k, at: it.at, kind, label });
    if (it.coll === "objectives") add("objective", `new run: ${one(d.objective).slice(0, 60)}`);
    else if (it.coll === "resumes" && d.from_checkpoint_seq != null) add("resumed", `kill → resume @ checkpoint #${d.from_checkpoint_seq}`);
    else if (it.coll === "failures" && fclass(d) === "regression") add("regression", `regression: ${one(d.failure).slice(0, 60)}`);
    else if (it.coll === "failures" && fclass(d) === "overfit_segment") add("regression", "overfit proposal");
    else if (it.coll === "taps" && d.decision?.tap) add("tap", `sentinel tap ${num(d.risk)} → ${d.decision.action}`);
    else if (it.coll === "harness_config") {
      if (!seenCfg.has(d._id)) {
        seenCfg.add(d._id);
        if (d.version !== 1 || d.created_by !== "seed") add("settings", `settings v${d.version}: ${diffLabel(d)}`);
      } else if (d.outcome?.verdict) add(d.outcome.verdict === "kept" ? "kept" : "rolled", `v${d.version} ${d.outcome.verdict === "kept" ? "kept" : "rolled back"}`);
    } else if (it.coll === "checkpoints") {
      const e = ends.get(d.objective_id);
      const v = bearingOf(d, e?.name).current;
      if (e && typeof e.target === "number" && reached(v, e.target, e.down)) add("kept", `end state reached · checkpoint #${d.seq}`);
    }
  });
  return { items, runs, ticks };
}
type Tick = { k: number; at: number; kind: string; label: string };
type ReplayData = { items: { at: number; coll: string; doc: Doc }[]; runs: RunSummary[]; ticks: Tick[] };

/** State exactly as it was after item k (rebuilt from scratch; no animation through intermediate events). */
function foldTo(items: ReplayData["items"], k: number): State {
  let cur: State = { ...EMPTY };
  for (let i = 0; i <= k && i < items.length; i++) {
    const it = items[i];
    if (it.coll === "objectives") cur = { ...EMPTY, harness_config: cur.harness_config, objective: it.doc };
    else cur = reduce(cur, { coll: it.coll, op: "insert", id: String(it.doc._id), doc: it.doc });
  }
  return cur;
}

function useReplay(data: ReplayData | null, initialSpeed: number) {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(initialSpeed);
  const n = data?.items.length ?? 0;
  useEffect(() => {
    if (!data || !playing) return;
    if (k >= n - 1) {
      setPlaying(false);
      return;
    }
    const gap = Math.min(2500, Math.max(60, (data.items[k + 1].at - data.items[k].at) / speed));
    const tm = setTimeout(() => setK((x) => Math.min(n - 1, x + 1)), gap);
    return () => clearTimeout(tm);
  }, [data, playing, k, n, speed]);
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName) && e.key !== " ") return;
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((p) => !p);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        setK((x) => Math.min(n - 1, x + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        setK((x) => Math.max(0, x - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, n]);
  const state = useMemo(() => (data ? foldTo(data.items, k) : EMPTY), [data, k]);
  return { k, setK, playing, setPlaying, speed, setSpeed, state, n };
}

const TICK_COL: Record<string, string> = { resumed: "#3b82f6", regression: "#f97316", tap: "#d946ef", settings: "#facc15", kept: "#22c55e", rolled: "#e11d48", objective: "#94a3b8" };

function Scrubber({ data, rep }: { data: ReplayData; rep: ReturnType<typeof useReplay> }) {
  const from = data.items[0]?.at ?? 0;
  const to = data.items[data.items.length - 1]?.at ?? from + 1;
  const span = Math.max(1, to - from);
  const cur = data.items[rep.k]?.at ?? from;
  const pos = (at: number) => `${((at - from) / span) * 100}%`;
  const seek = (at: number) => {
    // last item with at <= target
    let lo = 0, hi = data.items.length - 1, best = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (data.items[mid].at <= at) {
        best = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    rep.setK(best);
  };
  return (
    <div className="scrub">
      <div className="scrubrow">
        <button className="sbtn" onClick={() => { rep.setPlaying(false); rep.setK(Math.max(0, rep.k - 1)); }} title="step back (←)">◀︎</button>
        <button className="sbtn play" onClick={() => rep.setPlaying(!rep.playing)} title="play/pause (space)">{rep.playing ? "❚❚" : "▶︎"}</button>
        <button className="sbtn" onClick={() => { rep.setPlaying(false); rep.setK(Math.min(rep.n - 1, rep.k + 1)); }} title="step forward (→)">▶︎▏</button>
        <span className="speeds">
          {[1, 5, 20, 60].map((x) => (
            <button key={x} className={`sbtn sp ${rep.speed === x ? "on" : ""}`} onClick={() => rep.setSpeed(x)}>{x}×</button>
          ))}
        </span>
        <span className="stime">{new Date(cur).toTimeString().slice(0, 8)} · event {rep.k + 1}/{rep.n}</span>
      </div>
      <div className="track">
        <div className="trackfill" style={{ width: pos(cur) }} />
        {data.ticks.map((tk) => (
          <button
            key={`${tk.k}-${tk.kind}`}
            className={`tick t-${tk.kind}`}
            style={{ left: pos(tk.at), background: TICK_COL[tk.kind] ?? "#fff" }}
            title={`${new Date(tk.at).toTimeString().slice(0, 8)} · ${tk.label}`}
            onClick={() => { rep.setPlaying(false); rep.setK(tk.k); }}
          />
        ))}
        <input
          type="range"
          className="range"
          min={from}
          max={to}
          step={1}
          value={cur}
          onChange={(e) => { rep.setPlaying(false); seek(Number(e.target.value)); }}
          aria-label="replay time"
        />
      </div>
    </div>
  );
}

function useParams() {
  const [p, setP] = useState<Params>({ present: true, objective: null, fixture: false, replay: false, speed: 20, hours: 12 });
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setP({
      present: q.get("present") !== "0",
      objective: q.get("objective"),
      fixture: q.get("demoFixture") === "1" || q.get("demoFixture") === "outreach",
      replay: q.get("replay") === "1",
      speed: Math.max(1, Number(q.get("speed") ?? 20) || 20),
      since: q.get("since"),
      hours: Math.max(0.1, Number(q.get("hours") ?? 12) || 12),
    });
  }, []);
  return p;
}

/** ?db=waypoints_smoke passes through to the API routes. */
export const dbQ = () => {
  const d = typeof location !== "undefined" ? new URLSearchParams(location.search).get("db") : null;
  return d ? `db=${encodeURIComponent(d)}&` : "";
};

function useStream(objective: string | null, fx: boolean, ready: boolean, replay?: { speed: number; hours: number; since: string | null }) {
  const [rdata, setRdata] = useState<ReplayData | null>(null);
  const [s, setS] = useState<State>(EMPTY);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [loaded, setLoaded] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(0);
  const [fxAlive, setFxAlive] = useState<boolean | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (replay) {
      let stop = false;
      (async () => {
        const h = await (await fetch(`/api/history?${dbQ()}hours=${replay.hours}${replay.since ? `&since=${encodeURIComponent(replay.since)}` : ""}`, { cache: "no-store" })).json();
        if (stop) return;
        setRdata(buildReplay(h));
        setStatus("live");
        setLoaded(true);
      })().catch(() => setStatus("error"));
      return () => {
        stop = true;
      };
    }
    if (fx) {
      const kind = typeof location !== "undefined" ? new URLSearchParams(location.search).get("demoFixture") : null;
      const { snapshot, steps } = (kind === "outreach" ? fixtureOutreach : fixture)(Date.now());
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
    const es = new EventSource(`/api/stream?${dbQ()}${objective ? `objective=${encodeURIComponent(objective)}` : ""}`);
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
  }, [objective, fx, ready, replay?.hours, replay?.since]);
  return { s, status, loaded, lastEventAt, fxAlive, rdata };
}

export function useNow(ms = 500) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(i);
  }, [ms]);
  return now;
}

/** Harness process liveness (pgrep on the server). null = unknown. */
export function useAlive(enabled: boolean) {
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
          <div className="btitle">✖ CRASHED — progress is safe in Atlas</div>
          <div className="bsub">agent process killed {crash.secs}s ago · last save point #{crash.seq ?? "?"}</div>
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

function Route({ s, primary, target, unit, down }: { s: State; primary?: string; target: number; unit?: string; down: boolean }) {
  const cps = s.checkpoints;
  const W = 920;
  const H = 215;
  const padL = 70, padR = 24, top = 52, bottom = 36;
  const vals = cps.map((c) => bearingOf(c, primary).current).filter((x): x is number => x !== null);
  // Goal is always drawn at the top; the far end is the worst value seen (with 10% headroom).
  const worst = down ? Math.max(target, ...vals) : Math.min(target, ...vals);
  const span = Math.abs(target - worst) || Math.abs(target) || 1;
  const yMin = down ? worst + span * 0.1 : worst >= 0 ? Math.max(0, worst - span * 0.1) : worst - span * 0.1;
  const y = (v: number) => Math.max(top - 14, top + ((target - v) / (target - yMin || 1)) * (H - top - bottom));
  const n = Math.max(cps.length, 6);
  const x = (i: number) => padL + (i + 0.5) * ((W - padL - padR) / n);
  const pts = cps.map((c, i) => ({ c, i, v: bearingOf(c, primary).current ?? yMin, ver: versionAt(s.harness_config, t(c.created_at)) }));
  const resumedAfter = new Set(s.resumes.filter((r) => r.from_checkpoint_seq != null).map((r) => r.from_checkpoint_seq));
  const bends: { i: number; c: Doc }[] = [];
  const since = t(s.objective?.created_at);
  for (const cfg of s.harness_config) {
    if (cfg.version === 1 && cfg.created_by === "seed") continue;
    if (t(cfg.created_at) < since) continue; // only route changes made during this objective
    const i = pts.findIndex((p) => t(p.c.created_at) >= t(cfg.created_at));
    bends.push({ i: i < 0 ? pts.length : i, c: cfg });
  }
  return (
    <svg className="route" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="bearing path toward the immutable end state">
      {/* destination */}
      <line x1={padL - 10} x2={W - padR} y1={y(target)} y2={y(target)} className="goal" />
      <g transform={`translate(${W - padR - 6}, ${y(target) - 12})`}>
        <text textAnchor="end" className="goaltxt">
          ◎ END STATE {pretty(primary)} {down ? "≤" : "≥"} {fmtB(target, unit)} · IMMUTABLE 🔒
        </text>
      </g>
      <text x={padL - 14} y={y(target) + 6} textAnchor="end" className="axis">{fmtB(target, unit)}</text>
      <text x={padL - 14} y={y(yMin) + 6} textAnchor="end" className="axis">{fmtB(Number.isInteger(target) ? Math.round(yMin) : yMin, unit)}</text>
      {/* settings bends */}
      {bends.map(({ i, c }, k) => {
        const bx = i < pts.length ? x(i) - (W - padL - padR) / n / 2 : x(Math.max(0, pts.length - 1)) + 20;
        return (
          <g key={c._id}>
            <line x1={bx} x2={bx} y1={top - 8} y2={H - bottom + 6} stroke={vcol(c.version)} className="bend" />
            <text x={bx > W * 0.6 ? bx - 6 : bx + 6} y={k % 2 ? H - 30 : H - 10} textAnchor={bx > W * 0.6 ? "end" : "start"} className="bendtxt" fill={vcol(c.version)}>
              v{c.version} {diffLabel(c)}
            </text>
          </g>
        );
      })}
      {/* path segments */}
      {pts.slice(1).map((p, k) => {
        const a = pts[k];
        const gap = resumedAfter.has(a.c.seq);
        const dip = worse(a.v, p.v, down);
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
          <circle cx={x(p.i)} cy={y(p.v)} r={10} fill={vcol(p.ver)} className="node" />
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
                checkpoint {Math.min(since, req)} of {req} · keep if bearing ≥ {fmtB(c.probation.baseline_bearing)} and no {c.probation.watch_class}
              </span>
            </div>
          )}
          {c.outcome?.why && <div className={verdict === "kept" ? "why ok" : "why fail"}>{one(c.outcome.why)}</div>}
        </>
      )}
    </div>
  );
}

function RubricCard({ r, parent }: { r: Doc; parent?: Doc }) {
  const [raw, setRaw] = useState(false);
  const auc = r.metrics?.holdout?.auc;
  const pauc = parent?.metrics?.holdout?.auc;
  const delta = typeof auc === "number" && typeof pauc === "number" ? auc - pauc : null;
  const flags: string[] = r.flags ?? [];
  const over = flags.some((x) => /overfit/.test(x));
  const invalid = flags.some((x) => /invalid/.test(x));
  const lines = String(r.change_summary ?? "").split(/;\s*|,\s*(?=[+\-−~])/).map((x) => x.trim()).filter(Boolean);
  return (
    <div className={`card rub ${over || invalid ? "flagged" : ""}`}>
      <div className="row between">
        <span className="cardtitle rubtitle">rubric v{r.version}</span>
        <span className="row">
          {over && <span className="chip st-rolled_back">OVERFIT · gap {num(r.gap)}</span>}
          {invalid && <span className="chip st-rolled_back">INVALID</span>}
          <button className="rawbtn" onClick={() => setRaw(!raw)}>{raw ? "hide" : "raw document"}</button>
        </span>
      </div>
      {raw ? (
        <pre className="raw">{JSON.stringify(r, null, 2)}</pre>
      ) : (
        <>
          <div className="metricline">
            holdout AUC <b>{num(auc, 3)}</b>
            {delta !== null && <span className={delta >= 0 ? "ok" : "fail"}> ({delta >= 0 ? "+" : ""}{delta.toFixed(3)})</span>}
            {typeof r.metrics?.holdout?.a_win_rate === "number" && <> · A win {fmtB(r.metrics.holdout.a_win_rate <= 1 ? r.metrics.holdout.a_win_rate * 100 : r.metrics.holdout.a_win_rate, "%")}</>}
            {!over && typeof r.gap === "number" && <> · gap {num(r.gap)}</>}
          </div>
          <div className="code">
            {lines.length ? lines.slice(0, 3).map((l, k) => <div key={k} className={/^[-−]/.test(l) ? "del" : /^\+/.test(l) ? "add" : "chg"}>{l}</div>) : <div className="ctx">  baseline ({(r.rules ?? []).length} rules)</div>}
          </div>
          {r.rationale && <div className="reason">{one(r.rationale)}</div>}
        </>
      )}
    </div>
  );
}

function ReplaySummary({ rp }: { rp: ReplayInfo }) {
  return (
    <div className="summary">
      <h2>across runs · real Atlas history {hhmm(rp.from)}–{hhmm(rp.to)}</h2>
      <table>
        <thead>
          <tr>
            <th>run</th>
            <th>settings</th>
            <th>bearing start → end</th>
            <th>cp</th>
            <th>failures by class</th>
          </tr>
        </thead>
        <tbody>
          {rp.runs.map((r) => (
            <tr key={r.id}>
              <td>{hhmm(r.at)}</td>
              <td>
                v{r.startVersion ?? "?"}
                {r.endVersion !== r.startVersion ? ` → v${r.endVersion}` : ""}
              </td>
              <td>
                {fmtB(r.first, r.unit)} → {fmtB(r.last, r.unit)}
              </td>
              <td>{r.cps}</td>
              <td className="fl">
                {Object.entries(r.failures)
                  .map(([k, v]) => `${k} ×${v}`)
                  .join(" · ") || "none"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- plain English ----------
const PLAYBOOK: Record<string, string> = {
  checkpoint_every_test: "Save progress after every test run.",
  recall_before_edit: "Look up what went wrong last time before editing.",
  verify_whole_suite: "After a fix, re-run all the tests and undo anything that broke.",
  one_change_per_edit: "Fix one bug per edit.",
  read_policies_first: "Re-read its own rules before the first edit.",
  min_support_15: "Only use segments with at least 15 deals.",
  one_change_per_iteration: "Change only one rule at a time, so each change can be measured.",
  checkpoint_every_eval: "Save progress right after every scoring run.",
  check_schema_first: "Check which fields exist before proposing a rule.",
};
const play = (id: string) => PLAYBOOK[id] ?? id.replace(/_/g, " ");
const PROBLEM: Record<string, string> = {
  overfit_segment: "overfitting",
  regression: "score drops",
  skipped_checkpoint: "skipped saves",
  invalid_rubric: "invalid rules",
  corrupt_write: "corrupt file writes",
};
const problemName = (cls: string) => PROBLEM[cls.replace(/-/g, "_")] ?? cls.replace(/[-_]/g, " ");
const scoreLabel = (name?: string) =>
  name === "qa_pass_rate" ? "first-try QA pass rate" : name === "holdout_auc" ? "score on deals it has never seen" : name === "a_grade_win_rate" ? "win rate of A-graded deals" : name === "tests_passing" ? "tests passing" : pretty(name);
const ago = (at: number, now: number) => {
  const sec = Math.max(0, Math.round((now - at) / 1000));
  return sec < 60 ? `${sec}s ago` : sec < 3600 ? `${Math.round(sec / 60)} min ago` : `${Math.round(sec / 3600)} h ago`;
};

/** "+ up_sale=Yes (+2)" → "deals where up sale is Yes get +2 points" */
function ruleInWords(line: string): string {
  const m = /^([+\-−~])\s*([\w]+)\s*=\s*([^()]+?)\s*(?:\(([+\-−]?\d+)\))?$/.exec(line.trim());
  if (!m) return line;
  const [, op, field, value, pts] = m;
  const who = `deals where ${field.replace(/_/g, " ")} is ${value.trim()}`;
  const p = pts ? pts.replace("−", "-") : "";
  if (op === "+") return `${who} get ${p ? `${/^[+-]/.test(p) ? p : `+${p}`} points` : "points"}`;
  if (op === "-" || op === "−") return `no longer scoring ${who}`;
  return `re-weighted ${who}${pts ? ` to ${pts} points` : ""}`;
}

function problemInWords(f: Doc, s: State, primary?: string, unit?: string): string {
  const cls = fclass(f);
  const txt = `${f.failure ?? ""} ${f.context ?? ""}`;
  if (cls === "overfit_segment") {
    const m = /(?:support|only|on)\s*(?:of\s*)?(\d+)\s*(?:train\s*)?deals?/i.exec(txt) ?? /(\d+)\s*train deals/i.exec(txt);
    return m ? `It added a rule based on only ${m[1]} deals — that's overfitting. Caught automatically.` : "It added a rule that fits past deals but not new ones — that's overfitting. Caught automatically.";
  }
  if (cls === "regression") {
    const m = /from (-?[\d.]+) to (-?[\d.]+)/.exec(txt);
    return `Its last change made the score drop${m ? ` (${fmtB(Number(m[1]), unit)} → ${fmtB(Number(m[2]), unit)})` : ""}. Caught automatically.`;
  }
  if (cls === "skipped_checkpoint") return "It skipped saving its progress. The harness saved it anyway and logged it.";
  if (cls === "invalid_rubric") return "It proposed a rule using a field or value that doesn't exist. Rejected automatically.";
  if (cls === "corrupt_write") return "It tried to write a broken file. The harness rejected it.";
  return `It hit a problem: ${one(f.failure).slice(0, 140)}`;
}

// ---------- outreach task (docs/OUTREACH-PACK.md) ----------
export const isOutreachObj = (o: Doc | null | undefined) =>
  !!o && (o.task === "outreach" || o.end_state?.bearing === "qa_pass_rate" || ((o.bearings ?? []) as Doc[]).some((b) => b.name === "qa_pass_rate"));
export const OUT_PROBLEM: Record<string, string> = {
  invented_fact: "invented facts",
  missing_personalization: "generic openings",
  forbidden_promise: "forbidden promises",
  placeholder_left: "leftover placeholders",
  too_long: "over-long emails",
  missing_cta: "missing asks",
  missing_subject: "bad subject lines",
  stall: "a stalled pass rate",
};
export function outreachProblem(f: Doc): string {
  const cls = fclass(f);
  const txt = one(`${f.failure ?? ""} ${f.context ?? ""} ${f.detail ?? ""}`);
  if (cls === "invented_fact") {
    const what = /revenue|\$|musd|million/i.test(txt) ? "a revenue figure" : /employ|headcount|staff/i.test(txt) ? "a headcount" : /parent|subsidiar/i.test(txt) ? "a parent company" : /year|founded|established|\b(19|20)\d\d\b/i.test(txt) ? "a founding year" : /location|city|office|based/i.test(txt) ? "a location" : "a fact";
    return `It stated ${what} that isn't in the account record — an invented fact.`;
  }
  if (cls === "missing_personalization") return "Its opening line could have gone to anyone — nothing specific about the account.";
  if (cls === "forbidden_promise") return "It made a promise sales can't make (\"free\", \"guarantee\", a discount).";
  if (cls === "placeholder_left") return "It left a template placeholder like [Name] in the email.";
  if (cls === "too_long") return "The email ran past the 120-word limit.";
  if (cls === "missing_cta") return "It never asked for a call at the end.";
  if (cls === "missing_subject") return "The subject line was missing or too long.";
  if (cls === "stall") return "The pass rate stopped improving.";
  if (cls === "skipped_checkpoint") return "It skipped saving its progress. The harness saved it anyway and logged it.";
  if (cls === "regression") return "The pass rate dropped after its last change. Caught automatically.";
  return `It hit a problem: ${txt.slice(0, 140)}`;
}
export const OUT_RULES: Record<string, string> = { open_with_record_fact: "open with one fact from the record", plain_cta: "end with one short question asking for a 15-minute call" };
export const CTX_WORDS: Record<string, string> = { account_record_full: "the full account record", account_summary: "an account summary", product_catalog: "the product catalog", account_name: "the account name" };
export const TOOL_WORDS: Record<string, string> = { outline_email: "an outline tool", lookup_account: "an account lookup tool", precheck_email: "a pre-send check" };
export const arr = (x: unknown): string[] => (Array.isArray(x) ? x.map(String) : []);
/** The settings delta of one harness_config version, as {axis, words}. */
export function outreachChange(c: Doc, cfgs: Doc[]): { axis: string; words: string } | null {
  const parent = cfgs.find((x) => x.version === c.parent_version);
  const a: Doc = parent?.settings ?? {};
  const b: Doc = c.settings ?? {};
  const plus = (k: string) => arr(b[k]).filter((x) => !arr(a[k]).includes(x));
  const minus = (k: string) => arr(a[k]).filter((x) => !arr(b[k]).includes(x));
  if (plus("required_tools").includes("precheck_email") || (plus("granted_tools").includes("precheck_email")))
    return { axis: "Guardrail", words: "it gave itself a pre-send check and must use it." };
  if (plus("context_sources").length) {
    const x = plus("context_sources")[0]!;
    return { axis: "Context policy", words: x === "account_record_full" ? "it now reads the full account record before writing." : `it now also reads ${CTX_WORDS[x] ?? x}.` };
  }
  if (plus("granted_tools").length) return { axis: "Tool access", words: `it gave itself ${TOOL_WORDS[plus("granted_tools")[0]!] ?? plus("granted_tools")[0]}.` };
  if (plus("prompt_fragments").length) { const x = plus("prompt_fragments")[0]!; return { axis: "Rules", words: `added '${OUT_RULES[x] ?? play(x)}'.` }; }
  if (minus("prompt_fragments").length) { const x = minus("prompt_fragments")[0]!; return { axis: "Rules", words: `dropped '${OUT_RULES[x] ?? play(x)}'.` }; }
  if (a.reasoning !== b.reasoning && b.reasoning != null) return { axis: "Reasoning", words: `switched thinking ${b.reasoning}.` };
  if (minus("context_sources").length) return { axis: "Context policy", words: `it stopped reading ${CTX_WORDS[minus("context_sources")[0]!] ?? minus("context_sources")[0]}.` };
  if (minus("granted_tools").length) return { axis: "Tool access", words: `it gave up ${TOOL_WORDS[minus("granted_tools")[0]!] ?? minus("granted_tools")[0]}.` };
  if (a.model !== b.model) return { axis: "Model", words: `switched to ${b.model}.` };
  return null;
}
/** Compact "harness shape" strip under the goal line. */
function ShapeStrip({ cfg }: { cfg: Doc | null }) {
  const st: Doc = cfg?.settings ?? {};
  if (!cfg) return null;
  const guards = arr(st.required_tools).filter((x) => x !== "checkpoint");
  const tools = arr(st.granted_tools);
  return (
    <div className="shape">
      <span className="shv">harness v{cfg.version}{cfg.status === "probation" ? " (trial)" : ""}</span>
      <span>rules <b>{arr(st.prompt_fragments).length}</b></span>
      {st.context_sources && <span>context [<b>{arr(st.context_sources).join(", ")}</b>]</span>}
      {st.granted_tools && <span>tools [<b>{tools.join(", ") || "—"}</b>]</span>}
      <span>guardrails [<b>{guards.join(", ") || "—"}</b>]</span>
      {st.reasoning != null && <span>reasoning <b className={st.reasoning === "on" ? "good" : ""}>{st.reasoning}</b></span>}
    </div>
  );
}

export function Story({ s, primary, target, unit, down, now, curCfgs }: { s: State; primary?: string; target: number; unit?: string; down: boolean; now: number; curCfgs: Doc[] }) {
  const o = s.objective!;
  const outreach = isOutreachObj(o);
  const sales = !outreach && (primary === "holdout_auc" || s.rubrics.length > 0);
  const vals = s.checkpoints.map((c) => bearingOf(c, primary).current).filter((x): x is number => x !== null);
  const first = vals[0] ?? (s.rubrics[0]?.metrics?.holdout?.auc as number | undefined) ?? null;
  const last = vals[vals.length - 1] ?? (s.rubrics[s.rubrics.length - 1]?.metrics?.holdout?.auc as number | undefined) ?? null;
  const done = reached(last, target, down);
  const rub = s.rubrics[s.rubrics.length - 1];
  const rubLines = String(rub?.change_summary ?? "").split(/;\s*|,\s*(?=[+\-−~])/).map((x) => x.trim()).filter((x) => /^[+\-−~]/.test(x));
  const PROBLEMS = ["overfit_segment", "regression", "skipped_checkpoint", "invalid_rubric", "corrupt_write"];
  const fails = s.failures.filter((f) => sales ? PROBLEMS.includes(fclass(f)) : true);
  const lastFail = fails[fails.length - 1];
  // The trial change (has probation) is the story; a rollback's restore version is its consequence, shown in box 4.
  const mine = [...curCfgs].reverse().filter((c) => c.change && t(c.created_at) >= t(o.created_at));
  const change = mine.find((c) => c.probation) ?? mine[0];
  const d = change ? fragDiff(change.change) : null;
  const tap = change?.reason?.kind === "tap" ? s.taps.find((x) => x._id === change.reason.id) : null;
  const trig = tap ? s.failures.find((f) => f._id === tap.trigger?.id) : null;
  const why = trig ? problemName(fclass(trig)) : /^(\w[\w-]*)/.exec(String(change?.reason?.summary ?? ""))?.[1];
  const since = change?.probation ? s.checkpoints.filter((x) => x.seq > change.probation.started_seq).length : 0;
  const req = change?.probation?.checkpoints_required ?? 0;
  const verdict = change?.outcome?.verdict as string | undefined;
  const wm = /v\d+:\s*(\d+)\s+([\w-]+)\s+in\s+(\d+)[^→]*→\s*v\d+:\s*(\d+)\s+in\s+(\d+)/.exec(String(change?.outcome?.why ?? ""));
  const watch = change?.probation?.watch_class ? problemName(change.probation.watch_class) : wm ? problemName(wm[2]) : "the problem";
  const active = verdict ? 4 : change ? 3 : lastFail ? 2 : 1;
  const oc0 = outreach && change ? outreachChange(change, curCfgs) : null;
  // the sentinel's own tap carries axis + change_words: label from the tap, words ours when recognised
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);
  const oc = oc0
    ? { axis: tap?.axis ? cap(String(tap.axis)) : oc0.axis, words: oc0.words }
    : outreach && change && tap?.change_words ? { axis: tap.axis ? cap(String(tap.axis)) : "Change", words: `it ${String(tap.change_words)}.` } : null;
  const lastCp = s.checkpoints[s.checkpoints.length - 1];
  const acc = bearingOf(lastCp, "accounts_done");
  const accTarget = acc.target ?? ((o.bearings ?? []) as Doc[]).find((b) => b.name === "accounts_done")?.target ?? null;
  const pr = s.checkpoints.map((c) => bearingOf(c, "qa_pass_rate").current).filter((x): x is number => x !== null);
  const outWatch = change?.probation?.watch_class ? OUT_PROBLEM[fclass({ class: change.probation.watch_class })] ?? problemName(change.probation.watch_class) : "the problem";
  return (
    <div className="story">
      <div className={`sbox ${active === 1 ? "hot" : ""}`}>
        <div className="snum">1 · THE WORK</div>
        <div className="stext">
          {outreach ? "An SDR agent is working a queue of real accounts; a deterministic QA gate grades every email." : sales ? "The agent is improving a deal-scoring rubric." : `The agent is working on: ${one(o.objective)}`}
        </div>
        {outreach ? (
          <div className="sbig">
            Writing first-touch emails: <b>{acc.current ?? 0}</b> of {accTarget ?? "?"} accounts done · pass rate <b className="bad">{pr.length ? `${Math.round(pr[0]!)}%` : "—"}</b> → <b className={(pr[pr.length - 1] ?? 0) >= target ? "good" : ""}>{pr.length ? `${Math.round(pr[pr.length - 1]!)}%` : "—"}</b>
            <span className="sgoal"> (goal ≥ {fmtB(target, unit)} first-try — locked)</span>
          </div>
        ) : (
        <div className="sbig">
          {scoreLabel(primary)}: <b className="bad">{fmtB(first, unit)}</b> → <b className={done ? "good" : ""}>{fmtB(last, unit)}</b>
          <span className="sgoal"> (goal {down ? "≤" : "≥"} {fmtB(target, unit)} — locked)</span>
        </div>
        )}
        {rubLines.length > 0 && <div className="ssub">Just changed: {rubLines.slice(0, 2).map(ruleInWords).join("; ")}.</div>}
      </div>
      <div className="sarrow">↓</div>
      <div className={`sbox ${active === 2 ? "hot" : ""} ${lastFail ? "warnbox" : ""}`}>
        <div className="snum">2 · WHAT WENT WRONG</div>
        <div className="stext">{lastFail ? (outreach ? outreachProblem(lastFail) : problemInWords(lastFail, s, primary, unit)) : "Nothing so far."}</div>
        {lastFail && <div className="ssub">{ago(t(lastFail.created_at), now)} · {fails.length} problem{fails.length === 1 ? "" : "s"} this run</div>}
      </div>
      <div className="sarrow">↓</div>
      <div className={`sbox ${active === 3 ? "hot" : ""} ${change ? "selfbox" : ""}`}>
        <div className="snum">3 · WHAT THE HARNESS CHANGED ABOUT ITSELF</div>
        {oc ? (
          <>
            <div className="stext">
              <b className="axis">{oc.axis}:</b> {oc.words}
            </div>
            <div className="ssub">
              {change?.reason?.kind === "tap" && trig ? `Because of ${OUT_PROBLEM[fclass(trig)] ?? problemName(fclass(trig))}. ` : why ? `Because of ${OUT_PROBLEM[why.replace(/-/g, "_")] ?? why}. ` : ""}
              {change?.probation && !verdict ? `On trial: ${Math.min(since, req)} of ${req} save points checked.` : ""}
            </div>
          </>
        ) : change && d ? (
          <>
            <div className="stext">
              {d.add.length > 0 && <>It added one instruction to its own playbook: <q>{play(d.add[0])}</q></>}
              {d.add.length === 0 && d.del.length > 0 && <>It removed an instruction from its playbook: <q>{play(d.del[0])}</q></>}
              {d.other && <>It changed one setting: {d.other}</>}
            </div>
            <div className="ssub">
              {why ? `Because of ${why}. ` : ""}
              {change.probation && !verdict ? `On trial: ${Math.min(since, req)} of ${req} save points checked.` : ""}
            </div>
          </>
        ) : (
          <div className="stext">Nothing yet — it's running its starting playbook.</div>
        )}
      </div>
      <div className="sarrow">↓</div>
      <div className={`sbox ${active === 4 ? "hot" : ""} ${verdict === "kept" ? "okbox" : verdict ? "badbox" : ""}`}>
        <div className="snum">4 · DID IT WORK?</div>
        {verdict && outreach ? (
          <div className="stext">
            {change?.outcome?.why ? <>{one(change.outcome.why).replace(/\s*(Kept|Rolled back|Undone)\.?\s*$/i, "")} </> : null}
            {verdict === "kept" ? <b className="good">Change kept.</b> : <b className="bad">Didn&apos;t help — change automatically undone.</b>}
          </div>
        ) : verdict ? (
          <div className="stext">
            {wm ? (
              <>
                {watch[0].toUpperCase() + watch.slice(1)}: <b className="bad">{wm[1]}</b> in {wm[3]} save points before → <b className={Number(wm[4]) === 0 ? "good" : "bad"}>{wm[4]}</b> in the next {wm[5]}.{" "}
              </>
            ) : null}
            {verdict === "kept" ? <b className="good">Change kept.</b> : <b className="bad">Didn&apos;t help — change automatically undone.</b>}
          </div>
        ) : change?.probation ? (
          <div className="stext">Too early to tell — on trial ({Math.min(since, req)} of {req}). It is kept only if the {outreach ? "pass rate" : "score"} holds and {outreach ? outWatch : watch} don&apos;t come back.</div>
        ) : (
          <div className="stext">No changes to judge yet.</div>
        )}
      </div>
    </div>
  );
}

// ---------- page ----------
export default function Recorder({ replay = false }: { replay?: boolean }) {
  const params0 = useParams();
  const params = replay ? { ...params0, replay: true } : params0;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const replayOpts = useMemo(() => (params.replay ? { speed: params.speed, hours: params.hours, since: params.since ?? null } : undefined), [params.replay, params.speed, params.hours, params.since]);
  const { s: liveS, status, loaded, lastEventAt, fxAlive, rdata } = useStream(params.objective, params.fixture, ready, replayOpts);
  const rep = useReplay(rdata, params.speed);
  const s = rdata ? rep.state : liveS;
  const curAt = rdata?.items[rep.k]?.at ?? 0;
  const rp: ReplayInfo | null = rdata
    ? { from: rdata.items[0]?.at ?? 0, to: rdata.items[rdata.items.length - 1]?.at ?? 0, speed: rep.speed, done: rep.k >= rep.n - 1 && !rep.playing, runs: rdata.runs }
    : null;
  const liveAlive = useAlive(ready && !params.fixture && !params.replay);
  const alive = params.fixture ? fxAlive : liveAlive;
  const now = useNow();
  const present = params.present;
  const o = s.objective;
  const endState = o?.end_state as Doc | undefined;
  const primary: string | undefined = endState?.bearing ?? o?.bearings?.[0]?.name;
  const pb: Doc | undefined = ((o?.bearings ?? []) as Doc[]).find((b) => b.name === primary) ?? o?.bearings?.[0];
  const target: number = endState?.target ?? pb?.target ?? 10;
  const unit: string | undefined = pb?.unit ?? endState?.unit;
  const down = lowerBetter(endState?.direction ?? pb?.direction);
  const cfg = currentConfig(s.harness_config);
  const lastCp = s.checkpoints[s.checkpoints.length - 1];
  const latestTap = s.taps[s.taps.length - 1];
  const threshold: number = typeof cfg?.settings?.sentinel_threshold === "number" ? cfg.settings.sentinel_threshold : 0.6;

  // ---- banner queue: only moments that arrive after the first snapshot ----
  const all = useMemo(() => moments(s, primary, unit, down), [s, primary, unit, down]);
  const seen = useRef<Set<string> | null>(null);
  const objKey = useRef<string | null>(null);
  const [queue, setQueue] = useState<{ m: Moment; start: number | null }[]>([]);
  useEffect(() => {
    if (!loaded || rdata) return;
    const ok = o?._id ?? null;
    if (seen.current === null || objKey.current !== ok) {
      seen.current = new Set(all.map((m) => m.key));
      objKey.current = ok;
      return;
    }
    const fresh = all.filter((m) => !seen.current!.has(m.key));
    if (!fresh.length) return;
    fresh.forEach((m) => seen.current!.add(m.key));
    // Never let banners lag reality: keep at most the showing one plus the 2 newest.
    setQueue((q) => {
      const next = [...q, ...fresh.map((m) => ({ m, start: null as number | null }))];
      return next.length > 3 ? [next[0], ...next.slice(-2)] : next;
    });
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
    else if (alive === null && !params.fixture && !params.replay && now - lastWrite > 6000 && now - lastWrite < 120000 && lastCp && !reached(bearingOf(lastCp, primary).current, target, down)) crashed = true;
  }
  if (crashed && downSince.current === null) downSince.current = alive === false ? now : lastWrite;
  if (!crashed) downSince.current = null;
  // After 60s down it's probably a deliberate stop, not the demo's kill: fall back to the idle banner (header badge still says down).
  if (crashed && downSince.current !== null && now - downSince.current > 60000) crashed = false;
  const crash = crashed ? { secs: Math.max(0, Math.round((now - (downSince.current ?? now)) / 1000)), seq: lastCp?.seq ?? null } : null;
  // Replay: the banner is whatever moment the cursor sits on (within 6s of playback time), so scrubbing lands on it.
  const replayBanner = rdata ? [...all].reverse().find((m) => m.at <= curAt && curAt - m.at <= 6000 * rep.speed) ?? null : null;
  const banner = rdata ? (rp?.done ? null : replayBanner) : queue[0]?.start != null ? queue[0].m : null;

  // ---- hero metrics ----
  const hero = useMemo(() => {
    const cfgs = s.harness_config;
    const cur = currentConfig(cfgs);
    const afterV = cur?.version ?? null;
    const beforeV = cur?.parent_version ?? (afterV !== null && afterV > 1 ? afterV - 1 : null);
    const skipsBy = new Map<number, number>();
    const regBy = new Map<number, number>();
    const overBy = new Map<number, number>();
    const cpsBy = new Map<number, number>();
    for (const f of s.failures) {
      const v = failureVersion(cfgs, f);
      if (v === null) continue;
      if (fclass(f) === "skipped_checkpoint" || fclass(f) === "corrupt_write") skipsBy.set(v, (skipsBy.get(v) ?? 0) + 1);
      if (fclass(f) === "regression") regBy.set(v, (regBy.get(v) ?? 0) + 1);
      if (fclass(f) === "overfit_segment") overBy.set(v, (overBy.get(v) ?? 0) + 1);
    }
    for (const c of s.checkpoints) {
      const v = versionAt(cfgs, t(c.created_at));
      if (v !== null) cpsBy.set(v, (cpsBy.get(v) ?? 0) + 1);
    }
    const vals = s.checkpoints.map((c) => bearingOf(c, primary).current).filter((x): x is number => x !== null);
    let low: number | null = null;
    for (let i = 1; i < vals.length; i++) if (worse(vals[i - 1], vals[i], down)) low = vals[i];
    const nowTests = vals.length ? vals[vals.length - 1] : (o?.bearings?.[0]?.current ?? null);
    const verdictCfg = [...cfgs].reverse().find((c) => c.outcome?.why && t(c.outcome.decided_at) >= t(o?.created_at));
    return { beforeV, afterV, skipsBy, regBy, overBy, cpsBy, low, first: vals[0] ?? null, nowTests, why: verdictCfg ? `v${verdictCfg.version} ${verdictCfg.outcome.verdict === "kept" ? "kept" : "rolled back"}: ${one(verdictCfg.outcome.why)}` : null };
  }, [s, primary, o]);

  const lines = useMemo(() => narrate(s, present, primary, unit), [s, present, primary, unit]);
  const age = lastEventAt ? Math.max(0, Math.round((now - lastEventAt) / 1000)) : null;
  const counts: [string, number][] = [
    ["checkpoints", s.checkpoints.length],
    ["failures", s.failures.length],
    ["taps", s.taps.length],
    ["harness_config", s.harness_config.length],
    ["events", s.events.length],
    ["resumes", s.resumes.length],
  ];
  const objStart = t(o?.created_at);
  const cfgCards = [...s.harness_config].filter((c, i, arr) => t(c.created_at) >= objStart || !arr.slice(i + 1).some((n) => t(n.created_at) <= objStart)).reverse().slice(0, present ? 2 : 20);

  const testsFrom = hero.first;
  const cmp = (label: string, by: Map<number, number>) => {
    const { beforeV, afterV } = hero;
    if (afterV === null) return null;
    const before = beforeV !== null ? (by.get(beforeV) ?? 0) : null;
    const after = by.get(afterV) ?? 0;
    if (!before && !after) return null;
    return (
      <div className="tile" key={label}>
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

  const cmpTiles = [cmp("overfit proposals", hero.overBy), cmp("skipped checkpoints", hero.skipsBy), cmp("regressions", hero.regBy)].filter((x) => x !== null).slice(0, 2);

  return (
    <main className={`${present ? "present" : ""} ${rdata ? "replaying" : ""}`}>
      <header>
        <div className="row between top">
          <span className="brand">WAYPOINTS · replay{params.fixture ? " · DEMO FIXTURE (not live)" : ""}</span>
          {rp ? (
            <span className="replaybar">
              ⏵ REPLAY · {hhmm(rp.from)}–{hhmm(rp.to)} · {rp.speed}×
              {o && rp.runs.length > 1 ? ` · run ${rp.runs.findIndex((r) => r.id === o._id) + 1}/${rp.runs.length}` : ""}
              {rp.done ? " · done" : ""}
            </span>
          ) : (
          <span className={`conn ${status}`}>
            {status === "live" ? "●" : "○"} {status === "live" ? "live · Atlas change stream" : status === "connecting" ? "connecting…" : "reconnecting…"}
            {age !== null && status === "live" ? <span className="age"> · last event {age}s ago</span> : null}
          </span>
          )}
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
                  🔒 GOAL (locked): {scoreLabel(endState.bearing)} {down ? "≤" : "≥"} {fmtB(endState.target, unit)}
                </span>
              ) : (
                <span className="badge">goal: not set</span>
              )}
              {alive !== null && !params.fixture && <span className={`badge ${alive ? "alive" : "dead"}`}>{alive ? "agent ● running" : "agent ✖ down"}</span>}
              {params.fixture && alive !== null && <span className={`badge ${alive ? "alive" : "dead"}`}>{alive ? "agent ● running" : "agent ✖ down"}</span>}
            </div>
            <ShapeStrip cfg={cfg} />
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
                    {lastCp ? `save point #${lastCp.seq} · score ${fmtB(bearingOf(lastCp, primary).current, unit)}` : "starting up…"}
                  </div>
                  <div className="bsub">{lastCp ? `next it will: ${one(lastCp.next_action)}` : ""}</div>
                </div>
              </div>
            )}
          </div>

          {rp?.done && <ReplaySummary rp={rp} />}

          <Story s={s} primary={primary} target={target} unit={unit} down={down} now={rdata ? curAt : now} curCfgs={s.harness_config} />

          <details className="more" open={!present}>
            <summary>details ▸ scores, route, scoring rules, playbook versions, raw Atlas documents, event log</summary>
          <section className="hero">
            <div className="tile">
              <div className="tlabel">{pretty(primary)}</div>
              <div className="tnum">
                {testsFrom !== null && testsFrom !== hero.nowTests && (
                  <>
                    <span className="bad">{fmtB(testsFrom, unit)}</span>
                    <span className="arrow">→</span>
                  </>
                )}
                <span className={reached(hero.nowTests, target, down) ? "good" : "neutral"}>{fmtB(hero.nowTests, unit)}</span>
              </div>
              <div className="tfoot">
                start → now · target {down ? "≤" : "≥"} {fmtB(target, unit)}
              </div>
            </div>
            {cmpTiles}
            {cmpTiles.length < 2 && (
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
            <Route s={s} primary={primary} target={target} unit={unit} down={down} />
          </section>

          {s.rubrics.length > 0 ? (
            <section className="twocol">
              <div>
                <h2 className="h-work">what it's learning · rubric (the work)</h2>
                {[...s.rubrics].reverse().slice(0, present ? 1 : 20).map((r) => (
                  <RubricCard key={r._id} r={r} parent={s.rubrics.find((x) => x.version === r.parent_version) ?? s.rubrics.find((x) => x.version === r.version - 1)} />
                ))}
              </div>
              <div>
                <h2 className="h-self">how it's learning · harness settings (itself)</h2>
                {cfgCards.slice(0, present ? 1 : 20).map((c) => (
                  <ConfigCard key={c._id} c={c} s={s} primary={primary} present={present} />
                ))}
              </div>
            </section>
          ) : (
            <section>
              <h2 className="h-self">how it's learning · harness settings (itself) · one field per change, gated, on probation</h2>
              <div className="cards">
                {cfgCards.map((c) => (
                  <ConfigCard key={c._id} c={c} s={s} primary={primary} present={present} />
                ))}
                {cfgCards.length === 0 && <div className="dimtxt">no harness_config yet</div>}
              </div>
            </section>
          )}

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
          </details>
          {rdata && <Scrubber data={rdata} rep={rep} />}
        </>
      )}
    </main>
  );
}
