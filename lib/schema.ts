import { siteConfig } from "./site.config";
import type { Post, FaqItem } from "./queries";

const BASE_URL = `https://${siteConfig.domain}`;

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: BASE_URL,
    description: siteConfig.tagline,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: BASE_URL,
    description: siteConfig.niche,
    sameAs: [siteConfig.social.pinterest],
  };
}

export function articleSchema(post: Post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    url, ...(post.featured_image_url && { image: post.featured_image_url }),
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function faqSchema(faqItems: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Strip inline markdown (bold, italics, links, code, shortcodes) to plain text. */
function cleanMarkdown(text: string): string {
  return text
    .replace(/\{\{[^}]*\}\}/g, "") // {{printable:...}} shortcodes
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links/images → label
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italics
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Build HowTo schema for genuine step-by-step guides only. Returns null for any
 * post that isn't structured as a procedure, so list-style posts never emit it.
 * Two recognized shapes:
 *   A) ≥2 H2 headings of the form "## Step N, Title" (step text = following paragraph)
 *   B) an H2 containing "step-by-step" followed by an ordered list of "**Bold lead.** detail" items
 */
export function howToSchema(post: Post): object | null {
  const md = post.content ?? "";
  if (!md) return null;
  const lines = md.split("\n");
  const steps: Array<{ name: string; text: string }> = [];

  // Strategy A, "## Step N, Title" headings
  const stepHeadingRe = /^##\s+Step\s+\d+\s*[,  :\-]\s*(.+?)\s*$/i;
  const headings: Array<{ name: string; line: number }> = [];
  lines.forEach((ln, i) => {
    const m = ln.match(stepHeadingRe);
    if (m) headings.push({ name: m[1].trim(), line: i });
  });
  if (headings.length >= 2) {
    for (const h of headings) {
      let text = "";
      for (let j = h.line + 1; j < lines.length; j++) {
        const t = lines[j].trim();
        if (!t) {
          if (text) break;
          continue;
        }
        if (t.startsWith("#")) break;
        if (t.startsWith("{{")) continue;
        text += (text ? " " : "") + t;
      }
      steps.push({ name: cleanMarkdown(h.name), text: cleanMarkdown(text) || cleanMarkdown(h.name) });
    }
  }

  // Strategy B, ordered list under a "step-by-step" H2
  if (steps.length < 2) {
    const startIdx = lines.findIndex((ln) => /^##\s+.*step-by-step/i.test(ln));
    if (startIdx !== -1) {
      const olItemRe = /^\s*\d+\.\s+\*\*(.+?)\*\*\s*(.*)$/;
      for (let j = startIdx + 1; j < lines.length; j++) {
        const ln = lines[j];
        if (/^##\s/.test(ln)) break; // next section
        const m = ln.match(olItemRe);
        if (m) {
          const name = cleanMarkdown(m[1]).replace(/[.:]$/, "");
          const text = cleanMarkdown(`${m[1]} ${m[2] ?? ""}`);
          steps.push({ name, text: text || name });
        }
      }
    }
  }

  if (steps.length < 2) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: post.seo_title ?? post.title, ...((post.seo_description ?? post.excerpt) && {
      description: post.seo_description ?? post.excerpt ?? undefined,
    }),
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function digitalDocumentSchema(printable: {
  slug: string;
  title: string;
  description: string | null;
}) {
  const url = `${BASE_URL}/free-printables/${printable.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: printable.title, ...(printable.description && { description: printable.description }),
    url,
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: BASE_URL,
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; slug: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.slug}`,
    })),
  };
}
