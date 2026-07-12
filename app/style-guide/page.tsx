import { siteConfig } from "@/lib/site.config";
import {
  Button,
  Card, CardHeader, CardTitle, CardBody, CardFooter,
  Tag,
  SectionDivider,
  Container,
  PrintableCallout,
} from "@/components/ui";

export const metadata = { title: "Style Guide" };

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-text">{title}</h2>
        {note && (
          <p className="mt-1 text-sm text-muted font-mono">{note}</p>
        )}
        <div className="mt-3 h-px bg-gradient-to-r from-primary/30 to-transparent" />
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-xs font-mono text-muted uppercase tracking-widest">
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Palette swatches
// ─────────────────────────────────────────────────────────────────────────────

const palette = [
  { token: "primary",    name: "Ledger Teal",   hex: siteConfig.theme.colors.primary,    textClass: "text-white" },
  { token: "accent",     name: "Ink Amber",      hex: siteConfig.theme.colors.accent,     textClass: "text-white" },
  { token: "background", name: "Bond Paper",     hex: siteConfig.theme.colors.background, textClass: "text-text" },
  { token: "text",       name: "Ledger Ink",     hex: siteConfig.theme.colors.text,       textClass: "text-white" },
  { token: "muted",      name: "Ruled Line",     hex: siteConfig.theme.colors.muted,      textClass: "text-white" },
  { token: "success",    name: "Balance Green",  hex: siteConfig.theme.colors.success,    textClass: "text-white" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen py-16">
      <Container>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-16">
          <Tag variant="primary" className="mb-4">Design System</Tag>
          <h1 className="font-display text-5xl font-bold text-primary leading-tight mb-3">
            {siteConfig.name}
          </h1>
          <p className="text-xl text-muted max-w-xl">
            Style guide: palette, typography, signature element, and UI components.
            All values flow from{" "}
            <code className="font-mono text-sm bg-primary/8 text-primary px-1.5 py-0.5 rounded">
              lib/site.config.ts
            </code>{" "}
            via the CSS variable bridge.
          </p>
        </div>

        <SectionDivider />

        {/* ── 1. Color Palette ─────────────────────────────────────────────── */}
        <Section
          title="01: Color Palette"
          note="All colors injected as CSS custom properties at runtime. Change siteConfig.theme.colors → rebuild → done."
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {palette.map(({ token, name, hex, textClass }) => (
              <div key={token}>
                <div
                  className="h-24 rounded-xl flex flex-col justify-end p-3 border border-black/[0.07]"
                  style={{ backgroundColor: hex }}
                >
                  <span className={`font-mono text-xs font-medium ${textClass}`}>{hex}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-text">{name}</p>
                <p className="text-xs font-mono text-muted">--color-{token}</p>
              </div>
            ))}
          </div>

          {/* Tints at 10% / 20% intervals for the two main colors */}
          <div className="mt-8">
            <p className="text-xs font-mono text-muted mb-3 uppercase tracking-widest">
              Primary tints (opacity modifiers via color-mix)
            </p>
            <div className="flex gap-1.5 items-end">
              {[100, 80, 60, 40, 20, 10, 5].map((pct) => (
                <div key={pct} className="flex-1">
                  <div
                    className="rounded-lg"
                    style={{ height: `${pct * 0.5 + 16}px`, backgroundColor: `color-mix(in oklch, var(--color-primary) ${pct}%, transparent)` }}
                  />
                  <p className="text-[10px] font-mono text-muted text-center mt-1">{pct}%</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <SectionDivider variant="titled" label="typography" />

        {/* ── 2. Typography ────────────────────────────────────────────────── */}
        <Section
          title="02: Typography"
          note={`Display: ${siteConfig.theme.fonts.display} · Body: ${siteConfig.theme.fonts.body} · Mono: ${siteConfig.theme.fonts.mono}`}
        >
          {/* Display scale */}
          <div className="space-y-4 mb-10">
            <div>
              <Label>font-display · text-5xl · Fraunces</Label>
              <p className="font-display text-5xl font-bold text-text leading-tight">
                Budgeting that fits your real life
              </p>
            </div>
            <div>
              <Label>font-display · text-3xl</Label>
              <p className="font-display text-3xl font-semibold text-text leading-snug">
                How to Budget as a Couple Without Fighting About Money
              </p>
            </div>
            <div>
              <Label>font-display · text-2xl</Label>
              <p className="font-display text-2xl font-semibold text-text">
                Your First Paycheck: A Calm Guide
              </p>
            </div>
            <div>
              <Label>font-display · text-xl</Label>
              <p className="font-display text-xl font-medium text-text">
                Section heading: warm, editorial, unhurried
              </p>
            </div>
          </div>

          {/* Body scale */}
          <div className="space-y-4 mb-10 p-6 bg-white rounded-xl border border-black/[0.07]">
            <div>
              <Label>font-body · text-lg · Public Sans</Label>
              <p className="text-lg text-text leading-relaxed">
                Money is just a series of small decisions made repeatedly. That&rsquo;s it.
                You don&rsquo;t need to be a spreadsheet person to budget. You just need
                a system that fits how you actually live.
              </p>
            </div>
            <div>
              <Label>font-body · text-base</Label>
              <p className="text-base text-text leading-relaxed">
                Whether you&rsquo;re managing a household of four, supporting yourself
                on a single income, or figuring out your first paycheck, the principles
                are the same. Small, consistent, kind to yourself.
              </p>
            </div>
            <div>
              <Label>font-body · text-sm · text-muted</Label>
              <p className="text-sm text-muted leading-relaxed">
                Last updated June 2026 · 8 min read · Filed under Budgeting Basics
              </p>
            </div>
          </div>

          {/* Mono scale */}
          <div className="space-y-3 p-6 bg-primary/[0.04] rounded-xl border border-primary/20">
            <Label>font-mono · IBM Plex Mono · numbers, tags, ledger entries</Label>
            <div className="space-y-2">
              <p className="font-mono text-base text-primary">
                Income:   $3,240.00
              </p>
              <p className="font-mono text-base text-text">
                Housing: −$1,100.00
              </p>
              <p className="font-mono text-base text-text">
                Food:      −$420.00
              </p>
              <div className="h-px bg-primary/20" />
              <p className="font-mono text-base font-semibold text-success">
                Remaining: +$1,720.00
              </p>
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              <code className="font-mono text-xs bg-white border border-black/[0.07] text-muted px-2 py-1 rounded">
                Category 01
              </code>
              <code className="font-mono text-xs bg-white border border-black/[0.07] text-muted px-2 py-1 rounded">
                Q2 · 2026
              </code>
              <code className="font-mono text-xs bg-white border border-black/[0.07] text-muted px-2 py-1 rounded">
                Draft
              </code>
            </div>
          </div>
        </Section>

        <SectionDivider variant="titled" label="signature element" />

        {/* ── 3. Signature Element: The Stamp Tag ──────────────────────────── */}
        <Section
          title="03: Signature Element: The Stamp Tag"
          note="IBM Plex Mono · uppercase · letter-spacing 0.12em · 1px border · box-shadow 1.5px 1.5px 0 currentColor"
        >
          <Card variant="plain" className="mb-6">
            <p className="text-sm text-muted mb-4 leading-relaxed">
              The 1.5px offset box-shadow references a rubber stamp that landed slightly
              off-register, the physical impression of a repeated, deliberate act.
              This appears on every category label, audience segment badge, content tag,
              and status indicator. It is the site&rsquo;s single consistent design gesture.
            </p>

            <div className="space-y-6">
              <div>
                <Label>Variants</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  <Tag variant="default">Default</Tag>
                  <Tag variant="primary">Primary</Tag>
                  <Tag variant="accent">Free Download</Tag>
                  <Tag variant="success">Published</Tag>
                </div>
              </div>

              <div>
                <Label>Audience segment tags, driven from siteConfig.audienceSegments</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {siteConfig.audienceSegments.map((seg) => (
                    <Tag key={seg.slug} variant="primary">{seg.label}</Tag>
                  ))}
                </div>
              </div>

              <div>
                <Label>Category tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Budgeting Basics", "Saving Money", "Debt Payoff", "First Job", "Couples", "Printables"].map(
                    (cat) => <Tag key={cat}>{cat}</Tag>
                  )}
                </div>
              </div>

              <div>
                <Label>Status indicators</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag variant="success">Published</Tag>
                  <Tag variant="accent">Featured</Tag>
                  <Tag variant="default">Draft</Tag>
                  <Tag variant="primary">New</Tag>
                </div>
              </div>

              {/* Anatomy callout */}
              <div className="mt-4 p-4 border border-dashed border-muted/40 rounded-lg">
                <p className="font-mono text-xs text-muted mb-3 uppercase tracking-widest">
                  Anatomy
                </p>
                <div className="flex items-start gap-8 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="stamp text-primary border border-primary shadow-[1.5px_1.5px_0_currentColor] px-2 py-[3px] rounded-[3px] inline-flex">
                      Families &amp; Moms
                    </span>
                    <div className="flex flex-col gap-0.5 mt-2">
                      <p className="font-mono text-[10px] text-muted">↑ font: IBM Plex Mono</p>
                      <p className="font-mono text-[10px] text-muted">↑ uppercase, 0.12em tracking</p>
                      <p className="font-mono text-[10px] text-muted">↑ 1px border in currentColor</p>
                      <p className="font-mono text-[10px] text-muted">↑ shadow: 1.5px 1.5px 0 currentColor</p>
                      <p className="font-mono text-[10px] text-muted">↑ border-radius: 3px</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Section>

        <SectionDivider variant="titled" label="components" />

        {/* ── 4. Buttons ───────────────────────────────────────────────────── */}
        <Section title="04: Buttons">
          <div className="space-y-8">
            <div>
              <Label>Variants</Label>
              <div className="flex flex-wrap gap-3 mt-3">
                <Button variant="primary">Primary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="accent">Download Free Printable</Button>
              </div>
            </div>
            <div>
              <Label>Sizes</Label>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium (default)</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <Label>Disabled state</Label>
              <div className="flex flex-wrap gap-3 mt-3">
                <Button variant="primary" disabled>Primary</Button>
                <Button variant="outline" disabled>Outline</Button>
                <Button variant="accent" disabled>Accent</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 5. Cards ─────────────────────────────────────────────────────── */}
        <Section title="05: Cards">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <Label>Ledger variant (default): the 3px left tab is the ledger-entry accent</Label>
              <Card className="mt-3">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag variant="primary">Families</Tag>
                    <Tag variant="default">6 min read</Tag>
                  </div>
                  <CardTitle>How We Cut Our Grocery Bill by $300 a Month</CardTitle>
                </CardHeader>
                <CardBody>
                  Small changes, made consistently, compound faster than any spreadsheet
                  will ever show you. Here&rsquo;s exactly what we changed and what we kept.
                </CardBody>
                <CardFooter>
                  <Button variant="ghost" size="sm">Read article →</Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Label>Plain variant: no tab, for neutral surfaces</Label>
              <Card variant="plain" className="mt-3">
                <CardHeader>
                  <CardTitle as="h4">About the Author</CardTitle>
                </CardHeader>
                <CardBody>
                  A single mom who paid off $27,000 in debt over 3 years, not with a
                  side hustle, but with a budget I actually stuck to.
                </CardBody>
              </Card>
            </div>

            <div>
              <Label>Compact: for dense list contexts</Label>
              <Card compact className="mt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle as="h4" className="text-base">Emergency Fund Tracker</CardTitle>
                    <p className="text-xs text-muted mt-0.5 font-mono">Goal: $1,000 · Saved: $640</p>
                  </div>
                  <Tag variant="success">64%</Tag>
                </div>
              </Card>
            </div>

            <div>
              <Label>h2 title: for major page sections</Label>
              <Card className="mt-3">
                <CardHeader>
                  <CardTitle as="h2" className="text-2xl">Start Here</CardTitle>
                </CardHeader>
                <CardBody>
                  Not sure where to begin? Pick the situation that fits you best.
                </CardBody>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {siteConfig.audienceSegments.slice(0, 3).map((seg) => (
                      <Tag key={seg.slug} variant="primary">{seg.label}</Tag>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Section>

        {/* ── 6. Section Dividers ──────────────────────────────────────────── */}
        <Section title="06: Section Dividers">
          <div className="space-y-2 p-6 bg-white rounded-xl border border-black/[0.07]">
            <p className="text-sm text-muted">Plain (default): a single tally mark between fade-out rules</p>
            <SectionDivider spacing="sm" />

            <p className="text-sm text-muted mt-6">Titled: label centered between rules, in the stamp style</p>
            <SectionDivider variant="titled" label="Free Printables" spacing="sm" />
            <SectionDivider variant="titled" label="Most Popular" spacing="sm" />
            <SectionDivider variant="titled" label="For Single Moms" spacing="sm" />
          </div>
        </Section>

        {/* ── 7. Printable Callout ─────────────────────────────────────────── */}
        <Section
          title="07: Printable Callout"
          note="Dashed accent border references the 'cut here' perforation on physical printable sheets."
        >
          <div className="space-y-4">
            <PrintableCallout
              title="Monthly Budget Worksheet: Zero-Based"
              description="A single-page tracker to give every dollar a job before the month starts. Works for any income level."
            />
            <PrintableCallout
              title="Debt Payoff Tracker (Snowball Method)"
              description="List your debts smallest to largest, check off each balance as you go. Fits on one page."
              badge="Free Printable"
            />
          </div>
        </Section>

        {/* ── 8. Container ─────────────────────────────────────────────────── */}
        <Section title="08: Container" note="Max-width wrapper with responsive horizontal padding.">
          <div className="space-y-3">
            {(["narrow", "default", "wide"] as const).map((w) => (
              <div key={w} className="relative">
                <div className="bg-primary/8 rounded-lg py-3 flex items-center justify-center w-full">
                  <div
                    className="bg-primary/15 rounded h-6 flex items-center justify-center"
                    style={{
                      width: w === "narrow" ? "48rem" : w === "default" ? "72rem" : "90rem",
                      maxWidth: "100%",
                    }}
                  >
                    <span className="font-mono text-xs text-primary">
                      {w === "narrow" ? "narrow: max-w-3xl (48rem)" :
                       w === "default" ? "default: max-w-5xl (72rem)" :
                       "wide: max-w-7xl (90rem)"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <SectionDivider spacing="lg" />

        {/* ── Footer note ──────────────────────────────────────────────────── */}
        <div className="text-center pb-8">
          <Tag variant="default" className="mb-3">Design System v1</Tag>
          <p className="text-sm text-muted">
            All values flow from{" "}
            <code className="font-mono text-primary">lib/site.config.ts</code>
            {" "}via CSS custom properties.{" "}
            <br className="hidden sm:inline" />
            Change the config, rebuild, and every component restyled.
          </p>
        </div>

      </Container>
    </main>
  );
}
