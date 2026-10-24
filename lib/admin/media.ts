import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";
import { siteConfig } from "@/lib/site.config";
import { AdminError } from "./mutations";

/**
 * Media library, backed by the same Supabase Storage bucket and path convention
 * the existing /api/admin/media route already writes to: `<site-slug>/<file>`.
 * Keeping the layout identical means files uploaded either way show up here.
 */

/**
 * Storage bucket for uploads.
 *
 * The bucket that actually exists in this Supabase project is `blog-images`
 * (public). Both this module and app/api/admin/media/route.ts previously
 * hardcoded `media`, which does not exist — every upload failed with "Bucket not
 * found". Overridable so a different deployment doesn't need a code change.
 */
export const MEDIA_BUCKET = process.env.SUPABASE_MEDIA_BUCKET ?? "blog-images";

/** 8MB — large enough for a hero image, small enough to survive a body-size limit. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

export interface MediaItem {
  name: string;
  path: string;
  url: string;
  size: number | null;
  updatedAt: string | null;
}

/** Storage is keyed by site slug, not site id. */
async function mediaPrefix(): Promise<string> {
  const siteId = await getCurrentSiteId();
  const { data } = await getSupabaseAdmin()
    .from("sites")
    .select("slug")
    .eq("id", siteId)
    .maybeSingle();

  return (data as { slug: string } | null)?.slug ?? siteConfig.slug;
}

export async function listMedia(): Promise<{
  items: MediaItem[];
  /** Set when the bucket itself is missing/unreadable, so the UI can explain. */
  unavailable?: string;
}> {
  const prefix = await mediaPrefix();
  const storage = getSupabaseAdmin().storage.from(MEDIA_BUCKET);

  const { data, error } = await storage.list(prefix, {
    limit: 200,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    // A missing bucket is a setup problem, not a crash — report it in the UI.
    return { items: [], unavailable: error.message };
  }

  const items: MediaItem[] = (data ?? [])
    // Supabase returns a placeholder row for empty folders; skip it.
    .filter((f) => f.name && f.id !== null)
    .map((f) => {
      const path = `${prefix}/${f.name}`;
      const { data: pub } = storage.getPublicUrl(path);
      return {
        name: f.name,
        path,
        url: pub.publicUrl,
        size: (f.metadata as { size?: number } | null)?.size ?? null,
        updatedAt: f.updated_at ?? f.created_at ?? null,
      };
    });

  return { items };
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  if (!file || file.size === 0) {
    throw new AdminError("Choose a file to upload.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new AdminError(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${
        MAX_UPLOAD_BYTES / 1024 / 1024
      }MB.`
    );
  }
  // Require a recognised, allowed type. The old check skipped validation when
  // `file.type` was empty, letting a typeless upload slip past the allowlist
  // into a PUBLIC bucket. An image/PDF uploader has no reason to accept unknown
  // content, so an absent type is now a rejection, not a bypass.
  if (!file.type || !ALLOWED_TYPES.has(file.type)) {
    throw new AdminError(
      `${file.type || "That file"} isn't an allowed type. Upload a JPEG, PNG, GIF, WebP, AVIF or PDF.`
    );
  }

  const prefix = await mediaPrefix();

  // Normalise the filename: strip directory traversal and anything that would
  // need escaping in a URL, then prefix with a timestamp to avoid collisions.
  const safeName = file.name
    .replace(/^.*[\\/]/, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-100);

  const path = `${prefix}/${Date.now()}-${safeName}`;
  const storage = getSupabaseAdmin().storage.from(MEDIA_BUCKET);

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await storage.upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) throw new AdminError(`Upload failed: ${error.message}`);

  const { data: pub } = storage.getPublicUrl(path);

  return {
    name: safeName,
    path,
    url: pub.publicUrl,
    size: file.size,
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteMedia(path: string): Promise<void> {
  const prefix = await mediaPrefix();

  // Never let a caller-supplied path escape this site's folder — the bucket is
  // shared with the other sites in this Supabase project.
  if (!path.startsWith(`${prefix}/`) || path.includes("..")) {
    throw new AdminError("That file does not belong to this site.");
  }

  const { error } = await getSupabaseAdmin()
    .storage.from(MEDIA_BUCKET)
    .remove([path]);

  if (error) throw new AdminError(`Could not delete file: ${error.message}`);
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
