import { Secret, TOTP } from "otpauth";

const ISSUER = "OpsCenter";

export function newTotpSecret(): string {
  return new Secret({ size: 20 }).base32;
}

function buildTotp(secret: string, label: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });
}

export function totpAuthUri(secret: string, accountEmail: string): string {
  return buildTotp(secret, accountEmail).toString();
}

// Validates a 6-digit token, tolerating one step of clock drift either way.
export function verifyTotp(secret: string, token: string): boolean {
  const cleaned = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const delta = buildTotp(secret, "verify").validate({ token: cleaned, window: 1 });
  return delta !== null;
}
