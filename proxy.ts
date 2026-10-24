import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin/session";

/**
 * Next 16 renamed the `middleware` file convention to `proxy`. Same job, and it
 * now defaults to the Node.js runtime (so `crypto` in the session module works
 * here without an edge-compatible rewrite).
 *
 * This is an OPTIMISTIC gate: it keeps logged-out browsers from ever rendering
 * an admin screen. It is deliberately NOT the security boundary — Next's docs
 * are explicit on this, and Server Actions POST to their own page route where a
 * matcher can behave differently than you expect. The real check is
 * `requireSession()` inside every action and every admin data read.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page itself must stay reachable while logged out.
  if (pathname === "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    // Already signed in? Skip the form.
    if (verifySessionToken(token)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (verifySessionToken(token)) {
    return NextResponse.next();
  }

  // Bounce to login, remembering where they were headed.
  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Guard the dashboard only. The public site and the token-authenticated
  // /api/admin/* routes are untouched — those keep their own bearer check.
  matcher: ["/admin", "/admin/:path*"],
};
