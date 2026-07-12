import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "./site.config";

// next/font requires static imports, dynamic font loading is not supported.
// When adapting for a new site:
//   1. Add the new Google Font import above.
//   2. Instantiate it below with the correct options.
//   3. Add an entry to FONT_MAP keyed by the exact font name in siteConfig.theme.fonts.
//   4. Update siteConfig.theme.fonts to reference that key.

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const FONT_MAP: Record<string, { variable: string; className: string }> = {
  "Space Grotesk": spaceGrotesk,
  "Inter":         inter,
  "JetBrains Mono": jetBrainsMono,
};

export function getSiteFonts() {
  const { display, body, mono } = siteConfig.theme.fonts;

  const displayFont = FONT_MAP[display];
  const bodyFont    = FONT_MAP[body];
  const monoFont    = FONT_MAP[mono];

  if (!displayFont) throw new Error(`Font not in FONT_MAP: "${display}". Add it to lib/fonts.ts.`);
  if (!bodyFont)    throw new Error(`Font not in FONT_MAP: "${body}". Add it to lib/fonts.ts.`);
  if (!monoFont)    throw new Error(`Font not in FONT_MAP: "${mono}". Add it to lib/fonts.ts.`);

  return {
    variables: [displayFont.variable, bodyFont.variable, monoFont.variable].join(" "),
  };
}
