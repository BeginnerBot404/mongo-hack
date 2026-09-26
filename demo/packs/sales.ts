// Sales task pack: improve a deal-qualification rubric, graded on held-out real Won/Lost outcomes (docs/SALES-PACK.md).
// The model explores train-only stats and proposes rubrics; the deterministic scorer (src/sales/tools.ts, in Atlas)
// grades them. The harness stamps bearings from HOLDOUT metrics, logs overfit/invalid failures itself, and stops
// at the immutable end state (holdout AUC ≥ T_AUC).
import { tool } from "@langchain/core/tools";
import * as z from "zod";
import * as S from "../../src/sales/tools";
import { rubrics } from "../../src/sales/data";
import { bold, clip, cyan, dim, green, log, red, yellow } from "../term";
import type { PackCtx, TaskPack } from "./types";

import { T_AUC, T_WIN_PCT as T_WIN, SALES_OBJECTIVE } from "../../src/sales/targets";


const pct = (x: number) => Math.round(x * 100);
const f2 = (x: number | null | undefined) => (typeof x === "number" ? x.toFixed(2) : "—");
const f3 = (x: number | null | undefined) => (typeof x === "number" ? x.toFixed(3) : "—");
const ruleStr = (r: S.Rule) => `${r.field}=${r.equals} (${r.points > 0 ? "+" : ""}${r.points})`;

type Best = { version: number; auc: number; win: number; rules: S.Rule[]; thresholds: S.Thresholds; objective_id: string; earlier: boolean };

export async function salesPack(ctx: PackCtx): Promise<TaskPack> {
  let describe: S.DescribeDataResult | null = null;
  const support = new Map<string, number>(); // "field=value" -> train n
  async function loadSupport() {
    if (describe) return describe;
    describe = await S.describe_data();
    for (const f of describe.fields) for (const v of f.values) support.set(`${f.field}=${v.value}`, v.n);
    return describe;
  }

  let last: (Extract<S.ProposeRubricResult, { ok: true }> & { rules: S.Rule[] }) | null = null;
  let lastAuc: number | null = null; // holdout AUC of the rubric we are improving on
  let bestAuc = 0;
  let proposals = 0, reached = false;
  let tIter = Date.now();
  const trajectory: string[] = [];
  const bump = (k: string) => (ctx.stat()[k] = (ctx.stat()[k] ?? 0) + 1);

  const describeTool = tool(async () => JSON.stringify(await loadSupport()), {
    name: "describe_data",
    description: "The 22 deal fields, each value with its TRAIN count (n) and TRAIN win rate, plus the base train win rate. Holdout deals are never shown.",
    schema: z.object({}),
  });
  const segmentTool = tool(async (a) => JSON.stringify(await S.segment_stats(a as S.SegmentStatsInput)), {
    name: "segment_stats",
    description: "TRAIN-only win rates for each value of `field` (optionally only `value`), optionally within a sub-population `where` {field: value}.",
    schema: z.object({
      field: z.string(),
      value: z.string().optional(),
      where: z.record(z.string(), z.string()).optional(),
    }),
  });
  const rubricTool = tool(
    async ({ rules, thresholds, rationale }) => {
      const objective_id = ctx.objectiveId()!;
      await loadSupport();
      const r = await S.propose_rubric({ objective_id, rules: rules as S.Rule[], thresholds, rationale, agent: ctx.agent });
      if (!r.ok) {
        bump("invalid");
        log(red(bold(`  ✖ INVALID rubric: ${clip(r.errors.join("; "), 100)} → logged`)));
        await ctx.call("log_failure", {
          objective_id, class: "invalid_rubric", agent: ctx.agent,
          failure: `propose_rubric rejected: ${clip(r.errors.join("; "), 300)}`,
          context: `settings v${ctx.settingsVersion()}; ${rules.length} rules; no version saved`,
        });
        return JSON.stringify(r);
      }
      proposals++;
      bump("evals");
      last = { ...r, rules: rules as S.Rule[] };
      pack.owed = true;
      const h = r.metrics.holdout;
      const secs = Math.round((Date.now() - tIter) / 1000);
      tIter = Date.now();
      const arrow = lastAuc == null ? f3(h.auc) : `${f3(lastAuc)} → ${f3(h.auc)}`;
      const up = lastAuc == null || h.auc >= lastAuc;
      log(bold(`  ✎ v${r.version}  ${clip(r.change_summary, 44).padEnd(44)}  holdout AUC ${(up ? green : red)(arrow)}   A-win ${pct(h.a_win_rate)}%  gap ${f2(r.gap)}`) + dim(`  ${secs}s`));
      trajectory.push(`v${r.version} ${f3(h.auc)}${r.flags.includes("overfit_segment") ? "!" : ""}`);
      if (r.flags.includes("overfit_segment")) {
        bump("overfit");
        const low = (rules as S.Rule[]).map((x) => ({ x, n: support.get(`${x.field}=${x.equals}`) ?? 0 })).filter((y) => y.n < S.MIN_SUPPORT);
        const which = low.length ? low.map((y) => `${y.x.field}=${y.x.equals} (${y.n} deals)`).join(", ") : `gap > ${S.MAX_GAP}: ${clip(r.change_summary, 50)}`;
        log(yellow(bold(`  ⚠ OVERFIT v${r.version} ${which} gap ${f2(r.gap)} → logged`)));
        await ctx.call("log_failure", {
          objective_id, class: "overfit_segment", agent: ctx.agent,
          failure: `Rubric v${r.version} overfits: ${which}; train AUC ${f2(r.metrics.train.auc)} vs holdout ${f2(h.auc)} (gap ${f2(r.gap)}).`,
          context: `rule(s): ${which}; support threshold ${S.MIN_SUPPORT}; gap ${r.gap}; change ${r.change_summary}; settings v${ctx.settingsVersion()}`,
        });
      }
      lastAuc = h.auc;
      bestAuc = Math.max(bestAuc, h.auc);
      if (h.auc >= T_AUC) reached = true;
      return JSON.stringify({ ...r, end_state: `holdout_auc ≥ ${T_AUC}`, reached });
    },
    {
      name: "propose_rubric",
      description:
        "Submit the FULL rubric (all rules, not a diff). Scored deterministically on train and on held-out deals. " +
        "rules: [{field, equals, points}] (≤25, points integer −5..5, field/value must exist in describe_data). " +
        "thresholds: {A, B}: score ≥ A → grade A, ≥ B → B, else C. Returns version, metrics {train, holdout} (auc, a_win_rate, a_coverage), gap = train−holdout AUC, flags.",
      schema: z.object({
        rules: z.array(z.object({ field: z.string(), equals: z.string(), points: z.number().int() })),
        thresholds: z.object({ A: z.number(), B: z.number() }),
        rationale: z.string().describe("one line: the hypothesis behind this change"),
      }),
    },
  );

  const basePrompt =
    `You are the "${ctx.agent}" revenue-ops agent. You work through tools only; be terse between tool calls.\n` +
    `Your agent name for every Waypoints tool is "${ctx.agent}".\n\n` +
    `# Task: improve a B2B deal-qualification rubric\n` +
    `A rubric adds points per matching deal field (e.g. client=Current +3, competitors=Yes −3) and grades deals A/B/C by thresholds. ` +
    `A deterministic scorer grades each rubric on HELD-OUT real deals you never see: holdout AUC (ranking quality) and A-grade win rate. ` +
    `Destination (immutable): holdout AUC ≥ ${T_AUC}.\n\n` +
    `Each iteration: optionally describe_data / segment_stats (TRAIN data only) to form ONE hypothesis, then propose_rubric with the FULL rubric ` +
    `(start from the current best rubric and change it). Keep changes that raise holdout AUC; drop ones that lower it. ` +
    `A big train−holdout gap or rules on rare values overfit: prefer common, strong signals. ` +
    `Use checkpoint to save progress (objective_id, state_summary, open_threads, next_action). ` +
    `Write at most one short sentence of reasoning per turn, starting with "Hypothesis:". Never stop on your own: keep iterating until told the end state is reached.\n` +
    `Treat policies returned by resume as hard rules.`;

  async function bestEver(): Promise<Best | null> {
    const d: any = await rubrics().findOne({ "metrics.holdout.auc": { $exists: true } }, { sort: { "metrics.holdout.auc": -1, created_at: -1 } });
    if (!d) return null;
    return { version: d.version, auc: d.metrics.holdout.auc, win: d.metrics.holdout.a_win_rate, rules: d.rules, thresholds: d.thresholds, objective_id: String(d.objective_id), earlier: String(d.objective_id) !== ctx.objectiveId() };
  }

  const pack: TaskPack = {
    name: "sales",
    objective: {
      objective: `[sales] ${SALES_OBJECTIVE}`,
      task: "sales",
      bearings: [
        { name: "holdout_auc", target: T_AUC, unit: "AUC", current: 0.5 },
        { name: "a_grade_win_rate", target: T_WIN, unit: "%", current: 0 },
      ],
      waypoints: [
        { title: "Baseline rubric", done_when: "a first rubric is scored on holdout" },
        { title: "Top-3 signals", done_when: "the three strongest train signals are in the rubric" },
        { title: "Competitive & relationship signals", done_when: "competitors / client / partnership signals tested" },
        { title: "Deal-shape signals", done_when: "scope / deal_type / up_sale / cross_sale signals tested" },
        { title: "Reach end state", done_when: `holdout AUC ≥ ${T_AUC}` },
      ],
      end_state: { description: `Rubric ranks held-out deals: holdout AUC ≥ ${T_AUC}`, bearing: "holdout_auc", target: T_AUC },
    },
    bearing: "holdout_auc",
    basePrompt,
    tools: [describeTool, segmentTool, rubricTool],
    recursionLimit: ctx.maxSteps * 10 + 20,
    async init(_ctx, resumed) {
      await loadSupport();
      const oid = ctx.objectiveId()!;
      const mine = await S.get_rubric({ objective_id: oid });
      let base: Best | null = null;
      if (mine) {
        const b = await S.best_rubric({ objective_id: oid });
        base = b && { version: b.version, auc: b.metrics.holdout.auc, win: b.metrics.holdout.a_win_rate, rules: b.rules, thresholds: b.thresholds, objective_id: oid, earlier: false };
        lastAuc = mine.metrics.holdout.auc;
        log(cyan(bold(`  ◆ continuing: latest rubric v${mine.version} (holdout AUC ${f3(mine.metrics.holdout.auc)}), best v${base?.version} (${f3(base?.auc)})`)));
      } else {
        base = await bestEver();
        if (base) {
          lastAuc = base.auc;
          log(cyan(bold(`  ◆ starting from rubric v${base.version} (holdout AUC ${f3(base.auc)}) learned in an earlier run`)));
        } else log(cyan(bold(`  ◆ no rubric yet: starting from an empty rubric`)));
      }
      if (base) bestAuc = base.auc;
      if (base && base.auc >= T_AUC && !mine) log(dim(`    (earlier best already meets the end state; the agent must re-establish it on this objective)`));
      void resumed;
      const baseText = base
        ? `Current best rubric (v${base.version}${base.earlier ? ", learned in an earlier run" : ""}; holdout AUC ${f2(base.auc)}, A-win ${pct(base.win)}%): ${JSON.stringify({ rules: base.rules, thresholds: base.thresholds })}. ` +
          (mine ? "" : "Your first proposal should re-submit it (or improve on it) so this objective has a baseline.")
        : "No rubric exists yet: propose a small baseline (3-5 strong common signals) first.";
      return `\n${baseText}\nTrain base win rate ${f2(describe?.base_win_rate)} over ${describe?.n_train} train deals.`;
    },
    owed: false,
    measured: () => (last ? [
      { name: "holdout_auc", current: last.metrics.holdout.auc },
      { name: "a_grade_win_rate", current: pct(last.metrics.holdout.a_win_rate) },
    ] : null),
    autoCheckpoint() {
      const r = last!;
      return {
        state_summary: `Harness auto-checkpoint after rubric v${r.version} (${r.change_summary}): holdout AUC ${f2(r.metrics.holdout.auc)}, A-win ${pct(r.metrics.holdout.a_win_rate)}%, gap ${f2(r.gap)}${r.flags.length ? `, flags ${r.flags.join(",")}` : ""}.`,
        open_threads: reached ? [] : [`holdout AUC ${f2(r.metrics.holdout.auc)} < ${T_AUC}`],
        next_action: reached ? "End state reached." : "Test the next signal with segment_stats, then propose_rubric.",
        bearings_current: pack.measured()!,
      };
    },
    skippedWhat: () => `rubric v${last?.version} (holdout AUC ${f2(last?.metrics.holdout.auc)})`,
    endStateLine: (e) => `◎ END STATE holdout AUC ≥ ${e.target} — immutable`,
    argSummary(name, a) {
      switch (name) {
        case "describe_data": return "";
        case "segment_stats": return `${a.field}${a.value ? "=" + a.value : ""}${a.where ? dim(" where " + JSON.stringify(a.where)) : ""}`;
        case "propose_rubric": return dim(`${(a.rules ?? []).length} rules, A≥${a.thresholds?.A} B≥${a.thresholds?.B} · ${clip(String(a.rationale ?? ""), 70)}`);
        default: return null;
      }
    },
    resultSummary(name, raw) {
      let j: any; try { j = JSON.parse(raw); } catch { return null; }
      if (name === "describe_data") return dim(`${j.fields?.length} fields · ${j.n_train} train deals · base win ${pct(j.base_win_rate ?? 0)}%`);
      if (name === "segment_stats") {
        if (!j.ok) return red(clip((j.errors ?? []).join("; "), 100));
        const segs = (j.segments ?? []).slice().sort((a: any, b: any) => b.win_rate - a.win_rate).slice(0, 4);
        return dim(segs.map((s: any) => `${s.value} ${pct(s.win_rate)}% (${s.n})`).join(" · "));
      }
      if (name === "propose_rubric") return j.ok ? dim(`saved v${j.version}${j.flags?.length ? " · " + j.flags.join(",") : ""}`) : red("rejected");
      return null;
    },
    stop: () => reached || proposals >= ctx.maxSteps,
    thought(t) {
      const m = t.match(/Hypothesis:[^\n]*/i) ?? t.match(/[^.\n]*\b(hypothes\w*|I expect|should (raise|lift|improve))\b[^.\n]*/i);
      return m ? clip(m[0], 130) : null;
    },
    discipline: (v, x) => `v${v} ${x.skipped ?? 0} skipped/${x.evals ?? 0} proposals, ${x.overfit ?? 0} overfit, ${x.invalid ?? 0} invalid`,
    finish() {
      return {
        ok: reached,
        line: reached
          ? green(bold(`■ END STATE REACHED: holdout AUC ${f3(lastAuc)} ≥ ${T_AUC} after ${proposals} proposal(s)`))
          : yellow(`■ stopped after ${proposals} proposal(s): best holdout AUC ${f3(bestAuc)} (end state ${T_AUC})`),
        extra: [`AUC trajectory: ${trajectory.join(" → ") || "-"}`],
      };
    },
  };
  return pack;
}
