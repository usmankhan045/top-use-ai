import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CategoryCreateSchema = z.object({
  site_id: z.string().uuid().optional(),
  slug: z.string().min(1, "slug is required"),
  name: z.string().min(1, "name is required"),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const siteId =
    request.nextUrl.searchParams.get("site_id") ?? (await getCurrentSiteId());

  const { data, error } = await getSupabaseAdmin()
    .from("categories")
    .select("*")
    .eq("site_id", siteId)
    .order("name");

  if (error) {
    console.error("[GET /api/admin/categories]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ categories: data });
}

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = CategoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const siteId = parsed.data.site_id ?? (await getCurrentSiteId());
  const payload = { ...parsed.data, site_id: siteId };

  const { data, error } = await getSupabaseAdmin()
    .from("categories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/categories]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ category: data }, { status: 201 });
}
