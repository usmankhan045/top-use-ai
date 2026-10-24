"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import Link from "next/link";

import type { ActionState } from "@/lib/admin/actions";
import type { AdminPostListItem, AdminPrintable } from "@/lib/admin/data";
import type { Category, FaqItem } from "@/lib/queries";
import { cn, postPath } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";
import { ErrorBanner, Field, SuccessBanner, inputClass } from "../ui";
import { PrintablePicker } from "./PrintablePicker";
import { adminCategoryLabel } from "@/lib/admin/category-label";

const initialState: ActionState = {};

/** Mirrors lib/admin/mutations.ts slugify so the preview matches what's saved. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

function karachiDateTimeValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() + 5 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
}

export default function PostForm({
  action,
  post,
  categories,
  printables = [],
  attachedPrintableIds = [],
  submitLabel,
  justCreated,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  post?: AdminPostListItem;
  categories: Category[];
  printables?: AdminPrintable[];
  attachedPrintableIds?: string[];
  submitLabel: string;
  justCreated?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const isEdit = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");

  // Only auto-fill the slug for brand-new posts. Existing slugs are indexed in
  // Search Console and changing one forfeits its ranking (see CLAUDE.md), so an
  // edit never silently rewrites a published post's URL from a title change.
  //
  // `slugOverride` is null until the admin types in the slug field; until then
  // the slug is DERIVED from the title during render rather than synced in an
  // effect, which avoids a cascading re-render on every keystroke.
  const [slugOverride, setSlugOverride] = useState<string | null>(
    post?.slug ?? null
  );
  const slug = slugOverride ?? slugify(title);

  const [imageUrl, setImageUrl] = useState(post?.featured_image_url ?? "");
  const [categoryId, setCategoryId] = useState(post?.category_id ?? "");
  const [faq, setFaq] = useState<FaqItem[]>(post?.faq_items ?? []);

  // Live preview of the auto-generated card, so it's obvious what will be used
  // when no image is supplied.
  const generatedPreview = useMemo(() => {
    const params = new URLSearchParams({ title: title || "Untitled post" });
    const cat = categories.find((c) => c.id === categoryId);
    if (cat) params.set("label", cat.name);
    return `/api/og?${params.toString()}`;
  }, [title, categories, categoryId]);

  const [content, setContent] = useState(post?.content ?? "");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Drop a {{printable:slug}} mention at the cursor. Splices into the textarea's
   * current selection rather than appending, so it lands where the writer is
   * actually working.
   */
  const insertShortcode = (slug: string) => {
    const token = `\n\n{{printable:${slug}}}\n\n`;
    const el = bodyRef.current;

    if (!el) {
      setContent((prev) => prev + token);
      return;
    }

    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + token + content.slice(end);
    setContent(next);

    // Restore focus and put the caret after the inserted token.
    requestAnimationFrame(() => {
      el.focus();
      const caret = start + token.length;
      el.setSelectionRange(caret, caret);
    });
  };

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter(Boolean).length,
    [content]
  );

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* ── Main column ───────────────────────────────────────────────── */}
      <div className="space-y-5">
        <ErrorBanner message={state.error} />
        <SuccessBanner
          message={
            state.ok
              ? "Saved."
              : justCreated
                ? "Post created."
                : undefined
          }
        />

        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <div className="space-y-4">
            <Field label="Title" htmlFor="title">
              <input
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={cn(inputClass, "font-display text-lg font-bold")}
                placeholder="Which AI tool is best for this job?"
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              hint={
                isEdit
                  ? "This is the live URL. Changing it forfeits the page's search ranking and breaks existing links — only change it if you understand that."
                  : "Auto-generated from the title. Lowercase letters, numbers and hyphens."
              }
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-sm text-muted">/</span>
                <input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlugOverride(e.target.value)}
                  className={cn(inputClass, "font-mono")}
                />
              </div>
              {isEdit && slug !== post?.slug ? (
                <p className="mt-1.5 rounded-md border-2 border-text bg-accent/25 px-3 py-2 text-xs font-medium">
                  You are changing a published URL. The old address
                  <span className="font-mono"> /{post?.slug}</span> will 404 unless
                  you add a redirect in next.config.ts.
                </p>
              ) : null}
            </Field>

            <Field
              label="Quick answer"
              htmlFor="quick_answer"
              hint="One or two sentences answering the title directly. This is what AI Overviews and Perplexity tend to extract."
            >
              <textarea
                id="quick_answer"
                name="quick_answer"
                rows={3}
                defaultValue={post?.quick_answer ?? ""}
                className={inputClass}
              />
            </Field>

            <Field
              label="Excerpt"
              htmlFor="excerpt"
              hint="Shown on listing cards."
            >
              <textarea
                id="excerpt"
                name="excerpt"
                rows={2}
                defaultValue={post?.excerpt ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <Field
            label="Body"
            htmlFor="content"
            hint="Markdown, rendered as MDX. Because of that, { } and < > are special characters — the editor checks it compiles before saving, so a mistake here is caught rather than breaking the site."
          >
            <textarea
              ref={bodyRef}
              id="content"
              name="content"
              rows={22}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={cn(inputClass, "font-mono leading-relaxed")}
              placeholder={"## Do I need a visa?\n\nAnswer the question in the first paragraph…"}
            />
          </Field>
          <p className="mt-2 text-xs text-muted">
            {wordCount} words
            {wordCount > 0 && wordCount < 300 ? (
              <span className="ml-2 text-text">
                · thin, aim for 800+ on a guide
              </span>
            ) : null}
          </p>
        </div>

        <FaqEditor items={faq} onChange={setFaq} />

        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <h2 className="stamp mb-4 text-muted">Search appearance</h2>
          <div className="space-y-4">
            <Field
              label="SEO title"
              htmlFor="seo_title"
              hint="Falls back to the post title if blank. Aim for under 60 characters."
            >
              <input
                id="seo_title"
                name="seo_title"
                defaultValue={post?.seo_title ?? ""}
                className={inputClass}
              />
            </Field>
            <Field
              label="Meta description"
              htmlFor="seo_description"
              hint="Aim for 140–160 characters."
            >
              <textarea
                id="seo_description"
                name="seo_description"
                rows={3}
                defaultValue={post?.seo_description ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <div className="space-y-4">
            <Field label="Status" htmlFor="status">
              <select
                id="status"
                name="status"
                defaultValue={post?.status ?? "draft"}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </Field>

            <Field
              label="Publish At"
              htmlFor="publish_at"
              hint="Required when status is Scheduled. Timezone: Pakistan (UTC+5)."
            >
              <input
                id="publish_at"
                name="publish_at"
                type="datetime-local"
                defaultValue={karachiDateTimeValue(post?.publish_at)}
                className={inputClass}
              />
            </Field>

            <Field label="Category" htmlFor="category_id">
              <select
                id="category_id"
                name="category_id"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className={inputClass}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {adminCategoryLabel(c, categories)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Audience tags"
              htmlFor="audience_tags"
              hint="Comma separated."
            >
              <input
                id="audience_tags"
                name="audience_tags"
                defaultValue={(post?.audience_tags ?? []).join(", ")}
                className={inputClass}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-lg border-2 border-text bg-primary px-4 py-2.5 font-body text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {pending ? "Saving…" : submitLabel}
          </button>

          {post?.status === "published" ? (
            <Link
              href={postPath(post.slug)}
              target="_blank"
              rel="noreferrer"
              className="stamp mt-2 block rounded-md border-2 border-line px-3 py-2 text-center text-muted hover:border-text hover:text-text"
            >
              View live ↗
            </Link>
          ) : null}
        </div>

        {siteConfig.features.printables ? (
          <PrintablePicker
            available={printables}
            initialIds={attachedPrintableIds}
            onInsertShortcode={insertShortcode}
          />
        ) : null}

        {/* Preview image */}
        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <h2 className="stamp mb-3 text-muted">Preview image</h2>

          <div className="mb-3 overflow-hidden rounded-lg border-2 border-line">
            {/* eslint-disable-next-line @next/next/no-img-element -- the OG
                route returns a dynamically-sized PNG; next/image would add no
                value and can't optimise an on-the-fly endpoint. */}
            <img
              src={imageUrl || generatedPreview}
              alt=""
              className="block aspect-[1200/630] w-full bg-background object-cover"
            />
          </div>

          <Field
            label="Preview Image URL"
            htmlFor="featured_image_url"
            hint={
              imageUrl
                ? "Remove this to fall back to the generated card."
                : "Leave blank and a branded card is generated automatically from the title and category."
            }
          >
            <input
              id="featured_image_url"
              name="featured_image_url"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
              className={cn(inputClass, "font-mono text-xs")}
            />
          </Field>

          <Field
            label="Image Alt Text"
            htmlFor="featured_image_alt"
            hint="Describe the image for readers who cannot see it. Used on the featured image and as og:image:alt."
          >
            <input
              id="featured_image_alt"
              name="featured_image_alt"
              defaultValue={post?.featured_image_alt ?? ""}
              placeholder="Spectators watching from the main grandstand"
              className={inputClass}
            />
          </Field>

          {!imageUrl ? (
            <p className="mt-2 rounded-md border-2 border-line bg-background px-3 py-2 text-xs text-muted">
              Auto-generated. Nothing is written to the database — the card is
              rendered on demand, so it restyles itself if the brand changes.
            </p>
          ) : null}

          <Link
            href="/admin/media"
            className="stamp mt-2 block rounded-md border-2 border-line px-3 py-2 text-center text-muted hover:border-text hover:text-text"
          >
            Open media library
          </Link>
        </div>
      </aside>
    </form>
  );
}

/**
 * FAQ rows serialise as parallel faq_question[] / faq_answer[] inputs, which the
 * server action zips back together. Stored in the faq_items jsonb column, not in
 * the body — the post template renders it and emits FAQPage schema.
 */
function FaqEditor({
  items,
  onChange,
}: {
  items: FaqItem[];
  onChange: (next: FaqItem[]) => void;
}) {
  const update = (i: number, patch: Partial<FaqItem>) => {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  };

  return (
    <div className="rounded-xl border-2 border-text bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="stamp text-muted">FAQ</h2>
        <button
          type="button"
          onClick={() => onChange([...items, { question: "", answer: "" }])}
          className="stamp rounded-md border-2 border-text bg-background px-2.5 py-1 transition-colors hover:bg-primary hover:text-white"
        >
          + Add question
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">
          No FAQ yet. These render as an accordion and emit FAQPage schema
          automatically.
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="rounded-lg border-2 border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="stamp text-muted">Question {i + 1}</span>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                  className="stamp text-muted hover:text-text"
                >
                  Remove
                </button>
              </div>
              <input
                name="faq_question"
                value={item.question}
                onChange={(e) => update(i, { question: e.target.value })}
                placeholder="Question"
                className={cn(inputClass, "mb-2")}
              />
              <textarea
                name="faq_answer"
                value={item.answer}
                onChange={(e) => update(i, { answer: e.target.value })}
                rows={3}
                placeholder="Answer"
                className={inputClass}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">
        Blank rows are ignored when saving.
      </p>
    </div>
  );
}
