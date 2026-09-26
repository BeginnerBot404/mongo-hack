// Spec-first tests of the harness_config gate (docs/CONTRACT.md "harness_config", docs/OUTREACH-PACK.md
// "Harness settings"). Runs against a throwaway db: `waypoints_test_*`, dropped in afterAll.
import { afterAll, beforeAll, beforeEach, describe, expect, test, setDefaultTimeout } from "bun:test";
setDefaultTimeout(120_000); // Atlas round trips + transactions
import { ObjectId, type Db } from "mongodb";

if (!process.env.WAYPOINTS_DB?.startsWith("waypoints_test_"))
  process.env.WAYPOINTS_DB = `waypoints_test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const clients = await import("../src/clients");
const S = await import("../src/settings");
const F = await import("../src/fragments");
const db: Db = clients.waypointsDb;

// Refuse to touch anything that isn't a throwaway db (bun test shares modules across files).
if (!db.databaseName.startsWith("waypoints_test_"))
  throw new Error(`settings-gate: waypointsDb is "${db.databaseName}", not a waypoints_test_* db; run via \`bun run test:all\``);

const AGENT = "test";
let objectiveId: ObjectId;
let seq = 0;

async function checkpoint(bearing: number) {
  seq += 1;
  await db.collection("checkpoints").insertOne({
    objective_id: objectiveId,
    seq,
    bearings_snapshot: [{ name: "tests_passing", current: bearing, target: 10 }],
    created_at: new Date(),
  });
}

async function reset() {
  await Promise.all(["harness_config", "objectives", "checkpoints", "failures", "events", "taps"].map((c) => db.collection(c).deleteMany({})));
  seq = 0;
  await db.collection("harness_config").insertOne(S.seedConfig() as any);
  objectiveId = new ObjectId();
  // Non-outreach objective: probation = 2 checkpoints, kept iff bearing >= baseline and watch_class didn't recur.
  await db.collection("objectives").insertOne({
    _id: objectiveId,
    title: "gate test",
    bearings: [{ name: "tests_passing", target: 10 }],
    end_state: { description: "all tests pass", bearing: "tests_passing", target: 10 },
    created_at: new Date(),
  });
  await checkpoint(5);
}

const apply = (field: string, value: unknown, watch_class = "regression") =>
  S.applySettingsChange({ objective_id: objectiveId.toHexString(), field, value, reason: { kind: "manual_seed", summary: "test" }, watch_class, agent: AGENT });
const evaluate = () => S.evaluateProbation({ objective_id: objectiveId.toHexString(), agent: AGENT });
const all = () => db.collection("harness_config").find({}).sort({ version: 1 }).toArray();

beforeAll(async () => {
  await db.createCollection("harness_config", { validator: { $jsonSchema: S.HARNESS_CONFIG_SCHEMA } }).catch(() => {});
});
afterAll(async () => {
  await db.dropDatabase();
});
beforeEach(reset);

describe("gate refuses", () => {
  test("end_state", async () => {
    const r: any = await apply("end_state", { description: "x", bearing: "tests_passing", target: 1 });
    expect(r.applied).toBe(false);
    expect(r.gate.passed).toBe(false);
    expect((await all()).length).toBe(1);
  });
  test("unknown fields (objective, qa_gate, queue, bearing)", async () => {
    for (const f of ["objective", "qa_gate", "queue", "bearing", "bearings"]) {
      const r: any = await apply(f, ["x"]);
      expect(r.applied).toBe(false);
    }
    expect((await all()).length).toBe(1);
  });
  test("non-enum context_sources", async () => {
    expect(((await apply("context_sources", ["account_name", "web_search"])) as any).applied).toBe(false);
    expect(((await apply("context_sources", "account_record_full")) as any).applied).toBe(false);
  });
  test("non-enum granted_tools", async () => {
    expect(((await apply("granted_tools", ["send_email"])) as any).applied).toBe(false);
  });
  test("non-enum reasoning", async () => {
    for (const v of ["high", true, 1, ["on"]]) expect(((await apply("reasoning", v)) as any).applied).toBe(false);
  });
  test("non-enum model", async () => {
    expect(((await apply("model", "gpt-4o")) as any).applied).toBe(false);
  });
  test("sentinel_threshold out of range", async () => {
    expect(((await apply("sentinel_threshold", 1.5)) as any).applied).toBe(false);
    expect(((await apply("sentinel_threshold", -0.1)) as any).applied).toBe(false);
  });
  test("nothing refused was written", async () => {
    await apply("reasoning", "maybe");
    const docs = await all();
    expect(docs.length).toBe(1);
    expect(docs[0]!.status).toBe("active");
  });
  test("validator rejects end_state inside settings even on a direct insert", async () => {
    const bad = { ...S.seedConfig(), version: 99, settings: { ...F.SEED_SETTINGS, end_state: { target: 0 } } };
    await expect(db.collection("harness_config").insertOne(bad as any)).rejects.toThrow();
  });
});

describe("gate accepts one change into probation", () => {
  test("valid single-field change → v2 on probation, v1 superseded", async () => {
    const r: any = await apply("context_sources", ["account_name", "product_catalog", "account_record_full"], "invented-fact");
    expect(r.applied).toBe(true);
    const [v1, v2] = await all();
    expect(v1!.status).toBe("superseded");
    expect(v2!.version).toBe(2);
    expect(v2!.status).toBe("probation");
    expect(v2!.parent_version).toBe(1);
    expect(v2!.change.field).toBe("context_sources");
    expect(v2!.settings.context_sources).toContain("account_record_full");
    // only that one field changed
    const { context_sources: a, ...restNew } = v2!.settings;
    const { context_sources: b, ...restOld } = v1!.settings;
    expect(restNew).toEqual(restOld);
    expect((await S.currentConfig()).version).toBe(2);
  });
  test("reasoning off → on is accepted", async () => {
    expect(((await apply("reasoning", "on")) as any).applied).toBe(true);
  });
  test("a second change while one is on probation is refused", async () => {
    expect(((await apply("reasoning", "on")) as any).applied).toBe(true);
    const r: any = await apply("granted_tools", ["outline_email"]);
    expect(r.applied).toBe(false);
    expect((await all()).length).toBe(2);
  });
});

describe("probation verdict", () => {
  test("kept exactly once (two concurrent evaluations → one verdict)", async () => {
    await apply("reasoning", "on");
    await checkpoint(6);
    await checkpoint(7);
    const results: any[] = await Promise.all([evaluate(), evaluate()]);
    expect(results.filter((r) => r.evaluated).length).toBe(1);
    expect(results.find((r) => r.evaluated).verdict).toBe("kept");
    const docs = await all();
    expect(docs.length).toBe(2);
    expect(docs[1]!.status).toBe("kept");
    expect(docs[1]!.outcome?.verdict).toBe("kept");
    expect(await db.collection("events").countDocuments({ kind: "probation_verdict" })).toBe(1);
    // a later evaluation is a no-op
    expect(((await evaluate()) as any).evaluated).toBe(false);
  });

  test("rolled back exactly once (two concurrent evaluations → one rollback version)", async () => {
    await apply("reasoning", "on");
    await checkpoint(3);
    await checkpoint(2); // bearing below baseline 5 → roll back
    const results: any[] = await Promise.all([evaluate(), evaluate()]);
    expect(results.filter((r) => r.evaluated).length).toBe(1);
    expect(results.find((r) => r.evaluated).verdict).toBe("rolled_back");
    const docs = await all();
    expect(docs.length).toBe(3); // v1 superseded, v2 rolled_back, v3 restored — no duplicate v4
    expect(docs.filter((d) => d.parent_version === 2).length).toBe(1);
    expect(await db.collection("events").countDocuments({ kind: "probation_verdict" })).toBe(1);
  });

  test("rollback restores the parent's settings as a new active version", async () => {
    const v1 = (await all())[0]!;
    await apply("granted_tools", ["outline_email"]);
    await checkpoint(4);
    await checkpoint(4);
    const r: any = await evaluate();
    expect(r.evaluated).toBe(true);
    expect(r.verdict).toBe("rolled_back");
    const [, v2, v3] = await all();
    expect(v2!.status).toBe("rolled_back");
    expect(v2!.outcome?.verdict).toBe("rolled_back");
    expect(v3!.version).toBe(3);
    expect(v3!.status).toBe("active");
    expect(v3!.parent_version).toBe(2);
    expect(v3!.settings).toEqual(v1.settings);
    expect((await S.currentConfig()).version).toBe(3);
  });

  test("waits for checkpoints_required before deciding", async () => {
    await apply("reasoning", "on");
    await checkpoint(6);
    const r: any = await evaluate();
    expect(r.evaluated).toBe(false);
    expect((await S.currentConfig()).status).toBe("probation");
  });

  test("watched class recurring during probation → rolled back", async () => {
    await apply("reasoning", "on", "regression");
    await db.collection("failures").insertOne({ objective_id: objectiveId, class: "regression", created_at: new Date(Date.now() + 1000) });
    await checkpoint(6);
    await checkpoint(7);
    expect(((await evaluate()) as any).verdict).toBe("rolled_back");
  });

  test("manual rollbackSettings restores parent settings as a new version", async () => {
    await apply("reasoning", "on");
    const r: any = await S.rollbackSettings({ reason: "test", agent: AGENT, objective_id: objectiveId.toHexString() });
    expect(r.rolled_back).toBe(true);
    const cur = await S.currentConfig();
    expect(cur.version).toBe(3);
    expect(cur.settings.reasoning).toBe("off");
  });
});
