/**
 * Data-access layer — the only place raw Supabase queries should be written.
 * Every function filters by site_id via getCurrentSiteId() to enforce
 * multi-tenant isolation. Never bypass this by writing queries elsewhere.
 */
import { supabaseAdmin, getCurrentSiteId } from "./supabase";

// ── Type definitions ─────────────────────────────────────────────────────────

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  quick_answer: string | null;
  featured_image_url: string | null;
  category_id: string | null;
  audience_tags: string[];
  status: string;
  seo_title: string | null;
  seo_description: string | null;
  faq_items: FaqItem[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories?: { slug: string; name: string } | null;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

export interface Printable {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  orientation: "portrait" | "landscape";
  created_at: string;
  categories?: { slug: string; name: string } | null;
}

export interface Page {
  id: string;
  slug: string;
  title: string | null;
  content: string | null;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function getPublishedPosts(options?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  audienceTag?: string;
}): Promise<Post[]> {
  const siteId = await getCurrentSiteId();

  let query = supabaseAdmin
    .from("posts")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options?.audienceTag) {
    query = query.contains("audience_tags", [options.audienceTag]);
  }

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit ?? 10)) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Post[];
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error?.code === "PGRST116") return null; // not found
  if (error) throw error;
  return data as Post;
}

export async function getPostsByAudienceTag(tag: string, limit = 10): Promise<Post[]> {
  return getPublishedPosts({ audienceTag: tag, limit });
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("site_id", siteId)
    .order("name");

  if (error) throw error;
  return (data ?? []) as Category[];
}

/**
 * Categories that have at least one published post, with their post counts.
 * Used to drive the navbar "Categories" dropdown — empty categories are hidden.
 */
export async function getCategoriesWithPostCounts(): Promise<
  Array<Category & { postCount: number }>
> {
  const siteId = await getCurrentSiteId();

  const [categories, postsRes] = await Promise.all([
    getCategories(),
    supabaseAdmin
      .from("posts")
      .select("category_id")
      .eq("site_id", siteId)
      .eq("status", "published")
      .not("published_at", "is", null),
  ]);

  if (postsRes.error) throw postsRes.error;

  const counts = new Map<string, number>();
  for (const row of postsRes.data ?? []) {
    const id = (row as { category_id: string | null }).category_id;
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return categories
    .map((c) => ({ ...c, postCount: counts.get(c.id) ?? 0 }))
    .filter((c) => c.postCount > 0);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Category;
}

export async function getPostsByCategory(categorySlug: string, limit = 20): Promise<Post[]> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];
  return getPublishedPosts({ categoryId: category.id, limit });
}

// ── Printables ───────────────────────────────────────────────────────────────

export async function getPrintables(categoryId?: string): Promise<Printable[]> {
  const siteId = await getCurrentSiteId();

  let query = supabaseAdmin
    .from("printables")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Printable[];
}

export async function getPrintableBySlug(slug: string): Promise<Printable | null> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await supabaseAdmin
    .from("printables")
    .select("*, categories(slug, name)")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Printable;
}

// ── Pages ────────────────────────────────────────────────────────────────────

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const siteId = await getCurrentSiteId();

  const { data, error } = await supabaseAdmin
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Page;
}

// ── Subscribers ──────────────────────────────────────────────────────────────

export async function addSubscriber(email: string, source?: string): Promise<void> {
  const siteId = await getCurrentSiteId();

  const { error } = await supabaseAdmin
    .from("subscribers")
    .insert({ site_id: siteId, email, source });

  // Silently ignore duplicate emails
  if (error && !error.message.includes("duplicate")) throw error;
}

// ── Contact messages ─────────────────────────────────────────────────────────

export async function saveContactMessage(params: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const siteId = await getCurrentSiteId();

  const { error } = await supabaseAdmin
    .from("contact_messages")
    .insert({ site_id: siteId, ...params });

  if (error) throw error;
}

// ── Pagination helpers ────────────────────────────────────────────────────────

export async function getPublishedPostCount(options?: {
  categoryId?: string;
  audienceTag?: string;
}): Promise<number> {
  const siteId = await getCurrentSiteId();

  let query = supabaseAdmin
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("site_id", siteId)
    .eq("status", "published")
    .not("published_at", "is", null);

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId);
  }

  if (options?.audienceTag) {
    query = query.contains("audience_tags", [options.audienceTag]);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

// ── Related posts ─────────────────────────────────────────────────────────────

export async function getRelatedPosts(params: {
  categoryId: string | null;
  audienceTags: string[];
  excludeSlug: string;
  limit?: number;
}): Promise<Post[]> {
  const siteId = await getCurrentSiteId();
  const limit = params.limit ?? 3;
  const seen = new Set<string>();
  const results: Post[] = [];

  const makeBase = () =>
    supabaseAdmin
      .from("posts")
      .select("*, categories(slug, name)")
      .eq("site_id", siteId)
      .eq("status", "published")
      .not("published_at", "is", null)
      .neq("slug", params.excludeSlug)
      .order("published_at", { ascending: false });

  if (params.categoryId) {
    const { data } = await makeBase()
      .eq("category_id", params.categoryId)
      .limit(limit);
    for (const p of (data ?? []) as Post[]) {
      if (!seen.has(p.slug)) { seen.add(p.slug); results.push(p); }
    }
  }

  for (const tag of params.audienceTags) {
    if (results.length >= limit) break;
    const { data } = await makeBase()
      .contains("audience_tags", [tag])
      .limit(limit);
    for (const p of (data ?? []) as Post[]) {
      if (!seen.has(p.slug) && results.length < limit) {
        seen.add(p.slug);
        results.push(p);
      }
    }
  }

  return results.slice(0, limit);
}
