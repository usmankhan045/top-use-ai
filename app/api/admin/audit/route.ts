import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function wordCount(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const siteIdFilter = request.nextUrl.searchParams.get("site_id");

  let sitesQuery = getSupabaseAdmin()
    .from("sites")
    .select("id, slug, name, domain, deploy_url")
    .order("created_at", { ascending: true });

  if (siteIdFilter) {
    sitesQuery = sitesQuery.eq("id", siteIdFilter);
  }

  const { data: sites, error: sitesError } = await sitesQuery;
  if (sitesError) {
    console.error("[GET /api/admin/audit] sites", sitesError);
    return Response.json({ error: sitesError.message }, { status: 500 });
  }

  const siteIds = (sites ?? []).map((s) => s.id);

  const [postsResult, pagesResult, printablesResult] = await Promise.all([
    getSupabaseAdmin()
      .from("posts")
      .select(
        "id, site_id, slug, title, status, content, seo_title, seo_description, faq_items, audience_tags, category_id, categories(slug)"
      )
      .in("site_id", siteIds)
      .order("created_at", { ascending: false }),
    getSupabaseAdmin()
      .from("pages")
      .select("id, site_id, slug, title, content, seo_title, seo_description")
      .in("site_id", siteIds),
    getSupabaseAdmin()
      .from("printables")
      .select("id, site_id, slug, title, description")
      .in("site_id", siteIds),
  ]);

  if (postsResult.error) {
    console.error("[GET /api/admin/audit] posts", postsResult.error);
    return Response.json({ error: postsResult.error.message }, { status: 500 });
  }

  const allPosts = postsResult.data ?? [];
  const allPages = pagesResult.data ?? [];
  const allPrintables = printablesResult.data ?? [];

  const auditBySite = (sites ?? []).map((site) => {
    const posts = allPosts
      .filter((p) => p.site_id === site.id)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        status: p.status,
        word_count: wordCount(p.content),
        has_faq: Array.isArray(p.faq_items) && p.faq_items.length > 0,
        has_seo_title: Boolean(p.seo_title),
        has_seo_description: Boolean(p.seo_description),
        seo_title: p.seo_title,
        seo_description: p.seo_description,
        audience_tags: p.audience_tags ?? [],
        category_slug: (p.categories as unknown as { slug: string } | null)?.slug ?? null,
      }));

    const pages = allPages
      .filter((p) => p.site_id === site.id)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        word_count: wordCount(p.content),
        has_seo_title: Boolean(p.seo_title),
        has_seo_description: Boolean(p.seo_description),
      }));

    const printables = allPrintables
      .filter((p) => p.site_id === site.id)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        has_description: Boolean(p.description),
      }));

    const publishedPosts = posts.filter((p) => p.status === "published");

    return {
      id: site.id,
      slug: site.slug,
      name: site.name,
      domain: site.domain,
      deploy_url: site.deploy_url,
      summary: {
        post_count: posts.length,
        published_post_count: publishedPosts.length,
        posts_with_seo_title: posts.filter((p) => p.has_seo_title).length,
        posts_with_seo_description: posts.filter((p) => p.has_seo_description).length,
        posts_with_faq: posts.filter((p) => p.has_faq).length,
        avg_word_count:
          posts.length > 0
            ? Math.round(
                posts.reduce((sum, p) => sum + p.word_count, 0) / posts.length
              )
            : 0,
        page_count: pages.length,
        printable_count: printables.length,
      },
      posts,
      pages,
      printables,
    };
  });

  return Response.json({ sites: auditBySite });
}
