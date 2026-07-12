import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPrintables, type Printable } from "@/lib/queries";
import { siteConfig } from "@/lib/site.config";
import {
  Container,
  Tag,
  SectionDivider,
} from "@/components/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Free Printables",
  description:
    "Free budget worksheets, savings trackers, and debt payoff planners, download and print instantly. No sign-up or email required.",
  alternates: { canonical: "/free-printables" },
  openGraph: {
    title: "Free Budget Printables",
    description:
      "Free budget worksheets, savings trackers, and debt payoff planners, download and print instantly.",
    url: "/free-printables",
    type: "website",
  },
};

export const revalidate = 3600;

// ── Thumbnail placeholder, lines motif matching the PrintableCallout icon ────

function PrintableThumbnailPlaceholder() {
  return (
    <div
      className="w-full h-full flex flex-col justify-center items-center gap-[5px] px-7 py-8"
      aria-hidden
    >
      {/* Header "title" line */}
      <span className="block h-[3px] bg-primary/20 rounded-full w-3/5 mb-2" />
      {/* Body lines */}
      {[1, 0.9, 0.6, 1, 0.8, 1, 0.7, 1, 0.5].map((w, i) => (
        <span
          key={i}
          className="block h-px bg-muted/25 rounded-full"
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  );
}

// ── Printable card ─────────────────────────────────────────────────────────────

function PrintableCard({ printable }: { printable: Printable }) {
  const href = `/free-printables/${printable.slug}`;

  return (
    <Link
      href={href}
      className="group block focus-visible:outline-none"
      aria-label={`${printable.title}: get this free printable`}
    >
      <article
        className={cn(
          "bg-white rounded-xl border border-black/[0.07] shadow-sm overflow-hidden",
          "flex flex-col h-full",
          "transition-all duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[3/4] bg-[#FAF7F2] border-b border-black/[0.06] overflow-hidden">
          {printable.thumbnail_url ? (
            <Image
              src={printable.thumbnail_url}
              alt={`Preview of ${printable.title}`}
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : (
            <PrintableThumbnailPlaceholder />
          )}

          {/* "Free" badge overlaid on thumbnail */}
          <span
            className={cn(
              "absolute top-3 right-3",
              "font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase",
              "bg-accent text-white px-2 py-1 rounded-md",
              "shadow-sm"
            )}
          >
            Free
          </span>
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-5 gap-2.5">
          {printable.categories && (
            <Tag variant="default" className="self-start">
              {printable.categories.name}
            </Tag>
          )}

          <h2 className="font-display text-base font-semibold text-text leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {printable.title}
          </h2>

          {printable.description && (
            <p className="text-sm text-muted leading-relaxed line-clamp-3 flex-1">
              {printable.description}
            </p>
          )}

          <p className="mt-auto pt-2 text-xs font-mono text-primary font-medium tracking-wide uppercase">
            Get it free →
          </p>
        </div>
      </article>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function FreePrintablesPage() {
  if (!siteConfig.features.printables) notFound();

  let printables: Printable[] = [];
  try {
    printables = await getPrintables();
  } catch {
    // DB not yet configured
  }

  return (
    <main className="flex-1">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-accent/[0.06] via-accent/[0.02] to-background pt-10 pb-12"
        aria-labelledby="printables-heading"
      >
        <Container>
          <div className="flex flex-wrap gap-2 mb-5">
            <Tag variant="accent">Free Downloads</Tag>
          </div>
          <h1
            id="printables-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            Free Budget Printables
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl">
            Worksheets, trackers, and planners designed to make budgeting tangible.
            Print them, fill them in, and know exactly where your money is going.
            All free, download instantly, no sign-up required.
          </p>
        </Container>
      </section>

      {/* ── Grid ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14">
        <Container>
          {printables.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl font-semibold text-text mb-2">
                Printables coming soon
              </p>
              <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
                We&rsquo;re finishing up a set of budget worksheets and trackers.
                Check back soon, they&rsquo;ll be free to download.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {printables.map((p) => (
                <PrintableCard key={p.id} printable={p} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── Audience links ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14 bg-primary/[0.03]" aria-labelledby="audience-cta-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="Find your path" spacing="sm" />
          <h2
            id="audience-cta-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-text mt-8 mb-3"
          >
            Not sure where to start?
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            Each hub has guides, printables, and tools picked for your specific situation.
          </p>
          <div className="flex flex-wrap gap-2">
            {siteConfig.audienceSegments.map((seg) => (
              <Link
                key={seg.slug}
                href={`/${seg.slug}`}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium",
                  "border border-primary/20 text-primary bg-white",
                  "transition-colors duration-150 hover:bg-primary hover:text-white hover:border-primary",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                )}
              >
                {seg.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

    </main>
  );
}
