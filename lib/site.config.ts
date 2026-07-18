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
  // Internal DB key, matches the `sites.slug` row in Supabase used to resolve
  // site_id. Do NOT change without updating the DB row; it is invisible to users
  // and search engines, so the public rename to "Top Use AI" does not touch it.
  slug: "explained-ai-tools",
  // Canonical host. The apex (topuseai.com) 308-redirects to www, so www is the
  // canonical origin used for metadataBase, canonicals, OG URLs, sitemap, robots.
  domain: "www.topuseai.com",
  name: "Top Use AI",
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
    email: "contact@topuseai.com",       // general / terms contact
    privacyEmail: "privacy@topuseai.com", // privacy + data requests
  },
  legal: {
    lastUpdated: "July 12, 2026", // shown at the top of each legal page
    // One-line disclaimer in the footer bottom bar. Swap for your niche.
    disclaimer:
      "We publish independent AI tool reviews and may earn affiliate commissions. This is not professional advice.",
  },
  brand: {
    monogram: "TU",   // 2-letter mark used in avatar / quote blocks
    foundedYear: 2026, // used in the footer copyright line
  },

  // ── AUTHOR / E-E-A-T IDENTITY ────────────────────────────────────────────
  // The named human behind the reviews. Drives the visible byline + author bio
  // on every post and the Person JSON-LD (author on BlogPosting, mainEntity on
  // the About page). A real, verifiable author is the strongest Experience /
  // Expertise signal under Google's 2025 Quality Rater Guidelines.
  author: {
    name: "Muhammad Usman",
    initials: "MU",
    role: "Founder & Lead Reviewer",
    avatar: "/author-muhammad-usman.jpg", // 640x640 headshot in /public
    linkedin: "https://www.linkedin.com/in/muhammadusman80/",
    // Short bio, kept honest: he owns and runs the site and tests every tool.
    bio: "Muhammad Usman is the founder and lead reviewer at Top Use AI. He builds and runs the site, and personally signs up for and tests every AI tool it covers, from writing and image generators to video, voice, and automation tools. He writes up what actually works, what to skip, and where a free option does the job just as well, so beginners can pick and profit from the right tools without the hype.",
  },

  theme: {
    colors: {
      primary:    "#22202E", // Graphite, near-black primary; panels, buttons, footer
      accent:     "#D6FF3F", // Electric Lime, the single loud note; carries the whole identity
      background: "#FBFAF6", // Warm Paper, off-white with a faint warm cast; the daylight ground
      text:       "#17161F", // Graphite Ink, one step darker than primary so links stay legible
      muted:      "#5C5A68", // Slate, warm-leaning grey for secondary text and rules
      success:    "#2F8F5B", // Deep Green, kept away from the accent so it still reads as a signal
    },
    fonts: {
      display: "Bricolage Grotesque", // chunky variable grotesque; carries the oversized headlines
      body:    "Hanken Grotesk",      // warm, highly legible workhorse for long-form reading
      mono:    "Geist Mono",          // crisp mono for stamps, tags, and model names
    },
    radius: "0.9rem",
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
    pinterest: "https://www.pinterest.com/topuseai/",
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
