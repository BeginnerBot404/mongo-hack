// harness_config: versioned harness settings behind a deterministic gate.
// Writes (apply / rollback / evaluate) are only exposed by the surgeon role.
import { ObjectId, type Document } from "mongodb";
import { mongo, waypointsDb as db } from "./clients";
import {
  CONTEXT_SOURCES,
  FRAGMENT_IDS,
  GRANTABLE_TOOLS,
  REASONING_MODES,
  REQUIRABLE_TOOLS,
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
/** Outreach probation is longer: one checkpoint per submitted draft, so 3 drafts under the new settings. */
export const OUTREACH_PROBATION_CHECKPOINTS = 3;
/**
 * apply_settings_change field macro for the outreach guardrail axis: ONE version that adds the tool (value, e.g.
 * "precheck_email") to BOTH granted_tools and required_tools. Stored as change {field: "granted_tools", from, to,
 * also: {field: "required_tools", from, to}}. It is the only way a version changes two fields.
 */
export const GUARDRAIL_MACRO = "guardrail";

/** Outreach objectives: objective.task === "outreach", or a qa_pass_rate bearing. */
export function isOutreach(objective: Document | null | undefined): boolean {
  if (!objective) return false;
  if (objective.task === "outreach") return true;
  const names = [objective.end_state?.bearing, ...((objective.bearings as Document[] | undefined) ?? []).map((b) => b?.name)];
  return names.includes("qa_pass_rate");
}

export interface HarnessConfig {
  _id: ObjectId;
  version: number;
  status: ConfigStatus;
  settings: HarnessSettings;
  parent_version: number | null;
  change: { field: SettingsField; from: unknown; to: unknown; also?: { field: SettingsField; from: unknown; to: unknown } } | null;
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
        required_tools: { bsonType: "array", uniqueItems: true, items: { enum: [...REQUIRABLE_TOOLS] } },
        sentinel_threshold: { bsonType: "number", minimum: 0, maximum: 1 },
        model: { enum: [...MODELS] },
        context_sources: { bsonType: "array", uniqueItems: true, items: { enum: [...CONTEXT_SOURCES] } },
        granted_tools: { bsonType: "array", uniqueItems: true, items: { enum: [...GRANTABLE_TOOLS] } },
        reasoning: { enum: [...REASONING_MODES] },
      },
    },
    parent_version: { bsonType: ["number", "null"] },
    change: nullable({
      required: ["field", "from", "to"],
      additionalProperties: false,
      properties: {
        field: { enum: [...SETTINGS_FIELDS] },
        from: changeValue,
        to: changeValue,
        also: {
          bsonType: "object",
          required: ["field", "from", "to"],
          additionalProperties: false,
          properties: { field: { enum: [...SETTINGS_FIELDS] }, from: changeValue, to: changeValue },
        },
      },
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
  return { version: c.version, status: c.status, settings: c.settings, fragments: getFragments(c.settings.prompt_fragments), outcome: c.outcome, reason: c.reason };
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
      result = strArray(value, REQUIRABLE_TOOLS, "required_tools");
      break;
    case "context_sources":
      result = strArray(value, CONTEXT_SOURCES, "context_sources");
      break;
    case "granted_tools":
      result = strArray(value, GRANTABLE_TOOLS, "granted_tools");
      break;
    case "reasoning":
      result =
        typeof value === "string" && (REASONING_MODES as readonly string[]).includes(value)
          ? { passed: true, value }
          : { passed: false, why: `reasoning must be one of ${REASONING_MODES.join(", ")}` };
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

export async function applySettingsChange(input: {
  objective_id: string;
  field: string;
  value: unknown;
  reason: Reason;
  watch_class?: string;
  agent: string;
}) {
  const objectiveId = new ObjectId(input.objective_id);
  const objective = await db.collection("objectives").findOne({ _id: objectiveId });
  if (!objective) throw new Error(`No objective with id ${input.objective_id}`);
  const current = await currentConfig();

  if (current.status === "probation")
    return { applied: false, gate: { passed: false, why: `v${current.version} is still on probation; one change at a time` } };
  // Guardrail macro: one version adding a tool to granted_tools AND required_tools (see GUARDRAIL_MACRO).
  let also: { field: SettingsField; from: unknown; to: unknown } | undefined;
  let fieldName = input.field;
  let value = input.value;
  if (input.field === GUARDRAIL_MACRO) {
    const tool = Array.isArray(input.value) ? input.value[0] : input.value;
    if (typeof tool !== "string" || !(GRANTABLE_TOOLS as readonly string[]).includes(tool) || !(REQUIRABLE_TOOLS as readonly string[]).includes(tool))
      return { applied: false, gate: { passed: false, why: `guardrail value must be a tool that can be both granted and required (precheck_email)` } };
    const s = current.settings;
    const grant = s.granted_tools.includes(tool as never) ? null : [...s.granted_tools, tool];
    const require = s.required_tools.includes(tool as never) ? null : [...s.required_tools, tool];
    if (!grant && !require) return { applied: false, gate: { passed: false, why: `${tool} is already granted and required` } };
    if (grant && require) {
      const r = gateChange("required_tools", require, s);
      if (!r.passed) return { applied: false, gate: r };
      also = { field: "required_tools", from: s.required_tools, to: r.value };
    }
    fieldName = grant ? "granted_tools" : "required_tools";
    value = grant ?? require;
  }
  const check = gateChange(fieldName, value, current.settings);
  if (!check.passed) return { applied: false, gate: check };

  const field = fieldName as SettingsField;
  const lastCheckpoint = await db.collection("checkpoints").findOne({ objective_id: objectiveId }, { sort: { seq: -1 } });
  const bearingName = trackedBearingName(objective);
  let watchClass = input.watch_class ?? "regression";
  const reasonId = input.reason.id ? new ObjectId(input.reason.id) : null;
  if (input.watch_class) {
    // caller named the class to watch
  } else if (input.reason.kind === "failure" && reasonId) {
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
    settings: { ...structuredClone(current.settings), [field]: check.value, ...(also ? { [also.field]: also.to } : {}) } as HarnessSettings,
    parent_version: current.version,
    change: { field, from: current.settings[field], to: check.value, ...(also ? { also } : {}) },
    reason: { kind: input.reason.kind, id: reasonId, summary: input.reason.summary },
    probation: {
      checkpoints_required: isOutreach(objective) ? OUTREACH_PROBATION_CHECKPOINTS : PROBATION_CHECKPOINTS,
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
    text:
      `Settings v${doc.version} (probation): ${field} ${describe(doc.change!.from)} → ${describe(doc.change!.to)}` +
      (also ? ` and ${also.field} ${describe(also.from)} → ${describe(also.to)}` : ""),
  };
}

// ---- rollback ----------------------------------------------------------------------------------

async function rollbackTo(current: HarnessConfig, why: string, session: any) {
  const parent = await configs().findOne({ version: current.parent_version! }, { session });
  if (!parent) throw new Error(`parent v${current.parent_version} not found`);
  const now = new Date();
  // Only a version still on probation can be rolled back. Two concurrent evaluations of the same version
  // (the sentinel handles checkpoints concurrently) must not both roll it back; the loser aborts its transaction.
  const marked = await configs().updateOne(
    { _id: current._id, status: "probation" },
    { $set: { status: "rolled_back", outcome: { decided_at: now, verdict: "rolled_back", why } } },
    { session },
  );
  if (marked.matchedCount === 0) throw new Error(`v${current.version} is no longer on probation; already decided`);
  const restored: HarnessConfig = {
    _id: new ObjectId(),
    version: (await configs().find({}, { session }).sort({ version: -1 }).limit(1).next())!.version + 1,
    status: "active",
    settings: structuredClone(parent.settings),
    parent_version: current.version,
    change: current.change
      ? {
          field: current.change.field,
          from: current.change.to,
          to: current.change.from,
          ...(current.change.also ? { also: { field: current.change.also.field, from: current.change.also.to, to: current.change.also.from } } : {}),
        }
      : null,
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
  let kept: boolean;
  let why: string;
  if (isOutreach(objective)) {
    ({ kept, why } = await outreachVerdict(objectiveId, current, latest));
  } else {
  const recurred = await db
    .collection("failures")
    .countDocuments({ objective_id: objectiveId, class: p.watch_class, created_at: { $gt: current.created_at } });
  const bearingOk = p.baseline_bearing === null || (latest !== null && latest >= p.baseline_bearing);
  kept = bearingOk && recurred === 0;
  // Before/after on the watched class: parent version's window vs this version's, counted in checkpoints.
  const [before, cpBefore] = await Promise.all([
    db.collection("failures").countDocuments({ objective_id: objectiveId, class: p.watch_class, created_at: { $lte: current.created_at } }),
    db.collection("checkpoints").countDocuments({ objective_id: objectiveId, seq: { $lte: p.started_seq } }),
  ]);
  const delta = `v${current.parent_version}: ${before} ${p.watch_class} in ${cpBefore} checkpoints → v${current.version}: ${recurred} in ${since.length}`;
  why = kept
    ? `${delta}; bearing ${latest} ≥ baseline ${p.baseline_bearing}`
    : [delta,
        !bearingOk ? `bearing ${latest} < baseline ${p.baseline_bearing}` : "",
        recurred ? `${p.watch_class} recurred ${recurred}x` : "",
      ]
        .filter(Boolean)
        .join("; ");
  }

  let restored: HarnessConfig | null = null;
  const session = mongo.startSession();
  try {
    await session.withTransaction(async () => {
      if (kept) {
        const marked = await configs().updateOne(
          { _id: current._id, status: "probation" },
          { $set: { status: "kept", outcome: { decided_at: new Date(), verdict: "kept", why } } },
          { session },
        );
        if (marked.matchedCount === 0) throw new Error(`v${current.version} is no longer on probation; already decided`);
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
  } catch (err) {
    // Another evaluation decided this version first: not an error, just nothing left to do.
    if (err instanceof Error && err.message.includes("already decided")) {
      return { evaluated: false, version: current.version, why: err.message };
    }
    throw err;
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

// ---- outreach verdict --------------------------------------------------------------------------

const pctText = (v: number | null) => (v === null ? "n/a" : `${Math.round(v)}%`);

/**
 * Outreach probation: kept if the watched QA class's rate (per draft) went down and qa_pass_rate didn't drop.
 * A reasoning change made for a stall (watch_class "stall") is kept only if the pass rate went up.
 * why reads like: "invented-fact: 5 in 8 drafts → 0 in 3; pass rate 38% → 67%. Kept."
 */
async function outreachVerdict(objectiveId: ObjectId, current: HarnessConfig, latest: number | null): Promise<{ kept: boolean; why: string }> {
  const p = current.probation!;
  const drafts = db.collection("drafts");
  const count = (created: Document, cls?: string) =>
    drafts.countDocuments({ objective_id: objectiveId, created_at: created, ...(cls ? { "qa.failures.class": cls } : {}) });
  const [bHits, bN, aHits, aN] = await Promise.all([
    count({ $lte: current.created_at }, p.watch_class),
    count({ $lte: current.created_at }),
    count({ $gt: current.created_at }, p.watch_class),
    count({ $gt: current.created_at }),
  ]);
  const before = bN ? bHits / bN : 0;
  const after = aN ? aHits / aN : 0;
  const base = p.baseline_bearing;
  const passOk = base === null || (latest !== null && latest >= base);
  let kept: boolean;
  let classPart: string;
  if (p.watch_class === "stall") {
    kept = base === null ? passOk : latest !== null && latest > base;
    classPart = `stall: pass rate flat before the change`;
  } else {
    kept = passOk && (after < before || (bHits === 0 && aHits === 0));
    classPart = `${p.watch_class}: ${bHits} in ${bN} drafts → ${aHits} in ${aN}`;
  }
  const why = `${classPart}; pass rate ${pctText(base)} → ${pctText(latest)}. ${kept ? "Kept" : "Rolled back"}.`;
  return { kept, why };
}
