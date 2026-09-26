// Offline ceiling check for the sales task: greedy search over simple additive rubrics (log-odds points,
// int-rounded, only values with train support ≥ 15). Prints the realistic best holdout AUC / A-grade win rate
// and naive baselines, then re-scores the winner through the Atlas pipeline. Run: `bun run sales:ceiling`.
import { mongo } from "../src/clients";
import { FEATURES, opportunities, type Opportunity } from "../src/sales/data";
import { MIN_SUPPORT, aucFromBuckets, metricsFromBuckets, scoreRubric, type Rule, type ScoreBucket, type Thresholds } from "../src/sales/tools";

const rows = (await opportunities().find({}).toArray()) as unknown as Opportunity[];
const train = rows.filter((r) => r.split === "train");
const holdout = rows.filter((r) => r.split === "holdout");

function buckets(rs: Opportunity[], rules: Rule[]): ScoreBucket[] {
  const m = new Map<number, ScoreBucket>();
  for (const r of rs) {
    const s = rules.reduce((acc, x) => acc + (r[x.field] === x.equals ? x.points : 0), 0);
    const b = m.get(s) ?? { score: s, pos: 0, neg: 0 };
    r.won ? b.pos++ : b.neg++;
    m.set(s, b);
  }
  return [...m.values()];
}
const auc = (rs: Opportunity[], rules: Rule[]) => aucFromBuckets(buckets(rs, rules));

/** A threshold: the lowest train score whose A-coverage stays ≤ 35% (≥ 20% preferred), B at the median. */
function pickThresholds(rules: Rule[]): Thresholds {
  const scores = train.map((r) => rules.reduce((a, x) => a + (r[x.field] === x.equals ? x.points : 0), 0)).sort((a, b) => b - a);
  const distinct = [...new Set(scores)];
  let A = distinct[0] ?? 1;
  for (const s of distinct) {
    const cov = scores.filter((x) => x >= s).length / scores.length;
    if (cov > 0.35) break;
    A = s;
  }
  const B = Math.min(A - 1, scores[Math.floor(scores.length / 2)] ?? 0);
  return { A, B };
}

// Candidate rules: every value with train support ≥ MIN_SUPPORT, points = round(scale · log-odds vs base), clipped ±5.
const base = train.filter((r) => r.won).length / train.length;
const logit = (p: number) => Math.log(p / (1 - p));
function candidates(scale: number): Rule[] {
  const out: Rule[] = [];
  for (const f of FEATURES) {
    const values = new Map<string, { n: number; w: number }>();
    for (const r of train) {
      const v = values.get(r[f]) ?? { n: 0, w: 0 };
      v.n++;
      if (r.won) v.w++;
      values.set(r[f], v);
    }
    for (const [value, { n, w }] of values) {
      if (n < MIN_SUPPORT) continue;
      const p = (w + 1) / (n + 2);
      const points = Math.max(-5, Math.min(5, Math.round(scale * (logit(p) - logit(base)))));
      if (points !== 0) out.push({ field: f, equals: value, points });
    }
  }
  return out;
}

type Path = { rules: Rule[]; train: number; holdout: number }[];
function greedy(scale: number, by: "train" | "holdout", maxRules = 25): Path {
  const pool = candidates(scale);
  const chosen: Rule[] = [];
  const path: Path = [];
  let bestScore = 0.5;
  while (chosen.length < maxRules) {
    let pick: Rule | null = null;
    let pickScore = bestScore;
    for (const c of pool) {
      if (chosen.some((x) => x.field === c.field && x.equals === c.equals)) continue;
      const s = auc(by === "train" ? train : holdout, [...chosen, c]);
      if (s > pickScore + 1e-9) [pick, pickScore] = [c, s];
    }
    if (!pick) break;
    chosen.push(pick);
    bestScore = pickScore;
    path.push({ rules: [...chosen], train: auc(train, chosen), holdout: auc(holdout, chosen) });
  }
  return path;
}

const f3 = (x: number) => x.toFixed(3);
console.log(`train ${train.length}, holdout ${holdout.length}, base train win ${f3(base)}`);
console.log(`baseline empty rubric: train ${f3(auc(train, []))} holdout ${f3(auc(holdout, []))}`);
const one: Rule[] = [{ field: "client", equals: "Current", points: 3 }];
console.log(`1-rule client=Current(+3): train ${f3(auc(train, one))} holdout ${f3(auc(holdout, one))}`);

let best: { rules: Rule[]; train: number; holdout: number; scale: number; by: string } | null = null;
let bestHoldoutPeek = 0;
for (const scale of [1, 1.5, 2, 3]) {
  for (const by of ["train", "holdout"] as const) {
    const path = greedy(scale, by);
    const top = path.reduce((a, p) => (p.holdout > a.holdout ? p : a), path[0]!);
    const line = path.map((p, i) => `${i + 1}:${f3(p.holdout)}`).join(" ");
    console.log(`scale ${scale} greedy-by-${by}: final train ${f3(path.at(-1)!.train)} holdout ${f3(path.at(-1)!.holdout)}, peak holdout ${f3(top.holdout)} @${top.rules.length} rules | ${line}`);
    if (by === "train" && (!best || top.holdout > best.holdout)) best = { ...top, scale, by };
    bestHoldoutPeek = Math.max(bestHoldoutPeek, top.holdout);
  }
}
const b = best!;
const th = pickThresholds(b.rules);
const hm = metricsFromBuckets(buckets(holdout, b.rules), th);
const tm = metricsFromBuckets(buckets(train, b.rules), th);
console.log(`\nceiling (train-greedy, peak holdout): holdout AUC ${f3(b.holdout)} train ${f3(b.train)} with ${b.rules.length} rules, scale ${b.scale}`);
console.log(`thresholds ${JSON.stringify(th)} → holdout A win ${f3(hm.a_win_rate)} cov ${f3(hm.a_coverage)}; train A win ${f3(tm.a_win_rate)} cov ${f3(tm.a_coverage)}`);
console.log(`holdout-peeking greedy (upper bound when the agent chases holdout feedback): ${f3(bestHoldoutPeek)}`);
console.log(`rules: ${JSON.stringify(b.rules)}`);
const atlas = await scoreRubric(b.rules, th);
console.log(`Atlas pipeline re-score: ${JSON.stringify(atlas)}`);
await mongo.close();
