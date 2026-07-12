import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MediaUploadSchema = z.object({
  site_id: z.string().uuid().optional(),
  filename: z.string().min(1, "filename is required"),
  data: z.string().min(1, "data (base64) is required"),
  content_type: z.string().optional(),
});

const MEDIA_BUCKET = "media";

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = MediaUploadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const siteId = parsed.data.site_id ?? (await getCurrentSiteId());

  const { data: site } = await getSupabaseAdmin()
    .from("sites")
    .select("slug")
    .eq("id", siteId)
    .single();

  if (!site) {
    return Response.json({ error: "Site not found." }, { status: 404 });
  }

  const base64Data = parsed.data.data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const contentType =
    parsed.data.content_type ??
    inferContentType(parsed.data.filename) ??
    "application/octet-stream";

  const storagePath = `${site.slug}/${Date.now()}-${parsed.data.filename}`;

  const { error: uploadError } = await getSupabaseAdmin()
    .storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: false });

  if (uploadError) {
    console.error("[POST /api/admin/media]", uploadError);
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = getSupabaseAdmin()
    .storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return Response.json(
    { url: publicUrlData.publicUrl, path: storagePath },
    { status: 201 }
  );
}

function inferContentType(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
  };
  return ext ? (map[ext] ?? null) : null;
}
