import Link from "next/link";

import { listPages } from "@/lib/admin/data";
import { EmptyState, LinkButton, PageHeader, SuccessBanner } from "../ui";

export const dynamic = "force-dynamic";

export default async function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const pages = await listPages();

  return (
    <>
      <PageHeader
        title="Pages"
        description="Standalone pages served at the site root, alongside posts."
        action={<LinkButton href="/admin/pages/new">New page</LinkButton>}
      />

      <SuccessBanner message={deleted ? "Page deleted." : undefined} />

      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Pages are for evergreen content like About or Contact."
          action={<LinkButton href="/admin/pages/new">New page</LinkButton>}
        />
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between gap-4 rounded-xl border-2 border-text bg-surface p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="font-display text-base font-bold hover:text-primary"
                >
                  {page.title || page.slug}
                </Link>
                <p className="font-mono text-xs text-muted">/{page.slug}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="stamp text-muted hover:text-text"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="stamp rounded-md border-2 border-text bg-background px-2 py-1 transition-colors hover:bg-primary hover:text-white"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Several routes in app/ are hand-built React pages, not DB rows —
          editing those means editing the code, not this screen. */}
      <p className="mt-6 max-w-2xl text-xs text-muted">
        Note: some pages (About, Contact, the legal pages) are built as code in{" "}
        <span className="font-mono">app/</span> rather than stored here. Those
        are edited in the repo, not from this dashboard.
      </p>
    </>
  );
}
