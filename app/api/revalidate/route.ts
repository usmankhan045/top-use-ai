import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { secret, paths } = body as { secret?: string; paths?: unknown };

  const expectedSecret = process.env.REVALIDATION_SECRET;
  if (!expectedSecret) {
    return Response.json(
      { error: "Server misconfigured: REVALIDATION_SECRET not set." },
      { status: 500 }
    );
  }

  if (!secret) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const a = Buffer.from(secret);
  const b = Buffer.from(expectedSecret);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!Array.isArray(paths)) {
    return Response.json({ error: "paths must be an array." }, { status: 400 });
  }

  const revalidated: string[] = [];
  for (const path of paths) {
    if (typeof path === "string") {
      revalidatePath(path);
      revalidated.push(path);
    }
  }

  return Response.json({ revalidated: true, paths: revalidated });
}
