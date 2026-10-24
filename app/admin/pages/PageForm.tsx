"use client";

import { useActionState, useState } from "react";

import type { ActionState } from "@/lib/admin/actions";
import type { Page } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ErrorBanner, Field, SuccessBanner, inputClass } from "../ui";

const initialState: ActionState = {};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function PageForm({
  action,
  page,
  submitLabel,
  justCreated,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  page?: Page;
  submitLabel: string;
  justCreated?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const isEdit = Boolean(page);
  const [title, setTitle] = useState(page?.title ?? "");

  // Derived during render until the admin edits the slug directly — see the
  // same pattern and reasoning in PostForm.
  const [slugOverride, setSlugOverride] = useState<string | null>(
    page?.slug ?? null
  );
  const slug = slugOverride ?? slugify(title);

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      <ErrorBanner message={state.error} />
      <SuccessBanner
        message={state.ok ? "Saved." : justCreated ? "Page created." : undefined}
      />

      <div className="rounded-xl border-2 border-text bg-surface p-5">
        <div className="space-y-4">
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={cn(inputClass, "font-display text-lg font-bold")}
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            hint={
              isEdit
                ? "This is the live URL. Changing it breaks existing links unless you add a redirect."
                : "The page will be served at /<slug>."
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
          </Field>
        </div>
      </div>

      <div className="rounded-xl border-2 border-text bg-surface p-5">
        <Field
          label="Body"
          htmlFor="content"
          hint="Markdown, rendered as MDX — { } and < > are special. Checked on save."
        >
          <textarea
            id="content"
            name="content"
            rows={20}
            defaultValue={page?.content ?? ""}
            className={cn(inputClass, "font-mono leading-relaxed")}
          />
        </Field>
      </div>

      <div className="rounded-xl border-2 border-text bg-surface p-5">
        <h2 className="stamp mb-4 text-muted">Search appearance</h2>
        <div className="space-y-4">
          <Field label="SEO title" htmlFor="seo_title">
            <input
              id="seo_title"
              name="seo_title"
              defaultValue={page?.seo_title ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Meta description" htmlFor="seo_description">
            <textarea
              id="seo_description"
              name="seo_description"
              rows={3}
              defaultValue={page?.seo_description ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border-2 border-text bg-primary px-5 py-2.5 font-body text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
