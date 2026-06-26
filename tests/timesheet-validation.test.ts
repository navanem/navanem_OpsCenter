import { describe, it, expect } from "vitest";
import {
  timeEntrySchema,
  normalizeTimeEntryInput,
  rateToCents,
} from "@/lib/validation/timesheet";

const base = { date: "2026-07-01", hours: "1", minutes: "30", description: "Work", billable: "true", hourlyRate: "120.50", ticketId: "", taskId: "", visitId: "", clientId: "" };

describe("timeEntrySchema", () => {
  it("accepts a valid entry", () => {
    expect(timeEntrySchema.safeParse(base).success).toBe(true);
  });
  it("requires a date", () => {
    expect(timeEntrySchema.safeParse({ ...base, date: "" }).success).toBe(false);
  });
  it("rejects a zero duration", () => {
    expect(timeEntrySchema.safeParse({ ...base, hours: "0", minutes: "0" }).success).toBe(false);
  });
});

describe("normalizeTimeEntryInput", () => {
  it("computes total minutes, billable and rate cents", () => {
    const parsed = timeEntrySchema.parse(base);
    const n = normalizeTimeEntryInput(parsed);
    expect(n.minutes).toBe(90);
    expect(n.billable).toBe(true);
    expect(n.hourlyRateCents).toBe(12050);
    expect(n.ticketId).toBeNull();
  });
  it("treats an unchecked billable and empty rate", () => {
    const parsed = timeEntrySchema.parse({ ...base, billable: "", hourlyRate: "" });
    const n = normalizeTimeEntryInput(parsed);
    expect(n.billable).toBe(false);
    expect(n.hourlyRateCents).toBeNull();
  });
});

describe("rateToCents", () => {
  it("parses a decimal amount", () => {
    expect(rateToCents("120.50")).toBe(12050);
  });
  it("accepts a comma decimal", () => {
    expect(rateToCents("120,5")).toBe(12050);
  });
  it("returns null for empty", () => {
    expect(rateToCents("")).toBeNull();
  });
});
