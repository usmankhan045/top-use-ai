import { NextRequest, NextResponse } from "next/server";
import { AFFILIATE_LINKS } from "@/lib/affiliate-links";

// Affiliate/outbound redirect. Posts link to `/go/<tool>`; this 302-redirects to
// the URL in lib/affiliate-links.ts (affiliate link if set, else the tool's site).
// 302 (temporary) so the destination is never cached as canonical. `/go/` is
// disallowed in robots.txt AND carries X-Robots-Tag: noindex, so a crawler that
// ignores robots.txt still gets the signal. An unknown slug 404s rather than
// silently redirecting to the homepage.
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params;
  const entry = AFFILIATE_LINKS[(tool ?? "").toLowerCase()];

  // An unregistered slug is a broken link, not a redirect. Sending it to the
  // homepage hid typos and looked like a soft 404 to crawlers, so fail loudly.
  if (!entry) {
    return new NextResponse("Unknown tool", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  // robots.txt already disallows /go/, but a crawler that ignores it still gets
  // an explicit signal here rather than following the link out.
  return NextResponse.redirect(entry.href, {
    status: 302,
    headers: { "X-Robots-Tag": "noindex, nofollow" },
  });
}
