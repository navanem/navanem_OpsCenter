import { describe, it, expect } from "vitest";
import { inviteUserSchema, acceptInviteSchema } from "@/lib/validation/user";

describe("inviteUserSchema", () => {
  const base = { email: "user@example.com", firstName: "A", lastName: "B", phone: "", roleId: "r1" };
  it("accepts a valid invite", () => {
    expect(inviteUserSchema.safeParse(base).success).toBe(true);
  });
  it("rejects a bad email", () => {
    expect(inviteUserSchema.safeParse({ ...base, email: "x" }).success).toBe(false);
  });
  it("requires a role", () => {
    expect(inviteUserSchema.safeParse({ ...base, roleId: "" }).success).toBe(false);
  });
});

describe("acceptInviteSchema", () => {
  it("requires matching passwords of length >= 8", () => {
    expect(acceptInviteSchema.safeParse({ password: "longenough", confirmPassword: "longenough" }).success).toBe(true);
    expect(acceptInviteSchema.safeParse({ password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(acceptInviteSchema.safeParse({ password: "longenough", confirmPassword: "different" }).success).toBe(false);
  });
});
