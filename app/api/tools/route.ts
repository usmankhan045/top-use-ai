import { getCurrentSiteId, getSupabaseAdmin } from "@/lib/supabase";
import { WRITING_TOOLS } from "@/lib/tool-finder/writing-catalog";
import { NICHES, categorySlug } from "@/lib/tool-finder/niches";

export const dynamic = "force-dynamic";

const PAGE_LIMIT = 250;
const ALLOWED_CATEGORIES = new Set(NICHES.map((niche) => categorySlug(niche.category)));
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category")?.trim() || "";
  const allowedParams = new Set(["category", "limit"]);
  const hasUnsupportedParam = [...url.searchParams.keys()].some(
    (key) => !allowedParams.has(key)
  );
  if (
    hasUnsupportedParam ||
    !ALLOWED_CATEGORIES.has(category) ||
    (url.searchParams.has("limit") && url.searchParams.get("limit") !== String(PAGE_LIMIT))
  ) {
    return Response.json(
      { error: "Unsupported catalog query." },
      { status: 400, headers: { "Cache-Control": "public, s-maxage=300" } }
    );
  }

  try {
    const siteId = await getCurrentSiteId();
    const query = getSupabaseAdmin()
      .from("tool_catalog")
      .select("*, tool_sources(label, url, source_type)", { count: "exact" })
      .eq("site_id", siteId)
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("popular", { ascending: false })
      .order("name")
      .eq("category", category)
      .limit(PAGE_LIMIT);

    const catalogCountQuery = getSupabaseAdmin()
      .from("tool_catalog")
      .select("id", { count: "exact", head: true })
      .eq("site_id", siteId)
      .eq("status", "published");

    const [{ data, error, count }, { count: catalogTotal, error: catalogCountError }] = await Promise.all([
      query,
      catalogCountQuery,
    ]);
    if (error) throw error;
    if (catalogCountError) throw catalogCountError;
    const tools = (data ?? []).map((tool) => ({
      slug: tool.slug,
      name: tool.name,
      category: tool.category,
      sourceCategory: tool.source_category,
      subcategory: tool.subcategory,
      websiteUrl: tool.website_url,
      summary: tool.summary,
      bestFor: tool.best_for,
      audience: tool.audience,
      strengths: tool.strengths,
      limitations: tool.limitations,
      freePlan: tool.free_plan,
      paidPlans: tool.paid_plans,
      pricingModel: tool.pricing_model,
      pricingDetails: tool.pricing_details,
      qualityScore: tool.quality_score,
      easeScore: tool.ease_score,
      valueScore: tool.value_score,
      tags: tool.tags,
      useCases: tool.use_cases,
      notGoodFor: tool.not_good_for,
      industries: tool.industries,
      accessMethods: tool.access_methods,
      compliance: tool.compliance,
      dataStorage: tool.data_storage,
      featured: tool.featured,
      popular: tool.popular,
      relatedPostSlugs: tool.related_post_slugs,
      sources: (tool.tool_sources ?? []).map((source: { label: string; url: string; source_type: string }) => ({
        label: source.label,
        href: source.url,
        kind: source.source_type.startsWith("official")
          ? "official"
          : source.source_type === "dataset"
            ? "dataset"
            : "editorial",
      })),
      verification: tool.verification_status,
      lastReviewedLabel: tool.last_reviewed_at
        ? `Catalog verified ${new Date(tool.last_reviewed_at).toLocaleDateString("en-US", { dateStyle: "long" })}.`
        : "Catalog verification date not recorded.",
    }));
    return Response.json({
      tools,
      source: "supabase",
      catalog: {
        total: catalogTotal ?? count ?? tools.length,
        nicheTotal: count ?? tools.length,
      },
      pagination: {
        page: 1,
        limit: PAGE_LIMIT,
        total: count ?? tools.length,
        pages: 1,
      },
    }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.warn("[GET /api/tools] catalog fallback:", error);
    const fallbackCategory = category === "content-creation" || category === "ai-writing-content";
    return Response.json({
      tools: fallbackCategory ? WRITING_TOOLS : [],
      source: "local-editorial-seed",
      catalog: {
        total: WRITING_TOOLS.length,
        nicheTotal: fallbackCategory ? WRITING_TOOLS.length : 0,
      },
      pagination: {
        page: 1,
        limit: WRITING_TOOLS.length,
        total: fallbackCategory ? WRITING_TOOLS.length : 0,
        pages: fallbackCategory ? 1 : 0,
      },
      warning: "The local development catalog is being used until migration 005 is applied.",
    }, { headers: CACHE_HEADERS });
  }
}
