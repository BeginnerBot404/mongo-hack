// Live inference view: one `inflight` doc per worker ({worker} key), upserted at most every 300 ms while the model
// streams. The Console's /live "NOW WRITING" strip follows it over the change stream. Best-effort: every write
// failure is swallowed, and writes never block the harness (fire-and-forget, one in flight per worker).
import type { Db } from "mongodb";

export type Phase = "thinking" | "drafting" | "tool" | "qa" | "idle";
const THROTTLE_MS = 300;
const TEXT_MAX = 600, REASON_MAX = 400;
const tail = (s: string, n: number) => (s.length > n ? "…" + s.slice(-(n - 1)) : s);

/** Best-effort read of a string field from partial (still-streaming) JSON tool arguments. */
export function partialField(json: string, key: string): string | null {
  const m = new RegExp(`"${key}"\\s*:\\s*"`).exec(json);
  if (!m) return null;
  let out = "";
  for (let i = m.index + m[0].length; i < json.length; i++) {
    const ch = json[i]!;
    if (ch === '"') return out;
    if (ch !== "\\") { out += ch; continue; }
    const nx = json[i + 1];
    if (nx === undefined) break;
    i++;
    if (nx === "n") out += "\n";
    else if (nx === "t") out += "\t";
    else if (nx === "u") { const h = json.slice(i + 1, i + 5); if (h.length < 4) break; out += String.fromCharCode(parseInt(h, 16) || 32); i += 4; }
    else out += nx;
  }
  return out;
}

/** GLM's native tool-call markup (`<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value>…`), which vLLM's
 *  streaming parser sometimes leaves in `content`. Partial-safe: an unterminated last value is returned as-is. */
export function glmToolMarkup(text: string): { name: string; args: Record<string, string>; complete: boolean; closed: boolean } | null {
  const i = text.indexOf("<tool_call>");
  if (i < 0) return null;
  const rest = text.slice(i + "<tool_call>".length);
  const name = (rest.split(/<arg_key>|\n|<\/tool_call>/)[0] ?? "").trim();
  const args: Record<string, string> = {};
  const re = /<arg_key>([\s\S]*?)<\/arg_key>\s*<arg_value>([\s\S]*?)(<\/arg_value>|$)/g;
  let closed = true;
  for (let m; (m = re.exec(rest)); ) { args[m[1]!.trim()] = m[2]!; if (!m[3]) { closed = false; break; } }
  // closed: every arg value seen is terminated (the model may loop after the last one and never close the call)
  return { name, args, complete: rest.includes("</tool_call>"), closed: closed && Object.keys(args).length > 0 };
}

export class Inflight {
  private doc: Record<string, unknown>;
  private text = "";
  private reasoning = "";
  private dirty = false;
  private last = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private writing = false;

  constructor(private db: Db, worker: string, private agent: string) {
    this.doc = { worker, agent, phase: "idle", text: "", reasoning: "", tokens: 0, account: null, objective_id: null, tool: null };
  }

  /** New account: reset the row. */
  start(p: { objective_id: string; account: string; settings_version: number }) {
    this.text = ""; this.reasoning = "";
    Object.assign(this.doc, { ...p, phase: "thinking", tool: null, tokens: 0, started_at: new Date() });
    this.flush(true);
  }
  /** New model turn: visible text restarts; reasoning + tokens carry over for the account. */
  turn() { this.text = ""; this.raw = ""; this.set({ phase: "thinking", tool: null }); }
  addReasoning(s: string) { if (!s) return; this.reasoning = tail(this.reasoning + s, REASON_MAX); this.doc.phase = "thinking"; this.touch(); }
  private raw = "";
  addText(s: string) {
    if (!s) return;
    this.raw += s;
    const g = glmToolMarkup(this.raw); // show the email, not the markup
    if (g) { const { subject, body } = g.args; return this.setText(`${subject != null ? `Subject: ${subject}\n\n` : ""}${body ?? ""}`, g.name || null); }
    this.text = tail(this.raw, TEXT_MAX); this.doc.phase = "drafting"; this.touch();
  }
  /** Whole visible text (e.g. an email assembled from partial tool args). */
  setText(s: string, tool?: string | null) { this.text = tail(s, TEXT_MAX); this.doc.phase = "drafting"; if (tool !== undefined) this.doc.tool = tool; this.touch(); }
  get tokenCount() { return Number(this.doc.tokens ?? 0); }
  tokens(n: number) { this.doc.tokens = n; this.touch(); }
  set(p: { phase?: Phase; tool?: string | null; settings_version?: number }, now = false) { Object.assign(this.doc, p); this.touch(now); }
  idle() { this.set({ phase: "idle", tool: null }, true); }

  private touch(now = false) { this.dirty = true; this.flush(now); }
  private flush(now = false) {
    if (this.writing) return; // the write in flight re-checks dirty when it lands
    const wait = now ? 0 : Math.max(0, this.last + THROTTLE_MS - Date.now());
    if (wait > 0) { this.timer ??= setTimeout(() => { this.timer = null; this.flush(); }, wait); return; }
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (!this.dirty) return;
    this.dirty = false; this.writing = true; this.last = Date.now();
    const set = { ...this.doc, text: this.text, reasoning: this.reasoning, updated_at: new Date() };
    this.db.collection("inflight").updateOne({ worker: this.doc.worker }, { $set: set }, { upsert: true })
      .catch(() => {})
      .finally(() => { this.writing = false; if (this.dirty) this.flush(); });
  }
}
