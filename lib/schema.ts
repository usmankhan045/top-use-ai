import { siteConfig } from "./site.config";
import type { Post, FaqItem } from "./queries";

const BASE_URL = `https://${siteConfig.domain}`;

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: siteConfig.name,
    url: BASE_URL,
    description: siteConfig.tagline,
    publisher: { "@id": `${BASE_URL}/#organization` },
    inLanguage: "en-US",
    // No SearchAction: the site has no on-page search endpoint, so declaring a
    // sitelinks searchbox would promise a feature that doesn't exist.
  };
}

/** CollectionPage for archive routes (blog index, category pages). */
export function collectionPageSchema(opts: {
  path: string;
  name: string;
  description?: string | null;
}) {
  const url = `${BASE_URL}${opts.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: opts.name, ...(opts.description && { description: opts.description }),
    isPartOf: { "@id": `${BASE_URL}/#website` },
    publisher: { "@id": `${BASE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

/** AboutPage schema for /about. */
export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${BASE_URL}/about`,
    name: `About ${siteConfig.name}`,
    isPartOf: { "@id": `${BASE_URL}/#website` },
    mainEntity: { "@id": `${BASE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

/** The named human author behind the reviews (E-E-A-T Person entity). */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BASE_URL}/#person`,
    name: siteConfig.author.name,
    url: `${BASE_URL}/about`,
    image: `${BASE_URL}${siteConfig.author.avatar}`,
    jobTitle: siteConfig.author.role,
    description: siteConfig.author.bio,
    worksFor: { "@id": `${BASE_URL}/#organization` },
    sameAs: [siteConfig.author.linkedin],
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: siteConfig.name,
    url: BASE_URL,
    description: siteConfig.niche,
    // Publisher logo is required for Article rich results. Points at the 512x512
    // app icon, which Next serves at /icon.png.
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icon.png`,
      width: 512,
      height: 512,
    },
    sameAs: [siteConfig.social.pinterest],
  };
}

/** Resolve any image reference to an absolute URL. Google's structured data
 *  guidelines require absolute URLs; a stored value like "/covers/x.png" fails
 *  Article image eligibility silently, so relative paths get the origin added. */
function absoluteUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${BASE_URL}${path}`;
}

export function articleSchema(post: Post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  // Always emit an image (required for article rich results). Falls back to the
  // site OG default when a post has no featured image of its own.
  const image = absoluteUrl(post.featured_image_url ?? "/og-default.jpg");
  const wordCount = post.content
    ? post.content.trim().split(/\s+/).length
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    url,
    image,
    inLanguage: "en-US",
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    // Reference the site-wide entities by @id rather than duplicating them.
    // Both are emitted on every page by the root layout, so the references
    // resolve in-document and Google sees one canonical Person/Organization
    // instead of one orphaned copy per post.
    author: { "@id": `${BASE_URL}/#person` },
    publisher: { "@id": `${BASE_URL}/#organization` },
    isPartOf: { "@id": `${BASE_URL}/#website` }, ...(wordCount && { wordCount }), ...(post.categories && { articleSection: post.categories.name }),
    // The quick answer is the block written to be extracted, so point
    // speakable at it explicitly.
    ...(post.quick_answer && {
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".quick-answer"],
      },
    }),
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

/** Slugify heading text into an anchor id. Must match headingSlug in
 *  components/MarkdownContent.tsx so ItemList URLs resolve to real anchors. */
function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/**
 * Build ItemList schema for genuine ranked listicles ("best X" posts), which is
 * the one list type Google still rewards with carousel treatment. Returns null
 * unless the post really is a ranked list, so comparisons and explainers never
 * emit it.
 *
 * HowTo was removed deliberately: Google retired HowTo rich results, and a
 * HowToStep list carries no extraction advantage over the same steps as plain
 * markdown, so it was maintenance surface (fragile regex step-parsing) for no
 * benefit.
 *
 * Recognized shape: a "best/top" title, plus >= 3 H2 sections shaped
 * "ToolName: what it's best for", which is the house listicle format. The
 * colon is what separates a tool section from a prose section, since
 * "Key takeaways" and "Which X should you choose?" never carry one.
 */
export function itemListSchema(post: Post): object | null {
  const md = post.content ?? "";
  if (!md) return null;
  // Only ranked "best of" listicles qualify, not head-to-head comparisons.
  const title = post.title ?? "";
  if (!/\b(best|top)\b/i.test(title)) return null;
  if (/\bvs\.?\b/i.test(title)) return null;

  const items: Array<{ name: string; anchor: string }> = [];
  for (const ln of md.split("\n")) {
    const m = ln.match(/^##\s+(.+?)\s*$/);
    if (!m) continue;
    const heading = cleanMarkdown(m[1]);
    // A tool section reads "ToolName: what it's best for". Prose sections
    // ("Key takeaways", "Quick comparison") have no colon, so they drop out.
    const colon = heading.indexOf(":");
    if (colon < 1) continue;
    const name = heading.slice(0, colon).trim();
    // Tool names are short; anything longer is a sentence, not a product.
    if (!name || name.length > 40) continue;
    if (/[?]/.test(name)) continue;
    // The anchor must be built from the FULL heading, since that is what
    // MarkdownContent slugifies into the id.
    items.push({ name, anchor: headingSlug(heading) });
  }

  if (items.length < 3) return null;

  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: post.seo_title ?? post.title,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${url}#${item.anchor}`,
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
