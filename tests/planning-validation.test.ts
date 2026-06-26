import { describe, it, expect } from "vitest";
import { visitSchema, recurringVisitSchema } from "@/lib/validation/planning";

const visit = { title: "On-site", description: "", typeId: "vt1", clientId: "", assigneeId: "", location: "", scheduledAt: "2026-07-01T09:00", durationMinutes: "60", status: "SCHEDULED", notes: "" };
const recurring = { title: "Weekly support", description: "", typeId: "vt1", clientId: "", assigneeId: "", location: "", durationMinutes: "60", frequency: "WEEKLY", interval: "1", weekdays: ["1", "3"], startDate: "2026-07-01", endDate: "", timeHour: "9", timeMinute: "0" };

describe("visitSchema", () => {
  it("accepts a valid visit", () => { expect(visitSchema.safeParse(visit).success).toBe(true); });
  it("requires a title", () => { expect(visitSchema.safeParse({ ...visit, title: "" }).success).toBe(false); });
  it("requires a type", () => { expect(visitSchema.safeParse({ ...visit, typeId: "" }).success).toBe(false); });
  it("requires a scheduledAt", () => { expect(visitSchema.safeParse({ ...visit, scheduledAt: "" }).success).toBe(false); });
});

describe("recurringVisitSchema", () => {
  it("accepts a valid recurring visit", () => { expect(recurringVisitSchema.safeParse(recurring).success).toBe(true); });
  it("requires a title and type and startDate", () => {
    expect(recurringVisitSchema.safeParse({ ...recurring, title: "" }).success).toBe(false);
    expect(recurringVisitSchema.safeParse({ ...recurring, startDate: "" }).success).toBe(false);
  });
  it("rejects a bad frequency", () => { expect(recurringVisitSchema.safeParse({ ...recurring, frequency: "YEARLY" }).success).toBe(false); });
});
