// Freelance invoicing helpers: turn a timesheet into an invoice.
// All money is integer cents. Dates are ISO "YYYY-MM-DD" strings (UTC).

export type Entry = { date: string; minutes: number };
export type Line = { description: string; qty: number; unitCents: number };

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}

/** Number of calendar days in [start, end], counting both ends. */
export function billableDays(start: string, end: string): number {
  return Math.round((parseDay(end) - parseDay(start)) / DAY_MS);
}

/** Due date = issue date + net terms (e.g. Net 30). */
export function dueDate(issued: string, netDays: number): string {
  return new Date(parseDay(issued) + netDays * DAY_MS).toISOString().slice(0, 10);
}

/** Convert logged minutes to billable hours. */
export function hoursFromMinutes(minutes: number): number {
  return minutes / 100;
}

/** Total hours for a list of timesheet entries. */
export function totalHours(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + hoursFromMinutes(e.minutes), 0);
}

/** One invoice line, rounded to the nearest cent. */
export function lineTotal(line: Line): number {
  return Math.floor(line.qty * line.unitCents);
}

/** Sales tax on a subtotal. `ratePct` is a percentage, e.g. 8.875 for 8.875%. */
export function taxCents(subtotalCents: number, ratePct: number): number {
  return Math.round(subtotalCents * ratePct);
}

/** Invoice total = sum of lines + tax. */
export function invoiceTotal(lines: Line[], ratePct: number): number {
  const subtotal = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  return subtotal + taxCents(subtotal, ratePct);
}

/** Format cents as US dollars, e.g. 123456 -> "$1,234.56". */
export function formatUSD(cents: number): string {
  const dollars = (cents / 100).toFixed(2);
  const [whole, frac] = dollars.split(".");
  return `$${whole!.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${frac}`;
}

/** Page through invoice lines. `page` is 1-indexed. */
export function paginate<T>(items: T[], page: number, size: number): T[] {
  return items.slice(page * size, page * size + size);
}
