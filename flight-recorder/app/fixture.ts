// ?demoFixture=1 — a scripted replay of the demo beats, client-side only. Never writes to Atlas.
type Doc = Record<string, any>;
export type FxStep = { after: number; alive?: boolean; change?: { coll: string; op: string; id: string; doc: Doc } };

const OBJ = "fx0000000000000000000001";
let n = 0;
const id = () => `fx${String(++n).padStart(22, "0")}`;

export function fixture(start: number): { snapshot: Doc; steps: FxStep[] } {
  n = 100;
  const at = (s: number) => new Date(start + s * 1000).toISOString();
  const bearing = (v: number) => [{ name: "tests_passing", current: v, target: 10, unit: "tests" }];
  const objective = {
    _id: OBJ,
    objective: "Make every test in demo/fixture/invoice.test.ts pass by fixing bugs in invoice.ts",
    end_state: { bearing: "tests_passing", target: 10, description: "All 10 invoice tests pass" },
    status: "active",
    bearings: [{ name: "tests_passing", target: 10, unit: "tests", current: 5 }],
    agent: "waypoints-harness",
    created_at: at(-60),
    updated_at: at(-60),
  };
  const v1 = {
    _id: id(), version: 1, status: "active",
    settings: { prompt_fragments: ["read_policies_first"], required_tools: ["checkpoint"], sentinel_threshold: 0.25, model: "z-ai/glm-5.3-flash" },
    parent_version: null, change: null, reason: { kind: "manual_seed", id: null, summary: "Seed settings v1" },
    probation: null, outcome: null, created_by: "seed", created_at: at(-70),
  };
  const cps: Doc[] = [];
  const cp = (seq: number, v: number, s: number, summary: string) => {
    const d = { _id: id(), objective_id: OBJ, seq, state_summary: summary, next_action: summary, bearings_snapshot: bearing(v), agent: "waypoints-harness", created_at: at(s) };
    cps.push(d);
    return d;
  };
  const fail = (cls: string, s: number, failure: string, context: string) => ({ _id: id(), objective_id: OBJ, class: cls, failure, context, agent: "waypoints-harness", created_at: at(s) });
  const ins = (coll: string, doc: Doc) => ({ coll, op: "insert", id: doc._id, doc });
  const ev = (kind: string, s: number, text: string, detail: Doc = {}) => ins("events", { _id: id(), objective_id: OBJ, kind, agent: "waypoints-harness", detail, text, created_at: at(s) });

  const c1 = cp(1, 5, -50, "5/10 passing");
  const snapshot = {
    objective, harness_config: [v1], checkpoints: [c1],
    failures: [fail("skipped_checkpoint", -45, "Model skipped the checkpoint after test run 2", "test run 2 under settings v1")],
    decisions: [], resumes: [{ _id: id(), objective_id: OBJ, resumed_by: "waypoints-harness", from_checkpoint_seq: null, created_at: at(-58) }],
    policies: [], taps: [], events: [], at: at(0),
  };
  const tapId = id();
  const v2 = {
    _id: id(), version: 2, status: "probation",
    settings: { ...v1.settings, prompt_fragments: ["read_policies_first", "verify_whole_suite"] },
    parent_version: 1, change: { field: "prompt_fragments", from: ["read_policies_first"], to: ["read_policies_first", "verify_whole_suite"] },
    reason: { kind: "tap", id: tapId, summary: "regression (risk 0.66): enable verify_whole_suite" },
    probation: { checkpoints_required: 2, baseline_bearing: 8, watch_class: "regression", started_seq: 5 },
    outcome: null, created_by: "surgeon", created_at: at(27),
  };
  const steps: FxStep[] = [
    { after: 1, alive: true },
    { after: 2, change: ins("checkpoints", cp(2, 7, 2, "7/10 passing")) },
    { after: 3, change: ins("failures", fail("skipped_checkpoint", 3, "Model skipped the checkpoint after test run 4", "test run 4 under settings v1")) },
    { after: 4, change: ins("failures", fail("skipped_checkpoint", 4, "Model skipped the checkpoint after test run 5", "test run 5 under settings v1")) },
    { after: 5, change: ins("checkpoints", cp(3, 7, 5, "7/10")) },
    { after: 6, alive: false },
    { after: 12, alive: true },
    { after: 12.5, change: ins("resumes", { _id: id(), objective_id: OBJ, resumed_by: "waypoints-harness", from_checkpoint_seq: 3, created_at: at(12.5) }) },
    { after: 18, change: ins("checkpoints", cp(4, 9, 18, "9/10")) },
    { after: 21, change: ins("checkpoints", cp(5, 8, 21, "REGRESSION 9→8")) },
    { after: 21.3, change: ins("failures", fail("regression", 21.3, 'Regression: "tests_passing" dropped from 9 to 8 at checkpoint 5.', "Checkpoint 5")) },
    { after: 21.4, change: ev("auto_failure", 21.4, "Bearing tests_passing dropped 9 → 8 at checkpoint 5; logged a regression.") },
    { after: 26, change: ins("taps", { _id: tapId, objective_id: OBJ, risk: 0.66, components: { similarity: 0.9, recurrence: 0, trend: 1 }, weights: { similarity: 0.4, recurrence: 0.3, trend: 0.3 }, decision: { tap: true, action: "adjust_settings", decided_by: "deterministic" }, settings_version_after: 2, status: "open", created_at: at(26) }) },
    { after: 27, change: { coll: "harness_config", op: "update", id: v1._id, doc: { ...v1, status: "superseded" } } },
    { after: 27.1, change: ins("harness_config", v2) },
    { after: 33, change: ev("settings_reload", 33, "waypoints-harness is running settings v1; told to reload v2.", { from_version: 1, to_version: 2 }) },
    { after: 38, change: ins("checkpoints", cp(6, 9, 38, "9/10")) },
    { after: 43, change: ins("checkpoints", cp(7, 10, 43, "10/10 all green")) },
    { after: 44, change: { coll: "harness_config", op: "update", id: v2._id, doc: { ...v2, status: "kept", outcome: { decided_at: at(44), verdict: "kept", why: "v1: 1 regression in 5 checkpoints → v2: 0 in 2; bearing 10 ≥ baseline 8" } } } },
    { after: 44.1, change: ev("probation_verdict", 44.1, "Settings v2 kept: bearing held and no regression recurred.", { version: 2, verdict: "kept" }) },
  ];
  return { snapshot, steps };
}
