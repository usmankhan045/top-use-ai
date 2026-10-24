import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";
import type { Category, FaqItem, Page, Post } from "@/lib/queries";

/**
 * Admin-side reads.
 *
 * lib/queries.ts is the public site's data layer and every one of its post
 * queries hardcodes `status = 'published' AND published_at IS NOT NULL`. That's
 * correct for the site and useless for a dashboard, which must see drafts. So
 * these live here rather than loosening the public queries and risking a draft
 * leaking onto the live site.
 *
 * Every function scopes to the current site_id. The service-role key bypasses
 * RLS and this Supabase project is shared with other live sites, so an unscoped
 * query here would read (or a mutation would corrupt) someone else's data.
 */

export type PostStatus = "draft" | "scheduled" | "published";

export interface AdminPostListItem extends Post {
  categories?: { slug: string; name: string } | null;
}

export interface PostFilters {
  status?: PostStatus | "all";
  categoryId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listPosts(
  filters: PostFilters = {}
): Promise<{ posts: AdminPostListItem[]; total: number }> {
  const siteId = await getCurrentSiteId();
  const { status = "all", categoryId, search, limit = 50, offset = 0 } = filters;

  let query = getSupabaseAdmin()
    .from("posts")
    .select("*, categories(slug, name)", { count: "exact" })
    .eq("site_id", siteId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== "all") query = query.eq("status", status);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) {
    // Escape PostgREST's or() delimiters so a comma or paren in the search box
    // can't restructure the filter expression.
    const safe = search.replace(/[,()]/g, " ").trim();
    if (safe) query = query.or(`title.ilike.%${safe}%,slug.ilike.%${safe}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to load posts: ${error.message}`);

  return { posts: (data ?? []) as AdminPostListItem[], total: count ?? 0 };
}

export async function getPostById(id: string): Promise<AdminPostListItem | null> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return (data as AdminPostListItem) ?? null;
}

export async function listCategories(): Promise<
  Array<Category & { postCount: number }>
> {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: cats, error } = await db
    .from("categories")
    .select("*")
    .eq("site_id", siteId)
    .order("name");

  if (error) throw new Error(`Failed to load categories: ${error.message}`);

  // Count every post (drafts included) — the dashboard should show real totals,
  // not just what's live.
  const { data: posts, error: postErr } = await db
    .from("posts")
    .select("category_id")
    .eq("site_id", siteId);

  if (postErr) throw new Error(`Failed to count posts: ${postErr.message}`);

  const counts = new Map<string, number>();
  for (const row of posts ?? []) {
    const key = (row as { category_id: string | null }).category_id;
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return ((cats ?? []) as Category[]).map((c) => ({
    ...c,
    postCount: counts.get(c.id) ?? 0,
  }));
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const siteId = await getCurrentSiteId();
  const { data, error } = await getSupabaseAdmin()
    .from("categories")
    .select("*")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load category: ${error.message}`);
  return (data as Category) ?? null;
}

export async function listPages(): Promise<Page[]> {
  const siteId = await getCurrentSiteId();
  const { data, error } = await getSupabaseAdmin()
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .order("slug");

  if (error) throw new Error(`Failed to load pages: ${error.message}`);
  return (data ?? []) as Page[];
}

export async function getPageById(id: string): Promise<Page | null> {
  const siteId = await getCurrentSiteId();
  const { data, error } = await getSupabaseAdmin()
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load page: ${error.message}`);
  return (data as Page) ?? null;
}

// ── Dashboard stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalPosts: number;
  published: number;
  scheduled: number;
  drafts: number;
  pages: number;
  categories: number;
  subscribers: number;
  missingImage: number;
  /** Posts with little or no body — the migration left 61 of these. */
  thinContent: number;
  recent: Array<Pick<Post, "id" | "title" | "slug" | "status" | "updated_at">>;
}

/** Below this word count a post is "thin" — see CLAUDE.md on the WP migration. */
const THIN_WORD_COUNT = 300;

export function wordCount(content: string | null | undefined): number {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const [postsRes, pagesRes, catsRes, subsRes] = await Promise.all([
    db
      .from("posts")
      .select("id, title, slug, status, content, featured_image_url, updated_at")
      .eq("site_id", siteId)
      .order("updated_at", { ascending: false }),
    db.from("pages").select("id", { count: "exact", head: true }).eq("site_id", siteId),
    db.from("categories").select("id", { count: "exact", head: true }).eq("site_id", siteId),
    db.from("subscribers").select("id", { count: "exact", head: true }).eq("site_id", siteId),
  ]);

  if (postsRes.error) {
    throw new Error(`Failed to load dashboard stats: ${postsRes.error.message}`);
  }

  const posts = (postsRes.data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    content: string | null;
    featured_image_url: string | null;
    updated_at: string;
  }>;

  return {
    totalPosts: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    drafts: posts.filter((p) => p.status === "draft").length,
    pages: pagesRes.count ?? 0,
    categories: catsRes.count ?? 0,
    // subscribers table may not be readable in every environment; treat as 0.
    subscribers: subsRes.count ?? 0,
    missingImage: posts.filter((p) => !p.featured_image_url).length,
    thinContent: posts.filter((p) => wordCount(p.content) < THIN_WORD_COUNT).length,
    recent: posts.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      updated_at: p.updated_at,
    })),
  };
}

/** Posts that most need editorial work, worst first. */
export async function getThinPosts(limit = 25): Promise<
  Array<{ id: string; title: string; slug: string; status: string; words: number }>
> {
  const siteId = await getCurrentSiteId();
  const { data, error } = await getSupabaseAdmin()
    .from("posts")
    .select("id, title, slug, status, content")
    .eq("site_id", siteId);

  if (error) throw new Error(`Failed to load thin posts: ${error.message}`);

  return ((data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    content: string | null;
  }>)
    .map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      status: p.status,
      words: wordCount(p.content),
    }))
    .filter((p) => p.words < THIN_WORD_COUNT)
    .sort((a, b) => a.words - b.words)
    .slice(0, limit);
}

export type { Category, Page, Post, FaqItem };

// ── Printables ───────────────────────────────────────────────────────────────

export interface AdminPrintable {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  orientation: "portrait" | "landscape";
  created_at: string;
  updated_at: string | null;
  categories?: { slug: string; name: string } | null;
  /** How many posts attach this printable. */
  postCount?: number;
}

/**
 * Returns `unavailable` rather than throwing when the table is missing its new
 * columns (migration 005 not yet applied), so the screen can explain the setup
 * step instead of showing an error page.
 */
export async function listPrintables(): Promise<{
  printables: AdminPrintable[];
  unavailable?: string;
}> {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data, error } = await db
    .from("printables")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (error) return { printables: [], unavailable: error.message };

  const printables = (data ?? []) as AdminPrintable[];

  // Attach usage counts. A missing join table is not fatal — just show no counts.
  const { data: links } = await db
    .from("post_printables")
    .select("printable_id");

  if (links) {
    const counts = new Map<string, number>();
    for (const row of links as Array<{ printable_id: string }>) {
      counts.set(row.printable_id, (counts.get(row.printable_id) ?? 0) + 1);
    }
    for (const p of printables) p.postCount = counts.get(p.id) ?? 0;
  }

  return { printables };
}

export async function getPrintableById(
  id: string
): Promise<AdminPrintable | null> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await getSupabaseAdmin()
    .from("printables")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load printable: ${error.message}`);
  return (data as AdminPrintable) ?? null;
}

/** Printable ids attached to a post, in order — used to prefill the editor. */
export async function getAttachedPrintableIds(postId: string): Promise<string[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("post_printables")
    .select("printable_id, sort_order")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[getAttachedPrintableIds]", error.message);
    return [];
  }

  return ((data ?? []) as Array<{ printable_id: string }>).map(
    (r) => r.printable_id
  );
}
