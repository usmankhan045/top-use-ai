import crypto from "crypto";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Admin session layer.
 *
 * The repo already had `lib/auth.ts` — a static `ADMIN_API_TOKEN` bearer check
 * for the /api/admin/* routes. That token must never reach the browser, so the
 * dashboard cannot reuse it directly. This module sits alongside it: the admin
 * proves identity once with a password, and we hand back a signed cookie.
 * Server-side code keeps using the bearer token internally where it needs to.
 *
 * The cookie is a signed (not encrypted) payload: `base64(json).hmac`. There is
 * nothing secret in the payload — it only asserts "this browser logged in and
 * the assertion has not been tampered with" — so an HMAC is sufficient and
 * avoids adding a JWT dependency for a single-admin dashboard.
 */

const COOKIE_NAME = "topuseai_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h — short enough that a stolen cookie ages out.

export interface SessionPayload {
  /** Issued-at, epoch seconds. */
  iat: number;
  /** Expiry, epoch seconds. Checked on every verify. */
  exp: number;
}

/** Reject a secret too short to resist offline guessing of forged cookies. */
const MIN_SECRET_LENGTH = 16;

function getSecret(): string {
  // A DEDICATED secret, deliberately NOT falling back to ADMIN_API_TOKEN. That
  // token is sent as a Bearer header to /api/admin/* where proxies and CDNs can
  // log it; reusing it to sign session cookies would let a single leaked log
  // line forge an admin session. Keep the two secrets independent.
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  if (!secret) {
    throw new Error(
      "Missing env var: set ADMIN_SESSION_SECRET (32+ random bytes) to sign admin sessions."
    );
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `ADMIN_SESSION_SECRET is too short (min ${MIN_SECRET_LENGTH} chars). Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
    );
  }
  return secret;
}

function sign(data: string): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
}

/** Constant-time compare that tolerates unequal lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(now = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload: SessionPayload = { iat, exp: iat + MAX_AGE_SECONDS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  if (!safeEqual(signature, sign(body))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as SessionPayload;

    if (typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify the admin password. Compared in constant time so the endpoint does not
 * leak the password's length or a matching prefix through response timing.
 */
export function verifyPassword(provided: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) {
    throw new Error(
      "Missing env var: ADMIN_PASSWORD must be set to use the admin dashboard."
    );
  }
  // Hash both sides first: timingSafeEqual needs equal lengths, and hashing
  // gives us that without leaking the real password's length via early return.
  const a = crypto.createHash("sha256").update(provided).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    // Allow plain http on localhost; require https everywhere else.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Read + verify the session for the current request.
 *
 * `cache()` dedupes this across a single render pass, so a layout and the page
 * inside it don't each re-verify. Returns null rather than redirecting so
 * callers choose their own failure mode.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
});

/**
 * Assert an authenticated admin, or throw.
 *
 * Every Server Action must call this. proxy.ts is an optimistic check only —
 * Next's own docs are explicit that it is not a security boundary, and Server
 * Actions POST to the page's own route where a proxy matcher may not apply.
 */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized: admin session required.");
  return session;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
