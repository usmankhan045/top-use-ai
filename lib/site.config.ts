// Shape of an audience hub segment. Declared explicitly so `audienceSegments`
// keeps a real element type even when empty (an `[] as const` would collapse to
// `never` and break every `.map`/`.find` consumer across the app).
type AudienceSegmentDef = {
  slug: string;
  label: string;
  tag: string;
  headline: string;
  tone: string;
  startHereLabel: string;
};

export const siteConfig = {
  slug: "explained-ai-tools",
  domain: "explainedaitools.com",
  name: "Explained AI Tools",
  tagline: "AI tools, reviewed and explained",
  niche: "AI tool reviews, comparisons, and how-tos for making money with AI",

  // ── FEATURE FLAGS ────────────────────────────────────────────────────────
  // Toggle whole capabilities per site. Flip `printables` to false for a
  // blog-only site: the /free-printables routes 404, and its nav item, footer
  // link, homepage CTAs, and sitemap entries all disappear automatically.
  features: {
    printables: false,
  },

  // ── CONTACT + LEGAL IDENTITY ─────────────────────────────────────────────
  // Surfaced in the legal pages, footer, and about page. Set these per site so
  // the boilerplate legal copy carries the right brand, domain, and emails.
  contact: {
    email: "contact@explainedaitools.com",       // general / terms contact
    privacyEmail: "privacy@explainedaitools.com", // privacy + data requests
  },
  legal: {
    lastUpdated: "July 12, 2026", // shown at the top of each legal page
    // One-line disclaimer in the footer bottom bar. Swap for your niche.
    disclaimer:
      "We publish independent AI tool reviews and may earn affiliate commissions. This is not professional advice.",
  },
  brand: {
    monogram: "EA",   // 2-letter mark used in avatar / quote blocks
    foundedYear: 2026, // used in the footer copyright line
  },

  theme: {
    colors: {
      primary:    "#0369A1", // Azure, sky-blue deep enough to carry white text; nav, buttons
      accent:     "#F59E0B", // Signal Amber, warm highlight against the cool blues
      background: "#F6FAFD", // Sky Paper, barely-there blue-tinted white; light and airy
      text:       "#0F1B2A", // Deep Navy Ink, near-black with a blue undertone
      muted:      "#5B7183", // Slate, cool blue-gray for secondary text and rules
      success:    "#10B981", // Emerald, positive states, verified badges
    },
    fonts: {
      display: "Space Grotesk", // geometric, lightly technical serif-free display; modern AI vibe
      body:    "Inter",         // clean, highly legible workhorse for long-form reading
      mono:    "JetBrains Mono",// crisp coding mono for tags, stamps, model names
    },
    radius: "0.75rem",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ],

  footerLinks: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Cookie Policy", href: "/cookie-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
    { label: "Terms of Use", href: "/terms-of-use" },
  ],

  social: {
    pinterest: "https://pinterest.com/explainedaitools",
  },

  // AUDIENCE SEGMENTS, drives hub pages via a single dynamic route.
  // Adding/removing a segment here adds/removes a hub page automatically.
  // This site is organized by tool category, not audience, so there are no
  // audience hub pages. Leaving this empty makes /<segment> routes 404.
  audienceSegments: [] as readonly AudienceSegmentDef[],
} as const;

export type SiteConfig = typeof siteConfig;
export type AudienceSegment = SiteConfig["audienceSegments"][number];

/**
 * Nav links with feature-flagged items removed. When `features.printables` is
 * false, the "/free-printables" entry is dropped so the flag is the single
 * source of truth, components should render from this, not `siteConfig.nav`.
 */
export const navLinks: ReadonlyArray<{ label: string; href: string }> =
  siteConfig.features.printables
    ? siteConfig.nav
    : siteConfig.nav.filter((link) => (link.href as string) !== "/free-printables");
