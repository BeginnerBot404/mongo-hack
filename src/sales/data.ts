// Shared constants + CSV parsing for the B2B sales task (data/b2b_sales.csv, CC-BY-4.0).
import { waypointsDb as db } from "../clients";

export const FEATURES = [
  "product", "seller", "authority", "comp_size", "competitors", "purch_dept", "partnership", "budgt_alloc",
  "forml_tend", "rfi", "rfp", "growth", "posit_statm", "source", "client", "scope", "strat_deal", "cross_sale",
  "up_sale", "deal_type", "needs_def", "att_t_client",
] as const;
export type Feature = (typeof FEATURES)[number];

export type Split = "train" | "holdout";
export type Opportunity = Record<Feature, string> & { status: "Won" | "Lost"; won: boolean; row: number; split: Split };

export const SPLIT_SEED = 20260926;
export const HOLDOUT_SHARE = 0.3;

export const opportunities = () => db.collection<Opportunity>("opportunities");
export const rubrics = () => db.collection("rubrics");

export function snake(header: string): string {
  return header.trim().replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Parse the semicolon CSV and assign a fixed, seeded, stratified 70/30 split. */
export async function parseSalesCsv(path = new URL("../../data/b2b_sales.csv", import.meta.url).pathname): Promise<Opportunity[]> {
  const text = await Bun.file(path).text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const headers = lines[0]!.split(";").map(snake);
  const rows = lines.slice(1).map((line, i): Opportunity => {
    const cells = line.split(";").map((c) => c.trim());
    const doc: Record<string, unknown> = {};
    headers.forEach((h, j) => (doc[h] = cells[j] ?? ""));
    const status = doc.status as string;
    if (status !== "Won" && status !== "Lost") throw new Error(`row ${i + 1}: bad Status ${status}`);
    for (const f of FEATURES) if (typeof doc[f] !== "string") throw new Error(`row ${i + 1}: missing ${f}`);
    return { ...(doc as Record<Feature, string>), status, won: status === "Won", row: i + 1, split: "train" as Split };
  });
  const rand = mulberry32(SPLIT_SEED);
  for (const cls of [true, false]) {
    const idx = rows.filter((r) => r.won === cls).map((r) => r.row);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [idx[i], idx[j]] = [idx[j]!, idx[i]!];
    }
    const nHold = Math.round(idx.length * HOLDOUT_SHARE);
    const hold = new Set(idx.slice(0, nHold));
    for (const r of rows) if (r.won === cls && hold.has(r.row)) r.split = "holdout";
  }
  return rows;
}
