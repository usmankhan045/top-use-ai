import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CategoryUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Category not found." }, { status: 404 });
  }
  if (error) {
    console.error("[GET /api/admin/categories/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ category: data });
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

  const parsed = CategoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("categories")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Category not found." }, { status: 404 });
  }
  if (error) {
    console.error("[PUT /api/admin/categories/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ category: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { error } = await getSupabaseAdmin()
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/categories/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ deleted: true, id });
}
