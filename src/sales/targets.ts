// Bearing targets for the sales task, from `bun run sales:ceiling` (14:58 run, seeded split 314/134):
//   empty rubric AUC 0.500 · 1 rule (client=Current) holdout 0.789
//   best simple additive rubric fit on train (greedy, log-odds points, support ≥ 15): holdout AUC 0.881,
//   A-grade holdout win rate 0.875 at A≥4 (coverage 36%) · holdout-peeking greedy upper bound 0.905
// The agent sees holdout AUC after every proposal, so its effective ceiling is the holdout-peeking one (0.905).
// A 5-rule hand rubric already scores 0.855 and a low-support overfit one 0.862, so T_AUC sits above both:
// 0.875 = 0.03 below the reachable ceiling and ~0.02 above what a quick or overfit rubric gets.
export const T_AUC = 0.89; // above the honest train-only ceiling (0.881): reaching it takes sustained iteration, where overfitting and regressions really happen
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
