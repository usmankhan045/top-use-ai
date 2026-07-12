export const siteConfig = {
  slug: "spendwisecents",
  domain: "spendwisecents.com",
  name: "SpendWiseCents",
  tagline: "Budgeting that fits your real life",
  niche: "Personal finance & budgeting for women",

  // ── FEATURE FLAGS ────────────────────────────────────────────────────────
  // Toggle whole capabilities per site. Flip `printables` to false for a
  // blog-only site: the /free-printables routes 404, and its nav item, footer
  // link, homepage CTAs, and sitemap entries all disappear automatically.
  features: {
    printables: true,
  },

  // ── CONTACT + LEGAL IDENTITY ─────────────────────────────────────────────
  // Surfaced in the legal pages, footer, and about page. Set these per site so
  // the boilerplate legal copy carries the right brand, domain, and emails.
  contact: {
    email: "contact@spendwisecents.com",       // general / terms contact
    privacyEmail: "privacy@spendwisecents.com", // privacy + data requests
  },
  legal: {
    lastUpdated: "June 13, 2026", // shown at the top of each legal page
    // One-line disclaimer in the footer bottom bar. Swap for your niche.
    disclaimer:
      "This site does not provide financial advice. Always consult a qualified professional.",
  },
  brand: {
    monogram: "SW",   // 2-letter mark used in avatar / quote blocks
    foundedYear: 2026, // used in the footer copyright line
  },

  theme: {
    colors: {
      primary:    "#2A5C55", // Ledger Teal — old ledger cloth binding; calm, capable
      accent:     "#C8943A", // Ink Amber — rubber-stamp ochre; not terracotta
      background: "#F5F4F0", // Bond Paper — mineral paper-white; not the AI-default cream
      text:       "#1C2421", // Ledger Ink — near-black with green undertone
      muted:      "#7B8C88", // Ruled Line — teal-touched gray; like accounting paper rules
      success:    "#3D8C74", // Balance Green — positive states, completed budgets
    },
    fonts: {
      display: "Fraunces",      // warm-editorial variable serif; vintage without being corporate
      body:    "Public Sans",   // legible, lightly institutional; right for a finance context
      mono:    "IBM Plex Mono", // typewriter-meets-ledger; numbers, stamps, tags
    },
    radius: "0.75rem",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Free Printables", href: "/free-printables" },
    { label: "About", href: "/about" },
  ],

  footerLinks: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Terms of Use", href: "/terms-of-use" },
  ],

  social: {
    pinterest: "https://pinterest.com/spendwisecents",
  },

  // AUDIENCE SEGMENTS — drives hub pages via a single dynamic route.
  // Adding/removing a segment here adds/removes a hub page automatically.
  audienceSegments: [
    {
      slug: "budgeting-for-moms",
      label: "Families & Moms",
      tag: "families",
      headline: "Budgeting for Moms: Real Systems for Real Family Life",
      tone: "practical, warm",
      startHereLabel: "I'm a mom trying to budget for my family",
    },
    {
      slug: "single-mom-budget",
      label: "Single Moms",
      tag: "single-mom",
      headline: "Single Mom Budget Guide: Doing More With Less (And Doing It Well)",
      tone: "empathetic, dignified, no sugarcoating",
      startHereLabel: "I'm a single mom on my own",
    },
    {
      slug: "college-student-budget",
      label: "College Students",
      tag: "college-student",
      headline: "College Budget 101: How to Make Your Money Last the Whole Semester",
      tone: "light, relatable, encouraging",
      startHereLabel: "I'm a college student with no money",
    },
    {
      slug: "budget-on-low-income",
      label: "Low Income",
      tag: "low-income",
      headline: "How to Budget When There's Barely Enough",
      tone: "respectful, non-judgmental, practical, NO hustle-culture language",
      startHereLabel: "I have little or no income right now",
    },
    {
      slug: "first-job-budget",
      label: "First Job",
      tag: "first-job",
      headline: "Just Got Paid? Here's Exactly What to Do With Your First Paycheck",
      tone: "exciting, milestone-focused, forward-looking",
      startHereLabel: "I just got my first job",
    },
    {
      slug: "couples-budget",
      label: "Couples",
      tag: "couples",
      headline: "How to Budget as a Couple Without Fighting About Money",
      tone: "relatable, solution-focused",
      startHereLabel: "My partner and I need to get on the same page",
    },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
export type AudienceSegment = SiteConfig["audienceSegments"][number];

/**
 * Nav links with feature-flagged items removed. When `features.printables` is
 * false, the "/free-printables" entry is dropped so the flag is the single
 * source of truth — components should render from this, not `siteConfig.nav`.
 */
export const navLinks: ReadonlyArray<{ label: string; href: string }> =
  siteConfig.features.printables
    ? siteConfig.nav
    : siteConfig.nav.filter((link) => link.href !== "/free-printables");
