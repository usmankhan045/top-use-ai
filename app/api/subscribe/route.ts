import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/lib/queries";
import {
  parseBoundedJson,
  rejectRateLimitedPost,
  rejectUnsafePublicPost,
} from "@/lib/public-api";

export const dynamic = "force-dynamic";

const SubscribeSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  source: z.string().trim().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const rejection = rejectUnsafePublicPost(request, 4_096);
  if (rejection) return rejection;
  const rateLimit = rejectRateLimitedPost(request, "subscribe", 10, 60 * 60 * 1000);
  if (rateLimit) return rateLimit;

  const parsedBody = await parseBoundedJson(request, 4_096);
  if (parsedBody.error) return parsedBody.error;
  const body = parsedBody.data;

  const result = SubscribeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { source } = result.data;
  const email = result.data.email.trim().toLowerCase();

  try {
    await addSubscriber(email, source);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/subscribe]", err);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
