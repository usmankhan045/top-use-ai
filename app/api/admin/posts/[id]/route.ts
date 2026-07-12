import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidateForSite, audienceTagsToPaths } from "@/lib/revalidatePortfolio";

export const dynamic = "force-dynamic";

const FaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const PostUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  quick_answer: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  audience_tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "published"]).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  faq_items: z.array(FaqItemSchema).optional(),
  featured_image_url: z.string().url().nullable().optional(),
  published_at: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .select("*, categories(slug, name)")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Post not found." }, { status: 404 });
  }
  if (error) {
    console.error("[GET /api/admin/posts/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ post: data });
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

  const parsed = PostUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.status === "published" && parsed.data.published_at === undefined) {
    const { data: existing } = await getSupabaseAdmin()
      .from("posts")
      .select("published_at")
      .eq("id", id)
      .single();
    if (!existing?.published_at) {
      payload.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .update(payload)
    .eq("id", id)
    .select("*, categories(slug, name)")
    .single();

  if (error?.code === "PGRST116") {
    return Response.json({ error: "Post not found." }, { status: 404 });
  }
  if (error) {
    console.error("[PUT /api/admin/posts/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await revalidatePost(data.site_id, data.slug, data.category_id, data.audience_tags ?? []);

  return Response.json({ post: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = authenticate(request);
  if (authError) return authError;

  const { id } = await params;

  const { data: existing } = await getSupabaseAdmin()
    .from("posts")
    .select("site_id, slug, category_id, audience_tags")
    .eq("id", id)
    .single();

  const { error } = await getSupabaseAdmin()
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DELETE /api/admin/posts/[id]]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (existing) {
    await revalidatePost(
      existing.site_id,
      existing.slug,
      existing.category_id,
      existing.audience_tags ?? []
    );
  }

  return Response.json({ deleted: true, id });
}

async function revalidatePost(
  siteId: string,
  slug: string,
  categoryId: string | null,
  audienceTags: string[]
) {
  const paths = ["/blog", `/blog/${slug}`];

  if (categoryId) {
    const { data: cat } = await getSupabaseAdmin()
      .from("categories")
      .select("slug")
      .eq("id", categoryId)
      .single();
    if (cat) paths.push(`/category/${cat.slug}`);
  }

  paths.push(...audienceTagsToPaths(audienceTags));

  await revalidateForSite(siteId, paths);
}
