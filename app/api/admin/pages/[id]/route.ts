import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidateForSite } from "@/lib/revalidatePortfolio";

export const dynamic = "force-dynamic";

const PageUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Page not found." }, { status: 404 });
  }
  if (error) {
    console.error("[GET /api/admin/pages/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ page: data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = PageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("pages")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Page not found." }, { status: 404 });
  }
  if (error) {
    console.error("[PUT /api/admin/pages/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await revalidateForSite(data.site_id, [`/${data.slug}`]);

  return Response.json({ page: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data: existing } = await getSupabaseAdmin()
    .from("pages")
    .select("site_id, slug")
    .eq("id", id)
    .single();

  const { error } = await getSupabaseAdmin()
    .from("pages")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/pages/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (existing) {
    await revalidateForSite(existing.site_id, [`/${existing.slug}`]);
  }

  return Response.json({ deleted: true, id });
}
