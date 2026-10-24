"use client";

import { useState } from "react";
import Link from "next/link";

import type { AdminPrintable } from "@/lib/admin/data";

/**
 * Attach printables to the post being edited.
 *
 * Selections are submitted as repeated `printable_ids` inputs, in list order —
 * the server action zips them into post_printables with that order as
 * sort_order. Attached printables render as callouts at the end of the article,
 * unless the body already mentions one inline with {{printable:slug}}, in which
 * case it appears there instead and is skipped at the end.
 */
export function PrintablePicker({
  available,
  initialIds,
  onInsertShortcode,
}: {
  available: AdminPrintable[];
  initialIds: string[];
  /** Drops a {{printable:slug}} token into the body at the cursor. */
  onInsertShortcode?: (slug: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initialIds);

  const byId = new Map(available.map((p) => [p.id, p]));
  const attached = selected.map((id) => byId.get(id)).filter(Boolean) as AdminPrintable[];
  const unattached = available.filter((p) => !selected.includes(p.id));

  const move = (i: number, delta: number) => {
    const target = i + delta;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected];
    [next[i], next[target]] = [next[target], next[i]];
    setSelected(next);
  };

  return (
    <div className="rounded-xl border-2 border-text bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="stamp text-muted">Printables</h2>
        <Link
          href="/admin/printables/new"
          target="_blank"
          className="stamp rounded-md border-2 border-text bg-background px-2.5 py-1 transition-colors hover:bg-primary hover:text-white"
        >
          + Upload new
        </Link>
      </div>

      {/* Submitted with the form; order here becomes sort_order. */}
      {selected.map((id) => (
        <input key={id} type="hidden" name="printable_ids" value={id} />
      ))}

      {available.length === 0 ? (
        <p className="text-sm text-muted">
          No printables yet.{" "}
          <Link
            href="/admin/printables/new"
            target="_blank"
            className="text-primary underline"
          >
            Create one
          </Link>{" "}
          and it will appear here.
        </p>
      ) : (
        <>
          {attached.length > 0 && (
            <ul className="mb-4 space-y-2">
              {attached.map((p, i) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border-2 border-line p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="truncate font-mono text-xs text-muted">
                      /{p.slug}
                      {!p.file_url && " · no file yet"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {onInsertShortcode && (
                      <button
                        type="button"
                        onClick={() => onInsertShortcode(p.slug)}
                        title="Insert a mention at the cursor in the body"
                        className="rounded-md border-2 border-line px-2 py-1 text-xs text-muted hover:border-text hover:text-text"
                      >
                        ↩ Mention
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      className="rounded-md border-2 border-line px-2 py-1 text-xs text-muted disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === attached.length - 1}
                      aria-label="Move down"
                      className="rounded-md border-2 border-line px-2 py-1 text-xs text-muted disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSelected(selected.filter((id) => id !== p.id))
                      }
                      aria-label={`Detach ${p.title}`}
                      className="rounded-md border-2 border-line px-2 py-1 text-xs text-muted hover:border-text hover:text-text"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {unattached.length > 0 ? (
            <label className="block">
              <span className="stamp mb-1.5 block text-muted">Attach one</span>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) setSelected([...selected, e.target.value]);
                }}
                className="w-full rounded-lg border-2 border-line bg-surface px-3 py-2 font-body text-sm text-text outline-none focus:border-primary"
              >
                <option value="">Choose a printable…</option>
                {unattached.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-xs text-muted">All printables are attached.</p>
          )}
        </>
      )}

      <p className="mt-3 text-xs text-muted">
        Attached printables show as download callouts under the article. Use
        &ldquo;Mention&rdquo; to place one mid-article instead.
      </p>
    </div>
  );
}
