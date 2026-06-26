import { describe, it, expect } from "vitest";
import { parseClientsCsv } from "@/lib/clients/import";

describe("parseClientsCsv", () => {
  it("maps valid rows with defaults", () => {
    const r = parseClientsCsv("Company,Domain,Status\nAcme,acme.com,ACTIVE\nBeta,,");
    expect(r.errors).toEqual([]);
    expect(r.valid).toEqual([
      { companyName: "Acme", domain: "acme.com", status: "ACTIVE" },
      { companyName: "Beta", domain: null, status: "ACTIVE" },
    ]);
  });

  it("is case-insensitive on headers and status", () => {
    const r = parseClientsCsv("company,status\nAcme,inactive");
    expect(r.valid).toEqual([{ companyName: "Acme", domain: null, status: "INACTIVE" }]);
  });

  it("reports missing Company column", () => {
    const r = parseClientsCsv("Name,Domain\nAcme,acme.com");
    expect(r.valid).toEqual([]);
    expect(r.errors[0].message).toMatch(/Company/);
  });

  it("flags blank company and invalid status per line", () => {
    const r = parseClientsCsv("Company,Status\n,ACTIVE\nAcme,WRONG\nBeta,ACTIVE");
    expect(r.valid).toEqual([{ companyName: "Beta", domain: null, status: "ACTIVE" }]);
    expect(r.errors).toEqual([
      { line: 2, message: "Company is required." },
      { line: 3, message: 'Invalid status "WRONG" (expected ACTIVE or INACTIVE).' },
    ]);
  });

  it("handles an empty file", () => {
    expect(parseClientsCsv("").errors[0].message).toMatch(/empty/);
  });
});
