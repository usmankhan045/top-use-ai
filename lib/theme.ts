import { siteConfig } from "./site.config";

type ThemeColors = typeof siteConfig.theme.colors;

/**
 * Generates CSS custom properties from siteConfig.theme.colors.
 * The output is injected into the root layout via a <style> tag so that
 * Tailwind 4's @theme directives (in globals.css) can reference them.
 *
 * Changing siteConfig.theme.colors and rebuilding restyles the entire site.
 */
export function generateThemeCSS(colors: ThemeColors = siteConfig.theme.colors): string {
  return `
    --color-primary: ${colors.primary};
    --color-accent: ${colors.accent};
    --color-background: ${colors.background};
    --color-text: ${colors.text};
    --color-muted: ${colors.muted};
    --color-success: ${colors.success};
    --radius: ${siteConfig.theme.radius};
  `.trim();
}
