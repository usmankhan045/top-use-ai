import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/queries";
import { Container, Tag } from "@/components/ui";
import { BlogList, type BlogListPost } from "@/components/BlogList";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Hands-on AI tool reviews, side-by-side comparisons, and how-to guides, plus practical ways to make money with AI.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog",
    description: "Hands-on AI tool reviews, side-by-side comparisons, and how-to guides, plus practical ways to make money with AI.",
    url: "/blog",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function BlogIndexPage() {
  // No searchParams: fetch every published post once so this route can be
  // fully prerendered (static + ISR) instead of server-rendered per request.
  // Pagination is handled client-side via BlogList's progressive reveal.
  let rawPosts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    rawPosts = await getPublishedPosts();
  } catch {
    // DB not yet configured, show empty state
  }

  const posts: BlogListPost[] = rawPosts.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.published_at,
    categoryName: p.categories?.name ?? null,
  }));

  return (
    <main className="flex-1">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="blog-heading"
      >
        <Container>
          <Tag variant="primary" className="mb-5">
            Blog
          </Tag>
          <h1
            id="blog-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            Reviews &amp; how-tos.
            <br className="hidden sm:block" />
            No hype.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl">
            Hands-on AI tool reviews, honest comparisons, and step-by-step
            guides, including real ways to make money with AI.
          </p>
        </Container>
      </section>

      {/* ── Post grid ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14">
        <Container>
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl font-semibold text-text mb-2">
                No posts yet
              </p>
              <p className="text-muted text-sm">
                Content is coming soon. Check back shortly.
              </p>
            </div>
          ) : (
            <BlogList posts={posts} />
          )}
        </Container>
      </section>
    </main>
  );
}
