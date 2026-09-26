# Sales task pack (14:52): deal-qualification rubric optimization

Replaces the invoice fixture as **the** demo task. Everything in `docs/CONTRACT.md` still holds: harness_config, surgeon and agent roles, sentinel, taps, events, immutable end state. This file adds the task.

## Story
Sales teams qualify deals with checklists (BANT/MEDDIC). The Waypoints harness runs unattended and keeps improving a **deal-qualification rubric**. A deterministic scorer grades each rubric against **real Won/Lost outcomes on held-out deals** the agent never sees. There's always another point of lift, overfitting is a real risk, and the harness has to learn to avoid it.

## Data (loaded by `bun run load:sales`, idempotent)
- **Source:** HF `markobo/B2B_Sales_data` (CC-BY-4.0). 448 real B2B opportunities, 227 Won / 221 Lost, semicolon CSV. Local copy: `data/b2b_sales.csv` (commit it; it's small) with attribution in `data/README.md`.
- **Atlas:** db `waypoints`, collection `opportunities`. One doc per row, keys snake_case: product, seller, authority, comp_size, competitors, purch_dept, partnership, budgt_alloc, forml_tend, rfi, rfp, growth, posit_statm, source, client, scope, strat_deal, cross_sale, up_sale, deal_type, needs_def, att_t_client. Plus `status` ("Won"/"Lost"), `won` (bool), `row` (int), and `split` ("train"/"holdout"): a fixed, seeded, stratified 70/30 split, so about 314 train and 134 holdout.
- **Holdout rows are never returned to the agent**, only aggregate metrics.

## Rubric (collection `rubrics`, one doc per version)
```js
{ _id, objective_id, version: 4, parent_version: 3,
  rules: [ { field: "client", equals: "Current", points: 3 }, { field: "competitors", equals: "Yes", points: -3 } ], // ≤ 25 rules, points int −5..5, field ∈ the 22 features, value must exist in data
  thresholds: { A: 5, B: 2 },            // score ≥ A → grade A, ≥ B → B, else C
  change_summary: "+ up_sale=Yes (+2)",  // computed by code as a diff vs the parent, not written by the model
  rationale: string,                      // model's one-liner
  metrics: {
    train:   { auc, a_win_rate, a_coverage, n },
    holdout: { auc, a_win_rate, a_coverage, n }
  },
  gap: 0.07,                              // train.auc − holdout.auc
  flags: ["overfit_segment"] | [],
  agent, created_at }
```
**Scoring runs in Atlas:** an aggregation pipeline sums rule points per opportunity with `$sum`/`$cond`. AUC (Mann-Whitney), A-grade win rate and A coverage are computed in TS from the pipeline's output.

## Task tools: `src/sales/tools.ts` exports plain async functions; the harness wraps them as local tools
- `describe_data()` → the fields, each value with its **train** count and **train** win rate, and the base train win rate.
- `segment_stats({ field, value?, where?: {field: value} })` → train-only win rates for segments.
- `propose_rubric({ objective_id, rules, thresholds, rationale, agent })` → validates, then either
  - `{ ok: false, errors }` and **no** version saved, or
  - `{ ok: true, version, metrics, gap, flags, change_summary }`.
  - The version number is the next number for this objective.
- `get_rubric({ objective_id, version? })` → a rubric doc (latest by default).
- `best_rubric({ objective_id })` → the highest holdout AUC so far.
- **Deterministic flags:**
  - `overfit_segment`: gap > 0.08, or any rule on a value with train support < 15
  - `invalid_rubric`: validation failed

## Objective, bearings, end state (the harness sets them with `set_objective` on `--fresh`)
- **Objective:** "Qualify B2B deals: grade opportunities so A-grade deals actually close."
- **Bearings:**
  - `holdout_auc` (unit "AUC", target **T_AUC**)
  - `a_grade_win_rate` (unit "%", target **T_WIN**)

  D sets T_AUC and T_WIN from a quick ceiling check: fit the best simple additive rubric offline, then target about 0.02 below it, so it takes roughly 5–10 iterations.
- **End state (immutable):** `holdout_auc ≥ T_AUC`.
- **Waypoints:** "Baseline rubric", "Top-3 signals", "Competitive & relationship signals", "Deal-shape signals", "Reach end state".

## Harness loop (`bun run harness`; `--task sales` is the default, invoice is kept as `--task invoice`)
1. `resume`, then `get_settings`, then `get_rubric` (the latest) or a baseline.
2. Each iteration: `segment_stats` as needed → `propose_rubric` → **checkpoint immediately** with `bearings_current` from the **holdout** metrics.
3. **The harness logs failures itself, in code:**
   - `overfit_segment` when flags include it
   - `invalid_rubric` on validation errors
   - `skipped_checkpoint` when the model proposes again without a checkpoint (the harness writes the missing checkpoint itself and logs this)
4. A regression (holdout AUC drops) is logged by the server automatically, as it already is.
5. Stop at the end state, or at max steps.
6. **Across runs, history is kept:** the next run's baseline is `best_rubric`.

## Fragments and the sentinel mapping
The server normalizes classes to kebab-case: `overfit-segment`, `invalid-rubric`, `skipped-checkpoint`, `regression`. Extend `FIX_FOR` in `src/sentinel.ts`; keep the invoice entries.
 (replaces the invoice ones; the invoice fragments can stay in the library)
| Failure class | Fragment the surgeon enables (probation) | Fragment text idea |
|---|---|---|
| `overfit_segment` | `min_support_15` | "Only add a rule for a value with ≥ 15 train deals; check segment_stats first." |
| `regression` | `one_change_per_iteration` | "Change exactly one rule per proposal, so each change's effect is measurable." |
| `skipped_checkpoint` | `checkpoint_every_eval` | "Checkpoint immediately after every propose_rubric, before anything else." |
| `invalid_rubric` | `check_schema_first` | "Call describe_data before proposing; use only listed fields and values." |

**Lean seed v1:** `["read_policies_first"]`, required_tools `["checkpoint"]`, threshold 0.25, model `z-ai/glm-5.3-flash`. Live demo runs with `DEMO_PROVIDER=` empty (OpenRouter GLM, ~90 tok/s); GB10 (`DEMO_PROVIDER=gb10`, ~30 tok/s) is for cheap background history runs only. **No Sonnet anywhere.**
**Probation verdict text** includes before/after counts for the watched class per version, e.g. "v1: 3 overfit proposals in 6 → v2: 0 in 4 → kept".

## History and replay
`demo:clean` **no longer** wipes history or resets `harness_config`. It only marks the open objective `status: "archived"`. `demo:clean --hard` wipes everything (use once before the final run history begins). The flight recorder's replay plays real history.
