import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site.config";

export const runtime = "nodejs";
export const contentType = "image/png";

const sizes = {
  og: { width: 1200, height: 630 },
  card: { width: 1200, height: 675 },
} as const;

const GRAPHITE = "#22202E";
const PAPER = "#FBFAF6";
const LIME = "#D6FF3F";

// ImageResponse cannot read the variable WOFF2 files used by Chromium in the
// offline cover script. These static TTF instances were generated from those
// exact files at the exact weights used there, keeping both cover paths aligned.
const fonts = Promise.all([
  readFile(join(process.cwd(), "scripts/fonts/bricolage-800.ttf")),
  readFile(join(process.cwd(), "scripts/fonts/hanken-600.ttf")),
  readFile(join(process.cwd(), "scripts/fonts/geist-mono-500.ttf")),
]);

function badgeFor(title: string): string {
  const value = title.toLowerCase();
  if (/\bvs\.?\b/.test(value)) return "Head to head";
  if (/^how to|step by step|\(step by step\)/.test(value)) return "Step-by-step guide";
  if (/\breview\b/.test(value)) return "Hands-on review";
  if (/^best\b|\bbest\b.*\b(tools|apps|generators|makers)\b/.test(value)) return "Tested & ranked";
  if (/prompts?\b/.test(value)) return "Copy-paste prompts";
  if (/make money|side hustle|earn\b/.test(value)) return "Make money with AI";
  if (/how much|\bcost\b|pricing\b/.test(value)) return "What it really costs";
  if (/\bfree alternatives?\b|alternatives? to\b/.test(value)) return "Free alternatives";
  if (/beginners?\b/.test(value)) return "Beginner's guide";
  return "Hands-on guide";
}

function titleSize(title: string): number {
  if (title.length <= 34) return 78;
  if (title.length <= 52) return 66;
  if (title.length <= 72) return 57;
  if (title.length <= 110) return 50;
  return 44;
}

function polar(cx: number, cy: number, radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return [cx + radius * Math.cos(radians), cy + radius * Math.sin(radians)];
}

function arcPath(radius: number, end: number): string {
  const [x1, y1] = polar(1060, 286, radius, 202);
  const [x2, y2] = polar(1060, 286, radius, end);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${radius},${radius} 0 0 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function ScorecardMotif() {
  const rings = [
    { radius: 222, end: 338, lit: false },
    { radius: 182, end: 316, lit: true },
    { radius: 142, end: 296, lit: false },
    { radius: 102, end: 330, lit: false },
  ];
  const ticks = Array.from({ length: 17 }, (_, index) => {
    const degrees = 202 + index * 8.5;
    const [x1, y1] = polar(1060, 286, 242, degrees);
    const [x2, y2] = polar(1060, 286, 256, degrees);
    return { x1, y1, x2, y2 };
  });

  return (
    <svg
      width="1156"
      height="100%"
      viewBox="0 0 1156 586"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <defs>
        <radialGradient id="glow" cx="88%" cy="46%" r="52%">
          <stop offset="0%" stopColor="rgba(214,255,63,0.11)" />
          <stop offset="100%" stopColor="rgba(214,255,63,0)" />
        </radialGradient>
      </defs>
      <rect width="1156" height="586" fill="url(#glow)" />
      {ticks.map((tick, index) => (
        <line
          key={`tick-${index}`}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="rgba(251,250,246,0.14)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {rings.map((ring) => {
        const [endX, endY] = polar(1060, 286, ring.radius, ring.end);
        return (
          <g key={ring.radius}>
            <path
              d={arcPath(ring.radius, ring.end)}
              fill="none"
              stroke={ring.lit ? "rgba(214,255,63,0.62)" : "rgba(251,250,246,0.17)"}
              strokeWidth={ring.lit ? 15 : 12}
              strokeLinecap="round"
            />
            <circle
              cx={endX}
              cy={endY}
              r={ring.lit ? 11 : 8}
              fill={ring.lit ? "rgba(214,255,63,0.85)" : "rgba(251,250,246,0.26)"}
            />
          </g>
        );
      })}
      <circle cx="1060" cy="286" r="30" fill="rgba(214,255,63,0.88)" />
      <circle cx="1060" cy="286" r="12" fill={GRAPHITE} />
    </svg>
  );
}

function BrandMark() {
  return (
    <svg width="38" height="38" viewBox="0 0 512 512">
      <rect width="512" height="512" rx="128" fill={LIME} />
      <path
        d="M256 406 A150 150 0 1 1 406 256"
        fill="none"
        stroke={GRAPHITE}
        strokeWidth="56"
        strokeLinecap="round"
      />
      <circle cx="256" cy="256" r="62" fill={GRAPHITE} />
    </svg>
  );
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = (params.get("title")?.trim() || siteConfig.name).slice(0, 160);
  const label = (params.get("label")?.trim() || "AI Tools").slice(0, 48);
  const kicker = params.get("kicker")?.trim().slice(0, 32);
  const size = params.get("ratio") === "card" ? sizes.card : sizes.og;
  const [displayFont, bodyFont, monoFont] = await fonts;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: GRAPHITE,
          color: PAPER,
          fontFamily: "Hanken",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 22,
            left: 22,
            width: size.width - 44,
            height: size.height - 44,
            display: "flex",
            overflow: "hidden",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "44px 52px",
            border: "2px solid rgba(255,255,255,0.16)",
            borderRadius: 28,
            background: GRAPHITE,
          }}
        >
          <ScorecardMotif />

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: LIME,
                fontFamily: "GeistMono",
                fontSize: 19,
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ display: "flex", width: 32, height: 10, borderRadius: 99, background: LIME }} />
              {label}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BrandMark />
              <span style={{ fontFamily: "Bricolage", fontSize: 27, fontWeight: 800 }}>
                {siteConfig.name}
              </span>
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              width: 692,
              marginTop: "auto",
              marginBottom: "auto",
              paddingRight: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Bricolage",
                fontSize: titleSize(title),
                fontWeight: 800,
                lineHeight: 0.99,
                letterSpacing: "-0.032em",
              }}
            >
              {title.replace(/(\w)-(\w)/g, "$1‑$2")}
            </div>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                alignItems: "center",
                gap: 11,
                marginTop: 30,
                padding: "11px 22px",
                borderRadius: 999,
                background: LIME,
                color: GRAPHITE,
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              <span style={{ display: "flex", width: 9, height: 9, borderRadius: 9, background: GRAPHITE }} />
              {kicker || badgeFor(title)}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 24,
              color: "rgba(251,250,246,0.72)",
              fontFamily: "GeistMono",
              fontSize: 19,
              fontWeight: 500,
            }}
          >
            <span>{siteConfig.domain.replace("www.", "")}</span>
            <span style={{ color: "rgba(251,250,246,0.42)" }}>Tested, not hyped.</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: displayFont, style: "normal", weight: 800 },
        { name: "Hanken", data: bodyFont, style: "normal", weight: 600 },
        { name: "GeistMono", data: monoFont, style: "normal", weight: 500 },
      ],
    }
  );
}
