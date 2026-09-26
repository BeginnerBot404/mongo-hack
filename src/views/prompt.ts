// view:prompt — the exact system prompt the harness is running right now:
// the sales pack's base prompt + the enabled fragment texts of the current harness_config version,
// assembled the same way demo/harness.ts does. Redraws on every harness_config change.
//   bun run view:prompt [--db waypoints_smoke]
import type { Document } from "mongodb";
import { getFragments, type Fragment } from "../fragments";
import {
  DB_NAME, bgreen, bmagenta, bold, bred, byellow, cols, db, dim, f2, follow, green, hhmmss, oneLine, paint, red, rows, wrap, yellow,
onResize, } from "./common";

const CURRENT = ["active", "probation", "kept"];
const AGENT = "waypoints-harness"; // demo/harness.ts AGENT

// Base prompt: built inside demo/packs/sales.ts salesPack(ctx); build it with a stub ctx (no I/O at construction).
let BASE: string | null = null;
let baseNote = "";
try {
  const mod: any = await import("../../demo/packs/sales");
  const pack = await mod.salesPack({
    agent: AGENT, objectiveId: () => null, settingsVersion: () => undefined, call: async () => ({}), stat: () => ({}), fresh: false, maxSteps: 15,
  });
  if (typeof pack?.basePrompt === "string") BASE = pack.basePrompt;
} catch (e: any) {
  baseNote = oneLine(e?.message ?? e).slice(0, 60);
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
          if (f?.class) s += ` ← ${f.class}`;
        } else if (tap.trigger?.kind) s += ` ← ${tap.trigger.kind}`;
      }
    } else if (r.kind === "failure" && r.id) {
      const f = await db.collection("failures").findOne({ _id: r.id });
      if (f?.class) s = `failure ← ${f.class}`;
    }
  } catch {}
  if (r.summary && !s.includes("←")) s += ` · ${oneLine(r.summary)}`;
  return s;
}

/** Wrap plain text, then color each physical line (paint() resets color per line). */
const wrapC = (text: string, color: (s: string) => string, indent = "  ") => wrap(text, Math.min(cols(), 120), indent).map(color);

const statusColor = (st: string) => (st === "probation" ? byellow : st === "kept" ? bgreen : st === "rolled_back" ? bred : st === "active" ? green : dim);

async function onNewVersion(next: Cfg, prev: Cfg | null) {
  const block: string[] = [];
  const t = dim(hhmmss());
  const from = prev ? `v${prev.version}` : "∅";
  block.push(`${t} ${bold(`settings ${from} → v${next.version}`)} ${statusColor(next.status)(`(${next.status})`)} · reason: ${await reasonLine(next.doc)}`);
  const before = new Set(prev?.ids ?? []);
  const after = new Set(next.ids);
  const plus = next.ids.filter((i) => !before.has(i));
  const minus = [...before].filter((i) => !after.has(i));
  for (const f of getFragments(plus)) block.push(...wrapC(`+ [${f.id}] ${f.text}`, bgreen));
  for (const f of getFragments(minus)) block.push(...wrapC(`- [${f.id}] ${f.text}`, bred));
  const s0 = prev?.doc.settings ?? {};
  const s1 = next.doc.settings ?? {};
  for (const k of ["model", "sentinel_threshold", "required_tools"]) {
    if (prev && JSON.stringify(s0[k]) !== JSON.stringify(s1[k])) {
      block.push(bred(`- ${k}: ${JSON.stringify(s0[k])}`));
      block.push(bgreen(`+ ${k}: ${JSON.stringify(s1[k])}`));
    }
  }
  if (block.length === 1) block.push(dim("  (no prompt change)"));
  history.push(block);
  added = new Set(plus);
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
  const head = `## Harness settings v${current.version} (${current.status}): standing rules`;
  const ruleLines: string[] = [];
  ruleLines.push(...wrap(bold(head), W));
  if (!rules.length) ruleLines.push("- (none)");
  for (const f of rules) {
    const line = `- [${f.id}] ${f.title}: ${f.text}`;
    ruleLines.push(...wrapC(line, added.has(f.id) ? bgreen : (x) => x));
  }
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
    L.push(...baseLines.slice(0, keep), dim(`[… ${baseLines.length - keep} more lines of base prompt (demo/packs/sales.ts) …]`));
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
