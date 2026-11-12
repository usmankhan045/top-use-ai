import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site.config";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(
    { ok: true, site: siteConfig.name, slug: siteConfig.slug },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
