import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/lib/queries";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
  SectionDivider,
} from "@/components/ui";
import { MarkdownContent } from "@/components/MarkdownContent";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AuthorByline, AuthorBio } from "@/components/Author";
import { articleSchema, faqSchema, breadcrumbSchema, howToSchema } from "@/lib/schema";
import { siteConfig } from "@/lib/site.config";
import { cn } from "@/lib/utils";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((p) => ({ slug: p.slug }));
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
    const post = await getPostBySlug(slug);
    if (!post) return {};
    const title = post.seo_title ?? post.title;
    const description = post.seo_description ?? post.excerpt ?? undefined;
    // Always resolve a share image: the post's featured image, else the site OG
    // default, so every post has a non-generic og:image/twitter:image.
    const shareImage = post.featured_image_url ?? "/og-default.jpg";
    return {
      title,
      description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title,
        description,
        type: "article",
        url: `/blog/${slug}`,
        publishedTime: post.published_at ?? undefined,
        modifiedTime: post.updated_at,
        authors: [siteConfig.name],
        images: [{ url: shareImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [shareImage],
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post: Awaited<ReturnType<typeof getPostBySlug>>;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }
  if (!post) notFound();

  let relatedPosts: Awaited<ReturnType<typeof getRelatedPosts>> = [];
  try {
    relatedPosts = await getRelatedPosts({
      categoryId: post.category_id,
      audienceTags: post.audience_tags,
      excludeSlug: post.slug,
      limit: 3,
    });
  } catch {
    // non-critical
  }

  const hasFaq = post.faq_items && post.faq_items.length > 0;
  const howTo = howToSchema(post);

  const schemas = [
    articleSchema(post),
    breadcrumbSchema([
      { name: "Home", slug: "/" },
      { name: "Blog", slug: "/blog" }, ...(post.categories
        ? [{ name: post.categories.name, slug: `/category/${post.categories.slug}` }]
        : []),
      { name: post.title, slug: `/blog/${post.slug}` },
    ]), ...(hasFaq && post.faq_items.length > 0 ? [faqSchema(post.faq_items)] : []), ...(howTo ? [howTo] : []),
  ];

  return (
    <main className="flex-1">
      <JsonLd data={schemas} />
      {/* ── Article header ─────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] to-background pt-10 pb-8"
        aria-labelledby="post-title"
      >
        <Container width="narrow">
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Blog", href: "/blog" }, ...(post.categories
                ? [
                    {
                      name: post.categories.name,
                      href: `/category/${post.categories.slug}`,
                    },
                  ]
                : []),
            ]}
          />
          <div className="flex flex-wrap gap-2 mb-5">
            {post.categories && (
              <Link href={`/category/${post.categories.slug}`}>
                <Tag variant="primary">{post.categories.name}</Tag>
              </Link>
            )}
            {post.audience_tags.map((tag) => (
              <Tag key={tag} variant="default">
                {tag.replace(/-/g, " ")}
              </Tag>
            ))}
          </div>

          <h1
            id="post-title"
            className="font-display text-[2.4rem] sm:text-5xl lg:text-[3.4rem] font-extrabold text-text leading-[1.02] tracking-tight text-balance mb-5"
          >
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted leading-relaxed mb-5">
              {post.excerpt}
            </p>
          )}

          {post.published_at && (
            <p className="stamp text-muted/70">
              Published{" "}
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
              {post.updated_at &&
                new Date(post.updated_at).toDateString() !==
                  new Date(post.published_at).toDateString() && (
                  <>
                    {" · Updated "}
                    {new Date(post.updated_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </>
                )}
            </p>
          )}

          <div className="mt-6">
            <AuthorByline />
          </div>
        </Container>
      </section>

      {/* ── Featured image ─────────────────────────────────────────────────── */}
      {post.featured_image_url && (
        <Container width="narrow" className="mt-2">
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[var(--radius)] border-2 border-text hard-ink bg-primary/[0.05]">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        </Container>
      )}

      {/* ── Article body ───────────────────────────────────────────────────── */}
      <article className="py-12 sm:py-16">
        <Container width="narrow">
          {/* Quick Answer box, AEO answer-first pattern.
              The most extracted part of the page, so it gets the full card
              treatment: ink outline, hard shadow, and a lime tab down the left
              edge to mark it as the payoff. */}
          {post.quick_answer && (
            <div
              className="mb-10 border-2 border-text border-l-[6px] border-l-accent rounded-[var(--radius)] bg-white p-5 sm:p-6 hard-sm"
              role="note"
              aria-label="Quick answer"
            >
              <p className="stamp text-text mb-3">Quick Answer</p>
              <p className="text-text leading-relaxed font-medium">
                {post.quick_answer}
              </p>
            </div>
          )}

          {/* Main content */}
          {post.content && <MarkdownContent content={post.content} />}

          {/* FAQ section */}
          {hasFaq && (
            <section
              className="mt-14 pt-10 border-t border-black/[0.07]"
              aria-labelledby="faq-heading"
            >
              <SectionDivider variant="titled" label="FAQ" spacing="sm" />
              <h2
                id="faq-heading"
                className="font-display text-2xl font-extrabold text-text mt-6 mb-8"
              >
                Frequently Asked Questions
              </h2>
              <div className="space-y-8">
                {post.faq_items.map((item, i) => (
                  <div key={i}>
                    <h3 className="font-display text-base font-semibold text-text mb-2">
                      {item.question}
                    </h3>
                    <p className="text-text/80 leading-relaxed text-sm sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Author bio, reinforces E-E-A-T at the end of the article */}
          <AuthorBio />
        </Container>
      </article>

      {/* ── Related posts ──────────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section
          className="py-12 bg-primary/[0.03]"
          aria-labelledby="related-heading"
        >
          <Container>
            <SectionDivider variant="titled" label="Keep reading" spacing="sm" />
            <h2
              id="related-heading"
              className="font-display text-2xl font-extrabold text-text mt-6 mb-8"
            >
              Related guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group block h-full focus-visible:outline-none"
                >
                  <Card
                    className={cn(
                      "h-full flex flex-col",
                      "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-text"
                    )}
                  >
                    {related.categories && (
                      <Tag variant="default" className="mb-3 self-start">
                        {related.categories.name}
                      </Tag>
                    )}
                    <CardTitle
                      as="h3"
                      className="text-base leading-snug mb-2 line-clamp-3 group-hover:underline group-hover:decoration-accent decoration-2 underline-offset-4 transition"
                    >
                      {related.title}
                    </CardTitle>
                    {related.excerpt && (
                      <CardBody className="flex-1 line-clamp-3 text-sm">
                        {related.excerpt}
                      </CardBody>
                    )}
                    <p className="mt-4 stamp text-muted group-hover:text-text transition-colors">
                      Read →
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </main>
  );
}
