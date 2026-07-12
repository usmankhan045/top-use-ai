import { NextResponse } from "next/server";
import { getCurrentSiteId } from "@/lib/supabase";
import { siteConfig } from "@/lib/site.config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteId = await getCurrentSiteId();
    return NextResponse.json({
      ok: true,
      site: siteConfig.name,
      siteId,
      slug: siteConfig.slug,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
