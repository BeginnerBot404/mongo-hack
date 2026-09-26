// Deterministic QA gate for outreach drafts (docs/OUTREACH-PACK.md). No LLM. The harness can never change it.
import { KNOWN_ACCOUNT_NAMES, KNOWN_LOCATIONS, PRODUCTS, type Account } from "./data";

export const QA_CLASSES = [
  "invented-fact",
  "missing-personalization",
  "forbidden-promise",
  "placeholder-left",
  "too-long",
  "missing-cta",
  "missing-subject",
] as const;
export type QaClass = (typeof QA_CLASSES)[number];

export interface Draft {
  subject: string;
  body: string;
}
export interface QaFailure {
  class: QaClass;
  detail: string;
}
export interface QaResult {
  pass: boolean;
  failures: QaFailure[];
}
export type QaAccount = Pick<Account, "account" | "sector" | "year_established" | "revenue_musd" | "employees" | "office_location" | "subsidiary_of">;

export const MAX_WORDS = 120;
export const MAX_SUBJECT = 60;
export const FORBIDDEN = /free|guarantee|no risk|discount|\d+% off|best price/i;
export const PLACEHOLDER = /\[[^\]]+\]|\{[^}]+\}|<[^>]+>|lorem/i;
export const CTA_WORDS = /call|chat|meet|demo|15 minutes|time/i;
const TOLERANCE = 0.01;

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, phrase: string) => phrase !== "" && new RegExp(`(^|[^\\p{L}])${esc(phrase)}($|[^\\p{L}])`, "iu").test(text);

const SCALE: Record<string, number> = { k: 1e3, thousand: 1e3, m: 1e6, mm: 1e6, million: 1e6, b: 1e9, bn: 1e9, billion: 1e9 };

export interface FoundNumber {
  raw: string;
  value: number; // with K/M/B applied
  bare: number; // the digits as written
  percent: boolean;
  year: boolean;
}

/** Numbers in text (after removing product names like "GTK 500" and durations like "15-minute"). */
export function extractNumbers(text: string): FoundNumber[] {
  let t = text;
  for (const p of PRODUCTS) t = t.replace(new RegExp(esc(p.product), "gi"), " ");
  t = t.replace(/\b\d+\s*-?\s*(?:minutes?|mins?|hours?|hrs?|days?|weeks?)\b/gi, " ");
  const out: FoundNumber[] = [];
  const re = /(\$)?\s?(\d[\d,]*(?:\.\d+)?)\s*(%|percent\b|thousand\b|million\b|billion\b|bn\b|mm\b|[kmb]\b)?/gi;
  for (const m of t.matchAll(re)) {
    const bare = Number(m[2]!.replace(/,/g, ""));
    if (!Number.isFinite(bare)) continue;
    const unit = (m[3] ?? "").toLowerCase();
    const percent = unit === "%" || unit === "percent";
    const value = percent ? bare : bare * (SCALE[unit] ?? 1);
    const year = !m[1] && !unit && /^(19|20)\d\d$/.test(m[2]!);
    out.push({ raw: m[0].trim(), value, bare, percent, year });
  }
  return out;
}

const near = (a: number, b: number) => b !== 0 && Math.abs(a - b) / Math.abs(b) <= TOLERANCE;

/** Record facts a number may legitimately state: revenue (as millions or in dollars), employees, year, product prices. */
function numberMatches(n: FoundNumber, acc: QaAccount): boolean {
  if (n.percent) return false; // the record has no percentages
  if (n.year) return n.bare === acc.year_established;
  const candidates = [acc.revenue_musd, acc.revenue_musd * 1e6, acc.employees, acc.year_established, ...PRODUCTS.map((p) => p.sales_price)];
  return candidates.some((c) => near(n.value, c) || near(n.bare, c));
}

export function sentences(body: string): string[] {
  return body
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The first sentence, skipping a greeting line like "Hi team," */
function firstSentence(body: string): string {
  const s = sentences(body);
  const i = s.length > 1 && /^(hi|hello|dear|hey|greetings)\b[^.!?]{0,40}[,!]?$/i.test(s[0]!) ? 1 : 0;
  return s[i] ?? "";
}

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

export function qa(draft: Draft, account: QaAccount): QaResult {
  const subject = String(draft.subject ?? "").trim();
  const body = String(draft.body ?? "");
  const failures: QaFailure[] = [];
  const add = (cls: QaClass, detail: string) => failures.push({ class: cls, detail });

  // invented-fact: numbers + named locations / parent companies / other accounts not in the record
  const invented: string[] = [];
  for (const n of extractNumbers(body)) if (!numberMatches(n, account)) invented.push(`"${n.raw}" is not in the record or price list`);
  const bodyNoNames = [account.account, account.subsidiary_of].filter(Boolean).reduce((t, nm) => t.replace(new RegExp(esc(nm), "gi"), " "), body);
  for (const loc of KNOWN_LOCATIONS) {
    const office = account.office_location.toLowerCase();
    const l = loc.toLowerCase();
    if (l.includes(office) || office.includes(l) || (office === "philipines" && l === "philippines")) continue;
    if (account.office_location === "United States" && /^(USA|U\.S\.|America)$/.test(loc)) continue;
    if (has(bodyNoNames, loc)) invented.push(`location "${loc}" (record says ${account.office_location})`);
  }
  for (const name of KNOWN_ACCOUNT_NAMES) {
    if (name === account.account || name === account.subsidiary_of || name === "Cheers") continue; // "Cheers," is a sign-off
    if (account.account.toLowerCase().includes(name.toLowerCase())) continue;
    if (has(body, name)) invented.push(`company "${name}" is not in this record`);
  }
  if (!account.subsidiary_of && /subsidiary of|parent company|owned by|part of the \S+ group/i.test(body))
    invented.push("claims a parent company; the record has none");
  if (invented.length) add("invented-fact", invented.join("; "));

  const first = firstSentence(body);
  const personal =
    [account.account, account.sector, account.office_location, account.subsidiary_of].some((p) => has(first, p)) ||
    extractNumbers(first).some((n) => numberMatches(n, account) && !PRODUCTS.some((p) => near(n.value, p.sales_price)));
  if (!personal) add("missing-personalization", `first sentence doesn't mention ${account.account}, its sector, location or a record fact: "${first.slice(0, 80)}"`);

  const promise = body.match(FORBIDDEN) ?? subject.match(FORBIDDEN);
  if (promise) add("forbidden-promise", `"${promise[0]}"`);

  const placeholder = body.match(PLACEHOLDER) ?? subject.match(PLACEHOLDER);
  if (placeholder) add("placeholder-left", `"${placeholder[0]}"`);

  const n = words(body);
  if (n > MAX_WORDS) add("too-long", `${n} words (max ${MAX_WORDS})`);

  // Ignore a sign-off ("Cheers,\nSam"): trailing lines of 1-3 words without a question mark.
  const all = sentences(body);
  while (all.length > 2 && !all.at(-1)!.includes("?") && words(all.at(-1)!) <= 3) all.pop();
  const last2 = all.slice(-2).join(" ");
  if (!last2.includes("?") && !CTA_WORDS.test(last2)) add("missing-cta", "no question or call/chat/meet/demo ask in the last 2 sentences");

  if (!subject) add("missing-subject", "empty subject");
  else if (subject.length > MAX_SUBJECT) add("missing-subject", `subject is ${subject.length} characters (max ${MAX_SUBJECT})`);

  return { pass: failures.length === 0, failures };
}
