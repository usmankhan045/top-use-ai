import Link from "next/link";

import { getDashboardStats, getThinPosts } from "@/lib/admin/data";
import { LinkButton, PageHeader, Panel, StatCard, StatusPill } from "./ui";
import { siteConfig } from "@/lib/site.config";

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboard() {
  const [stats, thin] = await Promise.all([getDashboardStats(), getThinPosts(8)]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Everything on ${siteConfig.domain} at a glance.`}
        action={<LinkButton href="/admin/posts/new">New post</LinkButton>}
      />

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Posts" value={stats.totalPosts} href="/admin/posts" />
        <StatCard
          label="Live"
          value={stats.published}
          href="/admin/posts?status=published"
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          href="/admin/posts?status=scheduled"
        />
        <StatCard
          label="Drafts"
          value={stats.drafts}
          href="/admin/posts?status=draft"
        />
        <StatCard label="Pages" value={stats.pages} href="/admin/pages" />
        <StatCard
          label="Categories"
          value={stats.categories}
          href="/admin/categories"
        />
        <StatCard label="Subscribers" value={stats.subscribers} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recently edited">
          {stats.recent.length === 0 ? (
            <p className="text-sm text-muted">No posts yet.</p>
          ) : (
            <ul className="divide-y-2 divide-line">
              {stats.recent.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-muted">
                      {formatDate(post.updated_at)}
                    </span>
                    <StatusPill status={post.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Needs attention">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <StatCard
              label="Using generated image"
              value={stats.missingImage}
              tone={stats.missingImage > 0 ? "warn" : "default"}
            />
            <StatCard
              label="Thin content"
              value={stats.thinContent}
              tone={stats.thinContent > 0 ? "warn" : "default"}
            />
          </div>

          <p className="mb-3 text-xs text-muted">
            Shortest posts first, so you can quickly find articles that need more
            depth before publication.
          </p>

          {thin.length === 0 ? (
            <p className="text-sm text-muted">Nothing thin. Good shape.</p>
          ) : (
            <ul className="divide-y-2 divide-line">
              {thin.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  <span className="stamp shrink-0 text-muted">
                    {post.words} words
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
