// Sales task tools: plain async functions the harness wraps as local tools (docs/SALES-PACK.md).
// Holdout rows never leave this module: the agent only ever sees train aggregates and holdout metrics.
import { ObjectId, type Document } from "mongodb";
import { FEATURES, opportunities, rubrics, type Feature } from "./data";

export { FEATURES, type Feature };

export const MAX_RULES = 25;
export const MIN_POINTS = -5;
export const MAX_POINTS = 5;
export const MIN_SUPPORT = 15;
export const MAX_GAP = 0.08;

export type RubricFlag = "overfit_segment" | "invalid_rubric";

export interface Rule {
  field: Feature;
  equals: string;
  points: number;
}
export interface Thresholds {
  A: number;
  B: number;
}
export interface SplitMetrics {
  auc: number;
  /** Win rate among deals graded A (0..1); 0 when nothing is graded A. */
  a_win_rate: number;
  /** Share of deals graded A (0..1). */
  a_coverage: number;
  n: number;
}
export interface RubricMetrics {
  train: SplitMetrics;
  holdout: SplitMetrics;
}
export interface RubricDoc {
  _id: string;
  objective_id: string;
  version: number;
  parent_version: number | null;
  rules: Rule[];
  thresholds: Thresholds;
  change_summary: string;
  rationale: string;
  metrics: RubricMetrics;
  gap: number;
  flags: RubricFlag[];
  agent: string;
  created_at: Date;
}

export interface ValueStat {
  value: string;
  n: number;
  win_rate: number;
}
export interface FieldStats {
  field: Feature;
  values: ValueStat[];
}
export interface DescribeDataResult {
  n_train: number;
  n_holdout: number;
  base_win_rate: number;
  fields: FieldStats[];
  note: string;
}

export interface SegmentStatsInput {
  field: string;
  value?: string;
  where?: Record<string, string>;
}
export type SegmentStatsResult =
  | { ok: true; field: Feature; where: Record<string, string>; base: { n: number; win_rate: number }; segments: ValueStat[] }
  | { ok: false; errors: string[] };

export interface ProposeRubricInput {
  objective_id: string;
  rules: Rule[];
  thresholds: Thresholds;
  rationale: string;
  agent: string;
}
export type ProposeRubricResult =
  | { ok: false; errors: string[]; flags: ["invalid_rubric"] }
  | { ok: true; version: number; metrics: RubricMetrics; gap: number; flags: RubricFlag[]; change_summary: string };

export interface GetRubricInput {
  objective_id: string;
  version?: number;
}
export interface BestRubricInput {
  objective_id: string;
}

// ---- helpers -----------------------------------------------------------------------------------

const r4 = (x: number) => Math.round(x * 10000) / 10000;
const isFeature = (f: unknown): f is Feature => typeof f === "string" && (FEATURES as readonly string[]).includes(f);

/** Objective ids are ObjectIds in Waypoints; any other string (e.g. a smoke-test id) is stored as-is. */
function objKey(id: string): ObjectId | string {
  return /^[0-9a-f]{24}$/i.test(id) ? new ObjectId(id) : id;
}

let valueCache: Map<Feature, Set<string>> | null = null;
async function knownValues(): Promise<Map<Feature, Set<string>>> {
  if (valueCache) return valueCache;
  const facets = Object.fromEntries(FEATURES.map((f) => [f, [{ $group: { _id: `$${f}` } }]]));
  const [res] = await opportunities().aggregate([{ $facet: facets }]).toArray();
  const m = new Map<Feature, Set<string>>();
  for (const f of FEATURES) m.set(f, new Set(((res?.[f] ?? []) as Document[]).map((d) => String(d._id))));
  if ([...m.values()].every((s) => s.size === 0)) throw new Error("waypoints.opportunities is empty: run `bun run load:sales`");
  valueCache = m;
  return m;
}

/** Train rows per value, for every feature (one $facet pipeline, train only). */
async function trainValueStats(match: Document = {}): Promise<{ n: number; wins: number; fields: Map<Feature, ValueStat[]> }> {
  const facets: Document = Object.fromEntries(
    FEATURES.map((f) => [f, [{ $group: { _id: `$${f}`, n: { $sum: 1 }, wins: { $sum: { $cond: ["$won", 1, 0] } } } }, { $sort: { n: -1, _id: 1 } }]]),
  );
  facets.__all = [{ $group: { _id: null, n: { $sum: 1 }, wins: { $sum: { $cond: ["$won", 1, 0] } } } }];
  const [res] = await opportunities().aggregate([{ $match: { ...match, split: "train" } }, { $facet: facets }]).toArray();
  const all = (res?.__all?.[0] ?? { n: 0, wins: 0 }) as { n: number; wins: number };
  const fields = new Map<Feature, ValueStat[]>();
  for (const f of FEATURES)
    fields.set(
      f,
      ((res?.[f] ?? []) as Document[]).map((d) => ({ value: String(d._id), n: d.n as number, win_rate: r4(d.wins / d.n) })),
    );
  return { n: all.n, wins: all.wins, fields };
}

// ---- describe_data / segment_stats -------------------------------------------------------------

export async function describe_data(): Promise<DescribeDataResult> {
  const [stats, nHoldout] = await Promise.all([trainValueStats(), opportunities().countDocuments({ split: "holdout" })]);
  return {
    n_train: stats.n,
    n_holdout: nHoldout,
    base_win_rate: r4(stats.n ? stats.wins / stats.n : 0),
    fields: FEATURES.map((f) => ({ field: f, values: stats.fields.get(f) ?? [] })),
    note: `Train split only. Holdout deals are never shown; propose_rubric reports holdout metrics. Rules on values with < ${MIN_SUPPORT} train deals are flagged overfit_segment.`,
  };
}

export async function segment_stats(input: SegmentStatsInput): Promise<SegmentStatsResult> {
  const errors: string[] = [];
  if (!isFeature(input.field)) errors.push(`unknown field "${input.field}"; use one of: ${FEATURES.join(", ")}`);
  const where = input.where ?? {};
  for (const k of Object.keys(where)) if (!isFeature(k)) errors.push(`unknown where field "${k}"`);
  if (errors.length) return { ok: false, errors };
  const field = input.field as Feature;
  const match: Document = {};
  for (const [k, v] of Object.entries(where)) match[k] = String(v);
  const stats = await trainValueStats(match);
  let segments = stats.fields.get(field) ?? [];
  if (input.value !== undefined) segments = segments.filter((s) => s.value === String(input.value));
  return { ok: true, field, where, base: { n: stats.n, win_rate: r4(stats.n ? stats.wins / stats.n : 0) }, segments };
}

// ---- scoring -----------------------------------------------------------------------------------

/** Atlas does the scoring: $sum of $cond points per rule, then counts per (split, score, won). */
export function scorePipeline(rules: Rule[]): Document[] {
  return [
    { $match: { split: { $in: ["train", "holdout"] } } },
    { $project: { _id: 0, split: 1, won: 1, score: { $sum: rules.map((r) => ({ $cond: [{ $eq: [`$${r.field}`, r.equals] }, r.points, 0] })) } } },
    { $group: { _id: { split: "$split", score: "$score", won: "$won" }, n: { $sum: 1 } } },
  ];
}

export interface ScoreBucket {
  score: number;
  pos: number;
  neg: number;
}

/** Mann-Whitney AUC over score buckets; ties count half. 0.5 when a class is missing. */
export function aucFromBuckets(buckets: ScoreBucket[]): number {
  const sorted = [...buckets].sort((a, b) => a.score - b.score);
  const P = sorted.reduce((s, b) => s + b.pos, 0);
  const N = sorted.reduce((s, b) => s + b.neg, 0);
  if (!P || !N) return 0.5;
  let negBelow = 0;
  let u = 0;
  for (const b of sorted) {
    u += b.pos * (negBelow + 0.5 * b.neg);
    negBelow += b.neg;
  }
  return u / (P * N);
}

export function metricsFromBuckets(buckets: ScoreBucket[], thresholds: Thresholds): SplitMetrics {
  const n = buckets.reduce((s, b) => s + b.pos + b.neg, 0);
  const a = buckets.filter((b) => b.score >= thresholds.A);
  const aN = a.reduce((s, b) => s + b.pos + b.neg, 0);
  const aWon = a.reduce((s, b) => s + b.pos, 0);
  return { auc: r4(aucFromBuckets(buckets)), a_win_rate: r4(aN ? aWon / aN : 0), a_coverage: r4(n ? aN / n : 0), n };
}

export async function scoreRubric(rules: Rule[], thresholds: Thresholds): Promise<RubricMetrics> {
  const rows = await opportunities().aggregate(scorePipeline(rules)).toArray();
  const by: Record<"train" | "holdout", Map<number, ScoreBucket>> = { train: new Map(), holdout: new Map() };
  for (const d of rows) {
    const split = d._id.split as "train" | "holdout";
    const score = Number(d._id.score);
    const b = by[split].get(score) ?? { score, pos: 0, neg: 0 };
    if (d._id.won) b.pos += d.n;
    else b.neg += d.n;
    by[split].set(score, b);
  }
  return { train: metricsFromBuckets([...by.train.values()], thresholds), holdout: metricsFromBuckets([...by.holdout.values()], thresholds) };
}

// ---- validation / diff -------------------------------------------------------------------------

export async function validateRubric(rules: unknown, thresholds: unknown): Promise<string[]> {
  const errors: string[] = [];
  if (!Array.isArray(rules)) return ["rules must be an array"];
  if (rules.length > MAX_RULES) errors.push(`too many rules: ${rules.length} > ${MAX_RULES}`);
  const values = await knownValues();
  const seen = new Set<string>();
  rules.forEach((r: any, i) => {
    const at = `rules[${i}]`;
    if (!r || typeof r !== "object") return void errors.push(`${at}: must be {field, equals, points}`);
    if (!isFeature(r.field)) return void errors.push(`${at}: unknown field "${r.field}"; use one of: ${FEATURES.join(", ")}`);
    if (typeof r.equals !== "string" || !values.get(r.field)!.has(r.equals))
      errors.push(`${at}: value "${r.equals}" does not exist for ${r.field}; valid: ${[...values.get(r.field)!].join(" | ")}`);
    if (typeof r.points !== "number" || !Number.isInteger(r.points) || r.points < MIN_POINTS || r.points > MAX_POINTS)
      errors.push(`${at}: points must be an integer in ${MIN_POINTS}..${MAX_POINTS} (got ${JSON.stringify(r.points)})`);
    const key = `${r.field}=${r.equals}`;
    if (seen.has(key)) errors.push(`${at}: duplicate rule ${key}`);
    seen.add(key);
  });
  const t = thresholds as any;
  if (!t || typeof t !== "object" || typeof t.A !== "number" || typeof t.B !== "number" || !Number.isFinite(t.A) || !Number.isFinite(t.B))
    errors.push("thresholds must be {A: number, B: number}");
  else if (!(t.A > t.B)) errors.push(`thresholds: A (${t.A}) must be greater than B (${t.B})`);
  return errors;
}

const pts = (p: number) => (p >= 0 ? `+${p}` : `${p}`);

export function changeSummary(parent: { rules: Rule[]; thresholds: Thresholds } | null, rules: Rule[], thresholds: Thresholds): string {
  if (!parent) return `baseline: ${rules.length} rule${rules.length === 1 ? "" : "s"}, A≥${thresholds.A}, B≥${thresholds.B}`;
  const key = (r: Rule) => `${r.field}=${r.equals}`;
  const before = new Map(parent.rules.map((r) => [key(r), r]));
  const after = new Map(rules.map((r) => [key(r), r]));
  const parts: string[] = [];
  for (const [k, r] of after) {
    const old = before.get(k);
    if (!old) parts.push(`+ ${k} (${pts(r.points)})`);
    else if (old.points !== r.points) parts.push(`~ ${k} (${pts(old.points)}→${pts(r.points)})`);
  }
  for (const [k, r] of before) if (!after.has(k)) parts.push(`− ${k} (${pts(r.points)})`);
  if (parent.thresholds.A !== thresholds.A) parts.push(`A ${parent.thresholds.A}→${thresholds.A}`);
  if (parent.thresholds.B !== thresholds.B) parts.push(`B ${parent.thresholds.B}→${thresholds.B}`);
  return parts.length ? parts.join(", ") : "no change";
}

async function trainSupport(rules: Rule[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!rules.length) return out;
  const facets = Object.fromEntries(rules.map((r, i) => [`r${i}`, [{ $match: { [r.field]: r.equals } }, { $count: "n" }]]));
  const [res] = await opportunities().aggregate([{ $match: { split: "train" } }, { $facet: facets }]).toArray();
  rules.forEach((r, i) => out.set(`${r.field}=${r.equals}`, (res?.[`r${i}`]?.[0]?.n as number | undefined) ?? 0));
  return out;
}

function publicDoc(d: Document | null): RubricDoc | null {
  if (!d) return null;
  return { ...(d as RubricDoc), _id: String(d._id), objective_id: String(d.objective_id) };
}

// ---- propose / get / best ----------------------------------------------------------------------

export async function propose_rubric(input: ProposeRubricInput): Promise<ProposeRubricResult> {
  const errors = await validateRubric(input.rules, input.thresholds);
  if (typeof input.objective_id !== "string" || !input.objective_id) errors.push("objective_id is required");
  if (errors.length) return { ok: false, errors, flags: ["invalid_rubric"] };

  const rules: Rule[] = input.rules.map((r) => ({ field: r.field, equals: r.equals, points: r.points }));
  const thresholds: Thresholds = { A: input.thresholds.A, B: input.thresholds.B };
  const [metrics, support] = await Promise.all([scoreRubric(rules, thresholds), trainSupport(rules)]);
  const gap = r4(metrics.train.auc - metrics.holdout.auc);
  const lowSupport = rules.filter((r) => (support.get(`${r.field}=${r.equals}`) ?? 0) < MIN_SUPPORT);
  const flags: RubricFlag[] = gap > MAX_GAP || lowSupport.length ? ["overfit_segment"] : [];

  const objective_id = objKey(input.objective_id);
  for (let attempt = 0; ; attempt++) {
    const parent = await rubrics().findOne({ objective_id }, { sort: { version: -1 } });
    const version = ((parent?.version as number | undefined) ?? 0) + 1;
    const change_summary = changeSummary(parent as { rules: Rule[]; thresholds: Thresholds } | null, rules, thresholds);
    try {
      await rubrics().insertOne({
        objective_id,
        version,
        parent_version: (parent?.version as number | undefined) ?? null,
        rules,
        thresholds,
        change_summary,
        rationale: String(input.rationale ?? ""),
        metrics,
        gap,
        flags,
        low_support: lowSupport.map((r) => ({ field: r.field, equals: r.equals, train_n: support.get(`${r.field}=${r.equals}`) ?? 0 })),
        agent: String(input.agent ?? "unknown"),
        created_at: new Date(),
      });
      return { ok: true, version, metrics, gap, flags, change_summary };
    } catch (err: any) {
      if (err?.code === 11000 && attempt < 5) continue; // concurrent proposal took this version number
      throw err;
    }
  }
}

export async function get_rubric(input: GetRubricInput): Promise<RubricDoc | null> {
  const filter: Document = { objective_id: objKey(input.objective_id) };
  if (input.version !== undefined) filter.version = input.version;
  return publicDoc(await rubrics().findOne(filter, { sort: { version: -1 } }));
}

export async function best_rubric(input: BestRubricInput): Promise<RubricDoc | null> {
  return publicDoc(await rubrics().findOne({ objective_id: objKey(input.objective_id) }, { sort: { "metrics.holdout.auc": -1, version: 1 } }));
}

/** Idempotent; called by setup and the loader. */
export async function ensureSalesIndexes() {
  await rubrics().createIndex({ objective_id: 1, version: -1 }, { unique: true });
  await rubrics().createIndex({ objective_id: 1, "metrics.holdout.auc": -1 });
}
