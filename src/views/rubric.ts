// view:rubric — the latest deal-qualification rubric for the newest objective, as readable text,
// plus a diff block per new version. Redraws on rubrics / objectives changes. Waits if `rubrics` is empty.
//   bun run view:rubric [--db waypoints_smoke]
import { ObjectId, type Document } from "mongodb";
import { DB_NAME, bgreen, bold, bred, byellow, cols, db, dim, f2, follow, green, hhmmss, oneLine, paint, pct, red, rows, shortId, wrap, yellow, onResize } from "./common";

type Rule = { field: string; equals: string; points: number };
const key = (r: Rule) => `${r.field}=${r.equals}`;
const pts = (n: number) => (n > 0 ? `+${n}` : `${n}`);

let objective: Document | null = null;
let latest: Document | null = null;
const diffs: string[][] = [];
const seenVersions = new Set<string>();
let status = "connecting";

const objFilter = (id: unknown) => {
  const s = id instanceof ObjectId ? id.toHexString() : String(id);
  return { objective_id: { $in: ObjectId.isValid(s) ? [s, new ObjectId(s)] : [s] } };
};

function diffBlock(prev: Document | null, cur: Document): string[] {
  const out: string[] = [];
  const h0 = prev?.metrics?.holdout ?? {};
  const h1 = cur.metrics?.holdout ?? {};
  const pr = new Map<string, Rule>(((prev?.rules ?? []) as Rule[]).map((r) => [key(r), r]));
  const cr = new Map<string, Rule>(((cur.rules ?? []) as Rule[]).map((r) => [key(r), r]));
  const changes: string[] = [];
  for (const [k, r] of cr) {
    const p = pr.get(k);
    if (!p) changes.push(bgreen(`+ ${r.field} = ${r.equals} (${pts(r.points)})`));
    else if (p.points !== r.points) changes.push(byellow(`~ ${r.field} = ${r.equals} (${pts(p.points)}→${pts(r.points)})`));
  }
  for (const [k, r] of pr) if (!cr.has(k)) changes.push(bred(`- ${r.field} = ${r.equals} (${pts(r.points)})`));
  const t0 = prev?.thresholds;
  const t1 = cur.thresholds;
  if (t0 && t1 && (t0.A !== t1.A || t0.B !== t1.B)) changes.push(byellow(`~ thresholds A${t0.A}/B${t0.B}→A${t1.A}/B${t1.B}`));
  if (!prev && !changes.length && cur.change_summary) changes.push(oneLine(cur.change_summary));

  const aucUp = typeof h0.auc === "number" && typeof h1.auc === "number" ? (h1.auc > h0.auc ? green : h1.auc < h0.auc ? red : dim) : dim;
  const from = prev ? `v${prev.version}` : "∅";
  out.push(`${dim(hhmmss(cur.created_at instanceof Date ? cur.created_at : new Date()))} ${bold(`${from} → v${cur.version}`)}  ${changes.join("  ") || dim("(no rule change)")}`);
  const flags = (cur.flags ?? []) as string[];
  const flagStr = flags.length ? "   " + flags.map((f) => bred(bold(`⚠ ${f.replace(/_/g, "-")}`))).join(" ") : "";
  out.push(`    holdout AUC ${f2(h0.auc)} → ${aucUp(bold(f2(h1.auc)))}   A-win ${pct(h0.a_win_rate)} → ${pct(h1.a_win_rate)}   gap ${f2(cur.gap)}${flagStr}`);
  return out;
}

async function loadObjective() {
  objective = await db.collection("objectives").findOne({}, { sort: { created_at: -1 } });
}

async function refresh() {
  if (!objective) await loadObjective();
  const filter = objective ? objFilter(objective._id) : {};
  const docs = await db.collection("rubrics").find(filter).sort({ version: -1 }).limit(1).toArray();
  const cur = docs[0] ?? null;
  if (cur) {
    const id = `${cur.objective_id}:${cur.version}`;
    if (!seenVersions.has(id)) {
      seenVersions.add(id);
      const prev = cur.parent_version != null
        ? await db.collection("rubrics").findOne({ ...objFilter(cur.objective_id), version: cur.parent_version })
        : null;
      diffs.push(diffBlock(prev, cur));
    }
  }
  latest = cur;
}

function render() {
  const W = Math.min(cols(), 120);
  const H = rows();
  const L: string[] = [];
  const live = status === "live" ? green("●") : red("○");
  const r = latest;
  L.push(`${bold("RUBRIC")}${r ? bold(` v${r.version}`) : ""} ${dim("deal qualification")} · db ${DB_NAME} ${live}`);
  if (objective) L.push(dim(`objective …${shortId(objective._id)} · ${oneLine(objective.objective).slice(0, W - 20)}`));
  if (!r) {
    L.push("");
    L.push(yellow("waiting for the first rubric (propose_rubric → rubrics collection)…"));
    return paint(L);
  }
  const rules = (r.rules ?? []) as Rule[];
  const fw = Math.max(6, ...rules.map((x) => x.field.length));
  const vw = Math.max(4, ...rules.map((x) => String(x.equals).length));
  const perCol = fw + vw + 8;
  const ncol = Math.max(1, Math.floor((W + 2) / (perCol + 2)));
  const cells = rules.map((x) => {
    const p = pts(x.points).padStart(3);
    return `${x.field.padEnd(fw)} = ${String(x.equals).padEnd(vw)} ${x.points > 0 ? green(bold(p)) : red(bold(p))}`;
  });
  L.push(dim("─".repeat(W)));
  for (let i = 0; i < cells.length; i += ncol) L.push(cells.slice(i, i + ncol).join("  "));
  if (!cells.length) L.push(dim("(no rules)"));
  const t = r.thresholds ?? {};
  L.push(`${dim("grade")} A ≥ ${bold(String(t.A))}   B ≥ ${bold(String(t.B))}   ${dim("else C")}`);
  const tr = r.metrics?.train ?? {};
  const ho = r.metrics?.holdout ?? {};
  const flags = (r.flags ?? []) as string[];
  L.push(`${dim("         AUC   A-win  A-cov    n")}`);
  L.push(`${dim("train  ")} ${f2(tr.auc).padStart(5)} ${pct(tr.a_win_rate).padStart(6)} ${pct(tr.a_coverage).padStart(6)} ${String(tr.n ?? "—").padStart(4)}`);
  L.push(`${bold("holdout")} ${bold(f2(ho.auc).padStart(5))} ${bold(pct(ho.a_win_rate).padStart(6))} ${pct(ho.a_coverage).padStart(6)} ${String(ho.n ?? "—").padStart(4)}   gap ${(r.gap ?? 0) > 0.08 ? red(f2(r.gap)) : f2(r.gap)}${flags.length ? "  " + flags.map((f) => bred(bold(`⚠ ${f.replace(/_/g, "-")}`))).join(" ") : ""}`);
  if (r.rationale) L.push(...wrap(dim(`“${oneLine(r.rationale)}”`), W, " "));
  L.push(dim("─".repeat(W)));
  // newest diffs that fit, newest at the bottom
  const room = H - L.length;
  const tail: string[] = [];
  for (let i = diffs.length - 1; i >= 0; i--) {
    const block = diffs[i]!.flatMap((l) => wrap(l, W, "    "));
    if (tail.length + block.length > room) break;
    tail.unshift(...block);
  }
  L.push(...tail);
  paint(L);
}

let pending: Promise<void> = Promise.resolve();
const tick = (reloadObjective = false) => {
  pending = pending.then(async () => {
    try {
      if (reloadObjective) await loadObjective();
      await refresh();
    } catch {}
    render();
  });
};

tick(true);
onResize(render);
await follow(
  [{ $match: { "ns.coll": { $in: ["rubrics", "objectives"] }, operationType: { $in: ["insert", "replace", "update"] } } }],
  (c: any) => {
    if (c.ns.coll === "objectives") {
      if (c.operationType === "insert") tick(true);
      return;
    }
    tick(false);
  },
  (s) => {
    status = s;
    render();
  },
  undefined,
);
