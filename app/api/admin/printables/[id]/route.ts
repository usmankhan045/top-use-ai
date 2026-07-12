import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidateForSite } from "@/lib/revalidatePortfolio";

export const dynamic = "force-dynamic";

const PrintableUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  file_url: z.string().url().optional(),
  thumbnail_url: z.string().url().optional(),
  category_id: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("printables")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Printable not found." }, { status: 404 });
  }
  if (error) {
    console.error("[GET /api/admin/printables/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ printable: data });
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

  const parsed = PrintableUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("printables")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Printable not found." }, { status: 404 });
  }
  if (error) {
    console.error("[PUT /api/admin/printables/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await revalidateForSite(data.site_id, [
    "/free-printables",
    `/free-printables/${data.slug}`,
  ]);

  return Response.json({ printable: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data: existing } = await getSupabaseAdmin()
    .from("printables")
    .select("site_id, slug")
    .eq("id", id)
    .single();

  const { error } = await getSupabaseAdmin()
    .from("printables")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/printables/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (existing) {
    await revalidateForSite(existing.site_id, [
      "/free-printables",
      `/free-printables/${existing.slug}`,
    ]);
  }

  return Response.json({ deleted: true, id });
}
