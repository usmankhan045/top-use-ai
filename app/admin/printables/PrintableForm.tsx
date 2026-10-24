"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import type { ActionState } from "@/lib/admin/actions";
import type { AdminPrintable } from "@/lib/admin/data";
import type { Category } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ErrorBanner, Field, SuccessBanner, inputClass } from "../ui";
import { FileUploadField } from "../FileUploadField";
import { adminCategoryLabel } from "@/lib/admin/category-label";

const initialState: ActionState = {};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export default function PrintableForm({
  action,
  printable,
  categories,
  submitLabel,
  justCreated,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  printable?: AdminPrintable;
  categories: Category[];
  submitLabel: string;
  justCreated?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const isEdit = Boolean(printable);
  const [title, setTitle] = useState(printable?.title ?? "");
  const [slugOverride, setSlugOverride] = useState<string | null>(
    printable?.slug ?? null
  );
  const slug = slugOverride ?? slugify(title);

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <ErrorBanner message={state.error} />
        <SuccessBanner
          message={
            state.ok ? "Saved." : justCreated ? "Printable created." : undefined
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
                placeholder="AI tool evaluation checklist"
                className={cn(inputClass, "font-display text-lg font-bold")}
              />
            </Field>

            <Field
              label="Slug"
              htmlFor="slug"
              hint={
                isEdit
                  ? "This is the live URL at /free-printables/<slug>. Changing it breaks existing links."
                  : "Auto-generated from the title."
              }
            >
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono text-sm text-muted">
                  /free-printables/
                </span>
                <input
                  id="slug"
                  name="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlugOverride(e.target.value)}
                  className={cn(inputClass, "font-mono")}
                />
              </div>
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              hint="Shown on the card, the download page, and any in-post callout."
            >
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={printable?.description ?? ""}
                placeholder="Every document you need at the border, in one page you can tick off."
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <h2 className="stamp mb-4 text-muted">Files</h2>
          <div className="space-y-5">
            <FileUploadField
              label="PDF file"
              name="file_url"
              accept="application/pdf"
              defaultValue={printable?.file_url ?? ""}
              hint="The download itself. Upload a PDF or paste a URL. Until this is set, the page shows a 'being prepared' notice instead of a dead button."
            />

            <FileUploadField
              label="Thumbnail"
              name="thumbnail_url"
              accept="image/jpeg,image/png,image/webp,image/avif"
              defaultValue={printable?.thumbnail_url ?? ""}
              hint="Optional. Leave blank and a branded card is generated from the title, the same as posts without an image."
            />
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-xl border-2 border-text bg-surface p-5">
          <div className="space-y-4">
            <Field label="Category" htmlFor="category_id">
              <select
                id="category_id"
                name="category_id"
                defaultValue={printable?.category_id ?? ""}
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
              label="Orientation"
              htmlFor="orientation"
              hint="Sets the shape of the on-page preview."
            >
              <select
                id="orientation"
                name="orientation"
                defaultValue={printable?.orientation ?? "portrait"}
                className={inputClass}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </Field>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 w-full rounded-lg border-2 border-text bg-primary px-4 py-2.5 font-body text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {pending ? "Saving…" : submitLabel}
          </button>

          {isEdit && printable ? (
            <Link
              href={`/free-printables/${printable.slug}`}
              target="_blank"
              rel="noreferrer"
              className="stamp mt-2 block rounded-md border-2 border-line px-3 py-2 text-center text-muted hover:border-text hover:text-text"
            >
              View live ↗
            </Link>
          ) : null}
        </div>

        {isEdit && printable ? (
          <div className="rounded-xl border-2 border-text bg-surface p-5">
            <h2 className="stamp mb-2 text-muted">Mention in a post</h2>
            <p className="mb-2 text-xs text-muted">
              Paste this into any post body to drop a download callout at that
              exact point:
            </p>
            <code className="block break-all rounded-md border-2 border-line bg-background px-3 py-2 font-mono text-xs">
              {`{{printable:${printable.slug}}}`}
            </code>
            <p className="mt-2 text-xs text-muted">
              Or attach it from the post editor&apos;s sidebar, which lists it at
              the end of the article instead.
            </p>
          </div>
        ) : null}
      </aside>
    </form>
  );
}
