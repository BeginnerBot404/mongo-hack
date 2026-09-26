// Outreach task tools (docs/OUTREACH-PACK.md): plain async functions the harness wraps as local tools.
// The harness decides which ones the model can SEE (settings.granted_tools) and what next_account shows
// (settings.context_sources, via accountView). The QA gate and the queue live here; the surgeon can't touch them.
import { ObjectId, type Db, type Document } from "mongodb";
import { waypointsDb } from "../clients";
import { PRODUCTS, accounts, drafts, productCatalogText, queueSize, type Account, type Product } from "./data";
import { qa, sentences, type Draft, type QaFailure, type QaResult } from "./qa";

export { qa, PRODUCTS, productCatalogText, type Account, type Product, type QaResult, type QaFailure };
export { QA_CLASSES, type QaClass } from "./qa";

export { CONTEXT_SOURCES, GRANTABLE_TOOLS, REASONING_MODES, type ContextSource, type GrantableTool, type ReasoningMode } from "../fragments";
export const MAX_ATTEMPTS = 2;

export interface DraftDoc {
  _id?: ObjectId;
  objective_id: ObjectId | string;
  account: string;
  subject: string;
  body: string;
  qa: QaResult;
  settings_version: number | null;
  attempt: number;
  agent: string;
  worker?: string;
  created_at: Date;
}

function objKey(id: string): ObjectId | string {
  return /^[0-9a-f]{24}$/i.test(id) ? new ObjectId(id) : id;
}

export function sizeBand(employees: number): string {
  return employees < 1000 ? "small (under 1,000 employees)" : employees < 5000 ? "mid-market (1,000-5,000 employees)" : "enterprise (5,000+ employees)";
}

/**
 * What next_account shows the model, built from context_sources:
 * account_name → just the name; account_summary → + sector and size band; account_record_full → every record field.
 * product_catalog is not an account field (the harness puts productCatalogText() in the prompt when it's on).
 */
export function accountView(account: Account, context_sources: readonly string[]): Record<string, string | number> {
  const view: Record<string, string | number> = { account: account.account };
  if (context_sources.includes("account_record_full")) {
    Object.assign(view, {
      sector: account.sector,
      year_established: account.year_established,
      revenue_musd: account.revenue_musd,
      employees: account.employees,
      office_location: account.office_location,
      subsidiary_of: account.subsidiary_of || "(none)",
    });
  } else if (context_sources.includes("account_summary")) {
    Object.assign(view, { sector: account.sector, size: sizeBand(account.employees) });
  }
  return view;
}

// ---- next_account / lookup_account ------------------------------------------------------------

export interface NextAccountResult {
  done: boolean; // true when the queue is empty
  account: Account | null; // full record (for the harness; show the model `view`)
  view: Record<string, string | number> | null;
  attempt: number; // the attempt number the next submit_email will be (1 or 2)
  previous_failures: QaFailure[]; // on a retry: the QA failures of the first attempt
  remaining: number;
}

export const STALE_CLAIM_MS = 5 * 60_000;

/**
 * Claims the next account atomically for `worker` (concurrent workers never get the same account):
 * 1. this worker's own unfinished claim (a retry after a failed first attempt), else
 * 2. the lowest-queue_index account that is pending, or in_progress with a claim older than 5 minutes.
 * Sets {status: "in_progress", claimed_by: worker, claimed_at}. submit_email sets done/failed on the final attempt.
 */
export async function next_account(
  input: { objective_id: string; context_sources?: readonly string[]; worker?: string },
  db: Db = waypointsDb,
): Promise<NextAccountResult> {
  const worker = input.worker ?? "default";
  const coll = db.collection<Account>("accounts");
  const now = new Date();
  let acc = (await coll.findOneAndUpdate(
    { status: "in_progress", claimed_by: worker } as Document,
    { $set: { claimed_at: now } },
    { sort: { queue_index: 1 }, projection: { _id: 0 }, returnDocument: "after" },
  )) as Account | null;
  if (!acc)
    acc = (await coll.findOneAndUpdate(
      { $or: [{ status: "pending" }, { status: "in_progress", claimed_at: { $lt: new Date(now.getTime() - STALE_CLAIM_MS) } }] } as Document,
      { $set: { status: "in_progress", claimed_by: worker, claimed_at: now } },
      { sort: { queue_index: 1 }, projection: { _id: 0 }, returnDocument: "after" },
    )) as Account | null;
  const remaining = await coll.countDocuments({ status: { $in: ["pending", "in_progress"] } });
  if (!acc) return { done: true, account: null, view: null, attempt: 0, previous_failures: [], remaining };
  const prior = await db
    .collection<DraftDoc>("drafts")
    .find({ objective_id: objKey(input.objective_id), account: acc.account })
    .sort({ attempt: -1 })
    .limit(1)
    .toArray();
  return {
    done: false,
    account: acc,
    view: accountView(acc, input.context_sources ?? ["account_name"]),
    attempt: (prior[0]?.attempt ?? 0) + 1,
    previous_failures: prior[0]?.qa.failures ?? [],
    remaining,
  };
}

export async function lookup_account(input: { account: string }, db: Db = waypointsDb): Promise<Account | { error: string }> {
  const acc = (await db.collection<Account>("accounts").findOne({ account: input.account }, { projection: { _id: 0 } })) as Account | null;
  return acc ?? { error: `no account named "${input.account}"` };
}

// ---- outline_email -----------------------------------------------------------------------------

/** The product that fits the account's size: bigger companies get the bigger box. */
export function matchingProduct(acc: Pick<Account, "revenue_musd" | "employees">): Product {
  const by = (name: string) => PRODUCTS.find((p) => p.product === name) ?? PRODUCTS[0]!;
  if (acc.employees >= 5000 || acc.revenue_musd >= 2000) return by("GTK 500");
  if (acc.employees >= 2000 || acc.revenue_musd >= 1000) return by("GTX Plus Pro");
  if (acc.employees >= 1000) return by("GTX Pro");
  if (acc.employees >= 300) return by("MG Advanced");
  return by("GTX Plus Basic");
}

export interface Outline {
  hook: string;
  value: string;
  cta: string;
  subject: string;
}

/** Deterministic 3-line skeleton: hook from a record fact, value from the matching product, CTA question. */
export async function outline_email(input: { account: string }, db: Db = waypointsDb): Promise<Outline | { error: string }> {
  const acc = await lookup_account(input, db);
  if ("error" in acc) return acc;
  const p = matchingProduct(acc);
  return {
    hook: `${acc.account} has run its ${acc.sector} business from ${acc.office_location} since ${acc.year_established}.`,
    value: `Teams your size (${acc.employees.toLocaleString("en-US")} people) use our ${p.product} at $${p.sales_price.toLocaleString("en-US")} to keep up.`,
    cta: "Would a 15-minute call next week work?",
    subject: `${acc.account}: ${p.product} for your ${acc.sector} team`.slice(0, 60),
  };
}

// ---- precheck_email / submit_email -------------------------------------------------------------

/** Exact-draft key for precheck enforcement (required_tools includes precheck_email). */
export function draftKey(d: { account: string; subject: string; body: string }): string {
  return new Bun.CryptoHasher("sha256").update(`${d.account}\u0000${d.subject}\u0000${d.body}`).digest("hex");
}
const prechecked = new Set<string>();

export async function precheck_email(input: Draft & { account: string }, db: Db = waypointsDb): Promise<QaResult | { error: string }> {
  const acc = await lookup_account({ account: input.account }, db);
  if ("error" in acc) return acc;
  prechecked.add(draftKey(input));
  return qa(input, acc);
}

/** True when precheck_email ran on this exact draft (in this process). */
export function wasPrechecked(d: { account: string; subject: string; body: string }): boolean {
  return prechecked.has(draftKey(d));
}

export interface SubmitInput {
  objective_id: string;
  account: string;
  subject: string;
  body: string;
  agent: string;
  settings_version?: number | null;
  /** Concurrent worker id (stored on the draft). */
  worker?: string;
  /** When true (the harness sets it when required_tools has precheck_email), refuse drafts precheck_email didn't see. */
  require_precheck?: boolean;
}
export type SubmitResult =
  | { refused: true; why: string }
  | {
      refused: false;
      pass: boolean;
      failures: QaFailure[];
      attempt: number;
      account_status: "done" | "failed" | "in_progress";
      retry_allowed: boolean;
      draft_id: string;
    };

export async function submit_email(input: SubmitInput, db: Db = waypointsDb): Promise<SubmitResult> {
  const acc = (await db.collection<Account>("accounts").findOne({ account: input.account })) as Account | null;
  if (!acc) return { refused: true, why: `no account named "${input.account}"` };
  if (acc.status !== "pending" && acc.status !== "in_progress")
    return { refused: true, why: `${input.account} is not in the work queue (status ${acc.status})` };
  if (input.require_precheck && !wasPrechecked(input))
    return { refused: true, why: "precheck_email is required: call it on this exact draft (same subject and body) before submit_email" };
  const objective_id = objKey(input.objective_id);
  const prior = await db.collection("drafts").countDocuments({ objective_id, account: input.account });
  const attempt = prior + 1;
  const result = qa(input, acc);
  let settings_version = input.settings_version ?? null;
  if (settings_version === null) {
    const c = await db.collection("harness_config").findOne({ status: { $in: ["active", "probation", "kept"] } }, { sort: { version: -1 } });
    settings_version = (c?.version as number | undefined) ?? null;
  }
  const doc: DraftDoc = {
    objective_id,
    account: input.account,
    subject: String(input.subject ?? ""),
    body: String(input.body ?? ""),
    qa: result,
    settings_version,
    attempt,
    agent: String(input.agent ?? "unknown"),
    ...(input.worker ? { worker: input.worker } : {}),
    created_at: new Date(),
  };
  const { insertedId } = await db.collection("drafts").insertOne(doc);
  const account_status = result.pass ? "done" : attempt >= MAX_ATTEMPTS ? "failed" : "in_progress";
  // Final attempt: done/failed. First failed attempt: stays in_progress, claimed by the same worker for its retry.
  if (account_status !== "in_progress")
    await db.collection("accounts").updateOne({ account: input.account }, { $set: { status: account_status }, $unset: { claimed_by: "", claimed_at: "" } });
  else await db.collection("accounts").updateOne({ account: input.account }, { $set: { status: "in_progress", claimed_at: new Date(), ...(input.worker ? { claimed_by: input.worker } : {}) } });
  return {
    refused: false,
    pass: result.pass,
    failures: result.failures,
    attempt,
    account_status,
    retry_allowed: account_status === "in_progress",
    draft_id: insertedId.toHexString(),
  };
}

// ---- stats / reset -----------------------------------------------------------------------------

export interface QueueStats {
  done: number; // accounts finished (passed or failed out)
  passed: number;
  failed: number;
  in_progress: number; // claimed by a worker, not finished
  pending: number;
  total: number; // queue size (accounts not in reserve)
  submissions: number;
  first_try_pass_rate: number; // % of attempt-1 drafts that passed (0..100)
  rolling_pass_rate_10: number; // % of the last 10 drafts that passed (0..100)
}

const pct = (a: number, b: number) => (b ? Math.round((1000 * a) / b) / 10 : 0);

export async function getQueueStats(input: { objective_id: string } | string, db: Db = waypointsDb): Promise<QueueStats> {
  const objective_id = objKey(typeof input === "string" ? input : String(input.objective_id));
  const [byStatus, firsts, last10, submissions] = await Promise.all([
    db.collection("accounts").aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray(),
    db.collection("drafts").find({ objective_id, attempt: 1 }, { projection: { "qa.pass": 1 } }).toArray(),
    db.collection("drafts").find({ objective_id }, { projection: { "qa.pass": 1 } }).sort({ created_at: -1 }).limit(10).toArray(),
    db.collection("drafts").countDocuments({ objective_id }),
  ]);
  const n = (s: string) => (byStatus.find((b) => b._id === s)?.n as number | undefined) ?? 0;
  return {
    done: n("done") + n("failed"),
    passed: n("done"),
    failed: n("failed"),
    in_progress: n("in_progress"),
    pending: n("pending"),
    total: n("done") + n("failed") + n("pending") + n("in_progress"),
    submissions,
    first_try_pass_rate: pct(firsts.filter((d) => d.qa?.pass).length, firsts.length),
    rolling_pass_rate_10: pct(last10.filter((d) => d.qa?.pass).length, last10.length),
  };
}

/** Put the queue back: first QUEUE_SIZE accounts pending, the rest reserve; drafts cleared; precheck memory cleared. */
export async function resetOutreach(db: Db = waypointsDb, size = queueSize()): Promise<{ pending: number; drafts_deleted: number }> {
  await db.collection("accounts").updateMany({ queue_index: { $lt: size } }, { $set: { status: "pending" }, $unset: { claimed_by: "", claimed_at: "" } });
  await db.collection("accounts").updateMany({ queue_index: { $gte: size } }, { $set: { status: "reserve" }, $unset: { claimed_by: "", claimed_at: "" } });
  const { deletedCount } = await db.collection("drafts").deleteMany({});
  prechecked.clear();
  return { pending: await db.collection("accounts").countDocuments({ status: "pending" }), drafts_deleted: deletedCount };
}

export async function ensureOutreachIndexes(db: Db = waypointsDb) {
  await db.collection("accounts").createIndex({ account: 1 }, { unique: true });
  await db.collection("accounts").createIndex({ status: 1, queue_index: 1 });
  await db.collection("drafts").createIndex({ objective_id: 1, created_at: -1 });
  await db.collection("drafts").createIndex({ objective_id: 1, account: 1, attempt: 1 });
}

/** Failure-rate helper for probation verdicts: drafts in a window and how many had `cls`. */
export async function classRate(
  objective_id: ObjectId | string,
  cls: string,
  window: { after?: Date; until?: Date },
  db: Db = waypointsDb,
): Promise<{ hits: number; drafts: number }> {
  const created: Document = {};
  if (window.after) created.$gt = window.after;
  if (window.until) created.$lte = window.until;
  const filter: Document = { objective_id, ...(Object.keys(created).length ? { created_at: created } : {}) };
  const [hits, total] = await Promise.all([
    db.collection("drafts").countDocuments({ ...filter, "qa.failures.class": cls }),
    db.collection("drafts").countDocuments(filter),
  ]);
  return { hits, drafts: total };
}

export { sentences, accounts, drafts };

// ---- continuous mode (harness --continuous) ----------------------------------------------------

/**
 * Next batch for a new objective: finished accounts of the last batch become "contacted" (so queue stats count only
 * this batch), then the next `size` reserve accounts by queue_index become pending. When no reserve is left, every
 * account goes back to reserve first (a new campaign over the whole list) and `campaign_reset` is true.
 */
export async function loadNextBatch(size = queueSize(), db: Db = waypointsDb): Promise<{ loaded: number; campaign_reset: boolean; reserve_left: number }> {
  const col = db.collection("accounts");
  await col.updateMany({ status: { $in: ["done", "failed"] } }, { $set: { status: "contacted" }, $unset: { claimed_by: "", claimed_at: "" } });
  let campaign_reset = false;
  if (!(await col.countDocuments({ status: "reserve" }))) {
    await col.updateMany({ status: { $in: ["contacted", "done", "failed"] } }, { $set: { status: "reserve" } });
    campaign_reset = true;
  }
  const next = await col.find({ status: "reserve" }, { projection: { _id: 1 } }).sort({ queue_index: 1 }).limit(size).toArray();
  await col.updateMany({ _id: { $in: next.map((d) => d._id) } }, { $set: { status: "pending" } });
  return { loaded: next.length, campaign_reset, reserve_left: await col.countDocuments({ status: "reserve" }) };
}
