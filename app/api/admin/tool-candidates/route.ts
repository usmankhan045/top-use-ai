import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getCurrentSiteId, getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const CandidateSchema = z.object({
  name: z.string().min(1),
  website_url: z.string().url().optional(),
  source_url: z.string().url(),
  source_type: z.enum(["github", "huggingface", "dataset", "directory"]),
  raw_data: z.record(z.string(), z.unknown()).default({}),
});

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  const siteId = await getCurrentSiteId();
  const status = request.nextUrl.searchParams.get("status");
  let query = getSupabaseAdmin()
    .from("tool_candidates")
    .select("*")
    .eq("site_id", siteId)
    .order("discovered_at", { ascending: false });

  if (status) query = query.eq("review_status", status);
  const { data, error } = await query;
  if (error) {
    console.error("[GET /api/admin/tool-candidates]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ candidates: data ?? [] });
}

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = CandidateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const siteId = await getCurrentSiteId();
  const { data, error } = await getSupabaseAdmin()
    .from("tool_candidates")
    .insert({ ...parsed.data, site_id: siteId })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/tool-candidates]", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ candidate: data }, { status: 201 });
}
