// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters";
});

describe("session token", () => {
  it("round-trips a payload through sign/verify", async () => {
    const { signSession, verifySession } = await import("@/lib/auth/session-token");
    const token = await signSession({ userId: "u1", email: "a@b.c" });
    const payload = await verifySession(token);
    expect(payload).toEqual({ userId: "u1", email: "a@b.c" });
  });

  it("returns null for a tampered token", async () => {
    const { signSession, verifySession } = await import("@/lib/auth/session-token");
    const token = await signSession({ userId: "u1", email: "a@b.c" });
    expect(await verifySession(token + "x")).toBeNull();
  });

  it("returns null for garbage", async () => {
    const { verifySession } = await import("@/lib/auth/session-token");
    expect(await verifySession("not.a.jwt")).toBeNull();
  });
});
