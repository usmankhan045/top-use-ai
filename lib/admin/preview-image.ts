import { siteConfig } from "@/lib/site.config";

/** Bump when the generated artwork changes so Next/CDN image caches refresh. */
export const GENERATED_PREVIEW_VERSION = "2";

/**
 * Automatic preview images.
 *
 * When an admin saves a post without a featured image we deliberately store
 * NULL rather than writing a generated URL into the database. Two reasons:
 *
 *  1. The DB keeps telling the truth — `featured_image_url IS NULL` still means
 *     "nobody chose an image", which is what the dashboard's "missing image"
 *     count reports on.
 *  2. The generated card's design can change later without a data migration to
 *     rewrite dozens of baked-in URLs.
 *
 * So the fallback is resolved at render time, here.
 */

export interface PreviewImageSource {
  title: string;
  slug: string;
  featured_image_url?: string | null;
  categories?: { name: string; slug: string } | null;
}

/**
 * The URL to use for a post's preview/social image — the admin's uploaded image
 * if there is one, otherwise an on-brand generated card.
 */
export function previewImageUrl(
  post: PreviewImageSource,
  /**
   * "card" draws the image at 16:9, the shape the on-site post card renders it
   * in. The default 1200x630 is for meta tags, where scrapers expect it.
   */
  ratio: "og" | "card" = "og"
): string {
  if (post.featured_image_url) return post.featured_image_url;

  const params = new URLSearchParams({
    title: post.title,
    v: GENERATED_PREVIEW_VERSION,
  });
  const label = post.categories?.name;
  if (label) params.set("label", label);
  // The category slug is included so the preview route can evolve category-
  // specific treatments without changing the editor contract.
  if (post.categories?.slug) params.set("category", post.categories.slug);
  if (ratio === "card") params.set("ratio", "card");

  return `/api/og?${params.toString()}`;
}

/** Absolute variant, required by Open Graph / Twitter meta tags. */
export function absolutePreviewImageUrl(post: PreviewImageSource): string {
  const url = previewImageUrl(post);
  if (url.startsWith("http")) return url;
  return `https://${siteConfig.domain}${url}`;
}

// ── Printables ───────────────────────────────────────────────────────────────

export interface PrintableThumbnailSource {
  title: string;
  slug: string;
  thumbnail_url?: string | null;
  categories?: { name: string; slug: string } | null;
}

/**
 * Thumbnail for a printable — the uploaded image if there is one, otherwise the
 * same generated card that covers imageless posts. Labelled "Printable" so the
 * grid reads differently from a post card at a glance.
 *
 * As with posts, nothing is written to the database: `thumbnail_url` stays NULL
 * and the fallback resolves here at render time.
 */
export function printableThumbnail(printable: PrintableThumbnailSource): string {
  if (printable.thumbnail_url) return printable.thumbnail_url;

  const params = new URLSearchParams({ title: printable.title });
  params.set("label", printable.categories?.name ?? "Printable");
  params.set("kicker", "Free download");
  if (printable.categories?.slug) params.set("category", printable.categories.slug);

  return `/api/og?${params.toString()}`;
}

export function absolutePrintableThumbnail(
  printable: PrintableThumbnailSource
): string {
  const url = printableThumbnail(printable);
  if (url.startsWith("http")) return url;
  return `https://${siteConfig.domain}${url}`;
}
