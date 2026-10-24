import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { siteConfig } from "@/lib/site.config";

export const runtime = "nodejs";
export const contentType = "image/png";

const sizes = {
  og: { width: 1200, height: 630 },
  card: { width: 1200, height: 750 },
} as const;

function titleSize(title: string): number {
  if (title.length > 110) return 54;
  if (title.length > 75) return 64;
  if (title.length > 45) return 76;
  return 88;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = (params.get("title")?.trim() || siteConfig.name).slice(0, 160);
  const label = (params.get("label")?.trim() || "AI tools, clearly explained").slice(0, 48);
  const kicker = params.get("kicker")?.trim().slice(0, 32);
  const size = params.get("ratio") === "card" ? sizes.card : sizes.og;
  const { colors } = siteConfig.theme;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: colors.background,
          color: colors.text,
          padding: "64px 72px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: 480,
            border: `86px solid ${colors.accent}`,
            right: -120,
            top: -180,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 62,
              height: 62,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background: colors.primary,
              color: "white",
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            {siteConfig.brand.monogram}
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 16px",
              borderRadius: 999,
              background: colors.accent,
              fontSize: 22,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            {label}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: titleSize(title),
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            {title}
          </div>
          {kicker ? (
            <div style={{ display: "flex", marginTop: 22, color: colors.muted, fontSize: 28 }}>
              {kicker}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", fontSize: 24, color: colors.muted }}>
          {siteConfig.domain.replace("www.", "")}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: size.width,
            height: 12,
            background: colors.accent,
            display: "flex",
          }}
        />
      </div>
    ),
    size
  );
}
