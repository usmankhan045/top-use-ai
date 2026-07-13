import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site.config";
import { getPageBySlug } from "@/lib/queries";
import { Container, Tag, SectionDivider, Card } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { aboutPageSchema, personSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${siteConfig.name}: who we are, how we test AI tools, and why we built it.`,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", type: "website" },
};

export const revalidate = 3600;

const DEFAULT_INTRO =
  `${siteConfig.name} exists because there's a new AI tool every week, endless hype, and very little honest, hands-on testing. We use the tools ourselves, score them fairly, and tell you which ones are actually worth your time and money.`;

// What we cover, the six content pillars. Static so the page never depends on
// the DB being seeded; each links to its /category archive.
const PILLARS: { slug: string; name: string; body: string }[] = [
  {
    slug: "make-money-with-ai",
    name: "Make Money with AI",
    body: "AI side hustles, faceless content, and selling digital products with AI.",
  },
  {
    slug: "ai-writing-content",
    name: "AI Writing & Content",
    body: "AI writers and tools for blogging, copy, and social content.",
  },
  {
    slug: "ai-image-design",
    name: "AI Image & Design",
    body: "AI art generators, design tools, and AI headshot & photo apps.",
  },
  {
    slug: "ai-video-audio",
    name: "AI Video & Audio",
    body: "AI video, faceless video creation, and AI voice / text-to-speech.",
  },
  {
    slug: "ai-seo-marketing",
    name: "AI SEO & Marketing",
    body: "AI tools for SEO, content optimization, social media, and ads.",
  },
  {
    slug: "ai-sales-leadgen",
    name: "AI Sales & Lead Generation",
    body: "AI tools for lead generation, outreach, CRM, and sales automation.",
  },
  {
    slug: "ai-productivity-automation",
    name: "AI Productivity & Automation",
    body: "AI automation, agents, and productivity tools for work.",
  },
  {
    slug: "ai-prompts-templates",
    name: "AI Prompts & Templates",
    body: "Prompt packs, template libraries, and AI resources to save and use.",
  },
  {
    slug: "ai-basics-tutorials",
    name: "AI Basics & Tutorials",
    body: "Beginner-friendly ChatGPT and AI explainers, tutorials, and how-tos.",
  },
];

export default async function AboutPage() {
  let intro = DEFAULT_INTRO;
  try {
    const page = await getPageBySlug("about");
    if (page?.content) intro = page.content;
  } catch {}

  return (
    <main className="flex-1">
      <JsonLd data={[aboutPageSchema(), personSchema()]} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="about-hero-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">About</Tag>
          <h1
            id="about-hero-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            AI tools, tested
            <br className="hidden sm:block" />
            and explained.
          </h1>
          <p className="text-lg text-muted leading-relaxed">{intro}</p>
        </Container>
      </section>

      {/* ── Our story ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="founder-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="Our story" spacing="sm" />

          <div className="mt-10 flex flex-col sm:flex-row gap-8 items-start">
            <Image
              src={siteConfig.author.avatar}
              alt={siteConfig.author.name}
              width={80}
              height={80}
              className="shrink-0 w-20 h-20 rounded-full object-cover border-2 border-primary/20"
            />

            <div className="space-y-4 text-text/85 leading-relaxed">
              <p
                id="founder-heading"
                className="font-display text-xl font-semibold text-text"
              >
                I&rsquo;m {siteConfig.author.name}, founder of {siteConfig.name}.
              </p>

              <p className="text-sm sm:text-base">
                {siteConfig.name} started with a simple frustration: most &ldquo;best AI
                tool&rdquo; lists are thin, out of date, or quietly stuffed with whatever
                pays the highest commission. The screenshots are from the marketing site.
                Nobody actually opened the app.
              </p>

              <p className="text-sm sm:text-base">
                So I built the site I wished existed. I sign up, run the same real tasks
                through every tool, and score them on the things that matter: output
                quality, ease of use, speed, and whether the price is worth it. When there&rsquo;s
                a free or cheaper alternative that does the job, I say so.
              </p>

              <p className="text-sm sm:text-base">
                I also go a step further than most review sites: I show you how to
                actually earn with these tools, from AI side hustles to faceless video and
                digital products, with the honest costs, effort, and catches spelled out.
                No get-rich-quick hype.
              </p>

              <p className="text-sm sm:text-base">
                Some of my links are affiliate links, which is how I keep the site free.
                They never change my scores or my picks. I only recommend tools I&rsquo;d
                use myself, and I&rsquo;ll always tell you when something isn&rsquo;t worth it.
              </p>

              <div className="pt-1">
                <p className="font-medium text-text">{siteConfig.author.name}</p>
                <p className="text-sm text-muted">
                  {siteConfig.author.role}, {siteConfig.name}
                </p>
                <a
                  href={siteConfig.author.linkedin}
                  target="_blank"
                  rel="author noopener noreferrer"
                  className="inline-flex items-center mt-2 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  Connect on LinkedIn →
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── What we cover ──────────────────────────────────────────────────── */}
      <section
        className="py-12 sm:py-14 bg-primary/[0.03]"
        aria-labelledby="pillars-heading"
      >
        <Container>
          <SectionDivider variant="titled" label="What we cover" spacing="sm" />
          <h2
            id="pillars-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-text mt-8 mb-3"
          >
Nine topics, one goal.
          </h2>
          <p className="text-muted mb-10 max-w-lg">
            Everything on the site fits into one of these clusters, so it&rsquo;s easy
            to go from &ldquo;which tool?&rdquo; to &ldquo;how do I make this pay?&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PILLARS.map((pillar) => (
              <Link
                key={pillar.slug}
                href={`/category/${pillar.slug}`}
                className="group block focus-visible:outline-none"
                aria-label={`Browse ${pillar.name}`}
              >
                <Card
                  className="h-full flex flex-col gap-2 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                >
                  <Tag variant="primary" className="self-start">{pillar.name}</Tag>
                  <p className="text-sm text-text font-medium leading-snug mt-0.5">
                    {pillar.body}
                  </p>
                  <p className="mt-auto pt-3 text-xs font-mono text-primary/70 font-medium tracking-wide uppercase">
                    Browse →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── What you'll find here ──────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="content-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="What you'll find here" spacing="sm" />
          <h2
            id="content-heading"
            className="font-display text-3xl font-bold text-text mt-8 mb-8"
          >
            Honest reviews. Real how-tos.
          </h2>

          <ul className="space-y-7">
            {([
              {
                title: "Reviews from actually using the tool",
                body: "We sign up, run real tasks, and screenshot what we see. Every score reflects hands-on use, not a marketing page.",
              },
              {
                title: "Comparisons that give a clear pick",
                body: "Tool A vs Tool B, free vs paid, and cheaper alternatives to the expensive names, with a recommendation for each use case and budget.",
              },
              {
                title: "Make-money-with-AI playbooks",
                body: "Step-by-step guides for AI side hustles, faceless content, and digital products, including the realistic time, cost, and payoff.",
              },
              {
                title: "Beginner-friendly explanations",
                body: "No jargon walls. We explain what a tool does, who it's for, and whether you actually need it, in plain language.",
              },
              {
                title: "Transparent affiliate disclosure",
                body: "Some links earn us a commission at no cost to you. It never changes our scores, and we say so clearly on every review.",
              },
            ] as const).map((item) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="shrink-0 mt-1.5 w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                </span>
                <div>
                  <p className="font-medium text-text mb-1">{item.title}</p>
                  <p className="text-muted text-sm leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Affiliate disclosure ───────────────────────────────────────────── */}
      <section className="py-12 bg-primary/[0.03]" aria-label="Affiliate disclosure">
        <Container width="narrow">
          <div className="border border-black/[0.08] rounded-xl bg-white p-5">
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-medium text-text">Affiliate disclosure: </span>
              {siteConfig.name} is reader-supported. Some links on this site are affiliate
              links, and we may earn a commission if you sign up or buy through them, at no
              extra cost to you. This never influences our reviews, scores, or
              recommendations.{" "}
              <Link
                href="/disclaimer"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                Read our full disclaimer →
              </Link>
            </p>
          </div>
        </Container>
      </section>

    </main>
  );
}
