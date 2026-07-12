import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts, getPublishedPostCount } from "@/lib/queries";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
  SectionDivider,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Practical budgeting guides, honest money advice, and real-life strategies for every financial situation.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog",
    description: "Practical budgeting guides, honest money advice, and real-life strategies for every financial situation.",
    url: "/blog",
    type: "website",
  },
};

export const revalidate = 3600;

const POSTS_PER_PAGE = 12;

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(
    1,
    parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1
  );
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let total = 0;
  try {
    [posts, total] = await Promise.all([
      getPublishedPosts({ limit: POSTS_PER_PAGE, offset }),
      getPublishedPostCount(),
    ]);
  } catch {
    // DB not yet configured — show empty state
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

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
            Practical guides.
            <br className="hidden sm:block" />
            No filler.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl">
            Budgeting strategies, money advice, and honest takes, all written
            for real life, not ideal scenarios.
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block h-full focus-visible:outline-none"
                  >
                    <Card
                      className={cn(
                        "h-full flex flex-col",
                        "transition-all duration-200",
                        "group-hover:shadow-md group-hover:-translate-y-0.5",
                        "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                      )}
                    >
                      {post.categories && (
                        <Tag variant="default" className="mb-3 self-start">
                          {post.categories.name}
                        </Tag>
                      )}
                      <CardTitle
                        as="h2"
                        className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
                      >
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardBody className="flex-1 line-clamp-3 text-sm">
                          {post.excerpt}
                        </CardBody>
                      )}
                      {post.published_at && (
                        <p className="mt-4 text-xs font-mono text-muted/60 uppercase tracking-wide">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <>
                  <SectionDivider spacing="md" />
                  <div className="flex items-center justify-between">
                    {hasPrev ? (
                      <Link
                        href={`/blog?page=${currentPage - 1}`}
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        ← Previous
                      </Link>
                    ) : (
                      <span />
                    )}
                    <p className="text-xs font-mono text-muted uppercase tracking-wide">
                      Page {currentPage} of {totalPages}
                    </p>
                    {hasNext ? (
                      <Link
                        href={`/blog?page=${currentPage + 1}`}
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        Next →
                      </Link>
                    ) : (
                      <span />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
