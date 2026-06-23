import { cookies } from "next/headers";
import {
  signSession,
  SESSION_COOKIE_NAME,
  type SessionPayload,
} from "./session-token";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload, MAX_AGE);
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}
