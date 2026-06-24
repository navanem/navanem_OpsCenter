import { describe, it, expect } from "vitest";
import { clientSchema, normalizeClientInput } from "@/lib/validation/client";

const valid = {
  companyName: "Acme Corp",
  domain: "acme.com",
  contactName: "Jane Doe",
  contactEmail: "jane@acme.com",
  contactPhone: "+41 21 000 00 00",
  address: "1 Road",
  city: "Lausanne",
  postalCode: "1000",
  country: "CH",
  status: "ACTIVE",
  assignedTechnicianId: "",
  notes: "",
};

describe("clientSchema", () => {
  it("accepts a valid client", () => {
    expect(clientSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a company name", () => {
    const r = clientSchema.safeParse({ ...valid, companyName: "" });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed contact email", () => {
    const r = clientSchema.safeParse({ ...valid, contactEmail: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("allows an empty contact email", () => {
    const r = clientSchema.safeParse({ ...valid, contactEmail: "" });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid status", () => {
    const r = clientSchema.safeParse({ ...valid, status: "DELETED" });
    expect(r.success).toBe(false);
  });
});

describe("normalizeClientInput", () => {
  it("converts empty optional strings to null and keeps values", () => {
    const out = normalizeClientInput(clientSchema.parse(valid));
    expect(out.companyName).toBe("Acme Corp");
    expect(out.assignedTechnicianId).toBeNull();
    expect(out.notes).toBeNull();
    expect(out.domain).toBe("acme.com");
  });
});
