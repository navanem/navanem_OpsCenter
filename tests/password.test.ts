import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("S3cret!pass");
    expect(await verifyPassword(hash, "S3cret!pass")).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("S3cret!pass");
    expect(await verifyPassword(hash, "wrong")).toBe(false);
  });

  it("produces different hashes for the same input (salted)", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});
