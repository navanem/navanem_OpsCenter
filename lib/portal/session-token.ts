import { SignJWT, jwtVerify } from "jose";

export const PORTAL_COOKIE_NAME = "opscenter_portal";

export interface PortalSessionPayload {
  contactId: string;
  clientId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  }
  return new TextEncoder().encode(secret);
}

export function signPortalSession(
  payload: PortalSessionPayload,
  maxAgeSeconds = 60 * 60 * 24 * 7,
): Promise<string> {
  return new SignJWT({ clientId: payload.clientId, scope: "portal" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.contactId)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(getSecret());
}

export async function verifyPortalSession(token: string): Promise<PortalSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.scope !== "portal" || typeof payload.sub !== "string" || typeof payload.clientId !== "string") {
      return null;
    }
    return { contactId: payload.sub, clientId: payload.clientId };
  } catch {
    return null;
  }
}
