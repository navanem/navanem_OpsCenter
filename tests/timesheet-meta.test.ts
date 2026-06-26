import { describe, it, expect } from "vitest";
import { formatMinutes, formatRateCents } from "@/lib/timesheets/meta";

describe("formatMinutes", () => {
  it("formats hours and minutes", () => {
    expect(formatMinutes(90)).toBe("1h 30m");
  });
  it("formats minutes only", () => {
    expect(formatMinutes(45)).toBe("45m");
  });
  it("formats whole hours", () => {
    expect(formatMinutes(120)).toBe("2h");
  });
  it("formats zero", () => {
    expect(formatMinutes(0)).toBe("0m");
  });
});

describe("formatRateCents", () => {
  it("formats cents to a 2-decimal amount", () => {
    expect(formatRateCents(12050)).toBe("120.50");
  });
  it("renders a dash for null", () => {
    expect(formatRateCents(null)).toBe("—");
  });
});
