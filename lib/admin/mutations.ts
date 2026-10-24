import { z } from "zod";

import { getSupabaseAdmin, getCurrentSiteId } from "@/lib/supabase";
import { revalidateForSite, audienceTagsToPaths } from "@/lib/revalidatePortfolio";
import { postPath } from "@/lib/utils";
import { validateMdx, mdxHint } from "./mdx-validate";

/**
 * Shared write layer for posts, pages and categories.
 *
 * Both the Server Actions behind the dashboard UI and the existing
 * /api/admin/* routes go through here, so validation, MDX compile-checking,
 * slug rules and revalidation can't drift apart between the two entry points.
 *
 * ── Safety note, read before editing ──
 * This module uses the SERVICE-ROLE key, which bypasses RLS, and the Supabase
 * project is shared with other live sites. Every statement below filters on
 * site_id. An UPDATE or DELETE that reaches Supabase without `.eq("site_id", …)`
 * would hit other tenants' rows. Do not add one.
 */

export class AdminError extends Error {
  readonly field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = "AdminError";
    this.field = field;
  }
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const FaqItemSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

/**
 * Slugs are load-bearing SEO assets migrated from WordPress and indexed in
 * Search Console — see CLAUDE.md. Enforce the URL-safe shape at the boundary.
 */
const SlugSchema = z
  .string()
  .min(1, "Slug is required.")
  .max(200, "Slug is too long.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers and single hyphens (e.g. world-cup-visa-guide)."
  );

export const PostInputSchema = z.object({
  title: z.string().min(1, "Title is required.").max(300),
  slug: SlugSchema,
  content: z.string().optional().nullable(),
  excerpt: z.string().max(500).optional().nullable(),
  quick_answer: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().nullable().optional(),
  audience_tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "scheduled", "published"]).default("draft"),
  seo_title: z.string().max(120).optional().nullable(),
  seo_description: z.string().max(320).optional().nullable(),
  faq_items: z.array(FaqItemSchema).default([]),
  featured_image_url: z
    .string()
    .url("Featured image must be a full URL.")
    .nullable()
    .optional(),
  featured_image_alt: z.string().max(500).nullable().optional(),
  published_at: z.string().nullable().optional(),
  publish_at: z.string().datetime({ offset: true }).nullable().optional(),
});

export const PageInputSchema = z.object({
  slug: SlugSchema,
  title: z.string().max(300).optional().nullable(),
  content: z.string().optional().nullable(),
  seo_title: z.string().max(120).optional().nullable(),
  seo_description: z.string().max(320).optional().nullable(),
});

export const CategoryInputSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(1, "Name is required.").max(120),
  description: z.string().max(500).optional().nullable(),
});

export type PostInput = z.input<typeof PostInputSchema>;
export type PageInput = z.input<typeof PageInputSchema>;
export type CategoryInput = z.input<typeof CategoryInputSchema>;

// ── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

/** Reject content that would not compile as MDX, before it can break the build. */
async function assertValidMdx(content: string | null | undefined, field: string) {
  const result = await validateMdx(content);
  if (!result.ok) {
    throw new AdminError(
      `${result.error} — ${mdxHint(result.error ?? "")}`,
      field
    );
  }
}

/**
 * Guard against silently stealing another row's slug. The DB has a
 * unique(site_id, slug) constraint; catching it here gives a readable message
 * instead of a raw Postgres error.
 */
async function assertSlugFree(
  table: "posts" | "pages" | "categories" | "printables",
  slug: string,
  excludeId?: string
) {
  const siteId = await getCurrentSiteId();
  let query = getSupabaseAdmin()
    .from(table)
    .select("id")
    .eq("site_id", siteId)
    .eq("slug", slug);

  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new AdminError(`Could not verify slug: ${error.message}`, "slug");
  if (data) {
    throw new AdminError(
      `The slug "${slug}" is already used by another ${table.slice(0, -1)}.`,
      "slug"
    );
  }
}

async function revalidatePostPaths(
  siteId: string,
  slug: string,
  categoryId: string | null,
  audienceTags: string[],
  extraSlugs: string[] = []
) {
  const paths = ["/", "/blog", postPath(slug), ...extraSlugs.map(postPath)];

  if (categoryId) {
    const { data: cat } = await getSupabaseAdmin()
      .from("categories")
      .select("slug")
      .eq("id", categoryId)
      .maybeSingle();
    if (cat) paths.push(`/category/${(cat as { slug: string }).slug}`);
  }

  paths.push(...audienceTagsToPaths(audienceTags));
  await revalidateForSite(siteId, Array.from(new Set(paths)));
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function createPost(input: PostInput) {
  const parsed = PostInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  if (data.status === "scheduled" && !data.publish_at) {
    throw new AdminError("Choose a Publish At time for a scheduled post.", "publish_at");
  }

  await assertValidMdx(data.content, "content");
  await assertSlugFree("posts", data.slug);

  const siteId = await getCurrentSiteId();
  const now = new Date().toISOString();

  const payload = {
    ...data,
    site_id: siteId,
    published_at: data.status === "published" ? data.published_at ?? now : null,
    publish_at: data.status === "scheduled" ? data.publish_at : null,
    updated_at: now,
  };

  const { data: row, error } = await getSupabaseAdmin()
    .from("posts")
    .insert(payload)
    .select("*, categories(slug, name)")
    .single();

  if (error) throw new AdminError(`Could not create post: ${error.message}`);

  await revalidatePostPaths(
    siteId,
    row.slug,
    row.category_id,
    row.audience_tags ?? []
  );

  return row;
}

export async function updatePost(id: string, input: PostInput) {
  const parsed = PostInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  if (data.status === "scheduled" && !data.publish_at) {
    throw new AdminError("Choose a Publish At time for a scheduled post.", "publish_at");
  }

  await assertValidMdx(data.content, "content");
  await assertSlugFree("posts", data.slug, id);

  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  // Read the old row first: if the slug changed we must revalidate the OLD url
  // too, or the previous path keeps serving a stale cached page.
  const { data: before } = await db
    .from("posts")
    .select("slug, status, published_at, publish_at")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Post not found for this site.");

  const prev = before as {
    slug: string;
    status: string;
    published_at: string | null;
    publish_at: string | null;
  };
  const now = new Date().toISOString();

  // Stamp published_at the first time a post actually goes live, and don't
  // overwrite an existing date on later edits.
  let publishedAt = data.published_at ?? prev.published_at;
  if (data.status === "published" && !publishedAt) publishedAt = now;
  if (data.status === "scheduled") publishedAt = null;

  const payload = {
    ...data,
    site_id: siteId,
    published_at: publishedAt,
    publish_at: data.status === "scheduled" ? data.publish_at : null,
    // posts.updated_at has no DB trigger — it must be set explicitly.
    updated_at: now,
  };

  const { data: row, error } = await db
    .from("posts")
    .update(payload)
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id)
    .select("*, categories(slug, name)")
    .single();

  if (error) throw new AdminError(`Could not update post: ${error.message}`);

  const alsoRevalidate = prev.slug !== row.slug ? [prev.slug] : [];
  await revalidatePostPaths(
    siteId,
    row.slug,
    row.category_id,
    row.audience_tags ?? [],
    alsoRevalidate
  );

  return row;
}

export async function deletePost(id: string) {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: before } = await db
    .from("posts")
    .select("slug, category_id, audience_tags")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Post not found for this site.");

  const { error } = await db
    .from("posts")
    .delete()
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id);

  if (error) throw new AdminError(`Could not delete post: ${error.message}`);

  const row = before as {
    slug: string;
    category_id: string | null;
    audience_tags: string[] | null;
  };
  await revalidatePostPaths(siteId, row.slug, row.category_id, row.audience_tags ?? []);
}

// ── Pages ────────────────────────────────────────────────────────────────────

export async function createPage(input: PageInput) {
  const parsed = PageInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  await assertValidMdx(data.content, "content");
  await assertSlugFree("pages", data.slug);

  const siteId = await getCurrentSiteId();

  const { data: row, error } = await getSupabaseAdmin()
    .from("pages")
    .insert({ ...data, site_id: siteId, updated_at: new Date().toISOString() })
    .select("*")
    .single();

  if (error) throw new AdminError(`Could not create page: ${error.message}`);

  await revalidateForSite(siteId, [`/${row.slug}`]);
  return row;
}

export async function updatePage(id: string, input: PageInput) {
  const parsed = PageInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  await assertValidMdx(data.content, "content");
  await assertSlugFree("pages", data.slug, id);

  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: before } = await db
    .from("pages")
    .select("slug")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Page not found for this site.");

  const { data: row, error } = await db
    .from("pages")
    .update({ ...data, site_id: siteId, updated_at: new Date().toISOString() })
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new AdminError(`Could not update page: ${error.message}`);

  const paths = [`/${row.slug}`];
  const prevSlug = (before as { slug: string }).slug;
  if (prevSlug !== row.slug) paths.push(`/${prevSlug}`);

  await revalidateForSite(siteId, paths);
  return row;
}

export async function deletePage(id: string) {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: before } = await db
    .from("pages")
    .select("slug")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Page not found for this site.");

  const { error } = await db
    .from("pages")
    .delete()
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id);

  if (error) throw new AdminError(`Could not delete page: ${error.message}`);

  await revalidateForSite(siteId, [`/${(before as { slug: string }).slug}`]);
}

// ── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(input: CategoryInput) {
  const parsed = CategoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  await assertSlugFree("categories", data.slug);
  const siteId = await getCurrentSiteId();

  const { data: row, error } = await getSupabaseAdmin()
    .from("categories")
    .insert({ ...data, site_id: siteId })
    .select("*")
    .single();

  if (error) throw new AdminError(`Could not create category: ${error.message}`);

  await revalidateForSite(siteId, ["/", "/blog", `/category/${row.slug}`]);
  return row;
}

export async function updateCategory(id: string, input: CategoryInput) {
  const parsed = CategoryInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  await assertSlugFree("categories", data.slug, id);
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: before } = await db
    .from("categories")
    .select("slug")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Category not found for this site.");

  const { data: row, error } = await db
    .from("categories")
    .update({ ...data, site_id: siteId })
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new AdminError(`Could not update category: ${error.message}`);

  const paths = ["/", "/blog", `/category/${row.slug}`];
  const prevSlug = (before as { slug: string }).slug;
  if (prevSlug !== row.slug) paths.push(`/category/${prevSlug}`);

  await revalidateForSite(siteId, paths);
  return row;
}

/**
 * Categories are referenced by posts.category_id with no ON DELETE behaviour
 * declared, so Postgres would reject the delete with a foreign-key error. Check
 * first and explain it, rather than surfacing a constraint violation.
 */
export async function deleteCategory(id: string) {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { count } = await db
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("site_id", siteId)
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    throw new AdminError(
      `This category still has ${count} post${count === 1 ? "" : "s"}. Move them to another category first.`
    );
  }

  const { data: before } = await db
    .from("categories")
    .select("slug")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Category not found for this site.");

  const { error } = await db
    .from("categories")
    .delete()
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id);

  if (error) throw new AdminError(`Could not delete category: ${error.message}`);

  await revalidateForSite(siteId, ["/", "/blog", `/category/${(before as { slug: string }).slug}`]);
}

// ── Site settings ────────────────────────────────────────────────────────────

const HEX = /^#[0-9a-fA-F]{6}$/;

const NavItemSchema = z.object({
  label: z.string().min(1).max(60),
  href: z.string().min(1).max(300),
});

export const SettingsInputSchema = z.object({
  name: z.string().min(1, "Site name is required.").max(120),
  tagline: z.string().max(300).optional().nullable(),
  contact_email: z
    .string()
    .email("Contact email must be a valid address.")
    .optional()
    .nullable(),
  theme_colors: z.record(z.string(), z.string().regex(HEX, "Colours must be 6-digit hex, e.g. #0B6B3A.")),
  nav: z.array(NavItemSchema),
  footer_links: z.array(NavItemSchema),
  social: z.record(z.string(), z.string()),
});

export type SettingsInput = z.input<typeof SettingsInputSchema>;

/**
 * Upsert the site_settings override row.
 *
 * Writes only ever touch this site's row. If the table doesn't exist yet
 * (migration 004 not applied — the Supabase token used during development
 * couldn't apply it), Postgres reports 42P01 and we translate that into setup
 * instructions rather than a stack trace.
 */
export async function updateSiteSettings(input: SettingsInput) {
  const parsed = SettingsInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;
  const siteId = await getCurrentSiteId();

  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        site_id: siteId, // tenant scope — this is the primary key
        name: data.name,
        tagline: data.tagline ?? null,
        contact_email: data.contact_email ?? null,
        theme_colors: data.theme_colors,
        nav: data.nav,
        footer_links: data.footer_links,
        social: data.social,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "site_id" }
    );

  if (error) {
    if (error.code === "42P01" || /site_settings/i.test(error.message)) {
      throw new AdminError(
        "The site_settings table doesn't exist yet. Run supabase/migrations/004_site_settings.sql against the database, then try again."
      );
    }
    throw new AdminError(`Could not save settings: ${error.message}`);
  }

  // Theme and nav appear in the root layout, so every page is affected.
  await revalidateForSite(siteId, ["/", "/blog"]);
}

// ── Printables ───────────────────────────────────────────────────────────────

export const PrintableInputSchema = z.object({
  title: z.string().min(1, "Title is required.").max(300),
  slug: SlugSchema,
  description: z.string().max(1000).optional().nullable(),
  file_url: z.string().url("File must be a full URL.").optional().nullable(),
  thumbnail_url: z
    .string()
    .url("Thumbnail must be a full URL.")
    .optional()
    .nullable(),
  category_id: z.string().uuid().nullable().optional(),
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
});

export type PrintableInput = z.input<typeof PrintableInputSchema>;

/**
 * True when the failure is "this table/column doesn't exist yet".
 *
 * PostgREST reports a missing table as **PGRST205**, not Postgres's own 42P01 —
 * it fails in the schema cache before reaching the database. A missing column is
 * PGRST204. Matching only 42P01 (the obvious guess) silently misses both.
 */
function isMissingRelation(err: { code?: string; message?: string }): boolean {
  if (err.code === "PGRST205" || err.code === "PGRST204" || err.code === "42P01") {
    return true;
  }
  return /could not find the .*(table|column)|does not exist/i.test(
    err.message ?? ""
  );
}

/** Migration 005 adds the join table; explain the setup step if it's absent. */
function printableSetupError(message: string, code?: string): AdminError {
  if (isMissingRelation({ code, message })) {
    return new AdminError(
      "Attaching printables needs migration 005. Run supabase/migrations/005_printables.sql against the database, then try again."
    );
  }
  return new AdminError(message);
}

export async function createPrintable(input: PrintableInput) {
  const parsed = PrintableInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  await assertSlugFree("printables", data.slug);
  const siteId = await getCurrentSiteId();

  const { data: row, error } = await getSupabaseAdmin()
    .from("printables")
    // `updated_at` is intentionally NOT written here: the column only exists
    // after migration 005, and writing it would make every create fail with
    // PGRST204 until that runs. The migration adds a trigger to maintain it.
    .insert({ ...data, site_id: siteId })
    .select("*, categories(slug, name)")
    .single();

  if (error) throw printableSetupError(error.message, error.code);

  await revalidateForSite(siteId, ["/free-printables", `/free-printables/${row.slug}`]);
  return row;
}

export async function updatePrintable(id: string, input: PrintableInput) {
  const parsed = PrintableInputSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new AdminError(issue.message, String(issue.path[0] ?? ""));
  }
  const data = parsed.data;

  await assertSlugFree("printables", data.slug, id);
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: before } = await db
    .from("printables")
    .select("slug")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Printable not found for this site.");

  const { data: row, error } = await db
    .from("printables")
    // See createPrintable — updated_at is maintained by a DB trigger, not here.
    .update({ ...data, site_id: siteId })
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id)
    .select("*, categories(slug, name)")
    .single();

  if (error) throw printableSetupError(error.message, error.code);

  const paths = ["/free-printables", `/free-printables/${row.slug}`];
  const prevSlug = (before as { slug: string }).slug;
  if (prevSlug !== row.slug) paths.push(`/free-printables/${prevSlug}`);

  await revalidateForSite(siteId, paths);
  return row;
}

export async function deletePrintable(id: string) {
  const siteId = await getCurrentSiteId();
  const db = getSupabaseAdmin();

  const { data: before } = await db
    .from("printables")
    .select("slug")
    .eq("site_id", siteId)
    .eq("id", id)
    .maybeSingle();

  if (!before) throw new AdminError("Printable not found for this site.");

  // post_printables has ON DELETE CASCADE on printable_id, so attachments are
  // cleaned up by the database rather than left dangling.
  const { error } = await db
    .from("printables")
    .delete()
    .eq("site_id", siteId) // tenant scope — do not remove
    .eq("id", id);

  if (error) throw new AdminError(`Could not delete printable: ${error.message}`);

  await revalidateForSite(siteId, [
    "/free-printables",
    `/free-printables/${(before as { slug: string }).slug}`,
  ]);
}

/**
 * Replace a post's attached printables with exactly `printableIds`, preserving
 * the given order.
 *
 * Delete-then-insert rather than a diff: the sets are tiny, and it keeps
 * sort_order contiguous without a reshuffle. Both statements are scoped to the
 * one post_id.
 */
export async function setPostPrintables(postId: string, printableIds: string[]) {
  const db = getSupabaseAdmin();
  const unique = Array.from(new Set(printableIds.filter(Boolean)));

  // Only ever link printables that belong to THIS site. post_printables has no
  // site_id of its own, so without this check a crafted form payload could
  // attach another tenant's printable to one of our posts.
  if (unique.length > 0) {
    const siteId = await getCurrentSiteId();
    const { data: owned, error: ownErr } = await db
      .from("printables")
      .select("id")
      .eq("site_id", siteId)
      .in("id", unique);

    if (ownErr) throw printableSetupError(ownErr.message, ownErr.code);

    const ownedIds = new Set(
      ((owned ?? []) as Array<{ id: string }>).map((r) => r.id)
    );
    const foreign = unique.filter((id) => !ownedIds.has(id));
    if (foreign.length > 0) {
      throw new AdminError(
        "One of those printables doesn't belong to this site."
      );
    }
  }

  const { error: delError } = await db
    .from("post_printables")
    .delete()
    .eq("post_id", postId); // scope — never delete another post's links

  if (delError) {
    // The join table only exists after migration 005. If the admin didn't
    // attach anything there is nothing to sync, so stay silent rather than
    // failing an otherwise-good post save — the post itself is already written
    // by this point, and reporting an error would be actively misleading.
    if (unique.length === 0 && isMissingRelation(delError)) return;
    throw printableSetupError(delError.message, delError.code);
  }

  if (unique.length === 0) return;

  const { error: insError } = await db.from("post_printables").insert(
    unique.map((printable_id, i) => ({
      post_id: postId,
      printable_id,
      sort_order: i,
    }))
  );

  if (insError) throw printableSetupError(insError.message, insError.code);
}
