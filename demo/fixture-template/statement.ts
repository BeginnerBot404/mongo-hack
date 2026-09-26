// Monthly statement rendering (reuses the paging helper from invoice.ts). Out of scope for fixes.
import { pageStart } from "./invoice.ts";

/** The final (possibly partial) page of statement lines. */
export function lastPage<T>(items: T[], size: number): T[] {
  const pages = Math.ceil(items.length / size);
  return items.slice(pageStart(pages - 1, size));
}

/** Footer label for a 1-indexed page, e.g. "Showing 3-4 of 5". */
export function pageLabel(page: number, size: number, total: number): string {
  const end = Math.min(pageStart(page, size), total);
  return `Showing ${end - size + 1}-${end} of ${total}`;
}
