import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addSubscriber } from "@/lib/queries";

export const dynamic = "force-dynamic";

const SubscribeSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = SubscribeSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email, source } = result.data;

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
