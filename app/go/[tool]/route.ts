import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";
import { siteConfig } from "@/lib/site.config";

// Affiliate/outbound redirect. Posts link to `/go/<tool>`; this 302-redirects to
// the URL in lib/affiliate-links.ts (affiliate link if set, else the tool's site).
// 302 (temporary) so the destination is never cached as canonical. `/go/` is
// disallowed in robots.txt so crawlers don't follow these outbound links.
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params;
  const entry = AFFILIATE_LINKS[(tool ?? "").toLowerCase()];
  const destination = entry?.href ?? `https://${siteConfig.domain}`;
  return NextResponse.redirect(destination, 302);
}
