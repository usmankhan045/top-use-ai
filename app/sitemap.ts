import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site.config";
import { getPublishedPosts, getCategories, getPrintables } from "@/lib/queries";

const BASE_URL = `https://${siteConfig.domain}`;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.9 }, ...(siteConfig.features.printables
      ? [{ url: `${BASE_URL}/free-printables`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }]
      : []),
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Audience hub pages
  const hubRoutes: MetadataRoute.Sitemap = siteConfig.audienceSegments.map(
    (seg) => ({
      url: `${BASE_URL}/${seg.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Dynamic: posts, categories, printables, fall back to empty if DB not configured
  let postRoutes: MetadataRoute.Sitemap = [];
  let categoryRoutes: MetadataRoute.Sitemap = [];
  let printableRoutes: MetadataRoute.Sitemap = [];

  try {
    const posts = await getPublishedPosts({ limit: 1000 });
    postRoutes = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not yet configured
  }

  try {
    const categories = await getCategories();
    categoryRoutes = categories.map((cat) => ({
      url: `${BASE_URL}/category/${cat.slug}`,
      lastModified: now,
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
