import Link from "next/link";

import { listPrintables } from "@/lib/admin/data";
import {
  EmptyState,
  LinkButton,
  PageHeader,
  Panel,
  SuccessBanner,
} from "../ui";

export const dynamic = "force-dynamic";

export default async function PrintablesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { deleted } = await searchParams;
  const { printables, unavailable } = await listPrintables();

  return (
    <>
      <PageHeader
        title="Printables"
        description="Free downloads at /free-printables. Attach them to posts from the post editor."
        action={<LinkButton href="/admin/printables/new">New printable</LinkButton>}
      />

      <SuccessBanner message={deleted ? "Printable deleted." : undefined} />

      {unavailable ? (
        <Panel>
          <p className="text-sm font-medium">Printables aren&apos;t set up yet.</p>
          <p className="mt-1 text-sm text-muted">
            Supabase said: <span className="font-mono">{unavailable}</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            Run{" "}
            <span className="font-mono">
              supabase/migrations/005_printables.sql
            </span>{" "}
            against the database. It adds the <span className="font-mono">orientation</span>{" "}
            column and the post ↔ printable join table.
          </p>
        </Panel>
      ) : printables.length === 0 ? (
        <EmptyState
          title="No printables yet"
          description="Checklists, planners and trackers travelling fans can print and carry."
          action={<LinkButton href="/admin/printables/new">New printable</LinkButton>}
        />
      ) : (
        <div className="space-y-3">
          {printables.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-xl border-2 border-text bg-surface p-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/printables/${p.id}`}
                  className="font-display text-base font-bold hover:text-primary"
                >
                  {p.title}
                </Link>
                <p className="font-mono text-xs text-muted">/free-printables/{p.slug}</p>
                {!p.file_url && (
                  <p className="stamp mt-1 text-text">No file uploaded yet</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {typeof p.postCount === "number" && (
                  <span className="stamp whitespace-nowrap text-muted">
                    {p.postCount} post{p.postCount === 1 ? "" : "s"}
                  </span>
                )}
                <Link
                  href={`/free-printables/${p.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="stamp text-muted hover:text-text"
                >
                  View ↗
                </Link>
                <Link
                  href={`/admin/printables/${p.id}`}
                  className="stamp rounded-md border-2 border-text bg-background px-2 py-1 transition-colors hover:bg-primary hover:text-white"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
