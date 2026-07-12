import { revalidatePath } from "next/cache";
import { getSupabaseAdmin, getCurrentSiteId } from "./supabase";
import { siteConfig } from "./site.config";

export function audienceTagsToPaths(tags: string[]): string[] {
  return tags.flatMap((tag) => {
    const seg = siteConfig.audienceSegments.find((s) => s.tag === tag);
    return seg ? [`/${seg.slug}`] : [];
  });
}

export async function revalidateForSite(
  siteId: string,
  paths: string[]
): Promise<void> {
  const currentSiteId = await getCurrentSiteId().catch(() => null);

  if (siteId === currentSiteId) {
    for (const path of paths) {
      revalidatePath(path);
    }
    return;
  }

  const { data } = await getSupabaseAdmin()
    .from("sites")
    .select("deploy_url")
    .eq("id", siteId)
    .single();

  if (!data?.deploy_url) return;

  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) return;

  await fetch(`${data.deploy_url}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, paths }),
  }).catch(() => {});
}
