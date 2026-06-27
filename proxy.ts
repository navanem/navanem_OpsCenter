import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth/session-token";
import { verifyPortalSession, PORTAL_COOKIE_NAME } from "@/lib/portal/session-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The monitoring agent endpoint authenticates with a per-device token, not a staff session.
  if (pathname.startsWith("/api/agent/")) {
    return NextResponse.next();
  }

  // Client portal routes authenticate with a separate session.
  if (pathname.startsWith("/portal")) {
    if (pathname === "/portal/login" || pathname.startsWith("/portal/set-password")) {
      return NextResponse.next();
    }
    const portalToken = request.cookies.get(PORTAL_COOKIE_NAME)?.value;
    const portalSession = portalToken ? await verifyPortalSession(portalToken) : null;
    if (!portalSession) {
      return NextResponse.redirect(new URL("/portal/login", request.url));
    }
    return NextResponse.next();
  }

  // Staff routes use the main session.
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Protect everything except the public auth routes, Next internals, and static assets.
  matcher: ["/((?!login(?:$|/)|invite(?:$|/)|forgot-password(?:$|/)|reset-password(?:$|/)|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
