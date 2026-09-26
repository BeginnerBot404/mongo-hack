// Spec-first tests of the outreach queue (docs/OUTREACH-PACK.md "Task tools"): atomic claims under
// concurrent workers, the one-retry rule, and getQueueStats. Uses its own throwaway db, dropped in afterAll.
import { afterAll, beforeEach, describe, expect, test, setDefaultTimeout } from "bun:test";
setDefaultTimeout(120_000); // Atlas round trips + transactions
import { ObjectId, type Db } from "mongodb";

if (!process.env.WAYPOINTS_DB?.startsWith("waypoints_test_"))
  process.env.WAYPOINTS_DB = `waypoints_test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const clients = await import("../src/clients");
const T = await import("../src/outreach/tools");
if (!clients.waypointsDb.databaseName.startsWith("waypoints_test_"))
  throw new Error(`queue-claim: waypointsDb is "${clients.waypointsDb.databaseName}"; run via \`bun run test:all\``);

const db: Db = clients.mongo.db(`waypoints_test_q_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`);
let objective_id = "";

const RECORDS = [
  ["Acme Corporation", "technology", 1996, 1100.04, 2822, "United States", ""],
  ["Betasoloin", "medical", 1999, 251.41, 495, "United States", ""],
  ["Betatech", "medical", 1986, 647.18, 1185, "Kenya", ""],
  ["Bioholding", "medical", 2012, 587.34, 1356, "Philipines", ""],
  ["Bioplex", "medical", 1991, 326.82, 1016, "United States", ""],
  ["Blackzim", "retail", 2009, 497.11, 1588, "United States", ""],
  ["Bluth Company", "technology", 1993, 1242.32, 3027, "United States", "Acme Corporation"],
  ["Bubba Gump", "software", 2002, 987.39, 2253, "United States", ""],
  ["Cancity", "retail", 2001, 718.62, 2448, "United States", ""],
  ["Cheers", "entertainment", 1993, 4269.9, 6472, "United States", "Massive Dynamic"],
] as const;

async function load(n: number) {
  await Promise.all(["accounts", "drafts", "objectives"].map((c) => db.collection(c).deleteMany({})));
  objective_id = new ObjectId().toHexString();
  await db.collection("objectives").insertOne({ _id: new ObjectId(objective_id), task: "outreach", title: "queue test", created_at: new Date() });
  await db.collection("accounts").insertMany(
    RECORDS.slice(0, n).map(([account, sector, year_established, revenue_musd, employees, office_location, subsidiary_of], queue_index) => ({
      account, sector, year_established, revenue_musd, employees, office_location, subsidiary_of, queue_index, status: "pending",
    })),
  );
}

// Passes QA for any record: name in the first sentence, only a catalog price, CTA question.
const good = (account: string) => ({
  subject: `A quick idea for ${account}`,
  body: `${account} caught our eye this quarter. Our GTX Pro ($4,821) gives teams live inventory visibility. Would you be open to a short call next week?`,
});
const bad = (account: string) => ({ subject: "", body: good(account).body }); // missing-subject only

const submit = (account: string, draft: { subject: string; body: string }, worker: string) =>
  T.submit_email({ objective_id, account, ...draft, agent: "test", worker, settings_version: 1 }, db);

afterAll(async () => {
  await db.dropDatabase();
});

describe("queue claims", () => {
  beforeEach(() => load(10));

  test("4 concurrent claimers: every account claimed exactly once", async () => {
    const claims: { worker: string; account: string; attempt: number }[] = [];
    const worker = async (w: string) => {
      for (let i = 0; i < 50; i++) {
        const r = await T.next_account({ objective_id, worker: w, context_sources: ["account_name"] }, db);
        if (r.done || !r.account) return;
        claims.push({ worker: w, account: r.account.account, attempt: r.attempt });
        const s = await submit(r.account.account, good(r.account.account), w);
        if ("refused" in s && s.refused) throw new Error(`refused: ${(s as any).why}`);
      }
      throw new Error(`worker ${w} never saw an empty queue`);
    };
    await Promise.all(["w1", "w2", "w3", "w4"].map(worker));

    const byAccount = new Map<string, Set<string>>();
    for (const c of claims) (byAccount.get(c.account) ?? byAccount.set(c.account, new Set()).get(c.account)!).add(c.worker);
    expect(byAccount.size).toBe(10);
    for (const [acc, workers] of byAccount) expect({ acc, workers: workers.size }).toEqual({ acc, workers: 1 });
    expect(claims.filter((c) => c.attempt === 1).length).toBe(10);
    expect(await db.collection("accounts").countDocuments({ status: "pending" })).toBe(0);
    expect(await db.collection("accounts").countDocuments({ status: "in_progress" })).toBe(0);

    const stats = await T.getQueueStats({ objective_id }, db);
    expect(stats.total).toBe(10);
    expect(stats.done).toBe(10);
    expect(stats.pending).toBe(0);
    expect(stats.in_progress).toBe(0);
    expect(stats.passed + stats.failed).toBe(stats.done);
    expect(stats.submissions).toBe(await db.collection("drafts").countDocuments({}));
    expect(stats.submissions).toBeGreaterThanOrEqual(10);
  });

  test("next_account on an empty queue → done", async () => {
    await db.collection("accounts").updateMany({}, { $set: { status: "done" } });
    const r = await T.next_account({ objective_id, worker: "w" }, db);
    expect(r.done).toBe(true);
    expect(r.account).toBeNull();
  });
});

describe("submit_email retry rule", () => {
  beforeEach(() => load(2));

  test("fail twice → failed; pass → done; stats consistent", async () => {
    const a = await T.next_account({ objective_id, worker: "w" }, db);
    const A = a.account!.account;
    expect(a.attempt).toBe(1);
    const s1: any = await submit(A, bad(A), "w");
    expect(s1.refused).toBe(false);
    expect(s1.pass).toBe(false);
    expect(s1.failures.map((f: any) => f.class)).toEqual(["missing-subject"]);
    expect(s1.retry_allowed).toBe(true);
    expect(s1.account_status).toBe("in_progress");

    const a2 = await T.next_account({ objective_id, worker: "w" }, db);
    expect(a2.account!.account).toBe(A); // the retry comes back to the same worker
    expect(a2.attempt).toBe(2);
    expect(a2.previous_failures.map((f) => f.class)).toContain("missing-subject");
    const s2: any = await submit(A, bad(A), "w");
    expect(s2.pass).toBe(false);
    expect(s2.retry_allowed).toBe(false);
    expect(s2.account_status).toBe("failed");
    expect((await db.collection("accounts").findOne({ account: A }))!.status).toBe("failed");

    const b = await T.next_account({ objective_id, worker: "w" }, db);
    const B = b.account!.account;
    expect(B).not.toBe(A);
    const s3: any = await submit(B, good(B), "w");
    expect(s3.pass).toBe(true);
    expect(s3.account_status).toBe("done");
    expect((await db.collection("accounts").findOne({ account: B }))!.status).toBe("done");

    expect((await T.next_account({ objective_id, worker: "w" }, db)).done).toBe(true);

    const drafts = await db.collection("drafts").find({}).sort({ created_at: 1 }).toArray();
    expect(drafts.map((d) => [d.account, d.attempt, d.qa.pass])).toEqual([[A, 1, false], [A, 2, false], [B, 1, true]]);
    for (const d of drafts) for (const k of ["subject", "body", "settings_version", "agent", "created_at"]) expect(d).toHaveProperty(k);

    const stats = await T.getQueueStats({ objective_id }, db);
    expect(stats).toMatchObject({ total: 2, done: 2, passed: 1, failed: 1, pending: 0, in_progress: 0, submissions: 3 });
    expect(stats.first_try_pass_rate).toBeCloseTo(50, 0);
    expect(stats.rolling_pass_rate_10).toBeCloseTo(33.3, 0);
  });

  test("a third submit after failing out is not accepted as a new attempt", async () => {
    const a = await T.next_account({ objective_id, worker: "w" }, db);
    const A = a.account!.account;
    await submit(A, bad(A), "w");
    await submit(A, bad(A), "w");
    const s3: any = await submit(A, good(A), "w");
    const status = (await db.collection("accounts").findOne({ account: A }))!.status;
    // Either refused, or it must not flip a failed-out account to done / create attempt 3.
    if (!s3.refused) expect(status).toBe("failed");
    expect(await db.collection("drafts").countDocuments({ account: A, attempt: { $gt: 2 } })).toBe(0);
  });
});
