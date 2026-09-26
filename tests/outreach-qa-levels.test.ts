// The rising bar: QA levels 1-4 are cumulative (src/outreach/qa.ts), the bar ratchet (src/outreach/bar.ts)
// and the sentinel's class → playbook map for the new classes. Pure: no db, no LLM.
import { describe, expect, test } from "bun:test";
import { checksAt, qa, QA_CLASSES } from "../src/outreach/qa";
import { nextBarLevels } from "../src/outreach/bar";
import { planOutreachChange, OUTREACH_QA_CLASSES } from "../src/sentinel";
import { SEED_SETTINGS, FRAGMENT_IDS, getFragments, type HarnessSettings } from "../src/fragments";
import { gateChange } from "../src/settings";

const CANCITY = {
  account: "Cancity",
  sector: "retail",
  year_established: 2001,
  revenue_musd: 718.62,
  employees: 2448,
  office_location: "United States",
  subsidiary_of: "",
};

// Passes every level: personal subject, concrete opener with a record number, sector + product, specific-time CTA.
const SUBJECT = "Cancity: live inventory for retail";
const FIRST = "Cancity has served retail shoppers since 2001 with 2,448 employees across the United States.";
const MIDDLE = "Our GTX Pro ($4,821) gives retail teams live inventory visibility.";
const CTA = "Would a 15-minute call on Tuesday at 10am work?";
const body = (p: { first?: string; middle?: string; cta?: string } = {}) => [p.first ?? FIRST, p.middle ?? MIDDLE, p.cta ?? CTA].join(" ");
const classes = (r: { failures: { class: string }[] }) => [...new Set(r.failures.map((f) => f.class))].sort();
const run = (level: number, b = body(), subject = SUBJECT) => qa({ subject, body: b }, CANCITY, level);

describe("QA levels", () => {
  test("a strong draft passes at every level", () => {
    for (const l of [1, 2, 3, 4]) expect(run(l).failures).toEqual([]);
  });

  test("default level is 1 (backward compatible)", () => {
    const b = body({ first: "I hope this finds you well at Cancity." });
    expect(qa({ subject: "Hello", body: b }, CANCITY).pass).toBe(true);
    expect(checksAt(1)).toEqual([...QA_CLASSES.slice(0, 7)]);
  });

  test("checks are cumulative", () => {
    expect(checksAt(2)).toEqual([...checksAt(1), "generic-opener", "subject-not-personal"]);
    expect(checksAt(3)).toEqual([...checksAt(2), "no-sector-fit"]);
    expect(checksAt(4)).toEqual([...checksAt(3), "no-specific-number", "weak-cta"]);
    expect(checksAt(9)).toEqual(checksAt(4));
    expect(checksAt(0)).toEqual(checksAt(1));
  });

  test("L2 generic-opener: pleasantry in the first sentence", () => {
    for (const first of [
      "I hope this finds you well at Cancity.",
      "Hope you are well, Cancity team, as retail heats up.",
      "Cancity team, I wanted to reach out about retail inventory.",
      "Quick question for the Cancity retail team.",
      "Just touching base with Cancity.",
    ]) {
      const b = body({ first });
      expect(classes(run(1, b))).toEqual([]);
      expect(classes(run(2, b))).toContain("generic-opener");
    }
    // a greeting line is skipped: the first real sentence is judged
    expect(classes(run(2, `Hi Cancity team,\n${body()}`))).toEqual([]);
    // a pleasantry later in the body is fine
    expect(classes(run(2, body({ middle: `${MIDDLE} Hope this helps.` })))).toEqual([]);
  });

  test("L2 subject-not-personal: subject must name the account", () => {
    expect(classes(run(1, body(), "Live inventory for retail"))).toEqual([]);
    expect(classes(run(2, body(), "Live inventory for retail"))).toEqual(["subject-not-personal"]);
    expect(classes(run(2, body(), "cancity + GTX Pro"))).toEqual([]);
  });

  test("L3 no-sector-fit: needs the sector AND a product name", () => {
    const noProduct = body({ middle: "Our hardware gives retail teams live inventory visibility." });
    const noSector = body({ first: "Cancity has 2,448 employees across the United States.", middle: "Our GTX Pro ($4,821) gives teams live inventory visibility." });
    expect(classes(run(2, noProduct))).toEqual([]);
    expect(classes(run(3, noProduct))).toEqual(["no-sector-fit"]);
    expect(classes(run(3, noSector))).toEqual(["no-sector-fit"]);
  });

  test("L3 too-long tightens from 120 to 90 words", () => {
    const pad = Array.from({ length: 80 }, () => "retail").join(" ") + ".";
    const b = body({ middle: `${MIDDLE} ${pad}` });
    const n = b.split(/\s+/).length;
    expect(n).toBeGreaterThan(90);
    expect(n).toBeLessThanOrEqual(120);
    expect(classes(run(2, b))).toEqual([]);
    expect(classes(run(3, b))).toEqual(["too-long"]);
    expect(run(3, b).failures[0]!.detail).toContain("max 90");
  });

  test("L4 no-specific-number: must state employees, revenue or year exactly", () => {
    const vague = body({ first: "Cancity has served retail shoppers across the United States for decades." });
    expect(classes(run(3, vague))).toEqual([]);
    expect(classes(run(4, vague))).toEqual(["no-specific-number"]);
    // each record number counts on its own
    for (const first of [
      "Cancity has served retail shoppers since 2001.",
      "Cancity's 2,448 retail employees keep the United States stocked.",
      "Cancity turned $718.62M in retail revenue last year.",
    ])
      expect(classes(run(4, body({ first })))).toEqual([]);
    // a product price is not a record number
    expect(classes(run(4, body({ first: "Cancity serves retail shoppers across the United States." })))).toEqual(["no-specific-number"]);
  });

  test("L4 weak-cta: the ask must propose a specific day or time", () => {
    const vague = body({ cta: "Would a short call work for you?" });
    expect(classes(run(3, vague))).toEqual([]);
    expect(classes(run(4, vague))).toEqual(["weak-cta"]);
    for (const cta of ["Could we talk tomorrow?", "Could we chat next week?", "Does Thursday work for a 15-minute call?", "Can we talk at 2:30 pm?"])
      expect(classes(run(4, body({ cta })))).toEqual([]);
  });

  test("a time of day in the CTA is not an invented number (any level)", () => {
    expect(classes(run(1, body({ cta: "Could we talk at 2:30 pm or 10am?" })))).toEqual([]);
  });

  test("the combined L4 failure set on a generic draft", () => {
    const b = "I hope you are doing well. We sell hardware that helps companies. Let me know if you want to chat?";
    expect(classes(run(4, b, "Hello"))).toEqual(
      ["generic-opener", "missing-personalization", "no-sector-fit", "no-specific-number", "subject-not-personal", "weak-cta"].sort(),
    );
  });
});

describe("bar ratchet", () => {
  test("earned raise: level +1 (max 4), target = max(prev, round(first-try)+5), max 95", () => {
    expect(nextBarLevels({ level: 1, target_pct: 80 }, 83.3)).toEqual({ level: 2, target_pct: 88 });
    expect(nextBarLevels({ level: 2, target_pct: 88 }, 80)).toEqual({ level: 3, target_pct: 88 }); // never below prev
    expect(nextBarLevels({ level: 4, target_pct: 90 }, 100)).toEqual({ level: 4, target_pct: 95 });
  });
});

describe("sentinel: rising-bar classes → playbook changes", () => {
  const s = (over: Partial<HarnessSettings> = {}): HarnessSettings => ({ ...SEED_SETTINGS, ...over });
  test("every new QA class is known to the sentinel and has a fragment", () => {
    for (const c of QA_CLASSES) expect(OUTREACH_QA_CLASSES as readonly string[]).toContain(c);
    for (const f of ["specific_opener", "personal_subject", "sector_fit", "cite_one_number", "specific_time_cta"]) {
      expect(FRAGMENT_IDS as readonly string[]).toContain(f);
      expect(getFragments([f])[0]!.text.length).toBeGreaterThan(10);
    }
  });
  test("rules axis for opener / subject / cta", () => {
    expect(planOutreachChange("generic-opener", s())).toMatchObject({ field: "prompt_fragments", axis: "rules", value: [...SEED_SETTINGS.prompt_fragments, "specific_opener"] });
    expect(planOutreachChange("subject-not-personal", s())).toMatchObject({ axis: "rules", value: [...SEED_SETTINGS.prompt_fragments, "personal_subject"] });
    expect(planOutreachChange("weak-cta", s())).toMatchObject({ axis: "rules", value: [...SEED_SETTINGS.prompt_fragments, "specific_time_cta"] });
    expect(planOutreachChange("weak-cta", s({ prompt_fragments: ["specific_time_cta"] }))).toBeNull();
  });
  test("no-sector-fit: context first (account_summary), then the sector_fit rule", () => {
    expect(planOutreachChange("no-sector-fit", s())).toMatchObject({ field: "context_sources", axis: "context policy", value: ["account_name", "product_catalog", "account_summary"] });
    expect(planOutreachChange("no-sector-fit", s({ context_sources: ["account_name", "account_record_full"] }))).toMatchObject({ field: "prompt_fragments", value: [...SEED_SETTINGS.prompt_fragments, "sector_fit"] });
  });
  test("no-specific-number: context first (account_record_full), then cite_one_number", () => {
    expect(planOutreachChange("no-specific-number", s())).toMatchObject({ field: "context_sources", value: ["account_name", "product_catalog", "account_record_full"] });
    expect(planOutreachChange("no-specific-number", s({ context_sources: ["account_record_full"] }))).toMatchObject({ field: "prompt_fragments", value: [...SEED_SETTINGS.prompt_fragments, "cite_one_number"] });
  });
  test("the settings gate accepts the new fragments", () => {
    const r = gateChange("prompt_fragments", [...SEED_SETTINGS.prompt_fragments, "specific_opener", "cite_one_number"], s());
    expect(r.passed).toBe(true);
  });
});
