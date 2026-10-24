"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  AdminError,
  createCategory,
  createPage,
  createPost,
  deleteCategory,
  deletePage,
  deletePost,
  updateCategory,
  updatePage,
  updatePost,
  updateSiteSettings,
  createPrintable,
  updatePrintable,
  deletePrintable,
  setPostPrintables,
  type PrintableInput,
  type CategoryInput,
  type PageInput,
  type PostInput,
} from "./mutations";
import {
  endSession,
  requireSession,
  startSession,
  verifyPassword,
} from "./session";
import {
  checkLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
} from "./throttle";
import { getPostById } from "./data";
import { deleteMedia, uploadMedia } from "./media";
import { siteConfig } from "@/lib/site.config";

/**
 * Server Actions behind the dashboard forms.
 *
 * Every action calls `requireSession()` first. proxy.ts already bounces
 * logged-out browsers, but Next's docs are explicit that the proxy is not a
 * security boundary — a Server Action is a POST to its own page route, and
 * relying on the matcher alone would be the classic hole. The check is cheap
 * (one HMAC verify, memoised per request), so it goes on every one.
 */

export interface ActionState {
  ok?: boolean;
  error?: string;
  /** Which form field the error belongs to, when we know. */
  field?: string;
}

/** Turn a thrown error into form state instead of a crash screen. */
function toState(err: unknown): ActionState {
  if (err instanceof AdminError) {
    return { ok: false, error: err.message, field: err.field };
  }
  // Don't leak internals (connection strings, table names) to the browser.
  console.error("[admin action]", err);
  return { ok: false, error: "Something went wrong. Check the server logs." };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

/** Best-effort client identifier for rate-limiting, from proxy headers. */
async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!password) return { ok: false, error: "Enter your password." };

  // Throttle by client IP so the password can't be brute-forced. Keyed off the
  // proxy's forwarded-for header; unknown clients share one conservative bucket.
  const key = await clientKey();
  const gate = checkLoginAllowed(key);
  if (!gate.allowed) {
    const mins = Math.ceil(gate.retryAfterSec / 60);
    return {
      ok: false,
      error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  let valid = false;
  try {
    valid = verifyPassword(password);
  } catch (err) {
    // Misconfiguration (ADMIN_PASSWORD unset) — say so plainly, it's a local
    // setup problem, not a credential leak. Not a failed guess, so not counted.
    return { ok: false, error: (err as Error).message };
  }

  if (!valid) {
    recordLoginFailure(key);
    return { ok: false, error: "Incorrect password." };
  }

  recordLoginSuccess(key);
  await startSession();

  // Only ever redirect to an internal admin path — never echo back an
  // attacker-supplied absolute URL.
  const target = next.startsWith("/admin") ? next : "/admin";
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

// ── Form parsing ─────────────────────────────────────────────────────────────

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (v === null) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** FAQ rows arrive as parallel faq_question[] / faq_answer[] arrays. */
function parseFaq(fd: FormData): Array<{ question: string; answer: string }> {
  const questions = fd.getAll("faq_question").map((v) => String(v).trim());
  const answers = fd.getAll("faq_answer").map((v) => String(v).trim());

  return questions
    .map((question, i) => ({ question, answer: answers[i] ?? "" }))
    // Drop blank rows so an empty pair at the end of the form isn't an error.
    .filter((row) => row.question && row.answer);
}

function parseTags(fd: FormData): string[] {
  const raw = str(fd, "audience_tags");
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}


/** Printable ids attached to a post, in the order the editor listed them. */
function parsePrintableIds(fd: FormData): string[] {
  return fd
    .getAll("printable_ids")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

function postInputFromForm(fd: FormData): PostInput {
  const publishAtLocal = str(fd, "publish_at");
  // The CMS operator works in Asia/Karachi. datetime-local deliberately has no
  // zone, so make that zone explicit before storing an unambiguous UTC instant.
  const publishAt = publishAtLocal
    ? new Date(`${publishAtLocal}:00+05:00`).toISOString()
    : null;
  return {
    title: String(fd.get("title") ?? "").trim(),
    slug: String(fd.get("slug") ?? "").trim(),
    content: str(fd, "content"),
    excerpt: str(fd, "excerpt"),
    quick_answer: str(fd, "quick_answer"),
    category_id: str(fd, "category_id"),
    audience_tags: parseTags(fd),
    status:
      fd.get("status") === "published"
        ? "published"
        : fd.get("status") === "scheduled"
          ? "scheduled"
          : "draft",
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
    faq_items: parseFaq(fd),
    // Blank means "no image" — the generated OG card fills in at render time.
    // We store NULL rather than the generated URL, so the DB keeps recording
    // that nobody actually chose an image.
    featured_image_url: str(fd, "featured_image_url"),
    featured_image_alt: str(fd, "featured_image_alt"),
    publish_at: publishAt,
  };
}

// ── Posts ────────────────────────────────────────────────────────────────────

export async function createPostAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  let id: string;
  try {
    const row = await createPost(postInputFromForm(formData));
    id = row.id;
    if (siteConfig.features.printables) {
      await setPostPrintables(row.id, parsePrintableIds(formData));
    }
  } catch (err) {
    return toState(err);
  }

  // redirect() throws a control-flow signal, so it must sit outside the try —
  // inside, the catch would swallow it and the redirect would never happen.
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${id}?created=1`);
}

export async function updatePostAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    await updatePost(id, postInputFromForm(formData));
    if (siteConfig.features.printables) {
      await setPostPrintables(id, parsePrintableIds(formData));
    }
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/posts");
  return { ok: true };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deletePost(id);
  revalidatePath("/admin/posts");
  redirect("/admin/posts?deleted=1");
}

/** Publish / unpublish straight from the list view. */
export async function togglePostStatusAction(formData: FormData): Promise<void> {
  await requireSession();

  const id = String(formData.get("id") ?? "");
  const next = formData.get("next_status") === "published" ? "published" : "draft";
  if (!id) return;

  const post = await getPostById(id);
  if (!post) return;

  await updatePost(id, {
    title: post.title,
    slug: post.slug,
    content: post.content,
    excerpt: post.excerpt,
    quick_answer: post.quick_answer,
    category_id: post.category_id,
    audience_tags: post.audience_tags ?? [],
    status: next,
    seo_title: post.seo_title,
    seo_description: post.seo_description,
    faq_items: post.faq_items ?? [],
    featured_image_url: post.featured_image_url,
    featured_image_alt: post.featured_image_alt,
    published_at: post.published_at,
    publish_at: post.publish_at,
  });

  revalidatePath("/admin/posts");
}

// ── Pages ────────────────────────────────────────────────────────────────────

function pageInputFromForm(fd: FormData): PageInput {
  return {
    slug: String(fd.get("slug") ?? "").trim(),
    title: str(fd, "title"),
    content: str(fd, "content"),
    seo_title: str(fd, "seo_title"),
    seo_description: str(fd, "seo_description"),
  };
}

export async function createPageAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  let id: string;
  try {
    const row = await createPage(pageInputFromForm(formData));
    id = row.id;
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${id}?created=1`);
}

export async function updatePageAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    await updatePage(id, pageInputFromForm(formData));
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/pages");
  return { ok: true };
}

export async function deletePageAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deletePage(id);
  revalidatePath("/admin/pages");
  redirect("/admin/pages?deleted=1");
}

// ── Categories ───────────────────────────────────────────────────────────────

function categoryInputFromForm(fd: FormData): CategoryInput {
  return {
    slug: String(fd.get("slug") ?? "").trim(),
    name: String(fd.get("name") ?? "").trim(),
    description: str(fd, "description"),
  };
}

export async function createCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    await createCategory(categoryInputFromForm(formData));
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    await updateCategory(id, categoryInputFromForm(formData));
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing category id." };

  try {
    await deleteCategory(id);
  } catch (err) {
    // The "still has N posts" case lands here — it's expected, show it inline.
    return toState(err);
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}

// ── Media ────────────────────────────────────────────────────────────────────

export interface UploadState extends ActionState {
  /** Public URL of the file just uploaded, so the UI can offer a copy button. */
  url?: string;
}

export async function uploadMediaAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireSession();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Choose a file to upload." };
  }

  try {
    const item = await uploadMedia(file);
    revalidatePath("/admin/media");
    return { ok: true, url: item.url };
  } catch (err) {
    return toState(err);
  }
}

export async function deleteMediaAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  const path = String(formData.get("path") ?? "");
  if (!path) return { ok: false, error: "Missing file path." };

  try {
    await deleteMedia(path);
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/media");
  return { ok: true };
}

// ── Settings ─────────────────────────────────────────────────────────────────

/** Nav rows arrive as parallel <prefix>_label[] / <prefix>_href[] arrays. */
function parseNavRows(
  fd: FormData,
  prefix: string
): Array<{ label: string; href: string }> {
  const labels = fd.getAll(`${prefix}_label`).map((v) => String(v).trim());
  const hrefs = fd.getAll(`${prefix}_href`).map((v) => String(v).trim());

  return labels
    .map((label, i) => ({ label, href: hrefs[i] ?? "" }))
    .filter((row) => row.label && row.href);
}

export async function updateSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  // Colour inputs are named color_<token>; collect whatever is present.
  const themeColors: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("color_") && typeof value === "string" && value.trim()) {
      themeColors[key.slice("color_".length)] = value.trim();
    }
  }

  const social: Record<string, string> = {};
  for (const platform of ["pinterest", "x", "instagram"]) {
    const value = str(formData, `social_${platform}`);
    if (value) social[platform] = value;
  }

  try {
    await updateSiteSettings({
      name: String(formData.get("name") ?? "").trim(),
      tagline: str(formData, "tagline"),
      contact_email: str(formData, "contact_email"),
      theme_colors: themeColors,
      nav: parseNavRows(formData, "nav"),
      footer_links: parseNavRows(formData, "footer"),
      social,
    });
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Printables ───────────────────────────────────────────────────────────────

function printableInputFromForm(fd: FormData): PrintableInput {
  return {
    title: String(fd.get("title") ?? "").trim(),
    slug: String(fd.get("slug") ?? "").trim(),
    description: str(fd, "description"),
    file_url: str(fd, "file_url"),
    thumbnail_url: str(fd, "thumbnail_url"),
    category_id: str(fd, "category_id"),
    orientation: fd.get("orientation") === "landscape" ? "landscape" : "portrait",
  };
}

export async function createPrintableAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  let id: string;
  try {
    const row = await createPrintable(printableInputFromForm(formData));
    id = row.id;
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/printables");
  redirect(`/admin/printables/${id}?created=1`);
}

export async function updatePrintableAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();

  try {
    await updatePrintable(id, printableInputFromForm(formData));
  } catch (err) {
    return toState(err);
  }

  revalidatePath("/admin/printables");
  return { ok: true };
}

export async function deletePrintableAction(formData: FormData): Promise<void> {
  await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deletePrintable(id);
  revalidatePath("/admin/printables");
  redirect("/admin/printables?deleted=1");
}

/**
 * Upload a printable's PDF (or thumbnail) straight from its form, so an admin
 * can attach a file without a detour through the media library.
 */
export async function uploadPrintableFileAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  await requireSession();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Choose a file to upload." };
  }

  try {
    const item = await uploadMedia(file);
    return { ok: true, url: item.url };
  } catch (err) {
    return toState(err);
  }
}
