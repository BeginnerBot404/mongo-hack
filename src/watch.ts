// Live terminal observer for the Waypoints DB. Reads only; never writes.
// `bun run watch [--objective <id>] [--once]`
// Follows the most recently updated objective via a MongoDB change stream on the whole Waypoints DB.
import { ObjectId, type ChangeStream, type Document } from "mongodb";
import { mongo, waypointsDb as db } from "./clients";

// ---------- args ----------
const argv = process.argv.slice(2);
const ONCE = argv.includes("--once");
const pinArg = (() => {
  const i = argv.indexOf("--objective");
  return i >= 0 ? argv[i + 1] : undefined;
})();
if (pinArg !== undefined && !ObjectId.isValid(pinArg)) {
  console.error(`--objective "${pinArg}" is not a valid ObjectId`);
  process.exit(2);
}
const PINNED = pinArg ? new ObjectId(pinArg) : null;
const TTY = !!process.stdout.isTTY;
const COLOR = !process.env.NO_COLOR && (TTY || !!process.env.FORCE_COLOR);

// ---------- ansi ----------
const esc = (code: string) => (s: string) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
const bold = esc("1");
const dim = esc("2");
const red = esc("31");
const green = esc("32");
const yellow = esc("33");
const magenta = esc("35");
const cyan = esc("36");
const inverse = esc("7");
const ANSI_RE = /\x1b\[[0-9;?]*[A-Za-z]/g;
const visLen = (s: string) => [...s.replace(ANSI_RE, "")].length;

/** Truncate to `width` visible chars, preserving ANSI codes. */
function fit(s: string, width: number): string {
  if (visLen(s) <= width) return s;
  let out = "";
  let n = 0;
  let i = 0;
  while (i < s.length && n < width - 1) {
    if (s[i] === "\x1b") {
      const m = /^\x1b\[[0-9;?]*[A-Za-z]/.exec(s.slice(i));
      if (m) {
        out += m[0];
        i += m[0].length;
        continue;
      }
    }
    const cp = s.codePointAt(i)!;
    const ch = String.fromCodePoint(cp);
    out += ch;
    i += ch.length;
    n++;
  }
  return out + "…" + (COLOR ? "\x1b[0m" : "");
}
const oneLine = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();

const AGENT_COLORS: Record<string, (s: string) => string> = { hermes: magenta, langgraph: cyan };
const agentColor = (a: string | null | undefined) => (a ? (AGENT_COLORS[a.toLowerCase()] ?? yellow) : dim);
const agentTag = (a: string | null | undefined) => agentColor(a)(bold(a ?? "?"));

// ---------- state ----------
type Kind = "objective" | "checkpoint" | "decision" | "failure" | "policy" | "resume";
interface FeedEvent {
  id: string;
  kind: Kind;
  at: Date;
  agent: string | null;
  doc: Document;
}

const COLLS: Record<string, Kind> = {
  checkpoints: "checkpoint",
  decisions: "decision",
  failures: "failure",
  policies: "policy",
  resumes: "resume",
};

let objective: Document | null = null;
let events: FeedEvent[] = [];
const seen = new Set<string>();
const checkpointsBySeq = new Map<number, Document>();
const lastWrite = new Map<string, Date>(); // agent -> last write on this objective
const bearingFlash = new Map<string, { delta: number; at: number }>();
let streamStatus: "connecting" | "live" | "reconnecting" = "connecting";
let streamError = "";

const oid = (v: unknown) => (v instanceof ObjectId ? v.toHexString() : String(v ?? ""));
const asDate = (v: unknown) => (v instanceof Date ? v : new Date(String(v ?? 0)));

function noteWrite(agent: string | null | undefined, at: Date) {
  if (!agent) return;
  const prev = lastWrite.get(agent);
  if (!prev || prev < at) lastWrite.set(agent, at);
}

function addEvent(kind: Kind, doc: Document) {
  const id = `${kind}:${oid(doc._id)}`;
  if (seen.has(id)) return;
  seen.add(id);
  const at = asDate(doc.created_at);
  const agent = (doc.agent as string | undefined) ?? null;
  events.push({ id, kind, at, agent, doc });
  events.sort((a, b) => a.at.getTime() - b.at.getTime());
  if (events.length > 200) events = events.slice(-200);
  if (kind === "checkpoint" && typeof doc.seq === "number") checkpointsBySeq.set(doc.seq, doc);
  noteWrite(agent, at);
}

function setObjective(doc: Document) {
  const prev = objective;
  if (prev && oid(prev._id) === oid(doc._id)) {
    const now = Date.now();
    for (const b of (doc.bearings ?? []) as Document[]) {
      const old = ((prev.bearings ?? []) as Document[]).find((p) => p.name === b.name);
      if (old && typeof b.current === "number" && b.current !== old.current) {
        bearingFlash.set(b.name, { delta: b.current - ((old.current as number | null) ?? 0), at: now });
      }
    }
  }
  objective = doc;
  noteWrite(doc.last_agent as string | undefined, asDate(doc.updated_at));
}

async function newestObjective(): Promise<Document | null> {
  if (PINNED) return db.collection("objectives").findOne({ _id: PINNED });
  return db.collection("objectives").findOne({}, { sort: { updated_at: -1 } });
}

/** Load full state for one objective (replaces current state). */
async function loadSnapshot(target?: Document | null) {
  const obj = target ?? (await newestObjective());
  events = [];
  seen.clear();
  checkpointsBySeq.clear();
  lastWrite.clear();
  bearingFlash.clear();
  objective = null;
  if (!obj) return;
  setObjective(obj);
  addEvent("objective", obj);
  const results = await Promise.all(
    Object.entries(COLLS).map(async ([coll, kind]) => {
      const docs = await db
        .collection(coll)
        .find({ objective_id: obj._id }, { projection: { embedding: 0 } })
        .sort({ created_at: -1 })
        .limit(kind === "checkpoint" ? 500 : 50)
        .toArray();
      return docs.map((d) => [kind, d] as const);
    }),
  );
  for (const [kind, d] of results.flat()) addEvent(kind, d);
}

// ---------- render ----------
function bar(cur: number | null, target: number, width: number) {
  if (cur === null) return dim("░".repeat(width));
  const ratio = target > 0 ? Math.max(0, Math.min(1, cur / target)) : 0;
  const n = Math.round(ratio * width);
  const fill = "█".repeat(n);
  return (ratio >= 1 ? green(fill) : yellow(fill)) + dim("░".repeat(width - n));
}

const secs = (d: Date) => Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
const hhmmss = (d: Date) => d.toTimeString().slice(0, 8);

function primaryBearing(snapshot: Document[] | undefined): string {
  const b = snapshot?.[0];
  if (!b) return "";
  return `${b.current ?? "?"}/${b.target}`;
}

function resumeText(ev: FeedEvent) {
  const d = ev.doc;
  const who = String(d.resumed_by ?? ev.agent ?? "?").toUpperCase();
  const from = d.previous_agent ? String(d.previous_agent).toUpperCase() : "fresh";
  const seq = d.from_checkpoint_seq as number | null;
  const cp = seq !== null && seq !== undefined ? checkpointsBySeq.get(seq) : undefined;
  const at = cp ? `, ${primaryBearing(cp.bearings_snapshot as Document[])}` : "";
  const src = seq !== null && seq !== undefined ? `checkpoint #${seq}${at}` : "no checkpoint";
  return { who, from, src };
}

function eventLine(ev: FeedEvent, width: number): string {
  const d = ev.doc;
  const t = dim(hhmmss(ev.at));
  const a = agentTag(ev.agent);
  switch (ev.kind) {
    case "objective":
      return fit(`${t} ● ${a} set objective`, width);
    case "checkpoint": {
      const bp = primaryBearing(d.bearings_snapshot as Document[]);
      const wp = d.waypoint_completed_index !== null && d.waypoint_completed_index !== undefined ? green(` ✔wp${d.waypoint_completed_index}`) : "";
      return fit(`${t} ✎ ${a} checkpoint ${bold(`#${d.seq}`)} ${bp}${wp} ${dim("→")} ${oneLine(d.next_action)}`, width);
    }
    case "decision":
      return fit(`${t} ◆ ${a} decision: ${oneLine(d.decision)}`, width);
    case "failure": {
      const pm = (d.postmortem ?? {}) as Document;
      const rec = pm.is_recurring ? red(bold(` ×${pm.occurrences_of_class} recurring`)) : "";
      return fit(`${t} ${red("✖")} ${a} failure ${red(`[${d.class}]`)}${rec} ${oneLine(d.failure)}`, width);
    }
    case "policy":
      return fit(`${t} ${green(bold(`★ POLICY v${d.version} adopted`))} ${green(`[${d.class}]`)} by ${a}: ${oneLine(d.rule)}`, width);
    case "resume": {
      const { who, from, src } = resumeText(ev);
      const line = ` ⟳ ${who} resumed ← ${from} (${src}) `;
      return fit(`${t} ${inverse(bold(agentColor(ev.agent)(line)))}`, width);
    }
  }
}

function render(): string {
  // getWindowSize() re-queries the tty each frame, so multiplexer resizes are picked up even without SIGWINCH.
  const [liveCols, liveRows] = TTY && typeof process.stdout.getWindowSize === "function" ? process.stdout.getWindowSize() : [];
  const cols = liveCols || process.stdout.columns || 100;
  const W = Math.max(60, Math.min(110, cols));
  const rows = liveRows || process.stdout.rows || 40;
  const L: string[] = [];
  const rule = (label = "") => dim(label ? `── ${label} ${"─".repeat(Math.max(0, W - label.length - 4))}` : "─".repeat(W));

  const status =
    streamStatus === "live"
      ? green("● Atlas: live (change stream)")
      : streamStatus === "connecting"
        ? yellow("○ Atlas: connecting…")
        : red(`○ Atlas: reconnecting… ${streamError}`);

  L.push(fit(`${bold("WAYPOINTS")} ${dim("watch")}${PINNED ? dim(" [pinned]") : dim(" [following newest]")}   ${status}`, W));
  if (!objective) {
    L.push(rule());
    L.push(dim("No objectives yet. Waiting for set_objective…"));
    return L.join("\n");
  }
  const o = objective;
  const idShort = oid(o._id).slice(-6);
  const st = o.status === "completed" ? green(bold(" COMPLETED")) : "";
  L.push(fit(`${bold(oneLine(o.objective))}`, W));
  L.push(fit(dim(`objective …${idShort} · ${o.checkpoints_count ?? 0} checkpoints · started by ${o.agent ?? "?"}`) + st, W));

  // Bearings
  L.push(rule("bearings"));
  const bearings = (o.bearings ?? []) as Document[];
  const nameW = Math.min(22, Math.max(8, ...bearings.map((b) => String(b.name).length)));
  const barW = Math.max(10, Math.min(30, W - nameW - 30));
  for (const b of bearings) {
    const cur = (b.current as number | null) ?? null;
    const val = `${cur ?? "?"}/${b.target}${b.unit && b.unit !== "count" ? ` ${b.unit}` : ""}`;
    const f = bearingFlash.get(b.name);
    let flash = "";
    if (f && Date.now() - f.at < 5000) {
      const txt = ` ${f.delta >= 0 ? "▲ +" : "▼ "}${f.delta} `;
      flash = " " + inverse(bold(f.delta >= 0 ? green(txt) : red(txt)));
    }
    L.push(fit(`${fit(String(b.name), nameW).padEnd(nameW)} ${bar(cur, b.target, barW)} ${bold(val)}${flash}`, W));
  }
  if (!bearings.length) L.push(dim("(no bearings)"));

  // Waypoints
  L.push(rule("waypoints"));
  for (const w of (o.waypoints ?? []) as Document[]) {
    const title = `${w.index}. ${oneLine(w.title)}`;
    if (w.status === "done") L.push(fit(`${green("✔")} ${dim(title)}`, W));
    else if (w.status === "active") L.push(fit(`${yellow(bold("▶"))} ${bold(title)}`, W));
    else L.push(fit(`${dim("·")} ${dim(title)}`, W));
  }

  // Agent lane
  L.push(rule("agents"));
  const writer = (o.last_agent as string | undefined) ?? null;
  const lastCp = [...checkpointsBySeq.values()].sort((a, b) => b.seq - a.seq)[0];
  L.push(
    fit(
      `writing: ${writer ? inverse(agentColor(writer)(bold(` ${writer.toUpperCase()} `))) : dim("—")}` +
        (lastCp ? `  last checkpoint ${bold(`#${lastCp.seq}`)} by ${agentTag(lastCp.agent)}` : dim("  no checkpoints yet")),
      W,
    ),
  );
  if (lastCp) L.push(fit(`next_action: ${oneLine(lastCp.next_action)}`, W));
  const silence = [...lastWrite.entries()]
    .sort((a, b) => b[1].getTime() - a[1].getTime())
    .map(([agent, at]) => {
      const s = secs(at);
      const isWriter = agent === writer;
      const label = s < 10 ? `${agent}: active ${s}s ago` : `${agent}: silent ${s < 3600 ? `${s}s` : `${Math.floor(s / 60)}m`}`;
      if (s < 10) return agentColor(agent)(`● ${label}`);
      if (isWriter && s < 600) return red(bold(`◌ ${label}`));
      return dim(`◌ ${label}`);
    });
  if (silence.length) L.push(fit(silence.join("   "), W));
  const lastResume = [...events].reverse().find((e) => e.kind === "resume");
  if (lastResume && Date.now() - lastResume.at.getTime() < 30_000) {
    const { who, from, src } = resumeText(lastResume);
    L.push(fit(inverse(bold(agentColor(lastResume.agent)(`  ⟳ ${who} RESUMED ← ${from}  (${src})  `))), W));
  }

  // Feed
  L.push(rule("events"));
  const room = TTY ? Math.max(4, Math.min(14, rows - L.length - 1)) : 12;
  for (const ev of events.slice(-room)) L.push(eventLine(ev, W));
  return L.join("\n");
}

// ---------- output ----------
let lastFrame = "";
let lastSize = "";
function draw() {
  const frame = render();
  if (TTY) {
    const size = typeof process.stdout.getWindowSize === "function" ? process.stdout.getWindowSize().join("x") : "";
    if (size !== lastSize) process.stdout.write("\x1b[2J"); // clear stale wrapped lines after a resize
    lastSize = size;
    process.stdout.write("\x1b[H" + frame.split("\n").join("\x1b[K\n") + "\x1b[K\x1b[J");
  } else if (frame !== lastFrame) {
    // Non-TTY (piped to a log): append whole frames when they change.
    process.stdout.write(`\n===== ${new Date().toISOString()} =====\n${frame}\n`);
  }
  lastFrame = frame;
}
let drawTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleDraw() {
  if (drawTimer) return;
  drawTimer = setTimeout(() => {
    drawTimer = null;
    draw();
  }, 60);
}

// ---------- change stream ----------
let stream: ChangeStream | null = null;

async function handleChange(change: Document) {
  const coll = change.ns?.coll as string | undefined;
  const doc = change.fullDocument as Document | undefined;
  if (coll === "objectives" && change.operationType === "delete") {
    // e.g. demo:clean wiped the objective we were showing: fall back to the newest one.
    if (objective && oid(change.documentKey?._id) === oid(objective._id)) await loadSnapshot();
    scheduleDraw();
    return;
  }
  if (!coll || !doc) return;
  if (coll === "objectives") {
    const same = objective && oid(objective._id) === oid(doc._id);
    if (same) setObjective(doc);
    else if (!PINNED && (!objective || change.operationType === "insert" || asDate(doc.updated_at) >= asDate(objective.updated_at))) {
      await loadSnapshot(doc); // switch to the newer objective
    }
  } else if (COLLS[coll] && objective && oid(doc.objective_id) === oid(objective._id)) {
    addEvent(COLLS[coll], doc);
  }
  scheduleDraw();
}

async function runStream() {
  for (;;) {
    try {
      streamStatus = streamStatus === "live" ? "reconnecting" : streamStatus;
      stream = db.watch(
        [{ $match: { operationType: { $in: ["insert", "update", "replace", "delete"] }, "ns.coll": { $in: ["objectives", ...Object.keys(COLLS)] } } }],
        { fullDocument: "updateLookup" },
      );
      // Open the stream before snapshotting so nothing written in between is lost (events dedupe by _id).
      const first = await stream.tryNext();
      await loadSnapshot();
      streamStatus = "live";
      streamError = "";
      scheduleDraw();
      if (first) await handleChange(first);
      for await (const change of stream) await handleChange(change);
      throw new Error("stream closed");
    } catch (err) {
      streamStatus = "reconnecting";
      streamError = oneLine(err instanceof Error ? err.message : String(err)).slice(0, 40);
      scheduleDraw();
      try {
        await stream?.close();
      } catch {}
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
}

// ---------- main ----------
if (ONCE) {
  await loadSnapshot();
  streamStatus = "live";
  process.stdout.write(render() + "\n");
  await mongo.close();
  process.exit(0);
}

const restore = () => {
  if (TTY) process.stdout.write("\x1b[?25h\x1b[?1049l");
};
process.on("exit", restore);
for (const sig of ["SIGINT", "SIGTERM"] as const) process.on(sig, () => process.exit(0));
if (TTY) {
  process.stdout.write("\x1b[?1049h\x1b[?25l\x1b[2J");
  process.stdout.on("resize", () => {
    process.stdout.write("\x1b[2J");
    draw();
  });
}
draw();
setInterval(draw, 1000); // silence counters + flash expiry
void runStream();
