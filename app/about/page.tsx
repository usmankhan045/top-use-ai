import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { getPageBySlug } from "@/lib/queries";
import { Container, Tag, SectionDivider, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${siteConfig.name}: who we are, who this site is for, and why we built it.`,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", type: "website" },
};

export const revalidate = 3600;

const DEFAULT_INTRO =
  `${siteConfig.name} was built because most personal finance advice assumes you have margin to work with: extra money, extra time, extra emotional bandwidth. This site was built for when you don't.`;

export default async function AboutPage() {
  let intro = DEFAULT_INTRO;
  try {
    const page = await getPageBySlug("about");
    if (page?.content) intro = page.content;
  } catch {}

  return (
    <main className="flex-1">

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
            Real money help,
            <br className="hidden sm:block" />
            for real life.
          </h1>
          <p className="text-lg text-muted leading-relaxed">{intro}</p>
        </Container>
      </section>

      {/* ── Our story ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="founder-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="Our story" spacing="sm" />

          <div className="mt-10 flex flex-col sm:flex-row gap-8 items-start">
            <div
              className="shrink-0 w-20 h-20 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center"
              aria-hidden
            >
              <span className="font-display text-2xl font-bold text-primary">{siteConfig.brand.monogram}</span>
            </div>

            <div className="space-y-4 text-text/85 leading-relaxed">
              <p
                id="founder-heading"
                className="font-display text-xl font-semibold text-text"
              >
                We&rsquo;re the {siteConfig.name} editorial team.
              </p>

              <p className="text-sm sm:text-base">
                {siteConfig.name} started with a simple frustration: most personal finance
                advice is written for people who already have margin to work with. The
                budgeting books talk about &ldquo;dining out budgets&rdquo; and
                &ldquo;vacation savings&rdquo; but skip right past the months when
                money is tight, the bills outpace the paycheck, and there&rsquo;s no room
                for mistakes.
              </p>

              <p className="text-sm sm:text-base">
                So we built the site we wished existed. Our team of writers, budgeting
                coaches, and editors researches what actually works when you&rsquo;re
                living paycheck to paycheck, doing it on one income, or starting over from
                scratch, then turns it into clear guides and free tools you can use the
                same day.
              </p>

              <p className="text-sm sm:text-base">
                What we publish isn&rsquo;t the watered-down, &ldquo;just cut your
                coffee&rdquo; version. It&rsquo;s the real version, the practical steps
                that help people pay down debt, build a small emergency fund, and feel
                okay about money, often for the first time in their adult lives.
              </p>

              <p className="text-sm sm:text-base">
                We&rsquo;re not financial advisors, and nothing here is a substitute for
                personalized advice. We&rsquo;re a team that has done the unglamorous work
                of figuring money out, and we&rsquo;re here to make that path a little
                easier for you. That&rsquo;s the entire point of this site.
              </p>

              <p className="font-medium text-text">
                The {siteConfig.name} Editorial Team
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Who this is for ────────────────────────────────────────────────── */}
      <section
        className="py-12 sm:py-14 bg-primary/[0.03]"
        aria-labelledby="audience-heading"
      >
        <Container>
          <SectionDivider variant="titled" label="Who this is for" spacing="sm" />
          <h2
            id="audience-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-text mt-8 mb-3"
          >
            You&rsquo;re in the right place if&hellip;
          </h2>
          <p className="text-muted mb-10 max-w-lg">
            Every section of this site is built around a specific situation. Find yours
            and you&rsquo;ll find guides written exactly for where you are.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {siteConfig.audienceSegments.map((segment) => (
              <Link
                key={segment.slug}
                href={`/${segment.slug}`}
                className="group block focus-visible:outline-none"
                aria-label={segment.startHereLabel}
              >
                <Card
                  className="h-full flex flex-col gap-2 transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                >
                  <Tag variant="primary" className="self-start">{segment.label}</Tag>
                  <p className="text-sm text-text font-medium leading-snug mt-0.5">
                    {segment.startHereLabel}
                  </p>
                  <p className="mt-auto pt-3 text-xs font-mono text-primary/70 font-medium tracking-wide uppercase">
                    Start here →
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
            Practical tools. Honest guides.
          </h2>

          <ul className="space-y-7">
            {([
              {
                title: "Budgeting guides for your actual situation",
                body: "Not generic advice. Every guide is written for a specific life: single mom, college student, family on one income, or someone just getting started with their first paycheck.",
              },
              {
                title: "Free printables and worksheets",
                body: "Zero-based budget templates, savings trackers, debt snowball planners, and more. Designed to be printed and filled in by hand, because sometimes that's what actually works.",
              },
              {
                title: "Real talk about money",
                body: "No hustle culture. No \"just cut your coffee\" advice. We talk about the real tradeoffs, the hard decisions, and the slow, unglamorous work of building financial stability.",
              },
              {
                title: "Simple systems, not perfect ones",
                body: "A budget you'll actually stick to beats a perfect budget you abandon in week two. We focus on systems that work in a messy, real life.",
              },
              {
                title: "No judgment, ever",
                body: "Whether you have $0 saved or $50,000 in debt, and everything in between, you belong here. We don't shame, we don't lecture. We just help.",
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

      {/* ── Financial disclaimer ───────────────────────────────────────────── */}
      <section className="py-12 bg-primary/[0.03]" aria-label="Financial disclaimer">
        <Container width="narrow">
          <div className="border border-black/[0.08] rounded-xl bg-white p-5">
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-medium text-text">Financial disclaimer: </span>
              The content on {siteConfig.name} is for educational and informational purposes
              only. It is not financial, legal, or tax advice. Always consult a qualified
              professional before making significant financial decisions.{" "}
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
