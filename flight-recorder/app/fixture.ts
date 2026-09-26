// ?demoFixture=1 — a scripted replay of the demo beats, client-side only. Never writes to Atlas.
type Doc = Record<string, any>;
export type FxStep = { after: number; alive?: boolean; change?: { coll: string; op: string; id: string; doc: Doc } };

const OBJ = "fx0000000000000000000001";
let n = 0;
const id = () => `fx${String(++n).padStart(22, "0")}`;

export function fixture(start: number): { snapshot: Doc; steps: FxStep[] } {
  n = 100;
  const at = (s: number) => new Date(start + s * 1000).toISOString();
  // Sales-shaped: holdout AUC (continuous) toward an immutable 0.82.
  const AUC: Record<number, number> = { 5: 0.612, 7: 0.668, 9: 0.741, 8: 0.703, 10: 0.824 };
  const bearing = (v: number) => [{ name: "holdout_auc", current: AUC[v] ?? v, target: 0.82, unit: "AUC" }];
  const objective = {
    _id: OBJ,
    objective: "Qualify B2B deals: grade opportunities so A-grade deals actually close.",
    end_state: { bearing: "holdout_auc", target: 0.82, description: "holdout AUC ≥ 0.82" },
    status: "active",
    bearings: [{ name: "holdout_auc", target: 0.82, unit: "AUC", current: 0.612 }],
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
  const rub = (version: number, auc: number, change: string, s: number, flags: string[] = [], gap = 0.04) => ({
    _id: id(), objective_id: OBJ, version, parent_version: version - 1, rules: [], thresholds: { A: 5, B: 2 },
    change_summary: change, rationale: "fixture rationale", metrics: { train: { auc: auc + gap }, holdout: { auc, a_win_rate: 0.5 + auc / 3, a_coverage: 0.3, n: 134 } },
    gap, flags, agent: "waypoints-harness", created_at: at(s),
  });
  const ins = (coll: string, doc: Doc) => ({ coll, op: "insert", id: doc._id, doc });
  const ev = (kind: string, s: number, text: string, detail: Doc = {}) => ins("events", { _id: id(), objective_id: OBJ, kind, agent: "waypoints-harness", detail, text, created_at: at(s) });

  const c1 = cp(1, 5, -50, "5/10 passing");
  const snapshot = {
    objective, harness_config: [v1], checkpoints: [c1],
    failures: [fail("skipped_checkpoint", -45, "Model skipped the checkpoint after test run 2", "test run 2 under settings v1")],
    decisions: [], resumes: [{ _id: id(), objective_id: OBJ, resumed_by: "waypoints-harness", from_checkpoint_seq: null, created_at: at(-58) }],
    policies: [], taps: [], events: [], rubrics: [rub(1, 0.612, "baseline", -51)], at: at(0),
  };
  const tapId = id();
  const v2 = {
    _id: id(), version: 2, status: "probation",
    settings: { ...v1.settings, prompt_fragments: ["read_policies_first", "one_change_per_iteration"] },
    parent_version: 1, change: { field: "prompt_fragments", from: ["read_policies_first"], to: ["read_policies_first", "one_change_per_iteration"] },
    reason: { kind: "tap", id: tapId, summary: "regression (risk 0.66): enable one_change_per_iteration" },
    probation: { checkpoints_required: 2, baseline_bearing: 8, watch_class: "regression", started_seq: 5 },
    outcome: null, created_by: "surgeon", created_at: at(27),
  };
  const steps: FxStep[] = [
    { after: 1, alive: true },
    { after: 1.8, change: ins("rubrics", rub(2, 0.668, "+ client=Current (+3), + competitors=Yes (−3)", 1.8)) },
    { after: 2, change: ins("checkpoints", cp(2, 7, 2, "7/10 passing")) },
    { after: 3, change: ins("failures", fail("skipped_checkpoint", 3, "Model skipped the checkpoint after test run 4", "test run 4 under settings v1")) },
    { after: 4, change: ins("failures", fail("skipped_checkpoint", 4, "Model skipped the checkpoint after test run 5", "test run 5 under settings v1")) },
    { after: 5, change: ins("checkpoints", cp(3, 7, 5, "7/10")) },
    { after: 6, alive: false },
    { after: 12, alive: true },
    { after: 12.5, change: ins("resumes", { _id: id(), objective_id: OBJ, resumed_by: "waypoints-harness", from_checkpoint_seq: 3, created_at: at(12.5) }) },
    { after: 17.8, change: ins("rubrics", rub(3, 0.741, "+ up_sale=Yes (+2)", 17.8)) },
    { after: 18, change: ins("checkpoints", cp(4, 9, 18, "9/10")) },
    { after: 20.8, change: ins("rubrics", rub(4, 0.703, "+ source=Referral (+5), − up_sale=Yes", 20.8, ["overfit_segment"], 0.12)) },
    { after: 21, change: ins("checkpoints", cp(5, 8, 21, "REGRESSION 9→8")) },
    { after: 21.3, change: ins("failures", { ...fail("regression", 21.3, 'Regression: "tests_passing" dropped from 0.741 to 0.703 at checkpoint 5.', "Checkpoint 5"), _id: "fxreg" }) },
    { after: 21.4, change: ev("auto_failure", 21.4, "Bearing tests_passing dropped 9 → 8 at checkpoint 5; logged a regression.") },
    { after: 26, change: ins("taps", { _id: tapId, objective_id: OBJ, risk: 0.66, components: { similarity: 0.9, recurrence: 0, trend: 1 }, weights: { similarity: 0.4, recurrence: 0.3, trend: 0.3 }, trigger: { kind: "failure", id: "fxreg" }, decision: { tap: true, action: "adjust_settings", decided_by: "deterministic" }, settings_version_after: 2, status: "open", created_at: at(26) }) },
    { after: 27, change: { coll: "harness_config", op: "update", id: v1._id, doc: { ...v1, status: "superseded" } } },
    { after: 27.1, change: ins("harness_config", v2) },
    { after: 33, change: ev("settings_reload", 33, "waypoints-harness is running settings v1; told to reload v2.", { from_version: 1, to_version: 2 }) },
    { after: 38, change: ins("checkpoints", cp(6, 9, 38, "9/10")) },
    { after: 42.8, change: ins("rubrics", rub(5, 0.824, "+ strat_deal=Yes (+2)", 42.8)) },
    { after: 43, change: ins("checkpoints", cp(7, 10, 43, "10/10 all green")) },
    { after: 44, change: { coll: "harness_config", op: "update", id: v2._id, doc: { ...v2, status: "kept", outcome: { decided_at: at(44), verdict: "kept", why: "v1: 1 regression in 5 checkpoints → v2: 0 in 2; bearing 10 ≥ baseline 8" } } } },
    { after: 44.1, change: ev("probation_verdict", 44.1, "Settings v2 kept: bearing held and no regression recurred.", { version: 2, verdict: "kept" }) },
  ];
  return { snapshot, steps };
}
