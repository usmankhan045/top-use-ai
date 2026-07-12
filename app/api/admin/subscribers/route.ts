import { NextRequest } from "next/server";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const siteId =
    request.nextUrl.searchParams.get("site_id") ?? (await getCurrentSiteId());

  const { data, error } = await getSupabaseAdmin()
    .from("subscribers")
    .select("id, email, source, created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/admin/subscribers]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ subscribers: data, total: data?.length ?? 0 });
}
