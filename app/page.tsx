import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getCategoriesWithPostCounts, type Post } from "@/lib/queries";
import {
  Button,
  Card, CardTitle, CardBody,
  Tag,
  SectionDivider,
  Container,
  PrintableCallout,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";

// Statically prerender the homepage but refresh it hourly so newly published
// posts and categories appear without a redeploy (ISR).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: "Top Use AI: Honest AI Tool Reviews & How-Tos",
  },
  description:
    "Independent, hands-on reviews and comparisons of the best AI tools for writing, images, video, and business, plus practical guides to making money with AI. Tested, not hyped.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    type: "website",
    title: "Top Use AI: Honest AI Tool Reviews & How-Tos",
    description:
      "Hands-on AI tool reviews, side-by-side comparisons, and real ways to make money with AI. Tested, not hyped.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder posts, shown when the DB is not yet configured or has no content.
// Replace with real content via Supabase once live.
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_POSTS: Post[] = [
  {
    id: "ph-1",
    slug: "best-ai-writing-tools",
    title: "Best AI Writing Tools in 2026: 7 I Actually Tested",
    excerpt:
      "I ran the same brief through seven popular AI writers and scored them on output quality, editing time, and price. Here's which one earned the top spot, and which to skip.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-06-15T00:00:00Z",
    created_at: "2026-06-15T00:00:00Z",
    updated_at: "2026-06-15T00:00:00Z",
    categories: { slug: "ai-writing-content", name: "AI Writing & Content" },
  },
  {
    id: "ph-2",
    slug: "jasper-vs-copyai",
    title: "Jasper vs Copy.ai: Which AI Writer Wins for Marketers?",
    excerpt:
      "Two of the biggest names in AI copywriting, head to head. I compare output, templates, pricing, and the free plans so you know which fits your workflow before you pay.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-06-22T00:00:00Z",
    created_at: "2026-06-22T00:00:00Z",
    updated_at: "2026-06-22T00:00:00Z",
    categories: { slug: "ai-tool-reviews", name: "AI Tool Reviews" },
  },
  {
    id: "ph-3",
    slug: "ai-side-hustles",
    title: "11 AI Side Hustles You Can Start This Weekend (With $0)",
    excerpt:
      "No audience and no budget? These beginner-friendly AI side hustles need nothing but free tools and a few hours. I break down the setup, the realistic pay, and the catch for each.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-07-01T00:00:00Z",
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    categories: { slug: "make-money-with-ai", name: "Make Money with AI" },
  },
  {
    id: "ph-4",
    slug: "faceless-youtube-with-ai",
    title: "How to Start a Faceless YouTube Channel With AI (Step by Step)",
    excerpt:
      "Script, voiceover, and visuals, all made with AI and no camera. Here's the exact stack I'd use to publish a faceless video this week, plus what it actually costs.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-07-08T00:00:00Z",
    created_at: "2026-07-08T00:00:00Z",
    updated_at: "2026-07-08T00:00:00Z",
    categories: { slug: "ai-video-audio", name: "AI Video & Audio" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// § Hero artifact, the signature element
//
// A miniature AI-tool "review card." It does the one job a hero must do here:
// show a first-time visitor *exactly* what this site is, independent, scored,
// hands-on reviews of AI tools. The faint offset card behind it nods to the
// stack of tools compared side by side.
// ─────────────────────────────────────────────────────────────────────────────

// Rating criteria, each scored out of 5, reads like a real review scorecard.
const REVIEW_ROWS: { label: string; score: number }[] = [
  { label: "Ease of use",     score: 5 },
  { label: "Output quality",  score: 4 },
  { label: "Value for money", score: 4 },
  { label: "Speed",           score: 5 },
];

function ScoreDots({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1" aria-label={`${score} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            n <= score ? "bg-primary" : "bg-primary/15"
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ToolReviewCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      {/* Second card, peeking out behind, "one of many tools compared" */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-[22px] bg-white/70 border-2 border-text/15 rotate-[2deg]"
      />

      {/* Review card, carrying the hard ink shadow that anchors the design */}
      <div className="relative rounded-[22px] bg-white border-2 border-text hard-ink overflow-hidden">
        {/* Header strip */}
        <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="font-display text-white font-extrabold text-base leading-none">
              AI Writer Pro
            </p>
            <p className="stamp text-white/60 mt-1.5">AI Writing &amp; Content</p>
          </div>
          <span className="stamp bg-accent text-text rounded-[3px] px-2 py-[3px]">
            Review
          </span>
        </div>

        {/* Scorecard rows */}
        <div className="divide-y divide-black/[0.05]">
          {REVIEW_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between px-5 py-2.5",
                i % 2 === 1 && "bg-black/[0.015]"
              )}
            >
              <span className="text-sm text-text">{row.label}</span>
              <ScoreDots score={row.score} />
            </div>
          ))}
        </div>

        {/* Verdict, the payoff of a review. The one full-bleed hit of electric
            lime on the page, so the eye lands on the score last. */}
        <div className="bg-accent border-t-2 border-text px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="stamp text-text leading-none">My verdict</p>
            <p className="text-xs text-text/70 mt-1.5">Best for solo creators</p>
          </div>
          <span className="font-display text-2xl font-extrabold text-text tabular-nums">
            4.5
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § "What you get", three plain-language promises.
//   This is the first-sight clarity layer, directly under the hero.
// ─────────────────────────────────────────────────────────────────────────────
const VALUE_PROPS: { icon: "review" | "compare" | "money"; title: string; body: string }[] = [
  {
    icon: "review",
    title: "Hands-on reviews",
    body: "I actually use each tool before I rank it. Real screenshots, real limits, and honest pros and cons, never press-release fluff.",
  },
  {
    icon: "compare",
    title: "Clear comparisons",
    body: "Tool A vs Tool B, free vs paid, cheap alternatives to the expensive ones. A clear pick for your exact use case and budget.",
  },
  {
    icon: "money",
    title: "Ways to earn with AI",
    body: "Practical side-hustle and content playbooks that turn these tools into real income, with the honest costs and catches included.",
  },
];

function ValueIcon({ name }: { name: "review" | "compare" | "money" }) {
  const common = {
    width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "review") {
    // Star inside a rounded badge, a scored, vetted verdict.
    return (
      <svg {...common}>
        <path d="M12 4.5l2.1 4.3 4.7.7-3.4 3.3.8 4.7L12 15.5l-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" />
      </svg>
    );
  }
  if (name === "compare") {
    // Two bars side by side, a head-to-head comparison.
    return (
      <svg {...common}>
        <path d="M6 20V9M12 20V4M18 20v-7" />
        <path d="M3 20h18" />
      </svg>
    );
  }
  // Upward trend, earning with AI.
  return (
    <svg {...common}>
      <path d="M4 15l5-5 3 3 6-7" />
      <path d="M18 6h3v3" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (page-local, not exported)
// ─────────────────────────────────────────────────────────────────────────────

function CategoryCard({
  category,
}: {
  category: { slug: string; name: string; description: string | null; postCount: number };
}) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block focus-visible:outline-none"
      aria-label={`Browse ${category.name} posts`}
    >
      <Card
        variant="plain"
        className={cn(
          "h-full flex flex-col gap-2",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-text"
        )}
      >
        <Tag variant="primary" className="self-start">{category.name}</Tag>
        {category.description && (
          <p className="text-[0.95rem] text-text font-medium leading-snug mt-0.5">
            {category.description}
          </p>
        )}
        <p className="mt-auto pt-3 stamp text-muted group-hover:text-text transition-colors">
          {category.postCount} {category.postCount === 1 ? "post" : "posts"} →
        </p>
      </Card>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  const isPlaceholder = post.id.startsWith("ph-");
  const href = isPlaceholder ? "/blog" : post.slug.startsWith("#") ? post.slug : `/blog/${post.slug}`;
  return (
    <Link
      href={href}
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
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw"
              className="object-cover"
            />
          </div>
        )}
        {/* Category stamp */}
        {post.categories && (
          <Tag variant="default" className="mb-3 self-start">
            {post.categories.name}
          </Tag>
        )}

        {/* Title. Hidden visually when the cover art carries it, but kept in the
            DOM so search engines and screen readers still get the headline. */}
        <CardTitle
          as="h3"
          className={cn(
            post.featured_image_url
              ? "sr-only"
              : "text-base leading-snug mb-2 line-clamp-3 group-hover:underline group-hover:decoration-accent decoration-2 underline-offset-4 transition"
          )}
        >
          {post.title}
        </CardTitle>

        {/* Excerpt */}
        {post.excerpt && (
          <CardBody className="flex-1 line-clamp-3 text-sm">
            {post.excerpt}
          </CardBody>
        )}

        {/* Read link */}
        <p className="mt-4 stamp text-muted group-hover:text-text transition-colors">
          Read →
        </p>
      </Card>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch posts; falls back to placeholder content if the DB is not yet configured.
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts({ limit: 4 });
  } catch {
    // Supabase not configured or site not yet seeded; use placeholder posts.
  }
  const displayPosts = posts.length > 0 ? posts : PLACEHOLDER_POSTS;

  // Categories for the "Browse by category" section. Empty if DB unconfigured.
  let categories: Array<{
    slug: string;
    name: string;
    description: string | null;
    postCount: number;
  }> = [];
  try {
    categories = await getCategoriesWithPostCounts();
  } catch {
    // DB not configured; hide the category section.
  }

  return (
    <main className="flex-1">

      {/* impact.com media-partner site verification. Present in the served HTML
          so impact.com's crawler can read it; visually hidden from visitors. */}
      <p className="sr-only">Impact-Site-Verification: ac02bb23-2196-4d2d-bd11-2c7dfa9ceb0e</p>

      {/* ══════════════════════════════════════════════════════════════════
          § HERO, the page's thesis.
          A first-time visitor learns three things instantly: what this is
          (independent AI tool reviews), who it's for (people choosing and
          earning with AI tools), and what to do next (read the reviews).
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-background"
        aria-labelledby="hero-heading"
      >
        <Container className="pt-8 pb-12 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-14 items-center">

            {/* Left, the promise */}
            <div className="min-w-0 max-w-xl">
              <p className="stamp text-text mb-5 flex items-center gap-2.5">
                <span className="h-2 w-6 rounded-full bg-accent" aria-hidden />
                Independent AI tool reviews &amp; guides
              </p>

              <h1
                id="hero-heading"
                className="font-display text-[2.6rem] sm:text-5xl lg:text-[3.5rem] font-extrabold text-text leading-[1] tracking-tight text-balance"
              >
                The AI tools worth your money,{" "}
                {/* The rotated mark is an inline-block, which introduces a line
                    break opportunity before the comma. Tying them together in a
                    nowrap span keeps the punctuation attached to the word. */}
                <span className="whitespace-nowrap">
                  <em className="not-italic accent-mark">tested</em>,
                </span>{" "}
                not hyped.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-lg">
                {siteConfig.name} reviews and compares the best AI tools for writing,
                images, video, and business, then shows you how to turn them into real
                income. Hands-on scores, honest pros and cons, and clear picks for your
                budget.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg">
                  <Link href="/blog" className="contents">
                    Explore AI tools
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  <Link href="/category/make-money-with-ai" className="contents">
                    Make money with AI
                  </Link>
                </Button>
              </div>

              <p className="mt-6 stamp text-muted/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Hands-on tested</span>
                <span className="text-muted/40" aria-hidden>·</span>
                <span>No signup to read</span>
                <span className="text-muted/40" aria-hidden>·</span>
                <span>Honest picks</span>
              </p>
            </div>

            {/* Right, the artifact */}
            <div className="min-w-0 w-full lg:w-[22rem]">
              <ToolReviewCard />
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § WHAT YOU GET, first-sight clarity, three plain promises.
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 border-y-2 border-black/[0.08]" aria-label="What you get here">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} className="flex flex-col">
                <span
                  className="w-11 h-11 rounded-xl bg-accent text-text flex items-center justify-center mb-4"
                  aria-hidden
                >
                  <ValueIcon name={vp.icon} />
                </span>
                <h2 className="font-display text-lg font-bold text-text mb-1.5">
                  {vp.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed">{vp.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § BROWSE BY CATEGORY, driven from the published categories.
          Each card links to its /category/[slug] archive; empty categories
          are hidden. Renders nothing if the DB is unconfigured.
      ══════════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-16" aria-labelledby="categories-heading">
          <Container>
            <SectionDivider variant="titled" label="Browse by category" spacing="sm" />

            <div className="mt-10">
              <h2
                id="categories-heading"
                className="font-display text-3xl sm:text-4xl font-extrabold text-text mb-3"
              >
                Find your topic.
              </h2>
              <p className="text-muted text-lg max-w-xl mb-10">
                Every review and guide is filed by topic. Pick a category to see all of
                its posts in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="text-sm text-text font-semibold hover:underline underline-offset-4 decoration-2 decoration-accent"
                >
                  Browse all posts →
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          § LATEST FROM THE BLOG
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-primary/[0.03]" aria-labelledby="posts-heading">
        <Container>
          <div className="flex items-baseline justify-between gap-4 mb-10 flex-wrap">
            <div>
              <h2
                id="posts-heading"
                className="font-display text-3xl sm:text-4xl font-extrabold text-text"
              >
                Latest from the blog
              </h2>
              <p className="text-muted mt-2">
                Fresh reviews, comparisons, and how-tos. No filler.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm text-text font-semibold hover:underline underline-offset-4 decoration-2 decoration-accent shrink-0"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {posts.length === 0 && (
            <p className="mt-6 text-center text-xs font-mono text-muted/50 uppercase tracking-widest">
              Showing placeholder content. Connect Supabase to display real posts
            </p>
          )}
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § FREE PRINTABLE CALLOUT (blog-only site: hidden via feature flag)
      ══════════════════════════════════════════════════════════════════ */}
      {siteConfig.features.printables && (
        <section className="py-12 sm:py-16" aria-label="Free printable">
          <Container width="narrow">
            <PrintableCallout
              title="Free download"
              description="A free resource to go with the guides."
              href="/free-printables"
              badge="Free"
            />
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          § ABOUT TEASER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-primary/[0.03]" aria-labelledby="about-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="About" spacing="sm" />

          <div className="mt-10 text-center">
            <div
              className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-text mx-auto mb-6"
            >
              {/* The named reviewer, not a brand monogram. A quote signed by a
                  real person needs that person's face above it. */}
              <Image
                src={siteConfig.author.avatar}
                alt={siteConfig.author.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <blockquote className="font-display text-xl sm:text-2xl font-bold text-text leading-relaxed mb-6 max-w-lg mx-auto">
              &ldquo;There&rsquo;s a new AI tool every week and a lot of hype to match. I
              built {siteConfig.name}{" "}to cut through it, testing every tool myself so you
              can pick the right one and put it to work.&rdquo;
            </blockquote>

            <p
              id="about-heading"
              className="stamp text-muted mb-8"
            >
              {siteConfig.author.name} · {siteConfig.author.role}
            </p>

            <Button variant="outline">
              <Link href="/about" className="contents">
                Read our story →
              </Link>
            </Button>
          </div>
        </Container>
      </section>

    </main>
  );
}
