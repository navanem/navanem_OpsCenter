import { describe, it, expect } from "vitest";
import { roleSchema } from "@/lib/validation/role";

describe("roleSchema", () => {
  it("requires a name", () => {
    expect(roleSchema.safeParse({ name: "", permissions: [] }).success).toBe(false);
  });
  it("keeps only known permission keys", () => {
    const r = roleSchema.parse({ name: "Tech", permissions: ["clients.read", "bogus.key"] });
    expect(r.permissions).toEqual(["clients.read"]);
  });
  it("defaults description to empty and accepts no permissions", () => {
    const r = roleSchema.parse({ name: "Empty", permissions: [] });
    expect(r.permissions).toEqual([]);
  });
});
