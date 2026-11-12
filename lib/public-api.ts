import { siteConfig } from "@/lib/site.config";

interface RateBucket {
  count: number;
  resetAt: number;
}

const rateBuckets = new Map<string, RateBucket>();
const MAX_RATE_BUCKETS = 10_000;

/** Best-effort per-instance protection; Vercel Firewall remains the outer layer. */
export function rejectRateLimitedPost(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number
): Response | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  const key = `${namespace}:${ip}`;
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    if (rateBuckets.size >= MAX_RATE_BUCKETS) {
      for (const [bucketKey, bucket] of rateBuckets) {
        if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
      }
      if (rateBuckets.size >= MAX_RATE_BUCKETS) {
        rateBuckets.delete(rateBuckets.keys().next().value as string);
      }
    }
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  current.count += 1;
  return null;
}

/** Cheap checks that run before parsing a body or touching the database. */
export function rejectUnsafePublicPost(
  request: Request,
  maxBytes = 16_384
): Response | null {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    return Response.json({ error: "Missing request origin." }, { status: 403 });
  }

  let hostname: string;
  try {
    hostname = new URL(origin).hostname;
  } catch {
    return Response.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const allowed =
    hostname === siteConfig.domain ||
    hostname === siteConfig.domain.replace(/^www\./, "") ||
    hostname === process.env.VERCEL_URL ||
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  return allowed
    ? null
    : Response.json({ error: "Invalid request origin." }, { status: 403 });
}

export async function parseBoundedJson(
  request: Request,
  maxBytes = 16_384
): Promise<{ data?: unknown; error?: Response }> {
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return {
      error: Response.json({ error: "Request body is too large." }, { status: 413 }),
    };
  }

  try {
    return { data: JSON.parse(text) as unknown };
  } catch {
    return {
      error: Response.json({ error: "Invalid request body." }, { status: 400 }),
    };
  }
}
