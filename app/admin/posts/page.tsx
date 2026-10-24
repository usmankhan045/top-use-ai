import Link from "next/link";

import { listPosts, listCategories } from "@/lib/admin/data";
import { togglePostStatusAction } from "@/lib/admin/actions";
import { postPath } from "@/lib/utils";
import {
  EmptyState,
  LinkButton,
  PageHeader,
  StatusPill,
  SuccessBanner,
  inputClass,
} from "../ui";
import { adminCategoryLabel } from "@/lib/admin/category-label";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
    page?: string;
    deleted?: string;
  }>;
}) {
  const sp = await searchParams;

  const status =
    sp.status === "published" || sp.status === "scheduled" || sp.status === "draft"
      ? sp.status
      : "all";
  const page = Math.max(1, Number(sp.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [{ posts, total }, categories] = await Promise.all([
    listPosts({
      status,
      categoryId: sp.category || undefined,
      search: sp.q || undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    listCategories(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Preserve active filters when moving between pages.
  const qs = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = {
      status: status === "all" ? undefined : status,
      category: sp.category || undefined,
      q: sp.q || undefined,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const str = params.toString();
    return str ? `?${str}` : "";
  };

  return (
    <>
      <PageHeader
        title="Posts"
        description={`${total} post${total === 1 ? "" : "s"} on this site.`}
        action={<LinkButton href="/admin/posts/new">New post</LinkButton>}
      />

      <SuccessBanner message={sp.deleted ? "Post deleted." : undefined} />

      {/* Filters — a plain GET form so the state lives in the URL and is
          shareable and back-button friendly. No client JS needed. */}
      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="q" className="stamp mb-1.5 block text-muted">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Title or slug…"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className="stamp mb-1.5 block text-muted">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status === "all" ? "" : status}
            className={inputClass}
          >
            <option value="">All</option>
            <option value="published">Live</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div>
          <label htmlFor="category" className="stamp mb-1.5 block text-muted">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={sp.category ?? ""}
            className={inputClass}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {adminCategoryLabel(c, categories)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg border-2 border-text bg-surface px-4 py-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
        >
          Filter
        </button>
      </form>

      {posts.length === 0 ? (
        <EmptyState
          title="No posts match"
          description="Try clearing the filters, or write something new."
          action={<LinkButton href="/admin/posts/new">New post</LinkButton>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border-2 border-text bg-surface">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-text text-left">
                <th className="stamp px-4 py-3 text-muted">Title</th>
                <th className="stamp px-4 py-3 text-muted">Category</th>
                <th className="stamp px-4 py-3 text-muted">Status</th>
                <th className="stamp px-4 py-3 text-muted">Updated</th>
                <th className="stamp px-4 py-3 text-right text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b-2 border-line last:border-b-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {post.title}
                    </Link>
                    <div className="mt-0.5 font-mono text-xs text-muted">
                      {postPath(post.slug)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {post.categories?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDate(post.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {post.status === "published" ? (
                        <Link
                          href={postPath(post.slug)}
                          target="_blank"
                          rel="noreferrer"
                          className="stamp text-muted hover:text-text"
                        >
                          View ↗
                        </Link>
                      ) : null}

                      <form action={togglePostStatusAction}>
                        <input type="hidden" name="id" value={post.id} />
                        <input
                          type="hidden"
                          name="next_status"
                          value={post.status === "published" ? "draft" : "published"}
                        />
                        <button
                          type="submit"
                          className="stamp rounded-md border-2 border-line px-2 py-1 text-muted transition-colors hover:border-text hover:text-text"
                        >
                          {post.status === "published" ? "Unpublish" : "Publish now"}
                        </button>
                      </form>

                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="stamp rounded-md border-2 border-text bg-background px-2 py-1 transition-colors hover:bg-primary hover:text-white"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-6 flex items-center justify-between" aria-label="Pagination">
          <span className="text-sm text-muted">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={`/admin/posts${qs({ page: String(page - 1) })}`}
                className="rounded-lg border-2 border-text bg-surface px-3 py-1.5 text-sm font-bold"
              >
                ← Previous
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={`/admin/posts${qs({ page: String(page + 1) })}`}
                className="rounded-lg border-2 border-text bg-surface px-3 py-1.5 text-sm font-bold"
              >
                Next →
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
