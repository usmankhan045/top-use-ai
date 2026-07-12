import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";
import { revalidateForSite } from "@/lib/revalidatePortfolio";

export const dynamic = "force-dynamic";

const PageCreateSchema = z.object({
  site_id: z.string().uuid().optional(),
  slug: z.string().min(1, "slug is required"),
  title: z.string().optional(),
  content: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const siteId =
    request.nextUrl.searchParams.get("site_id") ?? (await getCurrentSiteId());

  const { data, error } = await getSupabaseAdmin()
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .order("slug");

  if (error) {
    console.error("[GET /api/admin/pages]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ pages: data });
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

  const parsed = PageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const siteId = parsed.data.site_id ?? (await getCurrentSiteId());
  const payload = { ...parsed.data, site_id: siteId };

  const { data, error } = await getSupabaseAdmin()
    .from("pages")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/pages]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await revalidateForSite(siteId, [`/${data.slug}`]);

  return Response.json({ page: data }, { status: 201 });
}
