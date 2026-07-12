import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site.config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${siteConfig.domain}`;

  const disallow = ["/api/", "/admin/"];

  return {
    rules: [
      // Standard search bots
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // AI training and inference crawlers — explicitly permitted
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow,
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow,
      },
      {
        userAgent: "cohere-ai",
        allow: "/",
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
