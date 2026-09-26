// Outreach task data (docs/OUTREACH-PACK.md): Maven CRM accounts + the fictional seller's product catalog.
// Parsed synchronously from data/*.csv so the QA gate stays pure (it needs the full account list to spot invented names).
import { readFileSync } from "node:fs";
import { waypointsDb as db } from "../clients";

export type AccountStatus = "pending" | "done" | "failed" | "reserve";

export interface Account {
  account: string;
  sector: string;
  year_established: number;
  revenue_musd: number;
  employees: number;
  office_location: string;
  subsidiary_of: string; // "" when independent
  queue_index: number;
  status: AccountStatus;
}

export interface Product {
  product: string;
  series: string;
  sales_price: number;
}

const dataPath = (name: string) => new URL(`../../data/${name}`, import.meta.url).pathname;

function rows(name: string): string[][] {
  const lines = readFileSync(dataPath(name), "utf8").split(/\r?\n/).filter((l) => l.trim() !== "");
  return lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));
}

/** All 85 accounts in CSV order (queue_index = row order), status not yet assigned. */
export function parseAccountsCsv(): Omit<Account, "status">[] {
  return rows("accounts.csv").map(([account, sector, year, revenue, employees, office, parent], i) => ({
    account: account!,
    sector: sector === "technolgy" ? "technology" : sector!,
    year_established: Number(year),
    revenue_musd: Number(revenue),
    employees: Number(employees),
    office_location: office!,
    subsidiary_of: parent ?? "",
    queue_index: i,
  }));
}

export const PRODUCTS: Product[] = rows("products.csv").map(([product, series, price]) => ({
  product: product!,
  series: series!,
  sales_price: Number(price),
}));

export const ALL_ACCOUNTS = parseAccountsCsv();
export const KNOWN_ACCOUNT_NAMES = ALL_ACCOUNTS.map((a) => a.account);
/** Locations the QA gate recognizes: every office_location in the CSV plus common places a model might invent. */
export const KNOWN_LOCATIONS = [
  ...new Set([
    ...ALL_ACCOUNTS.map((a) => a.office_location),
    "USA", "U.S.", "America", "Canada", "Mexico", "United Kingdom", "UK", "England", "London", "France", "Paris", "Spain",
    "Netherlands", "Switzerland", "Sweden", "Denmark", "Finland", "Ireland", "Austria", "Portugal", "Greece", "Russia",
    "India", "Singapore", "Australia", "Europe", "Asia", "Africa", "Nigeria", "Egypt", "Israel", "Dubai", "Tokyo", "Beijing",
    "Shanghai", "Seoul", "Berlin", "Munich", "Rome", "Milan", "Oslo", "Warsaw", "Nairobi", "Amman", "Brussels",
    "New York", "San Francisco", "Silicon Valley", "California", "Texas", "Boston", "Chicago", "Seattle", "Los Angeles",
    "Philippines", "Manila", "Argentina", "Chile", "Colombia", "Peru", "South Korea", "Taiwan", "Vietnam", "Indonesia",
  ]),
];

export const DEFAULT_QUEUE_SIZE = 24;
export function queueSize(): number {
  const n = Number(process.env.QUEUE_SIZE);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_QUEUE_SIZE;
}

export const accounts = () => db.collection<Account>("accounts");
export const drafts = () => db.collection("drafts");

/** Catalog text for the base prompt. */
export function productCatalogText(): string {
  return PRODUCTS.map((p) => `- ${p.product} (${p.series} series): $${p.sales_price.toLocaleString("en-US")}`).join("\n");
}
