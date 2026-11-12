import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveContactMessage } from "@/lib/queries";
import {
  parseBoundedJson,
  rejectRateLimitedPost,
  rejectUnsafePublicPost,
} from "@/lib/public-api";

export const dynamic = "force-dynamic";

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required.").max(200),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters.")
    .max(5000, "Message is too long."),
});

export async function POST(request: NextRequest) {
  const rejection = rejectUnsafePublicPost(request);
  if (rejection) return rejection;
  const rateLimit = rejectRateLimitedPost(request, "contact", 5, 60 * 60 * 1000);
  if (rateLimit) return rateLimit;

  const parsedBody = await parseBoundedJson(request);
  if (parsedBody.error) return parsedBody.error;
  const body = parsedBody.data;

  const result = ContactSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, message } = result.data;

  try {
    await saveContactMessage({ name, email, message });
    // TODO: add Resend notification email when RESEND_API_KEY is configured
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json(
      { error: "Failed to send your message. Please try again." },
      { status: 500 }
    );
  }
}
