import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { segmentIntros } from "@/content/segment-intros";
import { getPublishedPosts, type Post } from "@/lib/queries";
import {
  Container, Tag, Card, CardTitle, CardBody, SectionDivider,
} from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

// Only the slugs in siteConfig are valid — anything else returns 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return siteConfig.audienceSegments.map((seg) => ({ segment: seg.slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ segment: string }>;
}): Promise<Metadata> {
  const { segment: slug } = await params;
  const seg = siteConfig.audienceSegments.find((s) => s.slug === slug);
  const intro = segmentIntros[slug];
  if (!seg) return {};
  const title = seg.label;
  const description = intro?.metaDescription ?? seg.headline;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      type: "website",
    },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full focus-visible:outline-none">
      <Card
        className={cn(
          "h-full flex flex-col",
          "transition-all duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        {post.categories && (
          <Tag variant="default" className="mb-3 self-start">
            {post.categories.name}
          </Tag>
        )}
        <CardTitle
          as="h3"
          className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
        >
          {post.title}
        </CardTitle>
        {post.excerpt && (
          <CardBody className="flex-1 line-clamp-3 text-sm">
            {post.excerpt}
          </CardBody>
        )}
        <p className="mt-4 text-xs font-mono text-primary font-medium tracking-wide uppercase">
          Read →
        </p>
      </Card>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SegmentHubPage({
  params,
}: {
  params: Promise<{ segment: string }>;
}) {
  const { segment: slug } = await params;

  const seg = siteConfig.audienceSegments.find((s) => s.slug === slug);
  if (!seg) notFound();

  const intro = segmentIntros[slug];
  const isLowIncome = slug === "budget-on-low-income";

  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts({ audienceTag: seg.tag, limit: 6 });
  } catch {}

  return (
    <main className="flex-1">
      <JsonLd data={[breadcrumbSchema([
        { name: "Home", slug: "/" },
        { name: seg.label, slug: `/${slug}` },
      ])]} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-12"
        aria-labelledby="hub-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">{seg.label}</Tag>
          <h1
            id="hub-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            {seg.headline}
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {intro.paragraphs[0]}
          </p>
          <p className="mt-5 text-xs font-mono text-muted/60 uppercase tracking-wide">
            SpendWiseCents Editorial
          </p>
        </Container>
      </section>

      {/* ── Remaining intro copy ─────────────────────────────────────────── */}
      {intro.paragraphs.length > 1 && (
        <section className="py-12 sm:py-14" aria-label="Introduction">
          <Container width="narrow">
            <div className="space-y-5 text-text/85 leading-relaxed">
              {intro.paragraphs.slice(1).map((para, i) => (
                <p key={i} className="text-base sm:text-lg">
                  {para}
                </p>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Where to start — 3 quick links ──────────────────────────────── */}
      <section
        className="py-14 sm:py-16 bg-primary/[0.03]"
        aria-labelledby="quick-links-heading"
      >
        <Container>
          <SectionDivider variant="titled" label="Where to start" spacing="sm" />
          <h2
            id="quick-links-heading"
            className="font-display text-3xl font-bold text-text mt-8 mb-8"
          >
            Start with these
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {intro.quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group block focus-visible:outline-none"
              >
                <Card
                  className={cn(
                    "h-full flex flex-col gap-3",
                    "transition-all duration-200",
                    "group-hover:shadow-md group-hover:-translate-y-0.5",
                    "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                  )}
                >
                  <p className="font-display text-base font-semibold text-text leading-snug">
                    {link.label}
                  </p>
                  <p className="text-sm text-muted leading-relaxed flex-1">
                    {link.description}
                  </p>
                  <p className="text-xs font-mono text-primary font-medium tracking-wide uppercase">
                    Read →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Featured posts ───────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-16"
        aria-labelledby="posts-heading"
      >
        <Container>
          <SectionDivider variant="titled" label="Latest guides" spacing="sm" />
          <div className="flex items-baseline justify-between gap-4 mt-8 mb-10 flex-wrap">
            <h2
              id="posts-heading"
              className="font-display text-3xl font-bold text-text"
            >
              {seg.label} guides
            </h2>
            <Link
              href="/blog"
              className="text-sm text-primary font-medium hover:underline underline-offset-4 shrink-0"
            >
              View all →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl font-semibold text-text mb-2">
                More content coming soon
              </p>
              <p className="text-muted text-sm">
                We&rsquo;re adding new {seg.label.toLowerCase()} guides regularly.
                Check back soon, or browse the full blog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── Resources (budget-on-low-income only) ───────────────────────── */}
      {isLowIncome && (
        <section
          className="py-14 sm:py-16 bg-primary/[0.03]"
          aria-labelledby="resources-heading"
        >
          <Container width="narrow">
            <SectionDivider variant="titled" label="Resources" spacing="sm" />
            <h2
              id="resources-heading"
              className="font-display text-3xl font-bold text-text mt-8 mb-3"
            >
              Get help now
            </h2>
            <p className="text-muted mb-8">
              These programs may be able to help you right now, with food, utilities,
              rent, and more. There&rsquo;s no shame in using them. They exist for exactly
              this.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                {
                  name: "211 (Dial 2-1-1)",
                  href: "https://www.211.org",
                  description:
                    "A nationwide helpline that connects you to local assistance for rent, food, utilities, childcare, and more. Available 24/7 by phone or online.",
                },
                {
                  name: "Benefits.gov",
                  href: "https://www.benefits.gov",
                  description:
                    "The official U.S. government portal for finding federal benefit programs. Enter your situation and see what you may be eligible for.",
                },
                {
                  name: "SNAP (Food Assistance)",
                  href: "https://www.fns.usda.gov/snap/recipient/eligibility",
                  description:
                    "The Supplemental Nutrition Assistance Program provides monthly benefits to help pay for food. Check eligibility and apply through your state.",
                },
                {
                  name: "LIHEAP (Utility Help)",
                  href: "https://www.acf.hhs.gov/ocs/programs/liheap",
                  description:
                    "The Low Income Home Energy Assistance Program helps with heating and cooling costs. Apply through your state's LIHEAP office.",
                },
                {
                  name: "Feeding America",
                  href: "https://www.feedingamerica.org/find-your-local-foodbank",
                  description:
                    "Find your nearest food bank or food pantry. Most food banks serve anyone in need, no documentation required at many locations.",
                },
                {
                  name: "WIC Program",
                  href: "https://www.fns.usda.gov/wic",
                  description:
                    "For pregnant women, new mothers, and children under 5: nutritious food, health referrals, and support. Apply through your state WIC office.",
                },
              ] as const).map((resource) => (
                <a
                  key={resource.name}
                  href={resource.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block focus-visible:outline-none"
                >
                  <Card
                    className={cn(
                      "h-full flex flex-col gap-2",
                      "transition-all duration-200",
                      "group-hover:shadow-md group-hover:-translate-y-0.5",
                      "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                    )}
                  >
                    <p className="font-display text-base font-semibold text-text group-hover:text-primary transition-colors">
                      {resource.name}
                    </p>
                    <p className="text-sm text-muted leading-relaxed flex-1">
                      {resource.description}
                    </p>
                    <p className="text-xs font-mono text-primary/70 font-medium tracking-wide uppercase mt-2">
                      Visit site →
                    </p>
                  </Card>
                </a>
              ))}
            </div>
          </Container>
        </section>
      )}

    </main>
  );
}
