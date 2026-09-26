// view:atlas — the raw Atlas change stream over the Waypoints DB. Append-only: one compact JSON line
// (wrapped to at most a few lines) per insert/update/delete, prefixed with time + collection.
//   bun run view:atlas [--db waypoints_smoke] [--lines 3]
import { ObjectId, type ChangeStreamDocument, type Document } from "mongodb";
import {
  DB_NAME, arg, fit, bblue, bcyan, bgreen, bmagenta, bold, bred, byellow, cols, db, dim, follow, gray, green, hhmmss, magenta, oneLine, red, shortId, visLen, white, yellow, cyan, blue,
} from "./common";

const MAX_LINES = Number(arg("--lines") ?? 3);
const TEXT_MAX = 80;

const COLL_COLOR: Record<string, (s: string) => string> = {
  checkpoints: bcyan,
  failures: bred,
  taps: byellow,
  harness_config: bmagenta,
  rubrics: bgreen,
  events: bblue,
  resumes: cyan,
  policies: green,
  objectives: white,
  memories: gray,
  decisions: blue,
  opportunities: gray,
};
const colorFor = (c: string) => COLL_COLOR[c] ?? yellow;
const OP: Record<string, string> = { insert: "+", update: "~", replace: "=", delete: "-" };

/** Make a doc printable: short ids, HH:MM:SS dates, embeddings collapsed, long text trimmed. */
function trim(v: unknown, key = ""): unknown {
  if (v instanceof ObjectId) return `…${v.toHexString().slice(-6)}`;
  if (v instanceof Date) return hhmmss(v);
  if (typeof v === "string") return v.length > TEXT_MAX ? v.slice(0, TEXT_MAX - 1) + "…" : v;
  if (Array.isArray(v)) {
    if (v.length > 16 && v.every((x) => typeof x === "number")) return `[${v.length} floats]`;
    if (/embedding|vector/i.test(key) && v.length) return `[${v.length} floats]`;
    return v.map((x) => trim(x));
  }
  if (v && typeof v === "object") {
    const o = v as Document;
    if (o._bsontype === "Binary" || o.sub_type !== undefined) return "[binary]";
    const out: Document = {};
    for (const [k, x] of Object.entries(o)) out[k] = trim(x, k);
    return out;
  }
  return v;
}

const json = (v: unknown) =>
  JSON.stringify(v)
    .replace(/"([A-Za-z_][\w.]*)":/g, "$1:") // unquote keys: denser, still readable
    .replace(/,(?=[A-Za-z_"{[])/g, ", ");

/** Hard-wrap a single long line into ≤ MAX_LINES chunks of `width`. */
function chunk(s: string, width: number): string[] {
  const out: string[] = [];
  let rest = [...s];
  while (rest.length) {
    let cut = Math.min(width, rest.length);
    if (cut < rest.length) {
      // prefer breaking after ", " so keys stay whole
      const window = rest.slice(0, cut).join("");
      const at = window.lastIndexOf(", ");
      if (at > width * 0.5) cut = [...window.slice(0, at + 2)].length;
    }
    out.push(rest.slice(0, cut).join(""));
    rest = rest.slice(cut);
  }
  if (out.length > MAX_LINES) {
    const kept = out.slice(0, MAX_LINES);
    kept[MAX_LINES - 1] = kept[MAX_LINES - 1]!.slice(0, width - 1) + "…";
    return kept;
  }
  return out;
}

function body(c: ChangeStreamDocument & { ns?: { coll?: string } }): string {
  const coll = c.ns?.coll ?? "?";
  switch (c.operationType) {
    case "insert": {
      const d = c.fullDocument as Document;
      if (coll === "memories") {
        return json({ _id: trim(d._id), agent: d.agent, kind: d.kind ?? d.type, class: d.class, text: oneLine(d.text ?? d.content ?? "").slice(0, 60), embedding: Array.isArray(d.embedding) ? `[${d.embedding.length} floats]` : undefined });
      }
      const { _id, ...rest } = d;
      return json({ _id: trim(_id), ...(trim(rest) as Document) });
    }
    case "update": {
      const u = c.updateDescription;
      const set = trim(u?.updatedFields ?? {}) as Document;
      const parts: Document = { _id: trim((c.documentKey as Document)?._id), $set: set };
      if (u?.removedFields?.length) parts.$unset = u.removedFields;
      return json(parts);
    }
    case "replace":
      return json(trim(c.fullDocument));
    case "delete":
      return json({ _id: trim((c.documentKey as Document)?._id) });
    default:
      return json({ op: c.operationType });
  }
}

function print(c: ChangeStreamDocument) {
  const coll = (c as Document).ns?.coll ?? "?";
  if (coll === "memories" && c.operationType === "update") return; // embedding backfills: noise
  if (c.operationType === "update") {
    const f = Object.keys(c.updateDescription?.updatedFields ?? {});
    if (f.length && f.every((k) => k === "updated_at")) return; // touch-only updates: noise
  }
  const col = colorFor(coll);
  const op = OP[c.operationType] ?? "?";
  const t = (c as Document).wallTime instanceof Date ? (c as Document).wallTime : new Date();
  const head = `${dim(hhmmss(t))} ${col(bold(coll.padEnd(14).slice(0, 14)))} ${col(op)} `;
  const W = cols();
  const pad = visLen(head);
  const firstW = Math.max(20, W - pad);
  const text = body(c);
  const lines = coll === "memories" ? [text.length > firstW ? [...text].slice(0, firstW - 1).join("") + "…" : text] : chunk(text, firstW);
  const tint = coll === "memories" ? dim : (s: string) => s;
  process.stdout.write(head + tint(lines[0] ?? "") + "\n");
  for (const l of lines.slice(1)) process.stdout.write(" ".repeat(pad) + tint(l) + "\n");
}

// ---------- start ----------
const W0 = cols();
process.stdout.write(fit(`${bold("ATLAS")} ${dim("change stream")} · db ${bold(DB_NAME)} · ${dim("db.watch()")}`, W0) + "\n");
try {
  const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
  const counts = await Promise.all(names.map(async (n) => `${colorFor(n)(n)} ${dim(String(await db.collection(n).estimatedDocumentCount()))}`));
  let line = "";
  for (const c of counts) {
    if (visLen(line) + visLen(c) + 2 > W0) {
      process.stdout.write(line + "\n");
      line = "";
    }
    line += (line ? "  " : "") + c;
  }
  if (line) process.stdout.write(line + "\n");
} catch {}
process.stdout.write(dim("─".repeat(Math.min(W0, 80))) + "\n");

let lastStatus = "";
await follow(
  [{ $match: { operationType: { $in: ["insert", "update", "replace", "delete"] }, "ns.coll": { $ne: "inflight" } } }], // inflight = token-rate live rows
  (c) => print(c),
  (s, err) => {
    const line = s === "live" ? green("● live") : red(`○ reconnecting ${err ?? ""}`);
    if (line !== lastStatus) {
      lastStatus = line;
      process.stdout.write(`${dim(hhmmss())} ${line}\n`);
    }
  },
  undefined, // inserts carry fullDocument; updates print the delta (that's the raw truth)
);
