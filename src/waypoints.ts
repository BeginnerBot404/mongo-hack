// Tool implementations. Each function takes validated input and returns a plain JSON-able object.
import { ObjectId, type Document } from "mongodb";
import { waypointsDb as db } from "./clients";
import { remember } from "./memory";

export type WaypointStatus = "pending" | "active" | "done";

export interface Bearing {
  name: string;
  target: number;
  unit: string;
  current: number | null;
  updated_at: Date | null;
}

export interface Waypoint {
  index: number;
  title: string;
  done_when: string;
  status: WaypointStatus;
  completed_at: Date | null;
}

export interface Objective {
  _id: ObjectId;
  objective: string;
  status: "active" | "completed";
  bearings: Bearing[];
  waypoints: Waypoint[];
  checkpoints_count: number;
  last_agent: string;
  agent: string;
  created_at: Date;
  updated_at: Date;
}

const objectives = () => db.collection<Objective>("objectives");
const col = (name: string) => db.collection(name);

export function toObjectId(id: string, field = "objective_id"): ObjectId {
  if (!ObjectId.isValid(id)) throw new Error(`${field} "${id}" is not a valid id`);
  return new ObjectId(id);
}

async function getObjective(id: ObjectId): Promise<Objective> {
  const found = await objectives().findOne({ _id: id });
  if (!found) throw new Error(`No objective with id ${id.toHexString()}`);
  return found;
}

async function touchObjective(id: ObjectId, agent: string, now: Date) {
  await objectives().updateOne({ _id: id }, { $set: { last_agent: agent, updated_at: now } });
}

export function normalizeClass(raw: string): string {
  const kebab = raw
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return kebab || "unclassified";
}

function withProgress(o: Objective) {
  const bearings = o.bearings.map((b) => ({
    name: b.name,
    target: b.target,
    unit: b.unit,
    current: b.current,
    delta_to_target: b.current === null ? null : b.target - b.current,
    updated_at: b.updated_at,
  }));
  const current_waypoint = o.waypoints.find((w) => w.status === "active") ?? null;
  return { bearings, waypoints: o.waypoints, current_waypoint };
}

// 1. set_objective
export async function setObjective(input: {
  objective: string;
  bearings: { name: string; target: number; unit: string; current?: number }[];
  waypoints: { title: string; done_when: string }[];
  agent: string;
}) {
  const now = new Date();
  const doc: Objective = {
    _id: new ObjectId(),
    objective: input.objective,
    status: "active",
    bearings: input.bearings.map((b) => ({
      name: b.name,
      target: b.target,
      unit: b.unit,
      current: b.current ?? null,
      updated_at: b.current === undefined ? null : now,
    })),
    waypoints: input.waypoints.map((w, index) => ({
      index,
      title: w.title,
      done_when: w.done_when,
      status: index === 0 ? "active" : "pending",
      completed_at: null,
    })),
    checkpoints_count: 0,
    last_agent: input.agent,
    agent: input.agent,
    created_at: now,
    updated_at: now,
  };
  await objectives().insertOne(doc);
  return { objective_id: doc._id, objective: doc.objective, status: doc.status, ...withProgress(doc), agent: input.agent, created_at: now };
}

// 2. checkpoint
export async function checkpoint(input: {
  objective_id: string;
  state_summary: string;
  open_threads: string[];
  next_action: string;
  bearings_current?: { name: string; current: number }[];
  waypoint_done?: number;
  agent: string;
}) {
  const objectiveId = toObjectId(input.objective_id);
  const now = new Date();
  // Atomic sequence number per objective.
  const bumped = await objectives().findOneAndUpdate(
    { _id: objectiveId },
    { $inc: { checkpoints_count: 1 } },
    { returnDocument: "after" },
  );
  if (!bumped) throw new Error(`No objective with id ${objectiveId.toHexString()}`);
  const seq = bumped.checkpoints_count;

  const bearings = bumped.bearings.map((b) => ({ ...b }));
  const unknownBearings: string[] = [];
  for (const update of input.bearings_current ?? []) {
    const bearing = bearings.find((b) => b.name === update.name);
    if (!bearing) {
      unknownBearings.push(update.name);
      continue;
    }
    bearing.current = update.current;
    bearing.updated_at = now;
  }

  const waypoints = bumped.waypoints.map((w) => ({ ...w }));
  let waypointCompleted: Waypoint | null = null;
  if (input.waypoint_done !== undefined) {
    const done = waypoints.find((w) => w.index === input.waypoint_done);
    if (!done) throw new Error(`waypoint_done ${input.waypoint_done} does not exist (0..${waypoints.length - 1})`);
    if (done.status !== "done") {
      done.status = "done";
      done.completed_at = now;
    }
    waypointCompleted = done;
    if (!waypoints.some((w) => w.status === "active")) {
      const next = waypoints.find((w) => w.status === "pending" && w.index > done.index) ?? waypoints.find((w) => w.status === "pending");
      if (next) next.status = "active";
    }
  }
  const allDone = waypoints.length > 0 && waypoints.every((w) => w.status === "done");

  await objectives().updateOne(
    { _id: objectiveId },
    { $set: { bearings, waypoints, status: allDone ? "completed" : "active", last_agent: input.agent, updated_at: now } },
  );

  const tokenEstimate = Math.ceil((input.state_summary.length + input.open_threads.join("\n").length) / 4);
  const activeWaypoint = waypoints.find((w) => w.status === "active") ?? null;
  const checkpointDoc = {
    _id: new ObjectId(),
    objective_id: objectiveId,
    seq,
    state_summary: input.state_summary,
    open_threads: input.open_threads,
    next_action: input.next_action,
    bearings_snapshot: bearings.map((b) => ({ name: b.name, current: b.current, target: b.target, unit: b.unit })),
    active_waypoint_index: activeWaypoint?.index ?? null,
    waypoint_completed_index: waypointCompleted?.index ?? null,
    token_estimate: tokenEstimate,
    agent: input.agent,
    created_at: now,
  };
  await col("checkpoints").insertOne(checkpointDoc);

  await remember({
    kind: "checkpoint",
    source_id: checkpointDoc._id,
    objective_id: objectiveId,
    text: [
      `Checkpoint ${seq}: ${input.state_summary}`,
      input.open_threads.length ? `Open threads: ${input.open_threads.join("; ")}` : "",
      `Next action: ${input.next_action}`,
    ]
      .filter(Boolean)
      .join("\n"),
    agent: input.agent,
    created_at: now,
  });

  return {
    checkpoint_id: checkpointDoc._id,
    seq,
    token_estimate: tokenEstimate,
    current_waypoint: activeWaypoint,
    objective_status: allDone ? "completed" : "active",
    ...(unknownBearings.length ? { unknown_bearings_ignored: unknownBearings } : {}),
  };
}

// 3. resume
export async function resume(input: { objective_id?: string; agent: string }) {
  let objective: Objective | null;
  if (input.objective_id) {
    objective = await getObjective(toObjectId(input.objective_id));
  } else {
    objective = await objectives().findOne({ status: "active" }, { sort: { updated_at: -1 } });
    if (!objective) throw new Error("No active objective found. Call set_objective first, or pass objective_id.");
  }
  const objectiveId = objective._id;

  const [lastCheckpoint, lastDecisions, recentFailures, policies, checkpointsCount] = await Promise.all([
    col("checkpoints").findOne({ objective_id: objectiveId }, { sort: { seq: -1 } }),
    col("decisions").find({ objective_id: objectiveId }).sort({ created_at: -1 }).limit(3).toArray(),
    col("failures").find({ objective_id: objectiveId }).sort({ created_at: -1 }).limit(3).toArray(),
    col("policies").find({ objective_id: objectiveId, status: "active" }).sort({ created_at: 1 }).toArray(),
    col("checkpoints").countDocuments({ objective_id: objectiveId }),
  ]);

  const policySources = new Map(
    (
      await col("failures")
        .find({ _id: { $in: policies.map((p) => p.from_failure_id) } }, { projection: { agent: 1 } })
        .toArray()
    ).map((f) => [String(f._id), f.agent as string]),
  );

  const now = new Date();
  const previousAgent = objective.last_agent ?? (lastCheckpoint?.agent as string | undefined) ?? null;
  await col("resumes").insertOne({
    objective_id: objectiveId,
    resumed_by: input.agent,
    previous_agent: previousAgent,
    from_checkpoint_id: lastCheckpoint?._id ?? null,
    from_checkpoint_seq: lastCheckpoint?.seq ?? null,
    agent: input.agent,
    created_at: now,
  });

  return {
    objective_id: objectiveId,
    objective: objective.objective,
    objective_status: objective.status,
    ...withProgress(objective),
    last_checkpoint: lastCheckpoint,
    open_threads: (lastCheckpoint?.open_threads as string[] | undefined) ?? [],
    next_action: (lastCheckpoint?.next_action as string | undefined) ?? null,
    last_decisions: lastDecisions,
    recent_failures: recentFailures.map((f) => ({
      failure_id: f._id,
      failure: f.failure,
      class: f.class,
      context: f.context,
      postmortem: f.postmortem,
      agent: f.agent,
      created_at: f.created_at,
    })),
    policies: policies.map((p) => ({
      policy_id: p._id,
      rule: p.rule,
      class: p.class,
      version: p.version,
      from_failure_id: p.from_failure_id,
      from_failure_agent: policySources.get(String(p.from_failure_id)) ?? null,
      adopted_by: p.agent ?? null,
    })),
    resumed_by: input.agent,
    previous_agent: previousAgent,
    checkpoints_count: checkpointsCount,
  };
}

// 4. log_decision
export async function logDecision(input: { objective_id: string; decision: string; rationale: string; evidence?: string; agent: string }) {
  const objectiveId = toObjectId(input.objective_id);
  await getObjective(objectiveId);
  const now = new Date();
  const doc = {
    _id: new ObjectId(),
    objective_id: objectiveId,
    decision: input.decision,
    rationale: input.rationale,
    evidence: input.evidence ?? null,
    agent: input.agent,
    created_at: now,
  };
  await col("decisions").insertOne(doc);
  await touchObjective(objectiveId, input.agent, now);
  await remember({
    kind: "decision",
    source_id: doc._id,
    objective_id: objectiveId,
    text: [`Decision: ${input.decision}`, `Rationale: ${input.rationale}`, input.evidence ? `Evidence: ${input.evidence}` : ""]
      .filter(Boolean)
      .join("\n"),
    agent: input.agent,
    created_at: now,
  });
  return { decision_id: doc._id };
}

// 5. log_failure (postmortem is deterministic, no LLM)
export async function logFailure(input: { objective_id: string; failure: string; class: string; context: string; agent: string }) {
  const objectiveId = toObjectId(input.objective_id);
  await getObjective(objectiveId);
  const failureClass = normalizeClass(input.class);
  const now = new Date();

  const [priorSameClass, lastCheckpoint] = await Promise.all([
    col("failures").find({ objective_id: objectiveId, class: failureClass }, { projection: { _id: 1 } }).sort({ created_at: 1 }).toArray(),
    col("checkpoints").findOne({ objective_id: objectiveId }, { sort: { seq: -1 } }),
  ]);
  const nextAction = (lastCheckpoint?.next_action as string | undefined) ?? "the next attempt";
  const occurrences = priorSameClass.length + 1;

  const postmortem = {
    what_happened: input.failure,
    context: input.context,
    class: failureClass,
    occurrences_of_class: occurrences,
    prior_failures_same_class: priorSameClass.map((f) => f._id),
    suggested_policy: `Before ${lowerFirst(nextAction)}, check for ${failureClass}.`,
    is_recurring: occurrences >= 2,
  };
  const doc = {
    _id: new ObjectId(),
    objective_id: objectiveId,
    failure: input.failure,
    class: failureClass,
    class_as_reported: input.class,
    context: input.context,
    postmortem,
    agent: input.agent,
    created_at: now,
  };
  await col("failures").insertOne(doc);
  await touchObjective(objectiveId, input.agent, now);
  await remember({
    kind: "failure",
    source_id: doc._id,
    objective_id: objectiveId,
    text: [`Failure (${failureClass}): ${input.failure}`, `Context: ${input.context}`, `Suggested policy: ${postmortem.suggested_policy}`].join("\n"),
    agent: input.agent,
    created_at: now,
  });
  return { failure_id: doc._id, postmortem };
}

function lowerFirst(s: string): string {
  const trimmed = s.trim().replace(/[.\s]+$/, "");
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
}

// 7. adapt (deterministic gate: the failure class must have recurred, or the caller explicitly approves)
export const ADAPT_MIN_OCCURRENCES = 2;

export async function adapt(input: { objective_id: string; failure_id: string; explicit_approval?: boolean; agent: string }) {
  const objectiveId = toObjectId(input.objective_id);
  const failureId = toObjectId(input.failure_id, "failure_id");
  const failure = await col("failures").findOne({ _id: failureId, objective_id: objectiveId });
  if (!failure) throw new Error(`No failure ${failureId.toHexString()} on objective ${objectiveId.toHexString()}`);

  const occurrences = await col("failures").countDocuments({ objective_id: objectiveId, class: failure.class });
  const passed = occurrences >= ADAPT_MIN_OCCURRENCES || input.explicit_approval === true;
  const gate = {
    passed,
    rule: `class must have at least ${ADAPT_MIN_OCCURRENCES} occurrences on this objective, or explicit_approval must be true`,
    occurrences_of_class: occurrences,
    explicit_approval: input.explicit_approval === true,
  };
  if (!passed) return { adopted: false, gate };

  const now = new Date();
  const policies = col("policies");
  const previous = await policies.find({ objective_id: objectiveId, class: failure.class }).sort({ version: -1 }).limit(1).toArray();
  const version = ((previous[0]?.version as number | undefined) ?? 0) + 1;
  const superseded = await policies.updateMany(
    { objective_id: objectiveId, class: failure.class, status: "active" },
    { $set: { status: "superseded", superseded_at: now } },
  );
  const doc = {
    _id: new ObjectId(),
    objective_id: objectiveId,
    rule: (failure.postmortem as Document | undefined)?.suggested_policy ?? `Check for ${failure.class} before acting.`,
    class: failure.class,
    from_failure_id: failureId,
    version,
    status: "active",
    reversible: true,
    gate,
    agent: input.agent,
    created_at: now,
  };
  await policies.insertOne(doc);
  await touchObjective(objectiveId, input.agent, now);
  return { adopted: true, policy_id: doc._id, rule: doc.rule, class: doc.class, version, superseded_count: superseded.modifiedCount, gate };
}

export async function listPolicies(input: { objective_id?: string; status?: "active" | "superseded" | "any" }) {
  const filter: Document = {};
  if (input.objective_id) filter.objective_id = toObjectId(input.objective_id);
  if (input.status && input.status !== "any") filter.status = input.status;
  const policies = await col("policies").find(filter).sort({ created_at: -1 }).limit(100).toArray();
  return { count: policies.length, policies };
}
