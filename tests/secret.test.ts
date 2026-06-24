// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters";
});

describe("secret encryption", () => {
  it("round-trips a value", async () => {
    const { encryptSecret, decryptSecret } = await import("@/lib/crypto/secret");
    const enc = encryptSecret("hunter2");
    expect(enc).not.toContain("hunter2");
    expect(decryptSecret(enc)).toBe("hunter2");
  });

  it("produces different ciphertext each time (random IV)", async () => {
    const { encryptSecret } = await import("@/lib/crypto/secret");
    expect(encryptSecret("same")).not.toBe(encryptSecret("same"));
  });

  it("returns null for tampered or malformed input", async () => {
    const { encryptSecret, decryptSecret } = await import("@/lib/crypto/secret");
    const enc = encryptSecret("secret");
    expect(decryptSecret(enc + "xx")).toBeNull();
    expect(decryptSecret("not-valid")).toBeNull();
  });
});
