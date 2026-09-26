// Terminal helpers shared by the harness and its task packs.
export const c = (code: number) => (s: string) => (process.stdout.isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);
export const dim = c(2), bold = c(1), red = c(31), green = c(32), yellow = c(33), blue = c(34), magenta = c(35), cyan = c(36);
export const clip = (s: string, n = 110) => {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length > n ? one.slice(0, n - 1) + "…" : one;
};
export const log = (s: string) => console.log(s);

/** MCP tool results come back as a string or as content blocks; flatten to text. */
export function textOf(r: unknown): string {
  if (typeof r === "string") return r;
  if (Array.isArray(r)) return r.map(textOf).join("");
  if (r && typeof r === "object") {
    const o = r as any;
    if (typeof o.text === "string") return o.text;
    if (o.content !== undefined) return textOf(o.content);
  }
  return JSON.stringify(r);
}
export const parse = (s: string): any => { try { return JSON.parse(s); } catch { return { error: s }; } };
