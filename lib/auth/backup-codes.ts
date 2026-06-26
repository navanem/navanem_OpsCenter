import { randomBytes, createHash } from "node:crypto";

const COUNT = 10;

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code.replace(/\s|-/g, "").toLowerCase()).digest("hex");
}

// Returns plaintext codes (shown once) and their hashes (stored).
export function generateBackupCodes(): { codes: string[]; hashes: string[] } {
  const codes: string[] = [];
  for (let i = 0; i < COUNT; i++) {
    const raw = randomBytes(5).toString("hex"); // 10 hex chars
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5)}`);
  }
  return { codes, hashes: codes.map(hashBackupCode) };
}

// If `code` matches one of the stored hashes, returns the remaining hashes (consumed); else null.
export function consumeBackupCode(code: string, hashes: string[]): string[] | null {
  const h = hashBackupCode(code);
  if (!hashes.includes(h)) return null;
  return hashes.filter((x) => x !== h);
}
