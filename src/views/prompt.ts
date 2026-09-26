// view:prompt — the exact system prompt the harness is running right now:
// the sales pack's base prompt + the enabled fragment texts of the current harness_config version,
// assembled the same way demo/harness.ts does. Redraws on every harness_config change.
//   bun run view:prompt [--db waypoints_smoke]
import type { Document } from "mongodb";
import { getFragments, type Fragment } from "../fragments";
import {
  DB_NAME, bcyan, bgreen, bmagenta, bold, bred, byellow, cols, db, dim, f2, follow, green, hhmmss, oneLine, paint, red, rows, wrap, yellow,
onResize, } from "./common";

const CURRENT = ["active", "probation", "kept"];
const AGENT = "waypoints-harness"; // demo/harness.ts AGENT

// Base prompt: built inside the task pack (demo/packs/outreach.ts, else sales.ts) with a stub ctx (no I/O at construction).
let BASE: string | null = null;
let baseNote = "";
let baseFile = "";
const STUB = {
  agent: AGENT, objectiveId: () => null, settingsVersion: () => undefined, settings: () => undefined, call: async () => ({}), stat: () => ({}), fresh: false, maxSteps: 15,
};
for (const name of ["outreach", "sales"]) {
  try {
    const mod: any = await import(`../../demo/packs/${name}`);
    for (const [k, fn] of Object.entries(mod)) {
      if (typeof fn !== "function" || !/Pack$/.test(k)) continue; // only pack factories: never call helpers that might do I/O
      try {
        const pack: any = await (fn as any)(STUB);
        if (typeof pack?.basePrompt === "string") { BASE = pack.basePrompt; baseFile = `demo/packs/${name}.ts`; break; }
      } catch {}
    }
    if (BASE) break;
  } catch (e: any) {
    baseNote = oneLine(e?.message ?? e).slice(0, 60);
  }
}

// ---- harness SHAPE (outreach settings: context_sources / granted_tools / reasoning) ----
const BASE_TOOLS = ["next_account", "submit_email", "checkpoint", "recall"];
const isOutreach = (st: Document) => Array.isArray(st?.context_sources) || Array.isArray(st?.granted_tools) || st?.reasoning != null;
/** The axis a settings change moves (docs/OUTREACH-PACK.md sentinel table). */
function axisOf(field: string, s0: Document, s1: Document): string {
  if (field === "prompt_fragments") return "rules";
  if (field === "context_sources") return "context policy";
  if (field === "reasoning") return "reasoning mode";
  if (field === "required_tools") return "guardrail";
  if (field === "granted_tools") {
    const req = (s1.required_tools ?? []) as string[];
    const added = ((s1.granted_tools ?? []) as string[]).filter((t) => !((s0.granted_tools ?? []) as string[]).includes(t));
    return added.some((t) => t === "precheck_email" || req.includes(t)) ? "guardrail" : "tool access";
  }
  if (field === "model") return "model";
  if (field === "sentinel_threshold") return "sentinel";
  return field;
}
const SHORT: Record<string, string> = { prompt_fragments: "rules", context_sources: "context", granted_tools: "tools", required_tools: "required", reasoning: "reasoning", model: "model", sentinel_threshold: "threshold" };
function setDelta(field: string, a: unknown, b: unknown): string {
  const k = SHORT[field] ?? field;
  if (Array.isArray(a) || Array.isArray(b)) {
    const A = (a ?? []) as string[];
    const B = (b ?? []) as string[];
    const parts = [...B.filter((x) => !A.includes(x)).map((x) => `${k} += ${x}`), ...A.filter((x) => !B.includes(x)).map((x) => `${k} -= ${x}`)];
    return parts.join(" · ") || `${k} reordered`;
  }
  return `${k}: ${JSON.stringify(a)} → ${JSON.stringify(b)}`;
}

interface Cfg { version: number; status: string; ids: string[]; doc: Document }
let current: Cfg | null = null;
let added = new Set<string>();
const history: string[][] = []; // diff blocks, newest last
let status = "connecting";

const toCfg = (d: Document): Cfg & { parent_version?: number } => ({ parent_version: d.parent_version, version: d.version, status: d.status, ids: (d.settings?.prompt_fragments ?? []) as string[], doc: d });

async function reasonLine(d: Document): Promise<string> {
  const r = d.reason ?? {};
  let s = `${r.kind ?? "?"}`;
  try {
    if (r.kind === "tap" && r.id) {
      const tap = await db.collection("taps").findOne({ _id: r.id });
      if (tap) {
        s = `tap ${f2(tap.risk)}`;
        if (tap.trigger?.kind === "failure" && tap.trigger.id) {
          const f = await db.collection("failures").findOne({ _id: tap.trigger.id });
          if (f?.class) {
            const n = await db.collection("failures").countDocuments({ class: f.class, ...(f.objective_id ? { objective_id: f.objective_id } : {}) });
            s = `${f.class}${n > 1 ? ` ×${n}` : ""} (tap ${f2(tap.risk)})`;
          }
        } else if (tap.trigger?.kind) s += ` ← ${tap.trigger.kind}`;
      }
    } else if (r.kind === "failure" && r.id) {
      const f = await db.collection("failures").findOne({ _id: r.id });
      if (f?.class) {
        const n = await db.collection("failures").countDocuments({ class: f.class, ...(f.objective_id ? { objective_id: f.objective_id } : {}) });
        s = `${f.class}${n > 1 ? ` ×${n}` : ""}`;
      }
    }
  } catch {}
  if (r.summary && !s.includes("←") && !s.includes("×") && !s.includes("(tap")) s += ` · ${oneLine(r.summary)}`;
  return s;
}

/** Wrap plain text, then color each physical line (paint() resets color per line). */
const wrapC = (text: string, color: (s: string) => string, indent = "  ") => wrap(text, Math.min(cols(), 120), indent).map(color);

const statusColor = (st: string) => (st === "probation" ? byellow : st === "kept" ? bgreen : st === "rolled_back" ? bred : st === "active" ? green : dim);

async function onNewVersion(next: Cfg, prev: Cfg | null) {
  const block: string[] = [];
  const t = dim(hhmmss());
  const from = prev ? `v${prev.version}` : "∅";
  const s0: Document = prev?.doc.settings ?? {};
  const s1: Document = next.doc.settings ?? {};
  const fields = [...new Set([...Object.keys(s0), ...Object.keys(s1)])].filter((k) => prev && JSON.stringify(s0[k]) !== JSON.stringify(s1[k]));
  const deltas = fields.map((k) => setDelta(k, s0[k], s1[k]));
  const axes = [...new Set(fields.map((k) => axisOf(k, s0, s1)))];
  const stLabel = next.status === "probation" ? "trial" : next.status;
  block.push(
    `${t} ${bold(`${from} → v${next.version}`)} ${statusColor(next.status)(`(${stLabel})`)}${deltas.length ? ` · ${bcyan(deltas.join(" · "))}` : ""} · reason: ${await reasonLine(next.doc)}`,
  );
  if (axes.length) block.push(`   ${byellow(bold(`▲ ${axes.join(" + ").toUpperCase()}`))}${dim(" — the harness changed its own " + axes.join(" and "))}`);
  const before = new Set(prev?.ids ?? []);
  const after = new Set(next.ids);
  const plus = next.ids.filter((i) => !before.has(i));
  const minus = [...before].filter((i) => !after.has(i));
  for (const f of getFragments(plus)) block.push(...wrapC(`+ [${f.id}] ${f.text}`, bgreen));
  for (const f of getFragments(minus)) block.push(...wrapC(`- [${f.id}] ${f.text}`, bred));
  for (const k of ["model", "sentinel_threshold", "required_tools", "context_sources", "granted_tools", "reasoning"]) {
    if (prev && JSON.stringify(s0[k]) !== JSON.stringify(s1[k])) {
      block.push(bred(`- ${k}: ${JSON.stringify(s0[k])}`));
      block.push(bgreen(`+ ${k}: ${JSON.stringify(s1[k])}`));
    }
  }
  if (block.length === 1) block.push(dim("  (no change)"));
  history.push(block);
  added = new Set(plus);
  lastPrev = prev ? (prev.doc.settings ?? {}) : null;
}

async function refresh() {
  const d = await db.collection("harness_config").findOne({ status: { $in: CURRENT } }, { sort: { version: -1 } });
  if (!d) return;
  const next = toCfg(d);
  if (!current && next.parent_version != null) {
    // first paint: show how the running version differs from its parent
    const p = await db.collection("harness_config").findOne({ version: d.parent_version });
    if (p) current = toCfg(p);
  }
  if (!current || next.version !== current.version) await onNewVersion(next, current);
  current = next;
}

function promptText(c: Cfg): { base: string; rules: Fragment[] } {
  return { base: BASE ?? "[base prompt]", rules: getFragments(c.ids) };
}

function prevSettings(): Document {
  // the settings of the version before the current one (to highlight what just changed)
  return lastPrev ?? {};
}
let lastPrev: Document | null = null;

function shapeLines(c: Cfg, prev: Document): string[] {
  const st: Document = c.doc.settings ?? {};
  if (!isOutreach(st)) return [];
  const req = (st.required_tools ?? []) as string[];
  const granted = (st.granted_tools ?? []) as string[];
  const ctx = (st.context_sources ?? []) as string[];
  const pg = (prev.granted_tools ?? []) as string[];
  const pr = (prev.required_tools ?? []) as string[];
  const pc = (prev.context_sources ?? []) as string[];
  const fresh = (x: string, was: string[]) => lastPrev != null && !was.includes(x);
  const tool = (n: string) => {
    const lock = req.includes(n) ? "🔒" : "";
    const txt = `${n}${lock}`;
    return fresh(n, [...BASE_TOOLS, ...pg]) || (lock && !pr.includes(n)) ? bgreen(bold(`+${txt}`)) : txt;
  };
  const tools = [...BASE_TOOLS, ...granted.filter((g) => !BASE_TOOLS.includes(g))].map(tool);
  const ctxs = ctx.map((x) => (fresh(x, pc) ? bgreen(bold(`+${x}`)) : x));
  const reason = st.reasoning === "on" ? bgreen(bold("ON (thinking)")) : dim("off");
  const reasonShown = lastPrev && prev.reasoning !== st.reasoning && st.reasoning === "on" ? bgreen(bold("+ON (thinking)")) : reason;
  return [
    bold(`HARNESS SHAPE v${c.version}`) + dim(" — what the model can see and do"),
    `  ${bcyan("TOOLS    ")} ${tools.join("  ")}`,
    `  ${bcyan("CONTEXT  ")} ${ctxs.join("  ") || dim("(none)")}`,
    `  ${bcyan("REASONING")} ${reasonShown}   ${dim(`model ${st.model ?? "?"}`)}`,
    dim("─".repeat(Math.min(cols(), 120))),
  ];
}

function render() {
  const W = Math.min(cols(), 120);
  const H = rows();
  const L: string[] = [];
  const live = status === "live" ? green("●") : red("○");
  L.push(`${bold("SYSTEM PROMPT")} ${dim("the harness is running")} · db ${DB_NAME} ${live}`);
  if (!current) {
    L.push(dim("no harness_config yet — waiting for the seed version…"));
    return paint(L);
  }
  // Priority when the pane is short: standing rules > latest diff > base prompt.
  const { base, rules } = promptText(current);
  const head = `## RULES v${current.version} (${current.status === "probation" ? "trial" : current.status}): prompt fragments`;
  const ruleLines: string[] = [];
  ruleLines.push(...wrap(bold(head), W));
  if (!rules.length) ruleLines.push("- (none)");
  for (const f of rules) {
    const line = `- [${f.id}] ${f.title}: ${f.text}`;
    ruleLines.push(...wrapC(line, added.has(f.id) ? bgreen : (x) => x));
  }
  L.push(...shapeLines(current, prevSettings()));
  const diffLines: string[] = [];
  for (const b of history.slice(-2)) for (const l of b) diffLines.push(...wrap(l, W, "    "));
  const diffRoom = Math.max(3, H - L.length - ruleLines.length - 4);
  const shownDiff = diffLines.slice(-diffRoom);
  L.push(...shownDiff, dim("─".repeat(W)));

  const baseLines = wrap(base, W).map((l) => dim(l));
  if (!BASE) baseLines.push(yellow(`(base prompt not importable${baseNote ? `: ${baseNote}` : ""}; showing fragments only)`));
  const budget = H - L.length - ruleLines.length - 1;
  if (baseLines.length > budget) {
    const keep = Math.max(0, budget - 1);
    L.push(...baseLines.slice(0, keep), dim(`[… ${baseLines.length - keep} more lines of base prompt (${baseFile || "demo/packs"}) …]`));
  } else L.push(...baseLines);
  L.push(...ruleLines);
  paint(L);
}

let pending: Promise<void> = Promise.resolve();
const tick = () => {
  pending = pending.then(async () => {
    try {
      await refresh();
    } catch {}
    render();
  });
};

tick();
onResize(render);
await follow(
  [{ $match: { "ns.coll": "harness_config" } }],
  (c: any) => {
    // status transitions on the same version: one line (probation → kept / rolled back)
    if (c.operationType === "update" && c.updateDescription?.updatedFields?.status && c.fullDocument) {
      const d = c.fullDocument as Document;
      const st = c.updateDescription.updatedFields.status as string;
      if (st !== "superseded") {
        const why = d.outcome?.why ? ` · ${oneLine(d.outcome.why)}` : "";
        history.push([`${dim(hhmmss())} ${bmagenta(`v${d.version}`)} ${statusColor(st)(bold(`→ ${st}`))}${why}`]);
      }
    }
    tick();
  },
  (s) => {
    status = s;
    render();
  },
);
