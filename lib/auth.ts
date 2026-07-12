import crypto from "crypto";
import { NextRequest } from "next/server";

export function authenticate(request: NextRequest): Response | null {
  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    return Response.json(
      { error: "Server misconfigured: ADMIN_API_TOKEN not set." },
      { status: 500 }
    );
  }

  const header = request.headers.get("Authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!provided) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const a = Buffer.from(provided);
  const b = Buffer.from(token);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}
