import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = {
  title: {
    absolute: "SpendWiseCents: Budgeting That Fits Your Real Life",
  },
  description:
    "Practical budgeting guides for single moms, families, college students, first-job earners, and anyone managing money on a real income. No hustle culture. No guilt. Real systems that work.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    type: "website",
    title: "SpendWiseCents: Budgeting That Fits Your Real Life",
    description:
      "Practical budgeting guides for single moms, families, college students, and first-job earners. Real systems for real life.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder posts — shown when the DB is not yet configured or has no content.
// Replace with real content via Supabase once live.
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_POSTS: Post[] = [
  {
    id: "ph-1",
    slug: "zero-based-budgeting-beginners",
    title: "Zero-Based Budgeting: Give Every Dollar a Job (Even the Scary Ones)",
    excerpt:
      "Zero-based budgeting means your income minus your expenses equals zero, not because you spend everything, but because every dollar has a plan. Here's how to start in one afternoon.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: ["families", "first-job", "low-income"],
    published_at: "2026-01-15T00:00:00Z",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    categories: { slug: "budgeting-basics", name: "Budgeting Basics" },
  },
  {
    id: "ph-2",
    slug: "single-mom-budget-guide",
    title: "The Single Mom Budget Guide: More With Less (And Feeling Okay About It)",
    excerpt:
      "Managing money on one income with kids depending on you is genuinely hard. This isn't a 'just cut your lattes' guide. It's a real plan for a real situation.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: ["single-mom", "low-income"],
    published_at: "2026-01-22T00:00:00Z",
    created_at: "2026-01-22T00:00:00Z",
    updated_at: "2026-01-22T00:00:00Z",
    categories: { slug: "single-mom-money", name: "Single Mom Money" },
  },
  {
    id: "ph-3",
    slug: "first-paycheck-what-to-do",
    title: "Just Got Paid? Here's Exactly What to Do With Your First Paycheck",
    excerpt:
      "Your first real paycheck is both a milestone and a decision point. Here's a simple plan for the first 24 hours after it lands, so future-you says thank you.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: ["first-job", "college-student"],
    published_at: "2026-02-01T00:00:00Z",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-02-01T00:00:00Z",
    categories: { slug: "first-job-finance", name: "First Job Finance" },
  },
  {
    id: "ph-4",
    slug: "couples-budget-without-fighting",
    title: "How to Budget as a Couple Without Fighting About Money",
    excerpt:
      "Money fights are rarely about money. But a shared system removes most of the friction. Here's how two people build one budget that actually holds.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: ["couples", "families"],
    published_at: "2026-02-10T00:00:00Z",
    created_at: "2026-02-10T00:00:00Z",
    updated_at: "2026-02-10T00:00:00Z",
    categories: { slug: "couples-money", name: "Couples & Money" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// § Hero artifact — the signature element
//
// A real zero-based budget worksheet, rendered in HTML. It does the one job a
// hero must do here: show a first-time visitor *exactly* what this site is —
// budgeting worksheets where every dollar gets assigned down to a $0 balance.
// The faint offset sheet behind it nods to "print as many copies as you need."
// ─────────────────────────────────────────────────────────────────────────────

// Category dot colors borrowed from the printable envelope palette — each row
// reads like an assigned spending category, not an abstract line item.
const LEDGER_ROWS: { label: string; amount: string; dot: string }[] = [
  { label: "Income",      amount: "3,000", dot: "#3D8C74" },
  { label: "Rent",        amount: "1,100", dot: "#6B8FAE" },
  { label: "Groceries",   amount: "480",   dot: "#A89080" },
  { label: "Utilities",   amount: "210",   dot: "#8B7BA0" },
  { label: "Savings",     amount: "300",   dot: "#C4826E" },
  { label: "Debt payoff", amount: "250",   dot: "#C8943A" },
];

function BudgetLedgerCard() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      {/* Second sheet, peeking out behind — "free to print, again and again" */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl bg-white/70 border border-black/[0.06] shadow-sm rotate-[2deg]"
      />

      {/* Worksheet */}
      <div className="relative rounded-2xl bg-white border border-black/[0.08] shadow-xl shadow-primary/10 overflow-hidden">
        {/* Header strip */}
        <div className="bg-primary px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="font-display text-white font-semibold text-base leading-none">
              Monthly Budget
            </p>
            <p className="stamp text-white/60 mt-1.5">Zero-Based Worksheet</p>
          </div>
          <span className="stamp text-white/90 border border-white/40 rounded-[3px] px-2 py-[3px]">
            June
          </span>
        </div>

        {/* Line items */}
        <div className="divide-y divide-black/[0.05]">
          {LEDGER_ROWS.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between px-5 py-2.5",
                i % 2 === 1 && "bg-black/[0.015]"
              )}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: row.dot }}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-sm text-text",
                    row.label === "Income" && "font-semibold"
                  )}
                >
                  {row.label}
                </span>
              </span>
              <span className="font-mono text-sm text-text tabular-nums">
                <span className="text-muted">$</span>
                {row.amount}
              </span>
            </div>
          ))}
        </div>

        {/* Balance — the payoff of the whole method */}
        <div className="bg-success/[0.1] border-t-2 border-success/30 px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="stamp text-success leading-none">Left to assign</p>
            <p className="text-xs text-muted mt-1.5">Every dollar has a job</p>
          </div>
          <span className="font-display text-2xl font-bold text-success tabular-nums">
            $0
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § "What you get" — three plain-language promises, with ledger-paper icons.
//   This is the first-sight clarity layer, directly under the hero.
// ─────────────────────────────────────────────────────────────────────────────
const VALUE_PROPS: { icon: "guide" | "printable" | "note"; title: string; body: string }[] = [
  {
    icon: "guide",
    title: "Step-by-step guides",
    body: "Real walkthroughs written for your exact situation: single mom, one income, or first paycheck. Never generic advice.",
  },
  {
    icon: "printable",
    title: "Free printables",
    body: "Zero-based budget templates, savings trackers, and debt planners. Download, print, and fill them in by hand.",
  },
  {
    icon: "note",
    title: "A weekly note",
    body: "Practical money tips in your inbox. No guilt, no hustle culture, no spam. Unsubscribe in one click, anytime.",
  },
];

function ValueIcon({ name }: { name: "guide" | "printable" | "note" }) {
  const common = {
    width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "guide") {
    return (
      <svg {...common}>
        <path d="M5 4h11l3 3v13H5z" />
        <path d="M8 9h8M8 12.5h8M8 16h5" />
      </svg>
    );
  }
  if (name === "printable") {
    return (
      <svg {...common}>
        <path d="M12 4v9m0 0 3.2-3.2M12 13l-3.2-3.2" />
        <path d="M5 16v3h14v-3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
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
          "transition-all duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-primary/30",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        <Tag variant="primary" className="self-start">{category.name}</Tag>
        {category.description && (
          <p className="text-[0.95rem] text-text font-medium leading-snug mt-0.5">
            {category.description}
          </p>
        )}
        <p className="mt-auto pt-3 text-xs font-mono text-primary/70 font-medium tracking-wide uppercase">
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
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <Card
        className={cn(
          "h-full flex flex-col",
          "transition-all duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        {/* Category stamp */}
        {post.categories && (
          <Tag variant="default" className="mb-3 self-start">
            {post.categories.name}
          </Tag>
        )}

        {/* Title */}
        <CardTitle
          as="h3"
          className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
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
        <p className="mt-4 text-xs font-mono text-primary font-medium tracking-wide uppercase">
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

      {/* ══════════════════════════════════════════════════════════════════
          § HERO — the page's thesis.
          A first-time visitor learns three things instantly: what this is
          (a budgeting worksheet), who it's for (real, tight budgets), and
          what to do next (read guides / get printables).
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-background"
        aria-labelledby="hero-heading"
      >
        <Container className="pt-8 pb-12 sm:pt-10 sm:pb-14 lg:pt-12 lg:pb-16">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-10 lg:gap-14 items-center">

            {/* Left, the promise */}
            <div className="min-w-0 max-w-xl">
              <p className="stamp text-primary mb-5 flex items-center gap-2">
                <span className="h-px w-6 bg-primary/40" aria-hidden />
                Free budgeting guides &amp; printables
              </p>

              <h1
                id="hero-heading"
                className="font-display text-4xl sm:text-5xl lg:text-[3.1rem] font-bold text-text leading-[1.05] tracking-tight text-balance"
              >
                Give every dollar a job,{" "}
                <em className="not-italic text-primary">before</em> the month spends it
                for you.
              </h1>

              <p className="mt-5 text-lg text-muted leading-relaxed max-w-lg">
                SpendWiseCents turns a tight paycheck into a plan you can actually keep.
                Step-by-step guides and free printable worksheets, built for single
                moms, families, students, and anyone starting over. No guilt. No hustle
                culture.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Button size="lg">
                  <Link href="/blog" className="contents">
                    Read the guides
                  </Link>
                </Button>
                {siteConfig.features.printables && (
                  <Button variant="outline" size="lg">
                    <Link href="/free-printables" className="contents">
                      Get free printables
                    </Link>
                  </Button>
                )}
              </div>

              <p className="mt-6 stamp text-muted/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>No signup to read</span>
                <span className="text-muted/40" aria-hidden>·</span>
                <span>Always free</span>
                <span className="text-muted/40" aria-hidden>·</span>
                <span>Zero judgment</span>
              </p>
            </div>

            {/* Right, the artifact */}
            <div className="min-w-0 w-full lg:w-[22rem]">
              <BudgetLedgerCard />
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § WHAT YOU GET — first-sight clarity, three plain promises.
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 border-y border-black/[0.06]" aria-label="What you get here">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} className="flex flex-col">
                <span
                  className="w-11 h-11 rounded-xl bg-primary/[0.08] text-primary flex items-center justify-center mb-4"
                  aria-hidden
                >
                  <ValueIcon name={vp.icon} />
                </span>
                <h2 className="font-display text-lg font-semibold text-text mb-1.5">
                  {vp.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed">{vp.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § BROWSE BY CATEGORY — driven from the published categories.
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
                className="font-display text-3xl sm:text-4xl font-bold text-text mb-3"
              >
                Find your topic.
              </h2>
              <p className="text-muted text-lg max-w-xl mb-10">
                Every guide is filed by topic. Pick a category to see all of its
                posts in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="text-sm text-primary font-medium hover:underline underline-offset-4"
                >
                  Browse all guides →
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
                className="font-display text-3xl sm:text-4xl font-bold text-text"
              >
                Latest from the blog
              </h2>
              <p className="text-muted mt-2">
                Practical guides, honest takes, and no filler.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm text-primary font-medium hover:underline underline-offset-4 shrink-0"
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
          § FREE PRINTABLE CALLOUT
      ══════════════════════════════════════════════════════════════════ */}
      {siteConfig.features.printables && (
        <section className="py-12 sm:py-16" aria-label="Free printable">
          <Container width="narrow">
            <PrintableCallout
              title="Free Monthly Budget Printable: Zero-Based Template"
              description="A single-page worksheet to give every dollar a job before the month starts. Print it, fill it in, and know exactly where you stand. Works for any income level."
              href="/free-printables"
              badge="Free Printable"
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
              className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/20 mx-auto mb-6 flex items-center justify-center"
              aria-hidden
            >
              <span className="font-display text-xl font-bold text-primary">{siteConfig.brand.monogram}</span>
            </div>

            <blockquote className="font-display text-xl sm:text-2xl font-medium text-text leading-relaxed mb-6 max-w-lg mx-auto">
              &ldquo;Most money advice is written for people who already have margin to
              spare. We built {siteConfig.name} for everyone else, with practical guides and
              free tools for real budgets and real life.&rdquo;
            </blockquote>

            <p
              id="about-heading"
              className="font-mono text-xs uppercase tracking-widest text-muted mb-8"
            >
              The {siteConfig.name} Team
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
