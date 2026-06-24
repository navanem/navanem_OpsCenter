// @vitest-environment node
import { describe, it, expect } from "vitest";
import { generateInviteToken, hashInviteToken } from "@/lib/auth/invite-token";

describe("invite token", () => {
  it("hashes deterministically to 64 hex chars", () => {
    const h = hashInviteToken("abc");
    expect(h).toBe(hashInviteToken("abc"));
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates a token and its matching hash", () => {
    const { token, tokenHash } = generateInviteToken();
    expect(token.length).toBeGreaterThan(0);
    expect(tokenHash).toBe(hashInviteToken(token));
  });

  it("generates unique tokens", () => {
    expect(generateInviteToken().token).not.toBe(generateInviteToken().token);
  });
});
