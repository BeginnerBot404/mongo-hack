"use client";
// /live: the glass box. Story strip, then the harness's current shape, the work it produces, and the raw Atlas stream.
// One SSE connection (/api/stream): snapshot + every change. ?db= passes through, ?objective= pins.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  EMPTY, OUT_PROBLEM, arr, currentConfig, dbQ, fclass, hhmmss, one, outreachChange, outreachProblem, reduce, t, upsert, useAlive, useNow,
  type Change, type Doc, type State,
} from "../Recorder";
import { fragment } from "@/lib/fragments";

type LiveState = State & { drafts: Doc[]; accounts: Doc[]; objectives: Doc[]; inflight: Doc[]; bars: Doc[] };
type Raw = { k: number; at: number; coll: string; op: string; text: string };

const ALL_CONTEXT = ["account_name", "account_summary", "account_record_full", "product_catalog"];
const OPTIONAL_TOOLS = ["outline_email", "lookup_account", "precheck_email"];
const QUEUED = ["pending", "in_progress", "done", "failed"];
const visibleTools = (st: Doc) => [
  ...OPTIONAL_TOOLS.filter((x) => arr(st.granted_tools).includes(x) || (x === "precheck_email" && arr(st.required_tools).includes(x))),
  "submit_email",
];
const pct = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)}%`);
const rateCls = (x: number | null) => (x == null ? "" : x >= 0.8 ? "good" : x >= 0.5 ? "mid" : "bad");
const AXIS_OF: Record<string, string> = { prompt_fragments: "rules", context_sources: "context policy", reasoning: "reasoning mode", required_tools: "guardrail", granted_tools: "tool access", model: "model", sentinel_threshold: "sentinel" };

// ---------- raw change stream lines (mirror of view:atlas trim()) ----------
function trimRaw(v: unknown, key = ""): unknown {
  if (typeof v === "string") {
    if (/^[0-9a-f]{24}$/.test(v)) return `…${v.slice(-6)}`;
    if (/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(v)) return hhmmss(v);
    return v.length > 80 ? v.slice(0, 79) + "…" : v;
  }
  if (Array.isArray(v)) {
    if ((v.length > 16 && v.every((x) => typeof x === "number")) || (/embedding|vector/i.test(key) && v.length)) return `[${v.length} floats]`;
    return v.map((x) => trimRaw(x));
  }
  if (v && typeof v === "object") {
    const out: Doc = {};
    for (const [k, x] of Object.entries(v as Doc)) out[k] = trimRaw(x, k);
    return out;
  }
  return v;
}
const compact = (v: unknown) => JSON.stringify(v).replace(/"([A-Za-z_][\w.]*)":/g, "$1:").replace(/,(?=[A-Za-z_"{[])/g, ", ");

function useLive(objective: string | null, ready: boolean, series = true) {
  const [s, setS] = useState<LiveState>({ ...EMPTY, drafts: [], accounts: [], objectives: [], inflight: [], bars: [] });
  const [raw, setRaw] = useState<Raw[]>([]);
  const [status, setStatus] = useState<"connecting" | "live" | "error">("connecting");
  const [loaded, setLoaded] = useState(false);
  const k = useRef(0);
  useEffect(() => {
    if (!ready) return;
    const es = new EventSource(`/api/stream?${dbQ()}${series ? "series=1&" : ""}${objective ? `objective=${encodeURIComponent(objective)}` : ""}`);
    es.addEventListener("snapshot", (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      // never clear on a new batch: the series snapshot carries every batch since the run started
      setS({ ...EMPTY, drafts: [], accounts: [], objectives: d.objective ? [d.objective] : [], inflight: [], bars: [], ...d });
      setStatus("live");
      setLoaded(true);
    });
    es.addEventListener("change", (e) => {
      const ch = JSON.parse((e as MessageEvent).data) as Change;
      if (ch.coll === "inflight") {
        // token-rate rows: update in place, never into the raw stream list
        setS((prev) => {
          const list = prev.inflight ?? [];
          if (ch.op === "delete") return { ...prev, inflight: list.filter((d) => d._id !== ch.id) };
          if (!ch.doc) return prev;
          const i = list.findIndex((d) => d._id === ch.doc!._id);
          const next = i >= 0 ? list.map((d, j) => (j === i ? ch.doc! : d)) : [...list, ch.doc];
          return { ...prev, inflight: next.sort((a, b) => String(a.worker).localeCompare(String(b.worker), undefined, { numeric: true })) };
        });
        return;
      }
      setS((prev) => {
        const ids = new Set(prev.objectives.map((x) => x._id));
        const next: LiveState = { ...prev };
        const key = ch.coll as keyof LiveState;
        if (ch.coll === "objectives" && ch.doc) {
          if (ids.has(ch.doc._id)) next.objectives = prev.objectives.map((x) => (x._id === ch.doc!._id ? ch.doc! : x));
          if (prev.objective?._id === ch.doc._id) next.objective = ch.doc;
        } else if (ch.coll === "harness_config") {
          return reduce(prev, ch) as LiveState;
        } else if (ch.coll === "bars") {
          if (ch.op === "delete") next.bars = prev.bars.filter((d) => d._id !== ch.id);
          else if (ch.doc) next.bars = upsert(prev.bars ?? [], ch.doc, "version");
        } else if (ch.coll !== "accounts" && Array.isArray(prev[key])) {
          const list = prev[key] as Doc[];
          if (ch.op === "delete") (next as Doc)[key] = list.filter((d) => d._id !== ch.id);
          else if (ch.doc && ids.has(ch.doc.objective_id)) (next as Doc)[key] = upsert(list, ch.doc, "created_at");
        }
        if (ch.coll === "accounts" && ch.doc) {
          const i = prev.accounts.findIndex((a) => a._id === ch.doc!._id);
          const list = i >= 0 ? prev.accounts.map((a, j) => (j === i ? ch.doc! : a)) : [...prev.accounts, ch.doc];
          next.accounts = list.filter((a) => QUEUED.includes(a.status));
        }
        return next;
      });
      if (ch.coll === "accounts" && ch.op === "update") {
        // queue claims: show only the status flip, not the whole record
        const d = ch.doc ?? {};
        const line = compact({ _id: trimRaw(ch.id), $set: { account: d.account, status: d.status, ...(d.claimed_by ? { claimed_by: d.claimed_by } : {}) } });
        setRaw((r) => [{ k: ++k.current, at: Date.now(), coll: ch.coll, op: ch.op, text: line }, ...r].slice(0, 80));
        return;
      }
      if (ch.coll === "objectives" && ch.op === "update") {
        const d = ch.doc ?? {};
        const line = compact({ _id: trimRaw(ch.id), status: d.status, bearings: trimRaw((d.bearings ?? []).map((b: Doc) => ({ [b.name]: b.current }))) });
        setRaw((r) => [{ k: ++k.current, at: Date.now(), coll: ch.coll, op: ch.op, text: line }, ...r].slice(0, 80));
        return;
      }
      const text = ch.op === "delete" ? compact({ _id: trimRaw(ch.id) }) : compact(trimRaw(ch.doc ?? {}));
      setRaw((r) => [{ k: ++k.current, at: Date.now(), coll: ch.coll, op: ch.op, text }, ...r].slice(0, 80));
    });
    es.addEventListener("ping", () => setStatus("live"));
    es.addEventListener("error", () => setStatus("error"));
    return () => es.close();
  }, [objective, ready, series]);
  return { s, raw, status, loaded };
}

// ---------- harness config diff (one version vs its parent) ----------
type Diff = { from: number | null; to: number; axis: string; plus: string[]; minus: string[]; because: string | null; trial: string | null; status: string };
function diffOf(c: Doc, s: LiveState): Diff {
  const parent = s.harness_config.find((x) => x.version === c.parent_version);
  const a: Doc = parent?.settings ?? {};
  const b: Doc = c.settings ?? {};
  const plus: string[] = [];
  const minus: string[] = [];
  const fields: string[] = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (JSON.stringify(a[k]) === JSON.stringify(b[k])) continue;
    fields.push(k);
    if (Array.isArray(a[k]) || Array.isArray(b[k])) {
      const lock = k === "required_tools" ? "🔒 " : "";
      plus.push(...arr(b[k]).filter((x) => !arr(a[k]).includes(x)).map((x) => lock + x));
      minus.push(...arr(a[k]).filter((x) => !arr(b[k]).includes(x)).map((x) => lock + x));
    } else plus.push(`${k}: ${String(a[k] ?? "∅")} → ${String(b[k])}`);
  }
  const dedupe = (xs: string[]) => xs.filter((x) => !(!x.startsWith("🔒") && xs.includes(`🔒 ${x}`)));
  plus.splice(0, plus.length, ...dedupe(plus));
  minus.splice(0, minus.length, ...dedupe(minus));
  const tap = c.reason?.kind === "tap" ? s.taps.find((x) => x._id === c.reason.id) : null;
  let axis = tap?.axis ? String(tap.axis) : outreachChange(c, s.harness_config)?.axis ?? (fields.map((f) => AXIS_OF[f] ?? f)[0] ?? "settings");
  if (fields.includes("required_tools") && fields.includes("granted_tools")) axis = "guardrail";
  const trig = tap ? s.failures.find((f) => f._id === tap.trigger?.id) : null;
  const cls = trig?.class ?? c.probation?.watch_class ?? /^([\w-]+)/.exec(String(c.reason?.summary ?? ""))?.[1] ?? null;
  const n = cls ? s.failures.filter((f) => f.class === cls && t(f.created_at) <= t(c.created_at) + 1000).length : 0;
  const because = !c.probation && c.created_by !== "seed" && c.parent_version != null ? null : cls ? `${cls}${n > 1 ? ` ×${n}` : ""}` : c.reason?.kind === "manual_seed" || c.created_by === "seed" ? "seed" : null;
  let trial: string | null = null;
  if (c.probation) {
    const since = s.checkpoints.filter((x) => x.seq > c.probation.started_seq).length;
    const req = c.probation.checkpoints_required ?? 3;
    trial = c.outcome ? (c.outcome.verdict === "kept" ? "kept" : "undone") : `trial ${Math.min(since, req)}/${req}`;
  }
  return { from: parent?.version ?? c.parent_version ?? null, to: c.version, axis, plus, minus, because, trial, status: c.status };
}

function DiffCard({ d, flash }: { d: Diff; flash: boolean }) {
  return (
    <div className={`diffcard ${flash ? "flash" : "quiet"}`}>
      <div className="dchead">
        <span className="dcver">
          {d.from != null ? `v${d.from} → ` : ""}v{d.to}
        </span>
        <span className="dcaxis">{d.axis.toUpperCase()}</span>
        {d.trial && <span className={`dctrial ${d.trial === "kept" ? "good" : d.trial === "undone" ? "bad" : ""}`}>{d.trial}</span>}
      </div>
      <div className="dcbody">
        {d.plus.map((x) => (
          <span key={`+${x}`} className="plus">+ {x}</span>
        ))}
        {d.minus.map((x) => (
          <span key={`-${x}`} className="minus">− {x}</span>
        ))}
        {d.because && <span className="because">because {d.because}</span>}
      </div>
    </div>
  );
}

function ShapePanel({ s, now }: { s: LiveState; now: number }) {
  const cfg = currentConfig(s.harness_config);
  const [flash, setFlash] = useState<{ v: number; until: number } | null>(null);
  const seenV = useRef<number | null>(null);
  useEffect(() => {
    if (!cfg) return;
    if (seenV.current !== null && cfg.version !== seenV.current) setFlash({ v: cfg.version, until: Date.now() + 10_000 });
    seenV.current = cfg.version;
  }, [cfg?.version]);
  if (!cfg) return <section className="panel shape"><div className="phead"><h3>Harness shape</h3></div><div className="empty">waiting for the seed version…</div></section>;
  const st: Doc = cfg.settings ?? {};
  const parent: Doc = s.harness_config.find((x) => x.version === cfg.parent_version)?.settings ?? {};
  const isNew = (k: string, x: string) => cfg.parent_version != null && !arr(parent[k]).includes(x);
  const req = arr(st.required_tools);
  const tools = visibleTools(st);
  const d = diffOf(cfg, s);
  const flashing = !!flash && flash.v === cfg.version && now < flash.until;
  // last kept/undone verdict on any version (the change the current one may have replaced)
  const lastVerdict = [...s.harness_config].reverse().find((c) => c.outcome?.verdict && t(c.outcome.decided_at) >= t(s.objectives[0]?.created_at ?? s.objective?.created_at));
  return (
    <section className="panel shape">
      <div className="phead">
        <h3>Harness shape</h3>
        <span className={`vtag st-${cfg.status}`}>
          v{cfg.version} · {cfg.status === "probation" ? "on trial" : cfg.status}
        </span>
      </div>
      <DiffCard d={d} flash={flashing} />
      <div className="shrow">
        <div className="shk">Tools the model sees</div>
        <div className="chips">
          {tools.map((x) => (
            <span key={x} className={`chip tool ${isNew("granted_tools", x) && x !== "submit_email" ? "new" : ""}`}>
              {x}
              {req.includes(x) ? " 🔒" : ""}
            </span>
          ))}
          {OPTIONAL_TOOLS.filter((x) => !tools.includes(x)).map((x) => (
            <span key={x} className="chip off">{x}</span>
          ))}
        </div>
      </div>
      <div className="shrow">
        <div className="shk">Context sources</div>
        <div className="chips">
          {ALL_CONTEXT.map((x) => (
            <span key={x} className={`chip ${arr(st.context_sources).includes(x) ? (isNew("context_sources", x) ? "ctx new" : "ctx") : "off"}`}>{x}</span>
          ))}
        </div>
      </div>
      <div className="shrow">
        <div className="shk">Guardrails</div>
        <div className="chips">
          {req.map((x) => (
            <span key={x} className={`chip guard ${isNew("required_tools", x) ? "new" : ""}`}>🔒 {x} required</span>
          ))}
          {req.includes("precheck_email") && <span className="chip guard">submit refused unless prechecked</span>}
        </div>
      </div>
      <div className="shrow">
        <div className="shk">Reasoning</div>
        <div className="chips">
          <span className={`chip ${st.reasoning === "on" ? "reason new" : "off"}`}>thinking {st.reasoning ?? "off"}</span>
          <span className="chip dimchip">model {String(st.model ?? "?")}</span>
          <span className="chip dimchip">sentinel ≥ {typeof st.sentinel_threshold === "number" ? st.sentinel_threshold.toFixed(2) : "?"}</span>
        </div>
      </div>
      <div className="shk rulesk">Playbook rules (in the system prompt)</div>
      <div className="rules">
        {arr(st.prompt_fragments).map((id) => {
          const f = fragment(id);
          return (
            <div key={id} className={`rule ${isNew("prompt_fragments", id) ? "new" : ""}`}>
              <span className="rid">{id}</span> {f?.text ?? ""}
            </div>
          );
        })}
      </div>
      {lastVerdict && lastVerdict.version !== cfg.version && (
        <div className={`verdict ${lastVerdict.outcome.verdict === "kept" ? "good" : "bad"}`}>
          v{lastVerdict.version} {lastVerdict.outcome.verdict === "kept" ? "kept" : "undone"}: {one(lastVerdict.outcome.why)}
        </div>
      )}
    </section>
  );
}

// ---------- run control (ALLOW_RUN=1 only) ----------
function RunControl({ alive }: { alive: boolean | null }) {
  const [allowed, setAllowed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    fetch("/api/run", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setAllowed(!!j.allowed))
      .catch(() => setAllowed(false));
  }, []);
  if (!allowed) return null;
  const go = async (action: "start" | "stop") => {
    setBusy(true);
    try {
      const r = await fetch(`/api/run?${dbQ()}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      const j = await r.json();
      setMsg(j.message ?? "");
    } catch (e) {
      setMsg(String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <span className="runctl" title={msg}>
      {alive ? (
        <button className="btn stop" disabled={busy} onClick={() => go("stop")}>■ Stop</button>
      ) : (
        <button className="btn start" disabled={busy || alive === null} onClick={() => go("start")}>▶ Start run</button>
      )}
    </span>
  );
}

// ---------- NOW WRITING: one row per harness worker, streamed from `inflight` ----------
const PHASE_LABEL: Record<string, string> = { thinking: "thinking", drafting: "drafting", tool: "tool", qa: "QA gate", idle: "idle" };
function NowWriting({ rows, now }: { rows: Doc[]; now: number }) {
  // rows from a stopped process age out after 2 min; idle rows stay (faded) so the strip does not jump
  const live = rows.filter((r) => now - t(r.updated_at) < 120_000);
  if (!live.length) return null;
  return (
    <section className="nowwriting">
      <div className="nwhead"><b>Now writing</b><span>model output streamed token by token · one row per worker</span></div>
      {live.map((r) => {
        const idle = r.phase === "idle";
        const secs = r.started_at ? Math.max(0, Math.round(((idle ? t(r.updated_at) : now) - t(r.started_at)) / 1000)) : null;
        return (
          <div key={r._id} className={`nwrow ph-${r.phase ?? "idle"}`}>
            <div className="nwmeta">
              <span className="nwworker">{r.worker}</span>
              <span className="nwacct">{r.account ?? "—"}</span>
              <span className={`nwphase ph-${r.phase ?? "idle"}`}>{PHASE_LABEL[r.phase] ?? r.phase}{r.tool && !idle ? ` · ${r.tool}` : ""}</span>
              <span className="nwnums">{r.tokens ?? 0} tok{secs != null ? ` · ${secs}s` : ""}{r.settings_version != null ? ` · v${r.settings_version}` : ""}</span>
            </div>
            {r.reasoning && !idle ? <div className="nwreason">{String(r.reasoning).slice(-220)}</div> : null}
            <div className="nwtext"><div>{idle ? <span className="nwidle">{r.text ? String(r.text).slice(-160) : "waiting for the next account"}</span> : <>{String(r.text ?? "").replace(/\n{2,}/g, "\n")}<i className="caret" /></>}</div></div>
          </div>
        );
      })}
    </section>
  );
}

// ---------- trace waterfall ----------
const QA_ORDER: [string, string][] = [
  ["missing-subject", "subject"],
  ["missing-personalization", "personalization"],
  ["invented-fact", "invented-fact"],
  ["forbidden-promise", "forbidden-promise"],
  ["placeholder-left", "placeholder"],
  ["too-long", "length"],
  ["missing-cta", "CTA"],
];
// the rising bar (mirror of src/outreach/qa.ts LEVEL_NEW_CHECKS): levels are cumulative, level 1 = the original 7
export const LEVEL_NEW: Record<number, [string, string][]> = {
  1: QA_ORDER,
  2: [["generic-opener", "opener"], ["subject-not-personal", "personal subject"]],
  3: [["no-sector-fit", "sector-fit"]],
  4: [["no-specific-number", "specific number"], ["weak-cta", "strong CTA"]],
};
const lvl = (x: unknown) => Math.min(4, Math.max(1, Math.floor(Number(x)) || 1));
export const checksAt = (level: unknown): [string, string][] =>
  Object.entries(LEVEL_NEW).filter(([k]) => Number(k) <= lvl(level)).flatMap(([, v]) => v).map(([c, l]) => [c, c === "too-long" && lvl(level) >= 3 ? "length ≤90w" : l]);
const CHECK_LABEL: Record<string, string> = Object.fromEntries(Object.values(LEVEL_NEW).flat());
const checkLabel = (c: string, level?: unknown) => (c === "too-long" && lvl(level) >= 3 ? "90 words" : c === "no-sector-fit" ? "sector-fit" : CHECK_LABEL[c] ?? c);
/** The bar a view works under: newest active bar doc, else the objective's own level/target, else level 1 · 80%. */
function barNow(s: LiveState): { version: number | null; level: number; target: number; checks: string[]; fresh: string[]; earned: Doc | null; doc: Doc | null } {
  const o = s.objective;
  const doc = (typeof o?.bar_version === "number" ? s.bars.find((b) => b.version === o.bar_version) : null) ?? [...(s.bars ?? [])].reverse().find((b) => b.status === "active") ?? null;
  const level = lvl(doc?.level ?? o?.level ?? 1);
  const target = typeof doc?.target_pct === "number" ? doc.target_pct : typeof o?.target === "number" ? o.target : typeof o?.end_state?.target === "number" ? o.end_state.target : 80;
  const checks = arr(doc?.checks).length ? arr(doc?.checks) : checksAt(level).map(([c]) => c);
  return { version: doc?.version ?? o?.bar_version ?? null, level, target, checks, fresh: arr(doc?.new_checks), earned: doc?.earned_by ?? null, doc };
}
const secs = (ms: number) => (ms < 0 ? "" : ms < 100_000 ? `${Math.round(ms / 1000)}s` : `${Math.round(ms / 60000)}m`);
const short = (id: unknown) => `…${String(id ?? "").slice(-6)}`;
const money = (m: unknown) => (typeof m === "number" ? `$${m >= 1000 ? `${(m / 1000).toFixed(1)}B` : `${Math.round(m)}M`}` : "?");
const band = (n: unknown) => (typeof n !== "number" ? "?" : n < 1000 ? "small" : n < 5000 ? "mid-size" : "large");

function contextText(sources: string[], a: Doc | undefined): { full: boolean; text: string } {
  const parts: string[] = [];
  const full = sources.includes("account_record_full");
  if (full && a)
    parts.push(
      `FULL RECORD: ${[a.sector, a.year_established, money(a.revenue_musd), typeof a.employees === "number" ? `${a.employees.toLocaleString("en-US")} staff` : null, a.office_location, a.subsidiary_of ? `sub. of ${a.subsidiary_of}` : null]
        .filter(Boolean)
        .join(", ")}`,
    );
  else if (sources.includes("account_summary") && a) parts.push(`summary: ${a.sector}, ${band(a.employees)}`);
  else if (sources.includes("account_name")) parts.push("name only");
  if (sources.includes("product_catalog")) parts.push("product catalog");
  return { full, text: parts.join(" + ") || "(nothing)" };
}

type Item =
  | { kind: "draft"; at: number; d: Doc }
  | { kind: "change"; at: number; c: Doc }
  | { kind: "verdict"; at: number; c: Doc }
  | { kind: "resume"; at: number; r: Doc }
  | { kind: "batch"; at: number; ob: Doc; prev: Doc | null }
  | { kind: "bar"; at: number; e: Doc };

function Json({ doc, title, onOpen }: { doc: Doc | undefined | null; title: string; onOpen: (t: string, d: Doc) => void }) {
  if (!doc) return null;
  return (
    <button className="jbtn" title="open the raw Atlas document" onClick={(e) => { e.stopPropagation(); onOpen(title, doc); }}>
      {"{ }"}
    </button>
  );
}

function Step({ label, off, total, children, raw, rawTitle, onOpen, cls = "" }: { label: string; off: number; total: number; children: React.ReactNode; raw?: Doc | null; rawTitle?: string; onOpen: (t: string, d: Doc) => void; cls?: string }) {
  const w = total > 0 ? Math.max(1.5, Math.min(100, (off / total) * 100)) : 100;
  return (
    <div className={`step ${cls}`}>
      <div className="slabel">{label}</div>
      <div className="sbar"><i style={{ width: `${w}%` }} /></div>
      <div className="sbody">{children}</div>
      <div className="sright">
        <span className="soff">{off > 0 ? `+${secs(off)}` : ""}</span>
        <Json doc={raw} title={rawTitle ?? label} onOpen={onOpen} />
      </div>
    </div>
  );
}

function DraftRow({ d, s, prevAt, open, toggle, onOpen }: { d: Doc; s: LiveState; prevAt: number | null; open: boolean; toggle: () => void; onOpen: (t: string, d: Doc) => void }) {
  const at = t(d.created_at);
  const acct = s.accounts.find((a) => a.account === d.account);
  const cfg = s.harness_config.find((c) => c.version === d.settings_version);
  const fails: Doc[] = d.qa?.failures ?? [];
  const dur = prevAt != null && at - prevAt < 600_000 ? at - prevAt : 0;
  const start = at - dur;
  const re = new RegExp(`on ${d.account?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(attempt ${d.attempt ?? 1}\\)`);
  const logged = s.failures.filter((f) => t(f.created_at) >= at - 2000 && t(f.created_at) - at < 120_000 && re.test(String(f.failure ?? "")));
  const taps = s.taps.filter((x) => logged.some((f) => f._id === x.trigger?.id));
  const tap = taps.find((x) => x.decision?.tap) ?? taps[0];
  const last = Math.max(at, ...logged.map((f) => t(f.created_at)), ...(tap ? [t(tap.created_at)] : []));
  const total = last - start;
  const ctx = contextText(arr(cfg?.settings?.context_sources), acct);
  const pass = !!d.qa?.pass;
  const worker = d.worker ?? (d.agent && d.agent !== "waypoints-harness" ? d.agent : null);
  const body = String(d.body ?? "");
  return (
    <div className={`trow ${pass ? "tpass" : "tfail"} ${open ? "open" : ""}`}>
      <div className="thead" onClick={toggle}>
        <span className="tcaret">{open ? "▾" : "▸"}</span>
        <span className="ticon">✉</span>
        <span className="tq">#{acct?.queue_index ?? "?"}</span>
        <span className="tacct">{d.account}</span>
        {(d.attempt ?? 1) > 1 && <span className="tretry">retry</span>}
        {worker && <span className="worker">{String(worker)}</span>}
        <span className="vpill">playbook v{d.settings_version ?? "?"}</span>
        <span className={`tverdict ${pass ? "good" : "bad"}`}>{pass ? "✔ passed QA" : `✘ ${fails.length} failed check${fails.length === 1 ? "" : "s"}`}</span>
        {!open && !pass && <span className="tclasses">{fails.map((f) => f.class).join(" · ")}</span>}
        <span className="tdur">{dur ? secs(dur) : ""}</span>
        <span className="ttime">{hhmmss(at)}</span>
      </div>
      {open && (
        <div className="steps">
          <Step label="context" off={0} total={total} raw={acct} rawTitle={`accounts · ${d.account}`} onOpen={onOpen} cls={ctx.full ? "ctxfull" : ""}>
            <span className={ctx.full ? "ctxfull" : "ctxlean"}>{ctx.text}</span>
          </Step>
          <Step label="draft" off={at - start} total={total} raw={d} rawTitle={`drafts · ${short(d._id)}`} onOpen={onOpen}>
            <div className="dsub">“{one(d.subject) || "(no subject)"}”</div>
            <div className="dprev">{body.replace(/\n\s*\n+/g, "\n")}</div>
          </Step>
          <Step label="QA gate" off={at - start} total={total} raw={d} rawTitle={`drafts · ${short(d._id)} · qa`} onOpen={onOpen}>
            <div className="qchips">
              {d.qa_level != null && <span className="qc qlvl">L{lvl(d.qa_level)}</span>}
              {checksAt(d.qa_level).map(([cls, lbl]) => {
                const bad = fails.some((f) => f.class === cls);
                return <span key={cls} className={`qc ${bad ? "x" : "ok"}`}>{bad ? "✘" : "✔"} {lbl}</span>;
              })}
            </div>
            {fails.map((f, i) => (
              <div key={i} className="qdetail"><b>{f.class}</b> {one(f.detail)}</div>
            ))}
          </Step>
          {logged.length > 0 && (
            <Step label="logged" off={Math.max(...logged.map((f) => t(f.created_at))) - start} total={total} raw={logged[0]} rawTitle={`failures · ${short(logged[0]._id)}`} onOpen={onOpen}>
              <span className="logged">
                {logged.map((f) => (
                  <span key={f._id} className="lg" onClick={() => onOpen(`failures · ${short(f._id)}`, f)}>
                    {f.class} → failures <code>{short(f._id)}</code>
                  </span>
                ))}
              </span>
            </Step>
          )}
          {tap && (
            <Step label="sentinel" off={t(tap.created_at) - start} total={total} raw={tap} rawTitle={`taps · ${short(tap._id)}`} onOpen={onOpen}>
              <span className="tapline">
                risk <b>{Number(tap.risk ?? 0).toFixed(2)}</b> = sim {Number(tap.components?.similarity ?? 0).toFixed(2)} · recur {Number(tap.components?.recurrence ?? 0).toFixed(2)} · trend {Number(tap.components?.trend ?? 0).toFixed(1)}
                {tap.decision?.tap ? (
                  <b className="alert"> → ALERT → {tap.axis ? `${String(tap.axis)}${tap.settings_version_after ? ` (v${tap.settings_version_after})` : " (queued)"}` : String(tap.decision?.action ?? "")}</b>
                ) : (
                  <span className="dimtxt"> → below threshold</span>
                )}
              </span>
            </Step>
          )}
        </div>
      )}
    </div>
  );
}

function ChangeDivider({ c, s, onOpen }: { c: Doc; s: LiveState; onOpen: (t: string, d: Doc) => void }) {
  const d = diffOf(c, s);
  const restore = !c.probation && c.created_by !== "seed";
  return (
    <div className={`divider change ${restore ? "restore" : ""}`}>
      <span className="dvl" />
      <span className="dvt">
        <b>{restore ? "HARNESS RESTORED" : "HARNESS REBUILT"}</b> {d.from != null ? `v${d.from} → ` : ""}v{d.to} · <b className="dvaxis">{d.axis.toUpperCase()}</b>
        {d.plus.length > 0 && <> · <span className="plus">{d.plus.map((x) => `+ ${x}`).join("  ")}</span></>}
        {d.minus.length > 0 && <> · <span className="minus">{d.minus.map((x) => `− ${x}`).join("  ")}</span></>}
        {!restore && d.because && d.because !== "seed" && <> · because {d.because}</>}
        {c.probation && !c.outcome && <> · <span className="mid">{d.trial}</span></>}
      </span>
      <Json doc={c} title={`harness_config · v${c.version}`} onOpen={onOpen} />
      <span className="dvl" />
    </div>
  );
}

function VerdictDivider({ c, onOpen }: { c: Doc; onOpen: (t: string, d: Doc) => void }) {
  const kept = c.outcome?.verdict === "kept";
  return (
    <div className={`divider ${kept ? "kept" : "undone"}`}>
      <span className="dvl" />
      <span className="dvt">
        <b>{kept ? "TRIAL PASSED" : "UNDONE"}</b> · v{c.version} {kept ? "kept" : "rolled back"} · {one(c.outcome?.why).replace(/\s*(Kept|Rolled back|Undone)\.?\s*$/i, "")}
      </span>
      <Json doc={c} title={`harness_config · v${c.version}`} onOpen={onOpen} />
      <span className="dvl" />
    </div>
  );
}

function BarDivider({ e, s, onOpen }: { e: Doc; s: LiveState; onOpen: (t: string, d: Doc) => void }) {
  const raised = e.kind === "bar_raised";
  const dt: Doc = e.detail ?? {};
  const to: Doc = dt.to ?? dt.bar ?? {};
  const fresh = arr(dt.new_checks);
  const words = fresh.map((c) => checkLabel(c, to.level));
  if (raised && lvl(to.level) >= 3 && lvl(dt.from?.level) < 3 && !words.includes("90 words")) words.push("90 words");
  const ob = s.objectives.find((x) => x._id === e.objective_id);
  const href = ob ? `/runs/${ob._id}${dbQ() ? `?${dbQ().slice(0, -1)}` : ""}` : null;
  return (
    <div className={`divider bar ${raised ? "raised" : "held"}`}>
      <span className="dvl" />
      <span className="dvt">
        {raised ? (
          <>
            <b>▲ BAR RAISED</b> → level {to.level ?? "?"} · {to.target_pct ?? "?"}% · new checks: {words.length ? words.join(", ") : "none (target only)"} · earned by{" "}
            {href ? <a href={href}>batch {dt.batch ?? "?"}</a> : `batch ${dt.batch ?? "?"}`} ({dt.first_try_pct ?? "?"}%)
          </>
        ) : (
          <>
            <b>BAR HELD</b> at level {to.level ?? "?"} · {to.target_pct ?? "?"}% · batch {dt.batch ?? "?"} reached {dt.first_try_pct ?? "?"}%{dt.reached === false ? " (not earned)" : ""}
          </>
        )}
      </span>
      <Json doc={e} title={`events · ${e.kind}`} onOpen={onOpen} />
      <span className="dvl" />
    </div>
  );
}

function BarPanel({ s }: { s: LiveState }) {
  const b = barNow(s);
  const earnedOb = b.earned ? s.objectives.find((x) => x._id === b.earned!.objective_id) : null;
  return (
    <section className="panel barpanel">
      <div className="phead">
        <h3>The bar</h3>
        <span className="vtag">{b.version != null ? `bar v${b.version} · ` : ""}rises only when earned</span>
      </div>
      <div className="barnums">
        <div><div className="mk">Level</div><div className="bnv">{b.level}<span className="of">/4</span></div></div>
        <div><div className="mk">Target</div><div className="bnv">{b.target}%</div></div>
        <div className="barearn">
          <div className="mk">Earned by</div>
          <div>{b.earned ? <>{earnedOb ? <a href={`/runs/${earnedOb._id}${dbQ() ? `?${dbQ().slice(0, -1)}` : ""}`}>batch {b.earned.batch}</a> : `batch ${b.earned.batch}`} · {b.earned.first_try_pct}% first-try</> : <span className="dimtxt">seed bar</span>}</div>
        </div>
      </div>
      <div className="shk">Active checks ({b.checks.length})</div>
      <div className="chips">
        {b.checks.map((c) => (
          <span key={c} className={`chip barchk ${b.fresh.includes(c) || (c === "too-long" && b.fresh.includes("no-sector-fit")) ? "new" : ""}`}>{checkLabel(c, b.level)}</span>
        ))}
      </div>
    </section>
  );
}

function Drawer({ open, onClose }: { open: { title: string; doc: Doc } | null; onClose: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  if (!open) return null;
  const pretty = JSON.stringify(
    open.doc,
    (k, v) => (Array.isArray(v) && ((v.length > 16 && v.every((x) => typeof x === "number")) || /embedding|vector/i.test(k)) ? `[${v.length} floats]` : v),
    2,
  );
  return (
    <div className="drawerwrap" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drhead">
          <span>
            <b>{open.title}</b> <span className="dimtxt">· raw Atlas document</span>
          </span>
          <button className="jbtn" onClick={onClose}>esc ✕</button>
        </div>
        <pre>{pretty}</pre>
      </aside>
    </div>
  );
}

// ---------- batches (--continuous: one objective per batch, one global playbook) ----------
const versionAt = (cfgs: Doc[], at: number) => [...cfgs].filter((c) => t(c.created_at) <= at + 1000).sort((a, b) => b.version - a.version)[0]?.version ?? null;
function batchStats(s: LiveState, ob: Doc) {
  const mine = s.drafts.filter((d) => d.objective_id === ob._id);
  const ft = mine.filter((d) => (d.attempt ?? 1) <= 1);
  const pass = ft.filter((d) => d.qa?.pass).length;
  const accounts = new Set(mine.filter((d) => d.qa?.pass || (d.attempt ?? 1) >= 2).map((d) => d.account)).size;
  const target = ((ob.bearings ?? []) as Doc[]).find((b) => b.name === "accounts_done")?.target ?? null;
  return { n: ft.length, pass, rate: ft.length ? pass / ft.length : null, accounts, target, written: mine.length };
}
const batchLabel = (ob: Doc, i?: number) => (ob.batch != null ? `Batch ${ob.batch}` : `Run ${i != null ? i + 1 : ""}`.trim());

function BatchDivider({ ob, prev, s, onOpen }: { ob: Doc; prev: Doc | null; s: LiveState; onOpen: (t: string, d: Doc) => void }) {
  const v = versionAt(s.harness_config, t(ob.created_at));
  const ps = prev ? batchStats(s, prev) : null;
  return (
    <div className="divider batch">
      <span className="dvl" />
      <span className="dvt">
        <b>{batchLabel(ob, s.objectives.indexOf(ob)).toUpperCase()}</b>
        {ob.campaign ? ` · ${String(ob.campaign)}` : ""} · started on playbook v{v ?? "?"}{prev ? " (learned)" : ""}
        {prev && ps && (
          <>
            {" "}· {batchLabel(prev).toLowerCase()} finished: {ps.accounts}{ps.target ? `/${ps.target}` : ""} · first-try <b className={rateCls(ps.rate)}>{pct(ps.rate)}</b>
          </>
        )}
      </span>
      <a className="jbtn" href={`/runs/${ob._id}${dbQ() ? `?${dbQ().slice(0, -1)}` : ""}`}>open batch →</a>
      <Json doc={ob} title={`objectives · ${batchLabel(ob)}`} onOpen={onOpen} />
      <span className="dvl" />
    </div>
  );
}

function BatchRates({ s, target, written }: { s: LiveState; target: number; written: number }) {
  const rows = s.objectives.map((ob, i) => ({ ob, i, st: batchStats(s, ob) })).filter((r) => r.st.n > 0 || r.ob._id === s.objective?._id);
  if (!rows.length) return null;
  return (
    <div className="batchrates">
      <div className="mk">First-try pass by batch <span className="dimtxt">· {written} emails written</span></div>
      {rows.map(({ ob, i, st }) => (
        <div key={ob._id} className={`brow ${ob._id === s.objective?._id ? "cur" : ""}`}>
          <span className="bl">{batchLabel(ob, i)}</span>
          <span className="bt"><i className={rateCls(st.rate)} style={{ width: `${Math.round((st.rate ?? 0) * 100)}%` }} /><b style={{ left: `${target}%` }} /></span>
          <span className={`bv ${rateCls(st.rate)}`}>{pct(st.rate)}</span>
          <span className="bn">{st.pass}/{st.n}</span>
        </div>
      ))}
    </div>
  );
}

function RunHeader({ s, o, cls }: { s: LiveState; o: Doc; cls: string | null }) {
  const st = batchStats(s, o);
  const start = t(o.created_at);
  const end = s.drafts.length ? t(s.drafts[s.drafts.length - 1].created_at) : start;
  const v0 = versionAt(s.harness_config, start);
  const v1 = versionAt(s.harness_config, end);
  const hm = (x: number) => new Date(x).toTimeString().slice(0, 5);
  return (
    <span className="psub runhdr">
      {o.campaign ? `${String(o.campaign)} · ` : ""}
      {hm(start)}–{o.status === "completed" ? hm(end) : "now"} · first-try <b>{st.pass}/{st.n}</b> ({pct(st.rate)}) · {st.written} emails · playbook v{v0 ?? "?"} → v{v1 ?? "?"}
      {cls && (
        <>
          {" "}· showing only <b className="bad">{cls}</b> <a href={location.pathname + (dbQ() ? `?${dbQ().slice(0, -1)}` : "")}>show all</a>
        </>
      )}
    </span>
  );
}

export default function Live({ objectiveId }: { objectiveId?: string } = {}) {
  const detail = !!objectiveId;
  const [ready, setReady] = useState(false);
  const [pin, setPin] = useState<string | null>(objectiveId ?? null);
  const [cls, setCls] = useState<string | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (!objectiveId) setPin(q.get("objective"));
    setCls(q.get("class"));
    setReady(true);
  }, [objectiveId]);
  const { s, status, loaded } = useLive(pin, ready, !detail);
  const alive = useAlive(ready);
  const now = useNow(1000);
  const o = s.objective;
  const end = o?.end_state as Doc | undefined;
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const [drawer, setDrawer] = useState<{ title: string; doc: Doc } | null>(null);
  const onOpen = (title: string, doc: Doc) => setDrawer({ title, doc });

  const m = useMemo(() => {
    const ft = s.drafts.filter((d) => (d.attempt ?? 1) <= 1);
    const ftPass = ft.filter((d) => d.qa?.pass).length;
    const l10 = s.drafts.slice(-10);
    const done = s.accounts.filter((a) => a.status === "done" || a.status === "failed").length;
    const workers = new Set(s.accounts.filter((a) => a.status === "in_progress" && a.claimed_by).map((a) => a.claimed_by)).size;
    return {
      first: ft.length ? ftPass / ft.length : null, ftPass, ftN: ft.length,
      roll: l10.length ? l10.filter((d) => d.qa?.pass).length / l10.length : null, rPass: l10.filter((d) => d.qa?.pass).length, rN: l10.length,
      done, total: s.accounts.length, workers,
    };
  }, [s.drafts, s.accounts]);
  const bar = barNow(s);
  const target = bar.target ?? (typeof end?.target === "number" ? end.target : 80);

  const items = useMemo(() => {
    const drafts = cls ? s.drafts.filter((d) => (d.qa?.failures ?? []).some((f: Doc) => f.class === cls)) : s.drafts;
    const out: Item[] = drafts.map((d) => ({ kind: "draft" as const, at: t(d.created_at), d }));
    const since = t(s.objectives[0]?.created_at ?? o?.created_at);
    const until = detail && o?.status === "completed" ? Math.max(t(o.updated_at), ...s.drafts.map((d) => t(d.created_at))) + 30_000 : Infinity;
    s.objectives.forEach((ob, i) => out.push({ kind: "batch", at: t(ob.created_at), ob, prev: s.objectives[i - 1] ?? null }));
    for (const c of s.harness_config) {
      if (c.change && t(c.created_at) >= since && t(c.created_at) <= until) out.push({ kind: "change", at: t(c.created_at), c });
      if (c.outcome?.decided_at && t(c.outcome.decided_at) >= since && t(c.outcome.decided_at) <= until) out.push({ kind: "verdict", at: t(c.outcome.decided_at), c });
    }
    for (const e of s.events) if ((e.kind === "bar_raised" || e.kind === "bar_held") && t(e.created_at) >= since) out.push({ kind: "bar", at: t(e.created_at), e });
    for (const r of s.resumes) {
      const ob = s.objectives.find((x) => x._id === r.objective_id);
      if (ob && Math.abs(t(r.created_at) - t(ob.created_at)) < 60_000) continue; // the batch divider already marks the start
      out.push({ kind: "resume", at: t(r.created_at), r });
    }
    return out.sort((a, b) => b.at - a.at);
  }, [s.drafts, s.harness_config, s.resumes, s.objectives, s.events, o?.created_at]);
  const [limit, setLimit] = useState(60);
  const shown = useMemo(() => {
    let n = 0;
    const out: Item[] = [];
    for (const it of items) {
      if (it.kind === "draft" && ++n > (detail ? 100000 : limit)) break;
      out.push(it);
    }
    return { list: out, more: n > limit };
  }, [items, limit]);

  // previous submit by the same worker → per-draft duration
  const prevAt = useMemo(() => {
    const map = new Map<string, number | null>();
    const lastBy = new Map<string, number>();
    for (const d of s.drafts) {
      const w = String(d.worker ?? d.agent ?? "");
      const ob = s.objectives.find((x) => x._id === d.objective_id);
      const obAt = ob ? t(ob.created_at) : null;
      const last = lastBy.get(w);
      map.set(d._id, last != null && (obAt == null || last >= obAt) ? last : obAt);
      lastBy.set(w, t(d.created_at));
    }
    return map;
  }, [s.drafts, o]);
  const latestIds = s.drafts.slice(-3).map((d) => d._id);
  const crashed = alive === false && o && o.status !== "completed" && s.drafts.length > 0 && now - t(s.drafts[s.drafts.length - 1]?.created_at) < 600_000;

  return (
    <main className="console trace">
      <section className="waterfall">
        <div className="wfhead">
          <h3>{detail && o ? `${batchLabel(o)} trace` : "Trace"}</h3>
          {detail && o ? <RunHeader s={s} o={o} cls={cls} /> : <span className="psub">one row per email · real steps from Atlas · newest first · click a row to expand, {"{ }"} for the raw document</span>}
          <span className={`pill ${status === "live" ? "live" : "off"}`}>{status === "live" ? "● Atlas live" : status === "connecting" ? "○ connecting" : "○ reconnecting"}</span>
        </div>
        {!detail && <NowWriting rows={s.inflight ?? []} now={now} />}
        <div className="wflist">
          {!loaded && <div className="empty">connecting to Atlas…</div>}
          {loaded && !o && <div className="empty">no objective yet — waiting for the harness to start…</div>}
          {crashed && (
            <div className="divider crash"><span className="dvl" /><span className="dvt"><b>HARNESS PROCESS DOWN</b> · last write {secs(now - t(s.drafts[s.drafts.length - 1]?.created_at))} ago</span><span className="dvl" /></div>
          )}
          {loaded && o && items.length === 0 && <div className="empty">objective set — waiting for the first draft…</div>}
          {shown.list.map((it) =>
            it.kind === "batch" ? (
              <BatchDivider key={`b${it.ob._id}`} ob={it.ob} prev={it.prev} s={s} onOpen={onOpen} />
            ) :
            it.kind === "bar" ? (
              <BarDivider key={`e${it.e._id}`} e={it.e} s={s} onOpen={onOpen} />
            ) :
            it.kind === "draft" ? (
              <DraftRow
                key={it.d._id}
                d={it.d}
                s={s}
                prevAt={prevAt.get(it.d._id) ?? null}
                open={toggled[it.d._id] ?? latestIds.includes(it.d._id)}
                toggle={() => setToggled((x) => ({ ...x, [it.d._id]: !(x[it.d._id] ?? latestIds.includes(it.d._id)) }))}
                onOpen={onOpen}
              />
            ) : it.kind === "change" ? (
              <ChangeDivider key={`c${it.c._id}`} c={it.c} s={s} onOpen={onOpen} />
            ) : it.kind === "verdict" ? (
              <VerdictDivider key={`v${it.c._id}`} c={it.c} onOpen={onOpen} />
            ) : (
              <div key={`r${it.r._id}`} className="divider resume">
                <span className="dvl" />
                <span className="dvt">{Math.abs(it.at - t(s.objectives.find((x) => x._id === it.r.objective_id)?.created_at)) < 60_000 ? <><b>RUN STARTED</b> · objective set in Atlas · harness v{currentConfig(s.harness_config.filter((c) => t(c.created_at) <= it.at))?.version ?? "?"}</> : <><b>RESUMED</b> · picked up from Atlas{it.r.from_seq != null ? ` at save point #${it.r.from_seq}` : ""}</>}</span>
                <Json doc={it.r} title="resumes" onOpen={onOpen} />
                <span className="dvl" />
              </div>
            ),
          )}
          {shown.more && (
            <button className="older" onClick={() => setLimit((n) => n + 60)}>
              load older drafts ({items.filter((x) => x.kind === "draft").length - limit} more)
            </button>
          )}
        </div>
      </section>
      <aside className="side">
        <div className="goalcard">
          <div className="gk">🔒 Locked goal · the destination</div>
          <div className="gv">every account done · first-try QA pass ≥ <b>{target}%</b> · at bar level <b>{bar.level}</b></div>
        </div>
        <div className="bignums">
          <div className="meter">
            <div className="mk">Pass rate · last 10</div>
            <div className={`mv ${rateCls(m.roll)}`}>{pct(m.roll)}</div>
            <div className="mbar"><i style={{ width: `${Math.round((m.roll ?? 0) * 100)}%` }} /><b style={{ left: `${target}%` }} /></div>
            <div className="msub">first-try {pct(m.first)} ({m.ftPass}/{m.ftN})</div>
          </div>
          <div className="meter">
            <div className="mk">{o?.batch != null ? `Batch ${o.batch} · accounts` : "Accounts done"}</div>
            <div className="mv">{m.done}<span className="of">/{m.total || "?"}</span></div>
            <div className="mbar"><i className="acc" style={{ width: `${m.total ? Math.round((m.done / m.total) * 100) : 0}%` }} /></div>
            <div className="msub">
              {alive ? "harness running" : alive === false ? "harness idle" : ""}
              {m.workers ? ` · ${m.workers} workers` : ""}
            </div>
          </div>
        </div>
        <BarPanel s={s} />
        <BatchRates s={s} target={target} written={s.drafts.length} />
        {!detail && <RunControl alive={alive} />}
        <ShapePanel s={s} now={now} />
      </aside>
      <Drawer open={drawer} onClose={() => setDrawer(null)} />
    </main>
  );
}
