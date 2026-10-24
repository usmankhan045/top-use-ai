import type { Metadata } from "next";
import Link from "next/link";

import { getSession } from "@/lib/admin/session";
import { logoutAction } from "@/lib/admin/actions";
import { siteConfig } from "@/lib/site.config";
import AdminNav from "./AdminNav";

export const metadata: Metadata = {
  title: `Admin · ${siteConfig.name}`,
  // The dashboard must never be indexed, and must never appear in the sitemap.
  robots: { index: false, follow: false, nocache: true },
};

// Always render fresh: the dashboard reads and writes live data, and the
// session cookie makes these routes request-time anyway.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // The login page nests under /admin but must render without the shell.
  // It calls this layout too, so bail out to a bare frame when logged out
  // rather than rendering a sidebar to an anonymous visitor.
  if (!session) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b-2 border-text bg-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r-2">
          <div className="flex items-center gap-3 border-b-2 border-line px-5 py-5">
            <span
              aria-hidden
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-white"
            >
              {siteConfig.brand.monogram}
            </span>
            <span className="font-display text-base font-bold leading-tight">
              Control Room
            </span>
          </div>

          <AdminNav />

          <div className="border-t-2 border-line p-4">
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="stamp block rounded-md border-2 border-line px-3 py-2 text-center text-muted transition-colors hover:border-text hover:text-text"
            >
              View site ↗
            </Link>
            <form action={logoutAction} className="mt-2">
              <button
                type="submit"
                className="stamp w-full rounded-md border-2 border-line px-3 py-2 text-muted transition-colors hover:border-text hover:text-text"
              >
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
