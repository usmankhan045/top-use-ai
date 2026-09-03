import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  getCategories,
  getCategoryBySlug,
  getPublishedPosts,
} from "@/lib/queries";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
} from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site.config";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return categories.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) return {};
    const title = `${category.name}: Blog`;
    const description =
      category.description ??
      `Browse all ${category.name} articles on ${siteConfig.name}.`;
    // A category with no published posts renders a "coming soon" placeholder.
    // Indexing that is a soft-404 signal, so noindex it until it has content.
    // follow stays on so the crawler still walks the nav from here.
    const posts = await getPublishedPosts({ categoryId: category.id, limit: 1 });
    const isEmpty = posts.length === 0;
    return {
      title,
      description,
      alternates: { canonical: `/category/${slug}` }, ...(isEmpty && { robots: { index: false, follow: true } }),
      openGraph: {
        title,
        description,
        url: `/category/${slug}`,
        type: "website",
      },
    };
  } catch {
    return {};
  }
}

export default async function CategoryArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let category: Awaited<ReturnType<typeof getCategoryBySlug>>;
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];

  try {
    category = await getCategoryBySlug(slug);
  } catch {
    notFound();
  }
  if (!category) notFound();

  try {
    posts = await getPublishedPosts({ categoryId: category.id, limit: 50 });
  } catch {
    // DB error, show empty state
  }

  return (
    <main className="flex-1">
      <JsonLd
        data={[
          collectionPageSchema({
            path: `/category/${category.slug}`,
            name: category.name,
            description: category.description,
          }),
          breadcrumbSchema([
            { name: "Home", slug: "/" },
            { name: "Blog", slug: "/blog" },
            { name: category.name, slug: `/category/${category.slug}` },
          ]),
        ]}
      />
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="category-heading"
      >
        <Container>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" },
              { name: category.name, href: `/category/${category.slug}` },
            ]}
          />
          <Tag variant="primary" className="mb-5">
            Category
          </Tag>
          <h1
            id="category-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg text-muted leading-relaxed max-w-xl">
              {category.description}
            </p>
          )}
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
                Content for this category is coming soon.
              </p>
              <Link
                href="/blog"
                className="inline-block mt-6 text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                ← Browse all posts
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs font-mono text-muted/60 uppercase tracking-wide mb-6">
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    aria-label={post.title}
                    className="group block h-full focus-visible:outline-none"
                  >
                    <Card
                      className={cn(
                        "h-full flex flex-col overflow-hidden",
                      "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-text"
                      )}
                    >
                      {post.featured_image_url && (
                        <div className="relative -mx-6 -mt-6 mb-4 aspect-[16/9] overflow-hidden bg-primary/[0.05]">
                          <Image
                            src={post.featured_image_url}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        </div>
                      )}
                      {/* Hidden visually when the cover art carries the headline,
                          but kept in the DOM for search and screen readers. */}
                      <CardTitle
                        as="h2"
                        className={cn(
                          post.featured_image_url
                            ? "sr-only"
                            : "text-base leading-snug mb-2 line-clamp-3 group-hover:underline group-hover:decoration-accent decoration-2 underline-offset-4 transition"
                        )}
                      >
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardBody className="flex-1 line-clamp-3 text-sm">
                          {post.excerpt}
                        </CardBody>
                      )}
                      {post.audience_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {post.audience_tags.map((tag) => (
                            <Tag key={tag} variant="default" className="text-[10px]">
                              {tag.replace(/-/g, " ")}
                            </Tag>
                          ))}
                        </div>
                      )}
                      {post.published_at && (
                        <p className="mt-3 text-xs font-mono text-muted/60 uppercase tracking-wide">
                          {new Date(post.published_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-black/[0.07]">
                <Link
                  href="/blog"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  ← Browse all posts
                </Link>
              </div>
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
