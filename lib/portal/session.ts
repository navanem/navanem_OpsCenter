import { cookies } from "next/headers";
import { signPortalSession, PORTAL_COOKIE_NAME, type PortalSessionPayload } from "./session-token";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setPortalSessionCookie(payload: PortalSessionPayload): Promise<void> {
  const token = await signPortalSession(payload, MAX_AGE);
  const store = await cookies();
  store.set(PORTAL_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearPortalSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PORTAL_COOKIE_NAME);
}
