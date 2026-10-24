import { cache } from "react";

import { getSupabaseAdmin, getCurrentSiteId } from "./supabase";
import { siteConfig, navLinks as defaultNavLinks } from "./site.config";

/**
 * Resolved site settings = database overrides merged over lib/site.config.ts.
 *
 * The config file stays the source of defaults. This layer only supplies what an
 * admin has actually changed, which means:
 *
 *  - The site boots correctly when `site_settings` is missing or empty. That is
 *    not hypothetical: the table ships in migration 004, after the app was
 *    already live, and the Supabase MCP token here can't apply migrations — so
 *    for some window the table genuinely will not exist.
 *  - Anything untouched stays in git, reviewable and revertible by deploy.
 *
 * Every failure path falls back to config rather than throwing. This is read by
 * the ROOT LAYOUT, so an exception here would take down every page on the site.
 */

export interface NavItem {
  label: string;
  href: string;
}

export type ThemeColors = typeof siteConfig.theme.colors;

export interface ResolvedSettings {
  name: string;
  tagline: string;
  themeColors: ThemeColors;
  nav: NavItem[];
  footerLinks: NavItem[];
  social: { pinterest?: string; x?: string; instagram?: string };
  contactEmail: string;
  /** False when the values are pure config — used by the dashboard to explain. */
  fromDatabase: boolean;
}

function defaults(): ResolvedSettings {
  return {
    name: siteConfig.name,
    tagline: siteConfig.tagline,
    themeColors: { ...siteConfig.theme.colors },
    nav: [...defaultNavLinks],
    footerLinks: [...siteConfig.footerLinks],
    social: { ...siteConfig.social },
    contactEmail: siteConfig.contact.email,
    fromDatabase: false,
  };
}

/** Accept only well-formed nav rows; a malformed row would break the header. */
function parseNav(value: unknown): NavItem[] | null {
  if (!Array.isArray(value)) return null;

  const items = value.filter(
    (v): v is NavItem =>
      Boolean(v) &&
      typeof v === "object" &&
      typeof (v as NavItem).label === "string" &&
      typeof (v as NavItem).href === "string" &&
      (v as NavItem).label.trim() !== "" &&
      (v as NavItem).href.trim() !== ""
  );

  return items.length > 0 ? items : null;
}

/**
 * The printables feature flag is authoritative over any nav source. A DB
 * override could still list "/free-printables" after the flag was turned off, which
 * would link to a route that now 404s — strip it so the flag stays the single
 * source of truth (see lib/site.config.ts).
 */
function applyFeatureFlags(nav: NavItem[]): NavItem[] {
  return nav.filter(
    (item) => siteConfig.features.printables || item.href !== "/free-printables"
  );
}

/** Only accept full 6-digit hex, so a typo can't emit invalid CSS. */
function parseColors(value: unknown, base: ThemeColors): ThemeColors {
  if (!value || typeof value !== "object") return base;

  const merged = { ...base } as Record<string, string>;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (key in merged && typeof raw === "string" && /^#[0-9a-fA-F]{6}$/.test(raw)) {
      merged[key] = raw;
    }
  }
  return merged as ThemeColors;
}

/**
 * `cache()` dedupes this within a single request, so the layout and any page
 * reading settings share one query.
 */
export const getSiteSettings = cache(async (): Promise<ResolvedSettings> => {
  const base = defaults();

  try {
    const siteId = await getCurrentSiteId();
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("*")
      .eq("site_id", siteId)
      .maybeSingle();

    // Missing table (42P01) or any other read failure → silently use config.
    if (error || !data) return base;

    const row = data as {
      name: string | null;
      tagline: string | null;
      theme_colors: unknown;
      nav: unknown;
      footer_links: unknown;
      social: unknown;
      contact_email: string | null;
    };

    return {
      name: row.name?.trim() || base.name,
      tagline: row.tagline?.trim() || base.tagline,
      themeColors: parseColors(row.theme_colors, base.themeColors),
      nav: applyFeatureFlags(parseNav(row.nav) ?? base.nav),
      footerLinks: parseNav(row.footer_links) ?? base.footerLinks,
      social:
        row.social && typeof row.social === "object"
          ? { ...base.social, ...(row.social as Record<string, string>) }
          : base.social,
      contactEmail: row.contact_email?.trim() || base.contactEmail,
      fromDatabase: true,
    };
  } catch (err) {
    console.error("[getSiteSettings] falling back to site.config.ts:", err);
    return base;
  }
});
