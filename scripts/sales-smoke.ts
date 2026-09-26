// Live smoke test for the sales tools: load → baseline → better → overfit ×2 → invalid → get/best.
// Uses a throwaway objective id and deletes its own rubrics. Run: `bun run sales:smoke`.
import { mongo } from "../src/clients";
import { rubrics } from "../src/sales/data";
import { best_rubric, describe_data, get_rubric, propose_rubric, segment_stats, type Rule } from "../src/sales/tools";

const objective_id = `sales-smoke-${Date.now()}`;
const agent = "sales-smoke";
let failed = 0;
function check(cond: unknown, what: string) {
  console.log(`${cond ? "ok  " : "FAIL"} ${what}`);
  if (!cond) failed++;
}
const show = (label: string, r: any) =>
  console.log(`  ${label}: ${r.ok ? `v${r.version} holdout AUC ${r.metrics.holdout.auc} A-win ${r.metrics.holdout.a_win_rate} cov ${r.metrics.holdout.a_coverage} | train AUC ${r.metrics.train.auc} gap ${r.gap} flags [${r.flags}] "${r.change_summary}"` : `errors ${JSON.stringify(r.errors)}`}`);

try {
  const d = await describe_data();
  check(d.n_train > 300 && d.n_holdout > 120 && d.fields.length === 22, `describe_data: ${d.n_train} train / ${d.n_holdout} holdout, 22 fields`);
  const seg = await segment_stats({ field: "client", where: { competitors: "No" } });
  check(seg.ok && seg.segments.length > 0, "segment_stats client | competitors=No");

  const baseline = await propose_rubric({ objective_id, agent, rationale: "empty baseline", rules: [], thresholds: { A: 1, B: 0 } });
  show("baseline", baseline);
  check(baseline.ok && baseline.version === 1 && baseline.metrics.holdout.auc === 0.5 && baseline.flags.length === 0, "baseline: v1, AUC 0.5, no flags");

  const good: Rule[] = [
    { field: "client", equals: "Current", points: 2 },
    { field: "up_sale", equals: "Yes", points: 2 },
    { field: "competitors", equals: "Yes", points: -2 },
    { field: "posit_statm", equals: "Yes", points: 1 },
    { field: "att_t_client", equals: "Strategic account", points: 1 },
  ];
  const better = await propose_rubric({ objective_id, agent, rationale: "top signals", rules: good, thresholds: { A: 4, B: 2 } });
  show("good", better);
  check(better.ok && better.version === 2 && better.metrics.holdout.auc > 0.8 && better.flags.length === 0, "good: v2, holdout AUC > 0.8, no flags");
  check(better.ok && better.change_summary.includes("+ client=Current (+2)"), "good: change_summary diffs vs parent");

  const overfitA: Rule[] = [...good, { field: "seller", equals: "Seller 10", points: 5 }];
  const o1 = await propose_rubric({ objective_id, agent, rationale: "seller 10 closes", rules: overfitA, thresholds: { A: 4, B: 2 } });
  show("overfit (low support seller)", o1);
  check(o1.ok && o1.flags.includes("overfit_segment"), "overfit A: Seller 10 (7 train deals) flags overfit_segment");

  const tiny: Rule[] = [
    { field: "deal_type", equals: "Maintenance", points: 5 },
    { field: "product", equals: "Product I", points: 5 },
    { field: "product", equals: "Product E", points: -5 },
    { field: "source", equals: "Media", points: -5 },
    { field: "source", equals: "Direct mail", points: -5 },
    { field: "seller", equals: "Seller 8", points: 5 },
    { field: "seller", equals: "Seller 11", points: -5 },
    { field: "growth", equals: "Slow down", points: 5 },
  ];
  const o2 = await propose_rubric({ objective_id, agent, rationale: "small segments", rules: [...good, ...tiny], thresholds: { A: 5, B: 2 } });
  show("overfit (many small segments)", o2);
  check(o2.ok && o2.flags.includes("overfit_segment"), "overfit B: many small segments flags overfit_segment");

  const bad = await propose_rubric({
    objective_id,
    agent,
    rationale: "invalid",
    rules: [{ field: "budget" as never, equals: "Yes", points: 2 }, { field: "client", equals: "Maybe", points: 7 }],
    thresholds: { A: 1, B: 3 },
  });
  show("invalid", bad);
  check(!bad.ok && bad.flags[0] === "invalid_rubric" && bad.errors.length >= 4, "invalid: rejected with errors, flag invalid_rubric");
  check((await rubrics().countDocuments({ objective_id })) === 4, "invalid proposal saved no version");

  const latest = await get_rubric({ objective_id });
  check(latest?.version === 4 && latest.parent_version === 3, "get_rubric latest = v4 (parent v3)");
  check((await get_rubric({ objective_id, version: 2 }))?.rules.length === good.length, "get_rubric v2");
  const best = await best_rubric({ objective_id });
  console.log(`  best: v${best?.version} holdout AUC ${best?.metrics.holdout.auc}`);
  check(best && best.version >= 2, "best_rubric picks the highest holdout AUC");
  check(!JSON.stringify(best).includes('"split"'), "no row data in rubric docs");
} finally {
  const { deletedCount } = await rubrics().deleteMany({ objective_id });
  console.log(`cleaned ${deletedCount} smoke rubrics`);
  await mongo.close();
}
console.log(failed ? `${failed} check(s) FAILED` : "sales smoke passed");
process.exit(failed ? 1 : 0);
