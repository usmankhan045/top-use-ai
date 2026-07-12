import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";
import { revalidateForSite, audienceTagsToPaths } from "@/lib/revalidatePortfolio";

export const dynamic = "force-dynamic";

const FaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const PostCreateSchema = z.object({
  site_id: z.string().uuid().optional(),
  title: z.string().min(1, "title is required"),
  slug: z.string().min(1, "slug is required"),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  quick_answer: z.string().optional(),
  category_id: z.string().uuid().nullable().optional(),
  audience_tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  faq_items: z.array(FaqItemSchema).default([]),
  featured_image_url: z.string().url().nullable().optional(),
  published_at: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const sp = request.nextUrl.searchParams;
  const siteId = sp.get("site_id") ?? (await getCurrentSiteId());
  const status = sp.get("status");
  const categoryId = sp.get("category");
  const audienceTag = sp.get("audience_tag");

  let query = getSupabaseAdmin()
    .from("posts")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (audienceTag) query = query.contains("audience_tags", [audienceTag]);

  const { data, error } = await query;
  if (error) {
    console.error("[GET /api/admin/posts]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ posts: data });
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

  const parsed = PostCreateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const siteId = parsed.data.site_id ?? (await getCurrentSiteId());
  const payload = { ...parsed.data, site_id: siteId };

  if (payload.status === "published" && !payload.published_at) {
    payload.published_at = new Date().toISOString();
  }

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .insert(payload)
    .select("*, categories(slug, name)")
    .single();

  if (error) {
    console.error("[POST /api/admin/posts]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  await revalidatePost(siteId, data.slug, data.category_id, data.audience_tags ?? []);

  return Response.json({ post: data }, { status: 201 });
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
