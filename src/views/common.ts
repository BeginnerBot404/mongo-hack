// Shared plumbing for the "glass box" terminal views (src/views/*). Read-only against Atlas.
// Every view takes `--db <name>` (default: $WAYPOINTS_DB or "waypoints").
import { MongoClient, ObjectId, type ChangeStreamDocument, type Db, type Document } from "mongodb";

const argv = process.argv.slice(2);
export function arg(name: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
}
export const DB_NAME = arg("--db") ?? process.env.WAYPOINTS_DB ?? "waypoints";

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (.env)");
  process.exit(1);
}
export const client = new MongoClient(process.env.MONGODB_URI, { appName: "waypoints-views" });
export const db: Db = client.db(DB_NAME);

// ---------- ansi ----------
export const TTY = !!process.stdout.isTTY;
const COLOR = !process.env.NO_COLOR; // panes and logs both want color
const esc = (code: string) => (s: string) => (COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
export const bold = esc("1");
export const dim = esc("2");
export const red = esc("31");
export const green = esc("32");
export const yellow = esc("33");
export const blue = esc("34");
export const magenta = esc("35");
export const cyan = esc("36");
export const white = esc("37");
export const gray = esc("90");
export const bred = esc("91");
export const bgreen = esc("92");
export const byellow = esc("93");
export const bblue = esc("94");
export const bmagenta = esc("95");
export const bcyan = esc("96");
export const inverse = esc("7");

const ANSI_RE = /\x1b\[[0-9;?]*[A-Za-z]/g;
export const strip = (s: string) => s.replace(ANSI_RE, "");
export const visLen = (s: string) => [...strip(s)].length;

export function cols(): number {
  const c = TTY && typeof process.stdout.getWindowSize === "function" ? process.stdout.getWindowSize()[0] : 0;
  return Math.max(40, c || process.stdout.columns || 80);
}
export function rows(): number {
  const r = TTY && typeof process.stdout.getWindowSize === "function" ? process.stdout.getWindowSize()[1] : 0;
  return Math.max(10, r || process.stdout.rows || 40);
}

/** Truncate to `width` visible chars, keeping ANSI codes. */
export function fit(s: string, width: number): string {
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
    const ch = String.fromCodePoint(s.codePointAt(i)!);
    out += ch;
    i += ch.length;
    n++;
  }
  return out + "…\x1b[0m";
}

/** Word-wrap plain text to `width`, with `indent` on continuation lines. */
export function wrap(text: string, width: number, indent = ""): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/(\s+)/).filter((w) => w.length);
    let line = "";
    for (const w of words) {
      if (visLen(line) + visLen(w) > width && line.trim().length) {
        out.push(line.trimEnd());
        line = w.trim().length ? indent + w : indent;
      } else line += w;
    }
    out.push(line.trimEnd());
  }
  return out;
}

export const hhmmss = (d: Date = new Date()) => d.toTimeString().slice(0, 8);
export const oneLine = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
export const shortId = (v: unknown) => (v instanceof ObjectId ? v.toHexString() : String(v ?? "")).slice(-6);
export const f2 = (x: unknown) => (typeof x === "number" ? x.toFixed(2) : "—");
export const pct = (x: unknown) => (typeof x === "number" ? `${Math.round((x <= 1 ? x * 100 : x))}%` : "—");

/** Full-screen redraw without flicker: home the cursor, overwrite each line, clear what's left. */
let cursorHidden = false;
export function paint(lines: string[]) {
  if (!TTY) {
    process.stdout.write(lines.join("\n") + "\n\n");
    return;
  }
  if (!cursorHidden) {
    process.stdout.write("\x1b[?25l\x1b[2J");
    cursorHidden = true;
    const restore = () => process.stdout.write("\x1b[?25h");
    process.on("exit", restore);
    process.on("SIGINT", () => process.exit(0));
    process.on("SIGTERM", () => process.exit(0));
  }
  const W = cols();
  const H = rows();
  const body = lines.slice(0, H).map((l) => fit(l, W) + "\x1b[0m\x1b[K");
  process.stdout.write("\x1b[H" + body.join("\n") + "\x1b[J");
}

/**
 * Follow a db-level change stream (collections may not exist yet). Reconnects forever with backoff.
 * `onStatus` is told when the stream is live or reconnecting.
 */
export async function follow(
  pipeline: Document[],
  onChange: (c: ChangeStreamDocument) => void | Promise<void>,
  onStatus: (s: "live" | "reconnecting", err?: string) => void = () => {},
  fullDocument: "updateLookup" | undefined = "updateLookup",
) {
  let resumeAfter: unknown;
  let backoff = 500;
  for (;;) {
    try {
      const stream = db.watch(pipeline, { fullDocument, ...(resumeAfter ? { resumeAfter } : {}) } as Document);
      stream.on("init", () => onStatus("live"));
      // `hasNext` resolves once the cursor is established; signal live right away too.
      onStatus("live");
      backoff = 500;
      for await (const change of stream) {
        resumeAfter = change._id;
        await onChange(change);
      }
    } catch (e: any) {
      onStatus("reconnecting", oneLine(e?.message ?? e).slice(0, 60));
      if (/resume/i.test(String(e?.message))) resumeAfter = undefined;
      await Bun.sleep(backoff);
      backoff = Math.min(backoff * 2, 5000);
    }
  }
}

/** Call `cb` when the pane size changes (SIGWINCH plus a 1s poll: multiplexers don't always signal). */
export function onResize(cb: () => void) {
  let last = `${cols()}x${rows()}`;
  const check = () => {
    const now = `${cols()}x${rows()}`;
    if (now !== last) {
      last = now;
      cb();
    }
  };
  process.on("SIGWINCH", check);
  setInterval(check, 1000);
}
