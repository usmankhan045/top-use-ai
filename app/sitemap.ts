import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site.config";
import {
  getPublishedPosts,
  getCategoriesWithPostCounts,
  getPrintables,
} from "@/lib/queries";

const BASE_URL = `https://${siteConfig.domain}`;

// Pages whose content lives in the codebase rather than the database. Bump
// this by hand when /about or /contact is actually rewritten. Using the
// current time here would re-date them every hour for no reason.
const STATIC_PAGE_UPDATED = "2026-09-21T00:00:00.000Z";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch first: the newest post's timestamp is the honest lastModified for
  // every listing page, because that is what actually changed them.
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts({ limit: 1000 });
  } catch {
    // DB not yet configured
  }

  // A lastmod that moves on every regeneration is a lie, and Google is
  // documented to start ignoring the whole sitemap's dates when it spots one.
  // Anchor listing pages to real content changes instead of the clock.
  const latestPostChange = posts.reduce<string | null>((newest, post) => {
    const stamp = post.updated_at ?? post.published_at;
    if (!stamp) return newest;
    return !newest || stamp > newest ? stamp : newest;
  }, null);

  const siteChanged = latestPostChange ?? new Date().toISOString();

  // Static pages that genuinely change when a post is published or edited.
  // /about and /contact do not, so they get the deploy-independent fallback.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: siteChanged, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: siteChanged, changeFrequency: "daily", priority: 0.9 },
    ...(siteConfig.features.printables
      ? [{ url: `${BASE_URL}/free-printables`, lastModified: siteChanged, changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    { url: `${BASE_URL}/about`, lastModified: STATIC_PAGE_UPDATED, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: STATIC_PAGE_UPDATED, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Audience hub pages
  const hubRoutes: MetadataRoute.Sitemap = siteConfig.audienceSegments.map(
    (seg) => ({
      url: `${BASE_URL}/${seg.slug}`,
      lastModified: siteChanged,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Dynamic: categories and printables, fall back to empty if DB not configured
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let printableRoutes: MetadataRoute.Sitemap = [];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // A category page changes when one of its own posts does, not when any post
  // anywhere does, so date each one from its newest member.
  const newestPerCategory = new Map<string, string>();
  for (const post of posts) {
    const categoryId = (post as { category_id?: string | null }).category_id;
    const stamp = post.updated_at ?? post.published_at;
    if (!categoryId || !stamp) continue;
    const current = newestPerCategory.get(categoryId);
    if (!current || stamp > current) newestPerCategory.set(categoryId, stamp);
  }

  try {
    // Only categories that actually have published posts. An empty category
    // page renders "no posts yet", so submitting it is a soft-404 signal.
    const categories = await getCategoriesWithPostCounts();
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: newestPerCategory.get(cat.id) ?? siteChanged,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // DB not yet configured
  }

  if (siteConfig.features.printables) {
    try {
      const printables = await getPrintables();
      printableRoutes = printables.map((p) => ({
        url: `${BASE_URL}/free-printables/${p.slug}`,
        lastModified: p.created_at,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    } catch {
      // DB not yet configured
    }
  }

  return [
    ...staticRoutes, ...hubRoutes, ...postRoutes, ...categoryRoutes, ...printableRoutes,
  ];
}
