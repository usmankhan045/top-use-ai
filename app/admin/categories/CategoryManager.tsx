"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";

import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type ActionState,
} from "@/lib/admin/actions";
import type { Category } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ErrorBanner, Field, Panel, SuccessBanner, inputClass } from "../ui";

const initialState: ActionState = {};

type CategoryRow = Category & { postCount: number };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">
        {categories.length === 0 ? (
          <Panel>
            <p className="text-sm text-muted">
              No categories yet. Create the first one on the right.
            </p>
          </Panel>
        ) : (
          categories.map((cat) =>
            editing === cat.id ? (
              <EditCard
                key={cat.id}
                category={cat}
                onDone={() => setEditing(null)}
              />
            ) : (
              <ViewCard
                key={cat.id}
                category={cat}
                onEdit={() => setEditing(cat.id)}
              />
            )
          )
        )}
      </div>

      <CreateCard />
    </div>
  );
}

function ViewCard({
  category,
  onEdit,
}: {
  category: CategoryRow;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border-2 border-text bg-surface p-4">
      <div className="min-w-0">
        <p className="font-display text-base font-bold">{category.name}</p>
        <p className="font-mono text-xs text-muted">/category/{category.slug}</p>
        {category.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {category.description}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="stamp whitespace-nowrap text-muted">
          {category.postCount} post{category.postCount === 1 ? "" : "s"}
        </span>
        <Link
          href={`/admin/posts?category=${category.id}`}
          className="stamp rounded-md border-2 border-line px-2 py-1 text-muted hover:border-text hover:text-text"
        >
          View
        </Link>
        <button
          type="button"
          onClick={onEdit}
          className="stamp rounded-md border-2 border-text bg-background px-2 py-1 transition-colors hover:bg-primary hover:text-white"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

function EditCard({
  category,
  onDone,
}: {
  category: CategoryRow;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateCategoryAction.bind(null, category.id),
    initialState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCategoryAction,
    initialState
  );

  // Collapse back to the read-only card once the save lands.
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  return (
    <div className="rounded-xl border-2 border-primary bg-surface p-4">
      <form action={formAction} className="space-y-3">
        <ErrorBanner message={state.error} />

        <Field label="Name" htmlFor={`name-${category.id}`}>
          <input
            id={`name-${category.id}`}
            name="name"
            defaultValue={category.name}
            required
            className={inputClass}
          />
        </Field>

        <Field
          label="Slug"
          htmlFor={`slug-${category.id}`}
          hint="This is a live, indexed URL. Changing it forfeits that page's ranking."
        >
          <input
            id={`slug-${category.id}`}
            name="slug"
            defaultValue={category.slug}
            required
            className={cn(inputClass, "font-mono")}
          />
        </Field>

        <Field label="Description" htmlFor={`desc-${category.id}`}>
          <textarea
            id={`desc-${category.id}`}
            name="description"
            rows={2}
            defaultValue={category.description ?? ""}
            className={inputClass}
          />
        </Field>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border-2 border-text bg-primary px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg border-2 border-line px-3 py-1.5 text-sm font-bold text-muted"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Deleting a category with posts would violate the posts.category_id
          foreign key, so the action refuses and explains — surfaced here. */}
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm(`Delete the "${category.name}" category?`)) {
            e.preventDefault();
          }
        }}
        className="mt-3 border-t-2 border-line pt-3"
      >
        <input type="hidden" name="id" value={category.id} />
        <ErrorBanner message={deleteState.error} />
        <button
          type="submit"
          disabled={deleting}
          className="stamp text-muted underline hover:text-text disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete category"}
        </button>
      </form>
    </div>
  );
}

function CreateCard() {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    initialState
  );
  const [name, setName] = useState("");
  // Derived during render until the admin edits it directly.
  const [slugOverride, setSlugOverride] = useState<string | null>(null);
  const slug = slugOverride ?? slugify(name);

  // Clear the form after a successful create so the next one starts clean.
  // This IS an effect-worthy case — it synchronises local state with an
  // external event (the server's response), which is exactly what the rule's
  // documentation carves out — but the linter can't distinguish it from the
  // derive-during-render mistakes above.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (state.ok) {
      setName("");
      setSlugOverride(null);
    }
  }, [state.ok]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <Panel title="New category" className="lg:sticky lg:top-8 lg:self-start">
      <form action={formAction} className="space-y-3">
        <ErrorBanner message={state.error} />
        <SuccessBanner message={state.ok ? "Category created." : undefined} />

        <Field label="Name" htmlFor="new-name">
          <input
            id="new-name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fan Zone Guide"
            className={inputClass}
          />
        </Field>

        <Field label="Slug" htmlFor="new-slug">
          <input
            id="new-slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => setSlugOverride(e.target.value)}
            className={cn(inputClass, "font-mono")}
          />
        </Field>

        <Field label="Description" htmlFor="new-desc">
          <textarea
            id="new-desc"
            name="description"
            rows={3}
            className={inputClass}
          />
        </Field>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg border-2 border-text bg-primary px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create category"}
        </button>
      </form>
    </Panel>
  );
}
