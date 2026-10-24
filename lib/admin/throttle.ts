/**
 * In-memory login throttle.
 *
 * A single-admin password form is the one brute-forceable surface on the site,
 * and nothing else rate-limits it. This caps failed attempts per client so a
 * script can't grind the password.
 *
 * It is intentionally process-local: no Redis, no table, no dependency. On a
 * multi-instance deploy each instance keeps its own counter, which weakens but
 * does not remove the protection — an attacker would have to spread guesses
 * across instances, and the constant-time password check still stands behind it.
 * For this dashboard that trade-off is the right one.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

interface Attempt {
  count: number;
  /** When the current window (and any lockout) expires, epoch ms. */
  resetAt: number;
}

const attempts = new Map<string, Attempt>();

/** Drop expired buckets so the map can't grow without bound. */
function prune(now: number): void {
  for (const [key, rec] of attempts) {
    if (now > rec.resetAt) attempts.delete(key);
  }
}

export interface ThrottleResult {
  allowed: boolean;
  /** Seconds until the caller may try again, when blocked. */
  retryAfterSec: number;
}

/** Check — without recording — whether `key` may attempt a login now. */
export function checkLoginAllowed(key: string, now = Date.now()): ThrottleResult {
  const rec = attempts.get(key);
  if (!rec || now > rec.resetAt) return { allowed: true, retryAfterSec: 0 };
  if (rec.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((rec.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSec: 0 };
}

/** Record a failed attempt, opening or extending the window for `key`. */
export function recordLoginFailure(key: string, now = Date.now()): void {
  prune(now);
  const rec = attempts.get(key);
  if (!rec || now > rec.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    rec.count += 1;
    // Slide the window forward so a steady drip of guesses keeps the lock on.
    rec.resetAt = now + WINDOW_MS;
  }
}

/** Clear a client's history on a successful login. */
export function recordLoginSuccess(key: string): void {
  attempts.delete(key);
}
