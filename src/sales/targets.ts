// Bearing targets for the sales task, from `bun run sales:ceiling` (14:58 run, seeded split 314/134):
//   empty rubric AUC 0.500 · 1 rule (client=Current) holdout 0.789
//   best simple additive rubric fit on train (greedy, log-odds points, support ≥ 15): holdout AUC 0.881,
//   A-grade holdout win rate 0.875 at A≥4 (coverage 36%) · holdout-peeking greedy upper bound 0.905
// Targets sit ~0.02 below the train-fit ceiling so the harness needs several honest iterations.
export const T_AUC = 0.86;
/** A-grade win rate target as a fraction (0..1), matching propose_rubric metrics.*.a_win_rate. */
export const T_WIN = 0.85;
/** Same target in percent, for the `a_grade_win_rate` bearing whose unit is "%". */
export const T_WIN_PCT = 85;

export const SALES_OBJECTIVE = "Qualify B2B deals: grade opportunities so A-grade deals actually close.";
export const SALES_BEARINGS = [
  { name: "holdout_auc", unit: "AUC", target: T_AUC },
  { name: "a_grade_win_rate", unit: "%", target: T_WIN_PCT },
] as const;
export const SALES_WAYPOINTS = ["Baseline rubric", "Top-3 signals", "Competitive & relationship signals", "Deal-shape signals", "Reach end state"] as const;
