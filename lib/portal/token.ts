import { randomBytes, createHash } from "node:crypto";

export function hashPortalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generatePortalToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashPortalToken(token) };
}
