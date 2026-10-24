"use client";

import { useActionState, useState } from "react";

import {
  deleteMediaAction,
  uploadMediaAction,
  type ActionState,
  type UploadState,
} from "@/lib/admin/actions";
// Type-only — a value import from lib/admin/media would pull the Supabase
// service-role client into the browser bundle.
import type { MediaItem } from "@/lib/admin/media";
import { ErrorBanner, Panel, SuccessBanner } from "../ui";

const initialUpload: UploadState = {};
const initialDelete: ActionState = {};

function formatBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MediaLibrary({
  items,
  unavailable,
}: {
  items: MediaItem[];
  unavailable?: string;
}) {
  const [upload, uploadAction, uploading] = useActionState(
    uploadMediaAction,
    initialUpload
  );
  const [del, deleteAction] = useActionState(deleteMediaAction, initialDelete);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard can be blocked by permissions; the URL is selectable anyway.
    }
  };

  return (
    <div className="space-y-6">
      <Panel title="Upload">
        <form action={uploadAction} className="flex flex-wrap items-center gap-3">
          <ErrorBanner message={upload.error} />
          <input
            type="file"
            name="file"
            required
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif,application/pdf"
            className="max-w-full text-sm file:mr-3 file:rounded-md file:border-2 file:border-text file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-bold"
          />
          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg border-2 border-text bg-primary px-4 py-2 text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </form>

        {upload.ok && upload.url ? (
          <div className="mt-3">
            <SuccessBanner message="Uploaded." />
            <button
              type="button"
              onClick={() => copy(upload.url!)}
              className="stamp rounded-md border-2 border-line px-3 py-1.5 text-muted hover:border-text hover:text-text"
            >
              {copied === upload.url ? "Copied ✓" : "Copy URL"}
            </button>
          </div>
        ) : null}

        <p className="mt-3 text-xs text-muted">
          Max 8MB. JPEG, PNG, GIF, WebP, AVIF or PDF.
        </p>
      </Panel>

      <ErrorBanner message={del.error} />

      {unavailable ? (
        <Panel>
          <p className="text-sm font-medium">The media bucket isn&apos;t readable.</p>
          <p className="mt-1 text-sm text-muted">
            Supabase said: <span className="font-mono">{unavailable}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Create a public Storage bucket named{" "}
            <span className="font-mono">media</span> in the Supabase dashboard.
            Uploads and the rest of the dashboard work regardless — only this
            listing depends on it.
          </p>
        </Panel>
      ) : items.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            Nothing uploaded yet. Posts without an image fall back to a generated
            card, so this is optional.
          </p>
        </Panel>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <li
              key={item.path}
              className="overflow-hidden rounded-xl border-2 border-text bg-surface"
            >
              <div className="aspect-[4/3] bg-background">
                {/* eslint-disable-next-line @next/next/no-img-element -- user
                    uploads of unknown dimensions; next/image adds no value in a
                    thumbnail grid behind auth. */}
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-3">
                <p className="truncate font-mono text-xs" title={item.name}>
                  {item.name}
                </p>
                <p className="stamp mt-1 text-muted">{formatBytes(item.size)}</p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copy(item.url)}
                    className="stamp flex-1 rounded-md border-2 border-line px-2 py-1 text-muted hover:border-text hover:text-text"
                  >
                    {copied === item.url ? "Copied ✓" : "Copy URL"}
                  </button>

                  <form
                    action={deleteAction}
                    onSubmit={(e) => {
                      if (!window.confirm(`Delete ${item.name}?`)) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="path" value={item.path} />
                    <button
                      type="submit"
                      className="stamp rounded-md border-2 border-line px-2 py-1 text-muted hover:border-text hover:text-text"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
