import { describe, it, expect } from "vitest";
import { contactSchema, normalizeContactInput } from "@/lib/validation/contact";

const valid = {
  firstName: "Jane",
  lastName: "Doe",
  jobTitle: "IT Manager",
  email: "jane@acme.com",
  phone: "+41 21 000 00 00",
  isVip: "on",
};

describe("contactSchema", () => {
  it("accepts a valid contact", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("requires first and last name", () => {
    expect(contactSchema.safeParse({ ...valid, firstName: "" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, lastName: "" }).success).toBe(false);
  });
  it("rejects a malformed email but allows empty", () => {
    expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
  });
  it("coerces the VIP checkbox", () => {
    expect(contactSchema.parse(valid).isVip).toBe(true);
    expect(contactSchema.parse({ ...valid, isVip: undefined }).isVip).toBe(false);
  });
});

describe("normalizeContactInput", () => {
  it("maps empty optionals to null and keeps values", () => {
    const out = normalizeContactInput(contactSchema.parse({ ...valid, phone: "", jobTitle: "" }));
    expect(out.firstName).toBe("Jane");
    expect(out.phone).toBeNull();
    expect(out.jobTitle).toBeNull();
    expect(out.isVip).toBe(true);
  });
});
