// The rising bar (RAISE THE BAR stage of the loop): WORK → GRADE → DETECT → ADAPT (trial) → VERDICT → RAISE THE BAR.
// The bar is versioned in `bars`: {version, level, target_pct, checks, new_checks, status, earned_by, created_at}.
// It rises ONLY when earned: a batch closes having met its locked end state (every account done, first-try ≥ target).
// Then level = min(4, level+1), target = min(95, max(prev target, round(first-try %) + 5)). Otherwise the bar holds.
// Batch objectives carry bar_version; submit/precheck grade at that bar's level (missing → level 1).
import { ObjectId, type Db } from "mongodb";
import { waypointsDb } from "../clients";
import { LEVEL_NEW_CHECKS, MAX_LEVEL, checksAt, clampLevel, type QaClass } from "./qa";

export const SEED_TARGET = 80;
export const MAX_TARGET = 95;
export const RAISE_MARGIN = 5;

export interface Bar {
  _id?: ObjectId;
  version: number;
  level: number;
  target_pct: number;
  checks: QaClass[];
  new_checks: QaClass[];
  status: "active" | "superseded";
  earned_by: { objective_id: ObjectId; batch: number; first_try_pct: number } | null;
  created_at: Date;
}

export function seedBar(): Bar {
  return { version: 1, level: 1, target_pct: SEED_TARGET, checks: checksAt(1), new_checks: [], status: "active", earned_by: null, created_at: new Date() };
}

/** Pure: the next bar's level/target when a batch earned the raise. */
export function nextBarLevels(prev: { level: number; target_pct: number }, first_try_pct: number): { level: number; target_pct: number } {
  return {
    level: Math.min(MAX_LEVEL, clampLevel(prev.level) + 1),
    target_pct: Math.min(MAX_TARGET, Math.max(prev.target_pct, Math.round(first_try_pct) + RAISE_MARGIN)),
  };
}

const bars = (db: Db) => db.collection<Bar>("bars");

/** Idempotent (setup): indexes + seed bar v1 when `bars` is empty. Never modifies existing docs. */
export async function ensureBars(db: Db = waypointsDb): Promise<"seeded" | "exists"> {
  await bars(db).createIndex({ version: -1 }, { unique: true });
  await bars(db).createIndex({ status: 1, version: -1 });
  if (await bars(db).countDocuments({}, { limit: 1 })) return "exists";
  try {
    await bars(db).insertOne(seedBar());
    return "seeded";
  } catch (e: any) {
    if (e?.code === 11000) return "exists";
    throw e;
  }
}

/** The active bar; the seed (level 1, 80%) when `bars` is empty or missing (backward compatible, nothing written). */
export async function activeBar(db: Db = waypointsDb): Promise<Bar> {
  return (await bars(db).findOne({ status: "active" }, { sort: { version: -1 } })) ?? seedBar();
}

export async function barByVersion(version: unknown, db: Db = waypointsDb): Promise<Bar> {
  if (typeof version !== "number") return seedBar();
  return (await bars(db).findOne({ version })) ?? seedBar();
}

const levelCache = new Map<string, number>();
/** QA level for an objective: its bar_version's level; missing objective/bar_version → 1. Cached (a batch's bar never changes). */
export async function levelForObjective(objective_id: ObjectId | string | undefined | null, db: Db = waypointsDb): Promise<number> {
  if (!objective_id) return 1;
  const key = `${db.databaseName}:${String(objective_id)}`;
  const hit = levelCache.get(key);
  if (hit !== undefined) return hit;
  const id = typeof objective_id === "string" && /^[0-9a-f]{24}$/i.test(objective_id) ? new ObjectId(objective_id) : objective_id;
  const obj = await db.collection("objectives").findOne({ _id: id as ObjectId }, { projection: { bar_version: 1 } });
  const level = typeof obj?.bar_version === "number" ? clampLevel((await barByVersion(obj.bar_version, db)).level) : 1;
  if (obj) levelCache.set(key, level); // don't cache a not-yet-visible objective
  return level;
}

export interface BarSettlement {
  raised: boolean;
  bar: Bar; // the bar the NEXT batch works under
  previous: Bar;
  text: string;
}

/**
 * RAISE THE BAR stage, run when a batch closes (before the next objective opens). Earned (end state met) → a new bar
 * version supersedes the active one and a "bar_raised" event is written; otherwise a "bar_held" event. The seed bar
 * is inserted first if `bars` is empty, so the history is complete.
 */
export async function settleBar(
  input: { objective_id: ObjectId | string; batch: number; first_try_pct: number; reached: boolean; agent?: string },
  db: Db = waypointsDb,
): Promise<BarSettlement> {
  await ensureBars(db);
  const prev = await activeBar(db);
  const objective_id = typeof input.objective_id === "string" ? new ObjectId(input.objective_id) : input.objective_id;
  const pct = Math.round(input.first_try_pct * 10) / 10;
  const next = nextBarLevels(prev, pct);
  const changes = next.level !== prev.level || next.target_pct !== prev.target_pct;
  if (input.reached && pct >= prev.target_pct && changes) {
    const bar: Bar = {
      version: prev.version + 1,
      level: next.level,
      target_pct: next.target_pct,
      checks: checksAt(next.level),
      new_checks: next.level > prev.level ? [...(LEVEL_NEW_CHECKS[next.level] ?? [])] : [],
      status: "active",
      earned_by: { objective_id, batch: input.batch, first_try_pct: pct },
      created_at: new Date(),
    };
    await bars(db).insertOne(bar);
    await bars(db).updateMany({ status: "active", version: { $ne: bar.version } }, { $set: { status: "superseded", superseded_at: new Date() } });
    const extra = next.level >= 3 && prev.level < 3 ? " (too-long tightens to 90 words)" : "";
    const text =
      `Bar raised → level ${bar.level} · target ${bar.target_pct}% · new checks: ${bar.new_checks.length ? bar.new_checks.join(", ") + extra : "none (target only)"}` +
      ` · earned by batch ${input.batch} (${pct}%)`;
    await writeBarEvent(db, objective_id, "bar_raised", input.agent, { from: pick(prev), to: pick(bar), batch: input.batch, first_try_pct: pct, new_checks: bar.new_checks }, text);
    return { raised: true, bar, previous: prev, text };
  }
  const why = !input.reached || pct < prev.target_pct ? "" : prev.level >= MAX_LEVEL ? " (already at the top bar)" : "";
  const text = `Bar held at level ${prev.level} · ${prev.target_pct}% · batch ${input.batch} reached ${pct}%${why}`;
  await writeBarEvent(db, objective_id, "bar_held", input.agent, { bar: pick(prev), batch: input.batch, first_try_pct: pct, reached: input.reached }, text);
  return { raised: false, bar: prev, previous: prev, text };
}

const pick = (b: Bar) => ({ version: b.version, level: b.level, target_pct: b.target_pct });

async function writeBarEvent(db: Db, objective_id: ObjectId, kind: "bar_raised" | "bar_held", agent: string | undefined, detail: object, text: string) {
  await db.collection("events").insertOne({ objective_id, kind, agent: agent ?? "waypoints-harness", detail, text, created_at: new Date() });
}
