// Invoice task pack (the original fixture): fix 4 planted bugs in demo/fixture/invoice.ts, bearing tests_passing.
import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { resolve, relative, dirname, join } from "node:path";
import { mkdir } from "node:fs/promises";
import { clip, dim, green, yellow, bold, red, log } from "../term";
import type { PackCtx, TaskPack } from "./types";

const REPO = resolve(import.meta.dir, "..", "..");
const FIXTURE = join(REPO, "demo", "fixture");

function scoped(p: string): string {
  const abs = resolve(FIXTURE, p.replace(/^demo\/fixture\//, ""));
  const rel = relative(FIXTURE, abs);
  if (rel.startsWith("..") || rel === "" || resolve(abs) !== abs) throw new Error(`path outside demo/fixture: ${p}`);
  return abs;
}

export type TestReport = { pass: number; fail: number; total: number; all_green: boolean; failures: { test: string; detail: string }[] };

export async function runTests(): Promise<TestReport> {
  const proc = Bun.spawn(["bun", "test"], { cwd: FIXTURE, stdout: "pipe", stderr: "pipe", env: { ...process.env, NO_COLOR: "1", FORCE_COLOR: "0" } });
  const [out, err] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  await proc.exited;
  const text = `${out}\n${err}`;
  const pass = Number(text.match(/^\s*(\d+) pass/m)?.[1] ?? 0);
  const fail = Number(text.match(/^\s*(\d+) fail/m)?.[1] ?? 0);
  // bun prints each failure's error block *before* its "(fail) name" line.
  const failures: TestReport["failures"] = [];
  let block: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\(fail\) (.+?)(?: \[[\d.]+m?s\])?$/);
    if (m) {
      const keep = block.filter((l) => /error:|Expected|Received|^\s*[-+] /.test(l) && !/Expected\s+-|Received\s+\+/.test(l));
      failures.push({ test: m[1]!, detail: keep.map((l) => l.trim()).slice(0, 8).join(" | ") });
      block = [];
    } else if (/^\(pass\)/.test(line)) block = [];
    else block.push(line);
  }
  if (pass + fail === 0) failures.push({ test: "(no tests ran)", detail: clip(text, 600) });
  return { pass, fail, total: pass + fail, all_green: fail === 0 && pass > 0, failures };
}

// Corrupt-write guard (deterministic): the new invoice.ts must parse and keep every export of the original.
const TEMPLATE_EXPORTS = new Bun.Transpiler({ loader: "ts" }).scan(await Bun.file(join(REPO, "demo", "fixture-template", "invoice.ts")).text()).exports;
export function corruption(content: string): string | null {
  let exports: string[];
  try { exports = new Bun.Transpiler({ loader: "ts" }).scan(content).exports; } catch (e: any) { return `does not parse: ${clip(String(e?.message ?? e), 120)}`; }
  const missing = TEMPLATE_EXPORTS.filter((x) => !exports.includes(x));
  return missing.length ? `drops export(s) ${missing.join(", ")}` : null;
}

export async function invoicePack(ctx: PackCtx): Promise<TaskPack> {
  const task = await Bun.file(join(REPO, "demo", "task.md")).text();
  let lastReport: TestReport | null = null;
  let testRuns = 0, green_ = false;
  let checkpointsAfterTests = 0, awaitingCheckpoint = false, skipped = 0;

  const runTestsTool = tool(async () => {
    lastReport = await runTests();
    pack.owed = true;
    return JSON.stringify(lastReport);
  }, { name: "run_tests", description: "Run `bun test` in demo/fixture. Returns JSON {pass, fail, total, all_green, failures:[{test, detail}]}.", schema: z.object({}) });

  const readFileTool = tool(async ({ path }) => await Bun.file(scoped(path)).text(), {
    name: "read_file",
    description: "Read a file inside demo/fixture (e.g. 'invoice.ts', 'invoice.test.ts').",
    schema: z.object({ path: z.string().describe("path relative to demo/fixture") }),
  });

  const writeFileTool = tool(
    async ({ path, content }) => {
      const abs = scoped(path);
      if (relative(FIXTURE, abs) !== "invoice.ts") throw new Error("only invoice.ts is writable: fix bugs in invoice.ts");
      const bad = corruption(content);
      if (bad) {
        ctx.stat().corrupt = (ctx.stat().corrupt ?? 0) + 1;
        log(red(bold(`  ⛨ corrupt write rejected (${bad}) → log_failure [corrupt_write]`)));
        if (ctx.objectiveId()) await ctx.call("log_failure", {
          objective_id: ctx.objectiveId(), failure: `Model's full-file write of invoice.ts was corrupt: ${bad}. The harness rejected it.`,
          class: "corrupt_write", context: `write_file under settings v${ctx.settingsVersion()}; test run ${testRuns}`, agent: ctx.agent,
        });
        return `write REJECTED by the harness (corrupt write: new invoice.ts ${bad}); invoice.ts is unchanged. Write the FULL file again.`;
      }
      await mkdir(dirname(abs), { recursive: true });
      await Bun.write(abs, content);
      return `wrote ${relative(FIXTURE, abs)} (${content.length} bytes)`;
    },
    { name: "write_file", description: "Overwrite demo/fixture/invoice.ts with the FULL new content. Every other file is read-only.", schema: z.object({ path: z.string().describe("path relative to demo/fixture"), content: z.string() }) },
  );

  const basePrompt =
    `You are the "${ctx.agent}" coding agent. You work through tools only; be terse between tool calls.\n` +
    `Your agent name for every Waypoints tool is "${ctx.agent}".\n\n${task}\n\n` +
    `Tool notes: read_file/write_file paths are relative to demo/fixture. write_file needs the FULL file content. ` +
    `run_tests returns JSON pass/fail counts. Treat policies returned by resume as hard rules.\n\n` +
    `CROSS-AGENT MEMORY: if resume returned recent_failures or policies, call recall with kind "failure" for a class ` +
    `before fixing its first bug, then write one line of plain text starting with "MEMORY:" naming the earlier ` +
    `failure (class and id), the agent that logged it, and how it shapes your fix. If recall finds nothing, skip the MEMORY line.`;

  const pack: TaskPack = {
    name: "invoice",
    objective: {
      objective: "Make every test in demo/fixture/invoice.test.ts pass by fixing bugs in invoice.ts",
      bearings: [{ name: "tests_passing", target: 10, unit: "tests", current: 0 }],
      waypoints: [
        { title: "Baseline", done_when: "bun test has been run and every failing test is listed" },
        { title: "Fix date + time bugs", done_when: "billableDays, hoursFromMinutes and totalHours tests pass" },
        { title: "Fix money + paging bugs", done_when: "taxCents, invoiceTotal and paginate tests pass" },
        { title: "All green", done_when: "all 10 tests pass" },
      ],
      end_state: { description: "All 10 invoice tests pass", bearing: "tests_passing", target: 10 },
    },
    bearing: "tests_passing",
    basePrompt,
    tools: [runTestsTool, readFileTool, writeFileTool],
    recursionLimit: ctx.maxSteps * 2 + 1,
    async init() { return ""; },
    owed: false,
    measured: () => (lastReport ? [{ name: "tests_passing", current: lastReport.pass }] : null),
    autoCheckpoint() {
      const r = lastReport!;
      return {
        state_summary: `Harness auto-checkpoint after a test run: ${r.pass}/${r.total} passing (model skipped checkpoint).`,
        open_threads: r.failures.map((f) => f.test),
        next_action: r.all_green ? "Objective complete." : `Fix: ${r.failures[0]?.test ?? "remaining failures"}`,
        bearings_current: [{ name: "tests_passing", current: r.pass }],
      };
    },
    skippedWhat: () => `test run ${testRuns} (${lastReport?.pass}/${lastReport?.total} passing)`,
    endStateLine: (e) => `◎ END STATE: ${e.description} (${e.bearing} ≥ ${e.target}) — immutable`,
    argSummary: (name, a) => (name === "read_file" || name === "write_file" ? a.path ?? "" : null),
    resultSummary(name, raw) {
      if (name !== "run_tests") return null;
      let j: any; try { j = JSON.parse(raw); } catch { return null; }
      const s = `${j.pass}/${j.total} passing`;
      return j.all_green ? green(bold(s + " ✔ all green")) : (j.fail ? yellow(s) : s) + dim(`  failing: ${clip(j.failures.map((f: any) => f.test.split(" > ").pop()).join(", "), 80)}`);
    },
    onToolResult(name, raw) {
      if (awaitingCheckpoint && name === "checkpoint") checkpointsAfterTests++;
      else if (awaitingCheckpoint) skipped++;
      awaitingCheckpoint = false;
      if (name === "write_file" && !/REJECTED/.test(raw)) ctx.stat().writes = (ctx.stat().writes ?? 0) + 1;
      if (name === "run_tests") {
        ctx.stat().evals = (ctx.stat().evals ?? 0) + 1;
        testRuns++;
        awaitingCheckpoint = true;
        try { green_ = JSON.parse(raw).all_green === true; } catch {}
      }
    },
    stop: () => false,
    thought: (t) => t,
    discipline: (v, x) => `v${v} ${x.skipped ?? 0} skipped checkpoint(s)/${x.evals ?? 0} test runs, ${x.corrupt ?? 0} corrupt/${x.writes ?? 0} writes`,
    // Probation needs checkpoints under the new settings. If the task finished first, the harness verifies the suite
    // (a real test run + checkpoint) until the sentinel rules, so the verdict lands on stage instead of next session.
    async afterRun(doCheckpoint, reload, status, version) {
      for (let i = 0; green_ && status() === "probation" && i < 3; i++) {
        await reload("probation");
        if (status() !== "probation") break;
        const v0 = version();
        const r = await runTests();
        lastReport = r;
        ctx.stat().evals = (ctx.stat().evals ?? 0) + 1;
        log(`${"→ run_tests    "} ${dim(`(harness verification, v${v0} on probation)`)}`);
        log(`  ${dim("↳")} ${pack.resultSummary("run_tests", JSON.stringify(r))}`);
        await doCheckpoint({
          objective_id: ctx.objectiveId(),
          state_summary: `Harness verification run while settings v${v0} is on probation: ${r.pass}/${r.total} passing.`,
          open_threads: r.failures.map((f) => f.test),
          next_action: r.all_green ? "Objective complete." : `Fix: ${r.failures[0]?.test}`,
          bearings_current: [{ name: "tests_passing", current: r.pass }],
          agent: ctx.agent,
        });
        for (let t = 0; t < 8 && status() === "probation" && version() === v0; t++) {
          await Bun.sleep(1000);
          await reload("probation");
        }
      }
    },
    finish() {
      if (awaitingCheckpoint) skipped++;
      return {
        ok: green_,
        line: green_ ? green(bold(`■ done: all tests green`)) : yellow(`■ finished (tests not all green)`),
        extra: [`checkpoint discipline: ${checkpointsAfterTests}/${testRuns} test runs followed by a model checkpoint${skipped ? `, ${skipped} skipped` : ""}`],
      };
    },
  };
  return pack;
}
