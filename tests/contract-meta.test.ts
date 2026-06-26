import { describe, it, expect } from "vitest";
import {
  formatMoneyCents,
  monthlyEquivalentCents,
  formatContractReference,
  moneyToCents,
} from "@/lib/contracts/meta";

describe("formatMoneyCents", () => {
  it("formats cents to a 2-decimal amount", () => {
    expect(formatMoneyCents(120000)).toBe("1200.00");
  });
  it("renders a dash for null", () => {
    expect(formatMoneyCents(null)).toBe("—");
  });
});

describe("monthlyEquivalentCents", () => {
  it("returns the value as-is for monthly", () => {
    expect(monthlyEquivalentCents(120000, "MONTHLY")).toBe(120000);
  });
  it("divides quarterly by 3", () => {
    expect(monthlyEquivalentCents(120000, "QUARTERLY")).toBe(40000);
  });
  it("divides yearly by 12", () => {
    expect(monthlyEquivalentCents(120000, "YEARLY")).toBe(10000);
  });
  it("counts one-off as zero recurring", () => {
    expect(monthlyEquivalentCents(120000, "ONE_OFF")).toBe(0);
  });
  it("is zero for null value", () => {
    expect(monthlyEquivalentCents(null, "MONTHLY")).toBe(0);
  });
});

describe("formatContractReference", () => {
  it("formats CON-#### from the sequence", () => {
    expect(formatContractReference(5)).toBe("CON-1005");
  });
});

describe("moneyToCents", () => {
  it("parses a decimal amount", () => {
    expect(moneyToCents("1200.50")).toBe(120050);
  });
  it("accepts a comma decimal", () => {
    expect(moneyToCents("1200,5")).toBe(120050);
  });
  it("returns null for empty", () => {
    expect(moneyToCents("")).toBeNull();
  });
});
