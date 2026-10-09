// ─── Central affiliate link registry ────────────────────────────────────────
// Blog posts link to `/go/<slug>` (never the raw affiliate URL). The `/go/[tool]`
// route (app/go/[tool]/route.ts) redirects here. Update a URL ONCE and every post
// that references it updates instantly, so you can publish now and add real
// affiliate links later.
//
// The URLs themselves live in data/affiliate-links.json, which is the single
// source of truth. Do NOT hardcode an affiliate URL here or in a post. Adding or
// changing a link is a JSON edit; this file only types and re-exports it.
// See docs/AFFILIATE-LINKS.md for the workflow and verification steps.
//
// `href`      = the affiliate URL when you have one, else the tool's official
//               homepage as a safe fallback (links still work pre-approval).
// `affiliate` = true once a real affiliate link is in place.
//
// Pins must NEVER use these links, affiliate links live in blog posts only.

import fs from "node:fs";
import path from "node:path";

export type AffiliateLink = {
  name: string;
  href: string;
  affiliate: boolean;
  /** Network running the programme ("Direct", "Rewardful", "applied", "none"). */
  network?: string | null;
  /** Commission terms as recorded in the master sheet, for reference only. */
  terms?: string | null;
  /** ISO date the href was last confirmed to resolve with its tracking param. */
  verified?: string | null;
  /** True when no post links to this tool yet, so the link earns nothing. */
  unused?: boolean;
  /** Free-text caveat, e.g. why a programme is suspended. */
  note?: string;
};

type AffiliateLinkData = { links: Record<string, AffiliateLink> };

function readLinkData(): AffiliateLinkData {
  const raw = process.env.AFFILIATE_LINKS_JSON;
  if (raw) return JSON.parse(raw) as AffiliateLinkData;

  const localPath = path.join(process.cwd(), ".affiliate-links.local.json");
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, "utf8")) as AffiliateLinkData;
  }

  throw new Error(
    "Affiliate links are not configured. Set AFFILIATE_LINKS_JSON in the deployment environment."
  );
}

export function getAffiliateLinks(): Record<string, AffiliateLink> {
  return readLinkData().links;
}

/** Slugs with a real affiliate link in place (not a homepage fallback). */
export const activeAffiliateSlugs = (): string[] =>
  Object.entries(getAffiliateLinks())
    .filter(([, l]) => l.affiliate)
    .map(([slug]) => slug);

/**
 * Slugs that have a working affiliate link but no post linking to them yet.
 * These earn nothing until content mentions the tool, so this is the content
 * backlog ranked by opportunity rather than a list of problems.
 */
export const unusedAffiliateSlugs = (): string[] =>
  Object.entries(getAffiliateLinks())
    .filter(([, l]) => l.affiliate && l.unused)
    .map(([slug]) => slug);
