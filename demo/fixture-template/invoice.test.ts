import { describe, expect, test } from "bun:test";
import {
  billableDays,
  dueDate,
  formatUSD,
  hoursFromMinutes,
  invoiceTotal,
  lastPage,
  pageLabel,
  paginate,
  taxCents,
  totalHours,
} from "./invoice.ts";

describe("dates", () => {
  test("billableDays counts both the first and last day", () => {
    expect(billableDays("2026-09-01", "2026-09-30")).toBe(30);
    expect(billableDays("2026-09-26", "2026-09-26")).toBe(1);
  });

  test("dueDate adds net terms across a month boundary", () => {
    expect(dueDate("2026-09-26", 30)).toBe("2026-10-26");
  });
});

describe("time", () => {
  test("hoursFromMinutes converts minutes to hours", () => {
    expect(hoursFromMinutes(90)).toBe(1.5);
  });

  test("totalHours sums a week of timesheet entries", () => {
    const week = [
      { date: "2026-09-21", minutes: 480 },
      { date: "2026-09-22", minutes: 450 },
      { date: "2026-09-23", minutes: 30 },
    ];
    expect(totalHours(week)).toBe(16);
  });
});

describe("money", () => {
  test("taxCents treats the rate as a percentage", () => {
    expect(taxCents(10_000, 8.875)).toBe(888);
  });

  test("formatUSD adds thousands separators", () => {
    expect(formatUSD(123_456)).toBe("$1,234.56");
  });

  test("invoiceTotal = lines + tax", () => {
    const lines = [
      { description: "design", qty: 2, unitCents: 15_000 },
      { description: "dev", qty: 1.5, unitCents: 12_333 },
    ];
    // subtotal 30000 + 18500 = 48500; tax 10% = 4850
    expect(invoiceTotal(lines, 10)).toBe(53_350);
  });
});

describe("paging", () => {
  test("paginate page 1 is the first page", () => {
    expect(paginate(["a", "b", "c", "d", "e"], 1, 2)).toEqual(["a", "b"]);
  });

  test("lastPage returns the remainder", () => {
    expect(lastPage(["a", "b", "c", "d", "e"], 2)).toEqual(["e"]);
  });

  test("pageLabel shows the item range", () => {
    expect(pageLabel(2, 2, 5)).toBe("Showing 3-4 of 5");
  });
});
