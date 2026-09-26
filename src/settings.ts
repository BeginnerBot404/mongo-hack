// harness_config: versioned harness settings behind a deterministic gate.
// Writes (apply / rollback / evaluate) are only exposed by the surgeon role.
import { ObjectId, type Document } from "mongodb";
import { mongo, waypointsDb as db } from "./clients";
import {
  AGENT_TOOLS,
  FRAGMENT_IDS,
  MODELS,
  SEED_SETTINGS,
  SETTINGS_FIELDS,
  getFragments,
  type HarnessSettings,
  type SettingsField,
} from "./fragments";

export type ConfigStatus = "active" | "probation" | "kept" | "rolled_back" | "superseded";
export const CURRENT_STATUSES: ConfigStatus[] = ["active", "probation", "kept"];
export const PROBATION_CHECKPOINTS = 2;

export interface HarnessConfig {
  _id: ObjectId;
  version: number;
  status: ConfigStatus;
  settings: HarnessSettings;
  parent_version: number | null;
  change: { field: SettingsField; from: unknown; to: unknown } | null;
  reason: { kind: "failure" | "tap" | "manual_seed"; id: ObjectId | null; summary: string };
  probation: { checkpoints_required: number; baseline_bearing: number | null; watch_class: string; started_seq: number } | null;
  outcome: { decided_at: Date; verdict: "kept" | "rolled_back"; why: string } | null;
  created_by: "surgeon" | "seed";
  created_at: Date;
}

export const configs = () => db.collection<HarnessConfig>("harness_config");
const events = () => db.collection("events");

const nullable = (schema: Document): Document => ({ ...schema, bsonType: ["object", "null"] });
const changeValue = { bsonType: ["array", "string", "number"], items: { bsonType: "string" } };

/** $jsonSchema for harness_config. additionalProperties:false at every level, so no end_state/objective/bearing field can exist. */
export const HARNESS_CONFIG_SCHEMA: Document = {
  bsonType: "object",
  required: ["version", "status", "settings", "parent_version", "change", "reason", "probation", "outcome", "created_by", "created_at"],
  additionalProperties: false,
  properties: {
    _id: { bsonType: "objectId" },
    version: { bsonType: "number", minimum: 1 },
    status: { enum: ["active", "probation", "kept", "rolled_back", "superseded"] },
    settings: {
      bsonType: "object",
      required: [...SETTINGS_FIELDS],
      additionalProperties: false,
      properties: {
        prompt_fragments: { bsonType: "array", uniqueItems: true, items: { enum: [...FRAGMENT_IDS] } },
        required_tools: { bsonType: "array", uniqueItems: true, items: { enum: [...AGENT_TOOLS] } },
        sentinel_threshold: { bsonType: "number", minimum: 0, maximum: 1 },
        model: { enum: [...MODELS] },
      },
    },
    parent_version: { bsonType: ["number", "null"] },
    change: nullable({
      required: ["field", "from", "to"],
      additionalProperties: false,
      properties: { field: { enum: [...SETTINGS_FIELDS] }, from: changeValue, to: changeValue },
    }),
    reason: {
      bsonType: "object",
      required: ["kind", "id", "summary"],
      additionalProperties: false,
      properties: {
        kind: { enum: ["failure", "tap", "manual_seed"] },
        id: { bsonType: ["objectId", "null"] },
        summary: { bsonType: "string" },
      },
    },
    probation: nullable({
      required: ["checkpoints_required", "baseline_bearing", "watch_class", "started_seq"],
      additionalProperties: false,
      properties: {
        checkpoints_required: { bsonType: "number", minimum: 1 },
        baseline_bearing: { bsonType: ["number", "null"] },
        watch_class: { bsonType: "string" },
        started_seq: { bsonType: "number" },
      },
    }),
    outcome: nullable({
      required: ["decided_at", "verdict", "why"],
      additionalProperties: false,
      properties: {
        decided_at: { bsonType: "date" },
        verdict: { enum: ["kept", "rolled_back"] },
        why: { bsonType: "string" },
      },
    }),
    created_by: { enum: ["surgeon", "seed"] },
    created_at: { bsonType: "date" },
  },
};

export function seedConfig(now = new Date()): Omit<HarnessConfig, "_id"> {
  return {
    version: 1,
    status: "active",
    settings: structuredClone(SEED_SETTINGS),
    parent_version: null,
    change: null,
    reason: { kind: "manual_seed", id: null, summary: "Seed settings v1" },
    probation: null,
    outcome: null,
    created_by: "seed",
    created_at: now,
  };
}

export async function currentConfig(): Promise<HarnessConfig> {
  const found = await configs().findOne({ status: { $in: CURRENT_STATUSES } }, { sort: { version: -1 } });
  if (!found) throw new Error("No harness_config found. Run `bun run setup` to seed v1.");
  return found;
}

export async function getSettings() {
  const c = await currentConfig();
  return { version: c.version, status: c.status, settings: c.settings, fragments: getFragments(c.settings.prompt_fragments) };
}

async function writeEvent(objectiveId: ObjectId | null, kind: string, agent: string, detail: Document, text: string, session?: any) {
  await events().insertOne({ objective_id: objectiveId, kind, agent, detail, text, created_at: new Date() }, { session });
}

// ---- deterministic gate -------------------------------------------------------------------------

export type GateResult = { passed: true; value: unknown } | { passed: false; why: string };

/** Validate one field's new value against the fixed enums. Pure. */
export function gateChange(field: string, value: unknown, current: HarnessSettings): GateResult {
  if (!(SETTINGS_FIELDS as readonly string[]).includes(field))
    return { passed: false, why: `field "${field}" is not one of ${SETTINGS_FIELDS.join(", ")}` };
  const strArray = (v: unknown, allowed: readonly string[], label: string): GateResult => {
    if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) return { passed: false, why: `${label} must be an array of ids` };
    const bad = v.filter((x) => !allowed.includes(x));
    if (bad.length) return { passed: false, why: `${label} has unknown ids: ${bad.join(", ")} (allowed: ${allowed.join(", ")})` };
    if (new Set(v).size !== v.length) return { passed: false, why: `${label} has duplicates` };
    return { passed: true, value: v };
  };
  let result: GateResult;
  switch (field as SettingsField) {
    case "prompt_fragments":
      result = strArray(value, FRAGMENT_IDS, "prompt_fragments");
      break;
    case "required_tools":
      result = strArray(value, AGENT_TOOLS, "required_tools");
      break;
    case "sentinel_threshold":
      result =
        typeof value === "number" && value >= 0 && value <= 1
          ? { passed: true, value }
          : { passed: false, why: "sentinel_threshold must be a number between 0 and 1" };
      break;
    case "model":
      result =
        typeof value === "string" && (MODELS as readonly string[]).includes(value)
          ? { passed: true, value }
          : { passed: false, why: `model must be one of ${MODELS.join(", ")}` };
      break;
  }
  if (result.passed && JSON.stringify(result.value) === JSON.stringify(current[field as SettingsField]))
    return { passed: false, why: `${field} already has that value` };
  return result;
}

function describe(v: unknown): string {
  return Array.isArray(v) ? `[${v.join(", ")}]` : String(v);
}

/** The objective's tracked bearing: end_state.bearing, else the first bearing. */
export function trackedBearingName(objective: Document): string | null {
  return (objective.end_state?.bearing as string | undefined) ?? (objective.bearings?.[0]?.name as string | undefined) ?? null;
}

export function bearingValue(checkpoint: Document | null, name: string | null): number | null {
  if (!checkpoint || !name) return null;
  const b = (checkpoint.bearings_snapshot as Document[] | undefined)?.find((x) => x.name === name);
  return typeof b?.current === "number" ? b.current : null;
}

export type Reason = { kind: "failure" | "tap" | "manual_seed"; id?: string | null; summary: string };

// ---- apply_settings_change ---------------------------------------------------------------------

export async function applySettingsChange(input: { objective_id: string; field: string; value: unknown; reason: Reason; agent: string }) {
  const objectiveId = new ObjectId(input.objective_id);
  const objective = await db.collection("objectives").findOne({ _id: objectiveId });
  if (!objective) throw new Error(`No objective with id ${input.objective_id}`);
  const current = await currentConfig();

  if (current.status === "probation")
    return { applied: false, gate: { passed: false, why: `v${current.version} is still on probation; one change at a time` } };
  const check = gateChange(input.field, input.value, current.settings);
  if (!check.passed) return { applied: false, gate: check };

  const field = input.field as SettingsField;
  const lastCheckpoint = await db.collection("checkpoints").findOne({ objective_id: objectiveId }, { sort: { seq: -1 } });
  const bearingName = trackedBearingName(objective);
  let watchClass = "regression";
  const reasonId = input.reason.id ? new ObjectId(input.reason.id) : null;
  if (input.reason.kind === "failure" && reasonId) {
    const f = await db.collection("failures").findOne({ _id: reasonId });
    if (f?.class) watchClass = f.class as string;
  } else if (input.reason.kind === "tap" && reasonId) {
    const t = await db.collection("taps").findOne({ _id: reasonId });
    if (t?.trigger?.kind === "failure") {
      const f = await db.collection("failures").findOne({ _id: t.trigger.id });
      if (f?.class) watchClass = f.class as string;
    }
  }

  const now = new Date();
  const doc: HarnessConfig = {
    _id: new ObjectId(),
    version: current.version + 1,
    status: "probation",
    settings: { ...structuredClone(current.settings), [field]: check.value } as HarnessSettings,
    parent_version: current.version,
    change: { field, from: current.settings[field], to: check.value },
    reason: { kind: input.reason.kind, id: reasonId, summary: input.reason.summary },
    probation: {
      checkpoints_required: PROBATION_CHECKPOINTS,
      baseline_bearing: bearingValue(lastCheckpoint, bearingName),
      watch_class: watchClass,
      started_seq: (lastCheckpoint?.seq as number | undefined) ?? 0,
    },
    outcome: null,
    created_by: "surgeon",
    created_at: now,
  };

  const session = mongo.startSession();
  try {
    await session.withTransaction(async () => {
      await configs().insertOne(doc, { session });
      await configs().updateMany(
        { version: { $lt: doc.version }, status: { $in: CURRENT_STATUSES } },
        { $set: { status: "superseded" } },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }
  return {
    applied: true,
    gate: { passed: true },
    version: doc.version,
    status: doc.status,
    change: doc.change,
    probation: doc.probation,
    text: `Settings v${doc.version} (probation): ${field} ${describe(doc.change!.from)} → ${describe(doc.change!.to)}`,
  };
}

// ---- rollback ----------------------------------------------------------------------------------

async function rollbackTo(current: HarnessConfig, why: string, session: any) {
  const parent = await configs().findOne({ version: current.parent_version! }, { session });
  if (!parent) throw new Error(`parent v${current.parent_version} not found`);
  const now = new Date();
  await configs().updateOne(
    { _id: current._id },
    { $set: { status: "rolled_back", outcome: { decided_at: now, verdict: "rolled_back", why } } },
    { session },
  );
  const restored: HarnessConfig = {
    _id: new ObjectId(),
    version: (await configs().find({}, { session }).sort({ version: -1 }).limit(1).next())!.version + 1,
    status: "active",
    settings: structuredClone(parent.settings),
    parent_version: current.version,
    change: current.change ? { field: current.change.field, from: current.change.to, to: current.change.from } : null,
    reason: { kind: current.reason.kind, id: current.reason.id, summary: `Rollback of v${current.version}: ${why}` },
    probation: null,
    outcome: null,
    created_by: "surgeon",
    created_at: now,
  };
  await configs().insertOne(restored, { session });
  return restored;
}

export async function rollbackSettings(input: { reason: string; objective_id?: string; agent: string }) {
  const current = await currentConfig();
  if (current.parent_version === null) return { rolled_back: false, why: `v${current.version} has no parent to roll back to` };
  let restored!: HarnessConfig;
  const session = mongo.startSession();
  try {
    await session.withTransaction(async () => {
      restored = await rollbackTo(current, input.reason, session);
    });
  } finally {
    await session.endSession();
  }
  const text = `Settings v${current.version} rolled back (${input.reason}); v${current.parent_version}'s settings re-activated as v${restored.version}.`;
  await writeEvent(input.objective_id ? new ObjectId(input.objective_id) : null, "probation_verdict", input.agent, {
    version: current.version,
    verdict: "rolled_back",
    restored_version: restored.version,
    manual: true,
  }, text);
  return { rolled_back: true, rolled_back_version: current.version, active_version: restored.version, settings: restored.settings, text };
}

// ---- evaluate_probation ------------------------------------------------------------------------

export async function evaluateProbation(input: { objective_id: string; agent: string }) {
  const objectiveId = new ObjectId(input.objective_id);
  const current = await currentConfig();
  if (current.status !== "probation" || !current.probation) return { evaluated: false, why: "no settings version on probation", version: current.version };
  const p = current.probation;
  const objective = await db.collection("objectives").findOne({ _id: objectiveId });
  if (!objective) throw new Error(`No objective with id ${input.objective_id}`);
  const since = await db
    .collection("checkpoints")
    .find({ objective_id: objectiveId, seq: { $gt: p.started_seq } })
    .sort({ seq: -1 })
    .toArray();
  if (since.length < p.checkpoints_required)
    return {
      evaluated: false,
      why: `waiting: ${since.length}/${p.checkpoints_required} checkpoints since probation started`,
      version: current.version,
    };

  const latest = bearingValue(since[0] ?? null, trackedBearingName(objective));
  const recurred = await db
    .collection("failures")
    .countDocuments({ objective_id: objectiveId, class: p.watch_class, created_at: { $gt: current.created_at } });
  const bearingOk = p.baseline_bearing === null || (latest !== null && latest >= p.baseline_bearing);
  const kept = bearingOk && recurred === 0;
  const why = kept
    ? `bearing ${latest} ≥ baseline ${p.baseline_bearing} and no ${p.watch_class} in ${since.length} checkpoints`
    : [
        !bearingOk ? `bearing ${latest} < baseline ${p.baseline_bearing}` : "",
        recurred ? `${p.watch_class} recurred ${recurred}x` : "",
      ]
        .filter(Boolean)
        .join("; ");

  let restored: HarnessConfig | null = null;
  const session = mongo.startSession();
  try {
    await session.withTransaction(async () => {
      if (kept) {
        await configs().updateOne(
          { _id: current._id },
          { $set: { status: "kept", outcome: { decided_at: new Date(), verdict: "kept", why } } },
          { session },
        );
      } else {
        restored = await rollbackTo(current, why, session);
      }
      const text = kept
        ? `Probation passed: settings v${current.version} kept (${why}).`
        : `Probation failed: settings v${current.version} rolled back (${why}); v${current.parent_version}'s settings re-activated as v${restored!.version}.`;
      await writeEvent(
        objectiveId,
        "probation_verdict",
        input.agent,
        {
          version: current.version,
          verdict: kept ? "kept" : "rolled_back",
          why,
          change: current.change,
          restored_version: restored ? (restored as HarnessConfig).version : null,
        },
        text,
        session,
      );
    });
  } finally {
    await session.endSession();
  }
  const r = restored as HarnessConfig | null;
  return {
    evaluated: true,
    version: current.version,
    verdict: kept ? "kept" : "rolled_back",
    why,
    active_version: r ? r.version : current.version,
  };
}
