// view:drafts — the outreach work product. Tails waypoints.drafts: one history row per draft (above),
// then the latest draft in full (subject + wrapped body), its QA verdict (failure classes in red),
// account + queue position, the settings version it was written under, and pass rates computed from drafts.
//   bun run view:drafts [--db waypoints_smoke]
import type { Document } from "mongodb";
import {
  DB_NAME, bgreen, bmagenta, bold, bred, byellow, cols, db, dim, follow, green, hhmmss, oneLine, onResize, paint, red, rows, wrap,
} from "./common";

let drafts: Document[] = []; // oldest first
const queuePos = new Map<string, number>(); // account → queue_index
let queueSize = 0;
let status = "connecting";

async function loadAll() {
  drafts = await db.collection("drafts").find({}).sort({ created_at: 1, _id: 1 }).limit(2000).toArray();
  try {
    const accts = await db.collection("accounts").find({}, { projection: { account: 1, queue_index: 1, status: 1 } }).toArray();
    for (const a of accts) if (a.account) queuePos.set(a.account, a.queue_index);
    // queue = accounts in play (pending/done/failed); the rest of the 85 are loaded but not queued
    queueSize = accts.filter((a) => ["pending", "done", "failed"].includes(a.status)).length || Number(process.env.QUEUE_SIZE ?? 0);
  } catch {}
}

const firstTry = (d: Document) => (d.attempt ?? 1) <= 1;
const passed = (d: Document) => !!d.qa?.pass;
const classes = (d: Document): string[] => (d.qa?.failures ?? []).map((f: Document) => String(f.class));

function rates() {
  const ft = drafts.filter(firstTry);
  const ftPass = ft.filter(passed).length;
  const last10 = drafts.slice(-10);
  const l10 = last10.filter(passed).length;
  const accounts = new Set(drafts.map((d) => d.account));
  const done = new Set(drafts.filter((d) => passed(d) || (d.attempt ?? 1) >= 2).map((d) => d.account));
  return {
    firstTry: ft.length ? ftPass / ft.length : null, ftN: ft.length, ftPass,
    rolling: last10.length ? l10 / last10.length : null, rN: last10.length, rPass: l10,
    accounts: accounts.size, done: done.size,
  };
}
const p = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)}%`);
const rateColor = (x: number | null) => (x == null ? dim : x >= 0.8 ? bgreen : x >= 0.5 ? byellow : bred);

function historyRow(d: Document): string {
  const t = d.created_at instanceof Date ? hhmmss(d.created_at) : "--:--:--";
  const mark = passed(d) ? bgreen("✔") : bred("✘");
  const q = queuePos.get(d.account);
  const acct = `${q != null ? `#${q} ` : ""}${d.account ?? "?"}`;
  const tag = (d.attempt ?? 1) > 1 ? byellow(" retry") : "";
  const why = passed(d) ? dim(oneLine(d.subject).slice(0, 40)) : red(classes(d).join(", "));
  return `${dim(t)} ${mark} ${bold(acct)}${tag} ${bmagenta(`v${d.settings_version ?? "?"}`)} ${why}`;
}

function render() {
  const W = Math.min(cols(), 110);
  const H = rows();
  const live = status === "live" ? green("●") : red("○");
  const r = rates();
  const head = [
    `${bold("DRAFTS")} ${dim("the work, graded by the QA gate")} · db ${DB_NAME} ${live}`,
    `first-try pass ${rateColor(r.firstTry)(bold(p(r.firstTry)))} ${dim(`(${r.ftPass}/${r.ftN})`)} · last-10 ${rateColor(r.rolling)(bold(p(r.rolling)))} ${dim(`(${r.rPass}/${r.rN})`)} · accounts ${r.done}${queueSize ? `/${queueSize}` : ""} ${dim("· goal ≥80% first-try")}`,
  ];
  if (!drafts.length) return paint([...head, "", dim("no drafts yet — waiting for the first submit_email…")]);

  const d = drafts[drafts.length - 1]!;
  const latest: string[] = [];
  latest.push(dim("─".repeat(W)));
  const q = queuePos.get(d.account);
  latest.push(
    `${bold("LATEST")} ${bold(String(d.account ?? "?"))}${q != null ? dim(` · queue #${q}${queueSize ? ` of ${queueSize}` : ""}`) : ""} · attempt ${d.attempt ?? 1} · written under ${bmagenta(`v${d.settings_version ?? "?"}`)}${d.agent ? dim(` · ${d.agent}`) : ""}`,
  );
  latest.push(...wrap(`Subject: ${oneLine(d.subject) || "(empty)"}`, W, "         ").map(bold));
  const body = wrap(String(d.body ?? ""), W - 2, "").map((l) => "  " + l);
  const verdict: string[] = [];
  if (passed(d)) verdict.push(bgreen(bold("✔ PASS")));
  else {
    verdict.push(bred(bold(`✘ FAIL  ${classes(d).join(" · ")}`)));
    for (const f of d.qa?.failures ?? []) verdict.push(...wrap(`  ${f.class}: ${oneLine(f.detail)}`, W, "    ").map(red));
  }
  // budget: head + verdict always; body trimmed; history gets what's left (at least 3 rows)
  const bodyRoom = Math.max(3, H - head.length - latest.length - verdict.length - 5);
  const bodyShown = body.length > bodyRoom ? [...body.slice(0, bodyRoom - 1), dim(`  … ${body.length - bodyRoom + 1} more lines`)] : body;
  const histRoom = Math.max(0, H - head.length - latest.length - bodyShown.length - verdict.length - 1);
  const hist = drafts.slice(0, -1).slice(-histRoom).map(historyRow);
  paint([...head, ...hist, ...latest, ...bodyShown, ...verdict]);
}

let pending: Promise<void> = Promise.resolve();
const tick = (reload: boolean) => {
  pending = pending.then(async () => {
    try {
      if (reload) await loadAll();
    } catch {}
    render();
  });
};

tick(true);
onResize(() => tick(false));
await follow(
  [{ $match: { "ns.coll": { $in: ["drafts", "accounts"] }, operationType: { $in: ["insert", "update", "replace", "delete"] } } }],
  () => tick(true),
  (s) => {
    status = s;
    tick(false);
  },
);
