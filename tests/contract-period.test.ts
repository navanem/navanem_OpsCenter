import { describe, it, expect } from "vitest";
import { currentBillingPeriod } from "@/lib/contracts/meta";

const d = (s: string) => new Date(s + "T12:00:00");

describe("currentBillingPeriod", () => {
  it("monthly spans the calendar month", () => {
    const p = currentBillingPeriod("MONTHLY", d("2026-07-15"));
    expect(p.start.getMonth()).toBe(6);
    expect(p.start.getDate()).toBe(1);
    expect(p.end.getMonth()).toBe(7);
  });
  it("quarterly snaps to the quarter", () => {
    const p = currentBillingPeriod("QUARTERLY", d("2026-08-10")); // Q3 (Jul-Sep)
    expect(p.start.getMonth()).toBe(6);
    expect(p.end.getMonth()).toBe(9);
    expect(p.label).toBe("Q3 2026");
  });
  it("yearly spans the calendar year", () => {
    const p = currentBillingPeriod("YEARLY", d("2026-03-01"));
    expect(p.start.getFullYear()).toBe(2026);
    expect(p.end.getFullYear()).toBe(2027);
    expect(p.label).toBe("2026");
  });
  it("one-off counts to date", () => {
    const p = currentBillingPeriod("ONE_OFF", d("2026-03-01"));
    expect(p.label).toBe("To date");
    expect(p.start.getFullYear()).toBe(2000);
  });
});
