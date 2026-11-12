import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { parseBoundedJson } from "@/lib/public-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const parsedBody = await parseBoundedJson(request);
  if (parsedBody.error) return parsedBody.error;
  const body = parsedBody.data;

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

  if (!Array.isArray(paths) || paths.length > 50) {
    return Response.json(
      { error: "paths must be an array containing at most 50 entries." },
      { status: 400 }
    );
  }

  const uniquePaths = Array.from(new Set(paths));
  if (
    uniquePaths.some(
      (path) =>
        typeof path !== "string" ||
        path.length > 200 ||
        !/^\/(?:[a-z0-9][a-z0-9-]*\/)*[a-z0-9][a-z0-9.-]*$|^\/$/.test(path)
    )
  ) {
    return Response.json({ error: "Invalid revalidation path." }, { status: 400 });
  }

  const revalidated: string[] = [];
  for (const path of uniquePaths as string[]) {
    revalidatePath(path);
    revalidated.push(path);
  }

  return Response.json({ revalidated: true, paths: revalidated });
}
