import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site.config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${siteConfig.domain}`;

  const disallow = ["/api/", "/admin/", "/go/"];

  // Every agent gets the same rule, so the list is data rather than 30 repeated
  // literals. Retrieval bots (the ones that fetch a page to answer a live query)
  // are named explicitly alongside the training crawlers: they are already
  // covered by the "*" rule, but naming them means a future tightening of "*"
  // cannot silently cut off AI citation traffic.
  const aiAgents = [
    // Training / index crawlers
    "GPTBot",
    "ClaudeBot",
    "Google-Extended",
    "CCBot",
    "Applebot-Extended",
    "cohere-ai",
    "Amazonbot",
    "meta-externalagent",
    // Live retrieval agents, these fetch on demand to answer a user's question
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Perplexity-User",
    "Bingbot",
    "DuckAssistBot",
    "Google-CloudVertexBot",
    "Claude-User",
    "Claude-SearchBot",
  ];

  return {
    rules: [
      // Standard search bots
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // AI training and inference crawlers, explicitly permitted
      ...aiAgents.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow,
      })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
