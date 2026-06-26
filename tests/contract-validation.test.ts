import { describe, it, expect } from "vitest";
import { contractSchema, normalizeContractInput } from "@/lib/validation/contract";

const base = {
  name: "Support 2026",
  clientId: "c1",
  typeId: "t1",
  statusId: "s1",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  value: "1200.00",
  billingCycle: "MONTHLY",
  includedHours: "10",
  notes: "",
};

describe("contractSchema", () => {
  it("accepts a valid contract", () => {
    expect(contractSchema.safeParse(base).success).toBe(true);
  });
  it("requires a client", () => {
    expect(contractSchema.safeParse({ ...base, clientId: "" }).success).toBe(false);
  });
  it("requires a type and status and start date", () => {
    expect(contractSchema.safeParse({ ...base, typeId: "" }).success).toBe(false);
    expect(contractSchema.safeParse({ ...base, statusId: "" }).success).toBe(false);
    expect(contractSchema.safeParse({ ...base, startDate: "" }).success).toBe(false);
  });
  it("rejects a bad billing cycle", () => {
    expect(contractSchema.safeParse({ ...base, billingCycle: "WEEKLY" }).success).toBe(false);
  });
});

describe("normalizeContractInput", () => {
  it("computes cents, included minutes and dates", () => {
    const parsed = contractSchema.parse(base);
    const n = normalizeContractInput(parsed);
    expect(n.valueCents).toBe(120000);
    expect(n.includedMinutesPerPeriod).toBe(600);
    expect(n.billingCycle).toBe("MONTHLY");
    expect(n.endDate).toBeInstanceOf(Date);
  });
  it("handles empty value and hours", () => {
    const parsed = contractSchema.parse({ ...base, value: "", includedHours: "", endDate: "" });
    const n = normalizeContractInput(parsed);
    expect(n.valueCents).toBeNull();
    expect(n.includedMinutesPerPeriod).toBeNull();
    expect(n.endDate).toBeNull();
  });
});
