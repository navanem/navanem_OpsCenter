import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const TOTP_CHALLENGE_COOKIE = "opscenter_2fa";
const MAX_AGE = 60 * 5; // 5 minutes to complete the second factor

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export async function setTotpChallengeCookie(userId: string): Promise<void> {
  const token = await new SignJWT({ scope: "totp_pending" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
  const store = await cookies();
  store.set(TOTP_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function readTotpChallenge(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(TOTP_CHALLENGE_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.scope !== "totp_pending" || typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export async function clearTotpChallengeCookie(): Promise<void> {
  const store = await cookies();
  store.delete(TOTP_CHALLENGE_COOKIE);
}
