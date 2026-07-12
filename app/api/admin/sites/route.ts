import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[GET /api/admin/sites]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ sites: data });
}

const SiteCreateSchema = z.object({
  slug: z.string().min(1, "slug is required"),
  domain: z.string().min(1, "domain is required"),
  name: z.string().min(1, "name is required"),
  niche: z.string().optional(),
  deploy_url: z.string().url("deploy_url must be a valid URL"),
  theme_config: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = SiteCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/sites]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ site: data }, { status: 201 });
}
