import { describe, it, expect } from "vitest";
import { generalSettingsSchema, smtpSettingsSchema } from "@/lib/validation/settings";

describe("generalSettingsSchema", () => {
  it("requires a company name", () => {
    expect(generalSettingsSchema.safeParse({ companyName: "" }).success).toBe(false);
    expect(generalSettingsSchema.safeParse({ companyName: "Acme MSP" }).success).toBe(true);
  });
});

describe("smtpSettingsSchema", () => {
  const base = { smtpHost: "smtp.example.com", smtpPort: "587", smtpUser: "u", smtpPassword: "", smtpFrom: "ops@example.com", smtpSecure: "false" };
  it("accepts a valid config", () => {
    expect(smtpSettingsSchema.safeParse(base).success).toBe(true);
  });
  it("rejects an invalid from address", () => {
    expect(smtpSettingsSchema.safeParse({ ...base, smtpFrom: "nope" }).success).toBe(false);
  });
  it("rejects a non-numeric port", () => {
    expect(smtpSettingsSchema.safeParse({ ...base, smtpPort: "abc" }).success).toBe(false);
  });
  it("allows an empty (unconfigured) host and port", () => {
    expect(smtpSettingsSchema.safeParse({ ...base, smtpHost: "", smtpPort: "" }).success).toBe(true);
  });
});
