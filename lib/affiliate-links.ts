// ─── Central affiliate link registry ────────────────────────────────────────
// Blog posts link to `/go/<slug>` (never the raw affiliate URL). The `/go/[tool]`
// route (app/go/[tool]/route.ts) redirects here. Update a URL ONCE and every post
// that references it updates instantly, so you can publish now and add real
// affiliate links later.
//
// `href`      = the affiliate URL when you have one, else the tool's official
//               homepage as a safe fallback (links still work pre-approval).
// `affiliate` = true once a real affiliate link is in place (flip it when you add one).
//
// Pins must NEVER use these links, affiliate links live in blog posts only.

export type AffiliateLink = { name: string; href: string; affiliate: boolean };

export const AFFILIATE_LINKS: Record<string, AffiliateLink> = {
  // ✅ live affiliate link
  elevenlabs:  { name: "ElevenLabs",  href: "https://try.elevenlabs.io/gogy4t5w8iwq", affiliate: true },

  // ⏳ fallbacks (official sites) until you add affiliate links, just swap href
  murf:        { name: "Murf",        href: "https://murf.ai",                 affiliate: false },
  synthesia:   { name: "Synthesia",   href: "https://www.synthesia.io",        affiliate: false },
  pictory:     { name: "Pictory",     href: "https://pictory.ai",              affiliate: false },
  speechify:   { name: "Speechify",   href: "https://speechify.com",           affiliate: false },
  writesonic:  { name: "Writesonic",  href: "https://writesonic.com",          affiliate: false },
  rytr:        { name: "Rytr",        href: "https://rytr.me",                 affiliate: false },
  copyai:      { name: "Copy.ai",     href: "https://www.copy.ai",             affiliate: false },
  headshotpro: { name: "HeadshotPro", href: "https://www.headshotpro.com",     affiliate: false },
  surfer:      { name: "Surfer SEO",  href: "https://surferseo.com",           affiliate: false },
  semrush:     { name: "Semrush",     href: "https://www.semrush.com",         affiliate: false },
};
