// Spec-first tests of the deterministic QA gate (docs/OUTREACH-PACK.md, "The deterministic QA gate").
// Written from the spec only; qa() is pure (no db, no LLM).
import { describe, expect, test } from "bun:test";
import { qa } from "../src/outreach/qa";

const CANCITY = {
  account: "Cancity",
  sector: "retail",
  year_established: 2001,
  revenue_musd: 718.62,
  employees: 2448,
  office_location: "United States",
  subsidiary_of: "",
};

const SUBJECT = "Inventory visibility for Cancity";
const FIRST = "Cancity has served retail shoppers since 2001, and with 2,448 employees across the United States, keeping stores stocked is no small job.";
const MIDDLE = "Our GTX Pro ($4,821) gives retail teams live inventory visibility.";
const CTA = "Would you be open to a short call next week?";
const clean = (parts: { first?: string; middle?: string; cta?: string } = {}) =>
  [parts.first ?? FIRST, parts.middle ?? MIDDLE, parts.cta ?? CTA].join(" ");

const words = (s: string) => (s.match(/\S+/g) ?? []).length;
const classes = (r: { failures: { class: string }[] }) => [...new Set(r.failures.map((f) => f.class))].sort();
const run = (body: string, subject = SUBJECT) => qa({ subject, body }, CANCITY);

/** Assert the draft fails with exactly one failure class. */
function onlyClass(body: string, cls: string, subject = SUBJECT) {
  const r = run(body, subject);
  expect(classes(r)).toEqual([cls]);
  expect(r.pass).toBe(false);
  for (const f of r.failures) expect(typeof f.detail).toBe("string");
}

/** Assert the draft passes cleanly. */
function passes(body: string, subject = SUBJECT) {
  const r = run(body, subject);
  expect(r.failures).toEqual([]);
  expect(r.pass).toBe(true);
}

describe("qa: clean draft", () => {
  test("personalized, <120 words, CTA question → pass", () => {
    expect(words(clean())).toBeLessThan(120);
    passes(clean());
  });
  test("result shape is {pass, failures[]}", () => {
    const r = run(clean());
    expect(Object.keys(r).sort()).toEqual(["failures", "pass"]);
    expect(Array.isArray(r.failures)).toBe(true);
  });
});

describe("qa: must NOT trigger", () => {
  test("revenue restated as $718M (within 1%) is not invented", () => {
    passes(clean({ middle: `At roughly $718M in revenue, you need tooling that scales. ${MIDDLE}` }));
  });
  test("revenue restated as $718.6 million is not invented", () => {
    passes(clean({ middle: `With $718.6 million in revenue, scale matters. ${MIDDLE}` }));
  });
  test("year_established 2001 is a record fact", () => {
    passes(clean({ first: "Since 2001, Cancity has grown into a serious retail business." }));
  });
  test("employees written 2448 (no comma) is a record fact", () => {
    passes(clean({ first: "Cancity has 2448 employees working in retail." }));
  });
  test("catalog product prices are allowed ($5,482 GTX Plus Pro, $550 GTX Basic)", () => {
    passes(clean({ middle: "Our GTX Plus Pro ($5,482) or the entry GTX Basic at $550 fit retail teams." }));
  });
  test('"15 minutes" CTA is not an invented number', () => {
    passes(clean({ cta: "Do you have 15 minutes for a call next week?" }));
  });
  test('"15-minute call" CTA (the plain_cta fragment wording) is not an invented number', () => {
    passes(clean({ cta: "Could we set up a 15-minute call next week?" }));
  });
  test("office_location United States named in the body is a record fact", () => {
    passes(clean());
  });
  test("sector alone in the first sentence counts as personalization", () => {
    passes(clean({ first: "Retail margins are thin, so every hour spent counting stock hurts." }));
  });
  test("CTA keyword without a question mark satisfies missing-cta", () => {
    passes(clean({ cta: "Happy to set up a short demo next week." }));
  });
  test("exactly 120 words is not too long", () => {
    const body = padTo(120);
    expect(words(body)).toBe(120);
    passes(body);
  });
  test("60-character subject is allowed", () => {
    const subject = "Cancity inventory".padEnd(60, "!");
    expect(subject.length).toBe(60);
    passes(clean(), subject);
  });
});

// Neutral filler that can't trigger any class (no digits, names, CTA words, forbidden words, brackets).
const FILLER = "Retail teams like yours often juggle stock counts across many stores and spreadsheets";
function padTo(n: number): string {
  const base = clean();
  const need = n - words(base);
  const fillWords = FILLER.split(" ");
  const pad: string[] = [];
  for (let i = 0; i < need; i++) pad.push(fillWords[i % fillWords.length]!);
  // insert the padding as its own sentence between the hook and the product line
  return [FIRST, pad.join(" ") + ".", MIDDLE, CTA].join(" ");
}

describe("qa: invented-fact", () => {
  test('"founded in 1995" (record says 2001)', () => {
    onlyClass(clean({ middle: `Founded in 1995, you have seen retail change. ${MIDDLE}` }), "invented-fact");
  });
  test('"offices in Germany" (record says United States)', () => {
    onlyClass(clean({ middle: `With offices in Germany, you ship everywhere. ${MIDDLE}` }), "invented-fact");
  });
  test('"$2B revenue" (record says 718.62M)', () => {
    onlyClass(clean({ middle: `At $2B in revenue, scale matters. ${MIDDLE}` }), "invented-fact");
  });
  test("a percentage not in the record", () => {
    onlyClass(clean({ middle: `Teams like yours cut stockouts by 37%. ${MIDDLE}` }), "invented-fact");
  });
  test("a price not in the catalog", () => {
    onlyClass(clean({ middle: "Our GTX Pro ($3,999) gives retail teams live inventory visibility." }), "invented-fact");
  });
  test("an employee count off by more than 1%", () => {
    onlyClass(clean({ first: "Cancity has 3,000 employees working in retail." }), "invented-fact");
  });
  test("a parent company that isn't in the record", () => {
    onlyClass(clean({ middle: `As part of Acme Corporation, you have big backing. ${MIDDLE}` }), "invented-fact");
  });
});

describe("qa: missing-personalization", () => {
  test("generic first sentence", () => {
    onlyClass(clean({ first: "Hope your week is going well." }), "missing-personalization");
  });
});

describe("qa: forbidden-promise", () => {
  test('"free trial"', () => {
    onlyClass(clean({ middle: "Our GTX Pro ($4,821) comes with a free trial for retail teams." }), "forbidden-promise");
  });
  test('"guarantee"', () => {
    onlyClass(clean({ middle: "We guarantee our GTX Pro ($4,821) will cut your counting work." }), "forbidden-promise");
  });
  test('"no risk"', () => {
    onlyClass(clean({ middle: "There is no risk in trying our GTX Pro ($4,821)." }), "forbidden-promise");
  });
});

describe("qa: placeholder-left", () => {
  test("[First Name]", () => {
    onlyClass(clean({ first: `Hi [First Name], ${FIRST}` }), "placeholder-left");
  });
  test("{company}", () => {
    onlyClass(clean({ middle: `Teams at {company} love it. ${MIDDLE}` }), "placeholder-left");
  });
  test("<name>", () => {
    onlyClass(clean({ middle: `Hi <name>. ${MIDDLE}` }), "placeholder-left");
  });
  test("lorem ipsum", () => {
    onlyClass(clean({ middle: `Lorem ipsum dolor. ${MIDDLE}` }), "placeholder-left");
  });
});

describe("qa: too-long", () => {
  test("121-word body", () => {
    const body = padTo(121);
    expect(words(body)).toBe(121);
    onlyClass(body, "too-long");
  });
});

describe("qa: missing-cta", () => {
  test("no question mark and no CTA words", () => {
    onlyClass(clean({ cta: "It suits growing retail chains well." }), "missing-cta");
  });
});

describe("qa: missing-subject", () => {
  test("empty subject", () => {
    onlyClass(clean(), "missing-subject", "");
  });
  test("61-character subject", () => {
    const subject = "Cancity inventory".padEnd(61, "!");
    expect(subject.length).toBe(61);
    onlyClass(clean(), "missing-subject", subject);
  });
});

describe("qa: multiple classes", () => {
  test("one draft can fail several classes at once", () => {
    const r = qa({ subject: "", body: "Hope you are well. We guarantee a free trial for [Company]." }, CANCITY);
    expect(r.pass).toBe(false);
    const c = classes(r);
    for (const cls of ["missing-subject", "forbidden-promise", "placeholder-left", "missing-personalization"]) expect(c).toContain(cls);
  });
});
