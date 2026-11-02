#!/usr/bin/env node
/**
 * Publish posts whose scheduled date has arrived.
 *
 * Admin-scheduled posts use status='scheduled' with a future publish_at. Older
 * queued posts use status='draft' with a future published_at. Site queries
 * filter on status='published' only, so both stay invisible until this script
 * flips them.
 *
 * Idempotent: the database is the source of truth. A post already published is
 * never touched again, so re-runs, delayed runs and overlapping runs are safe.
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (required)
 *   DRY_RUN=1        optional - log what would publish, change nothing
 *   MAX_PER_RUN=50   optional - safety cap on publishes per run (default 50)
 *
 * Usage:
 *   node scripts/publishing/publish-due.js            # publish anything due
 *   node scripts/publishing/publish-due.js --dry-run  # show what would publish
 *   node scripts/publishing/publish-due.js --list     # show the whole queue
 */

const SITE_ID = "7635559c-2c64-4d76-8b3b-1c69e4a412f8";

// Normalize the URL defensively: trim whitespace/newlines, add https:// if the
// scheme was omitted, and strip any trailing slash. A malformed SUPABASE_URL
// secret (missing scheme is the classic one) otherwise throws "Invalid URL"
// deep inside fetch, with nothing pointing at the real cause.
function normalizeUrl(raw) {
  let u = (raw || "").trim().replace(/\/+$/, "");
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

const BASE = normalizeUrl(process.env.SUPABASE_URL);
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";
const listOnly = process.argv.includes("--list");
const MAX_PER_RUN = Number(process.env.MAX_PER_RUN || 50);

if (!BASE || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
try {
  new URL(BASE);
} catch {
  console.error(
    `SUPABASE_URL is not a valid URL after normalization: "${BASE}". ` +
      `It should look like https://<project-ref>.supabase.co`
  );
  process.exit(1);
}
if (!Number.isInteger(MAX_PER_RUN) || MAX_PER_RUN < 1) {
  console.error("MAX_PER_RUN must be a positive integer");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function sb(path, init = {}) {
  const res = await fetch(`${BASE}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  // PATCH with Prefer: return=minimal answers 204 with an empty body, which
  // res.json() would choke on. Only parse when there is something to parse.
  const body = await res.text();
  return body ? JSON.parse(body) : null;
}

function byDueAt(a, b) {
  return a.dueAt.localeCompare(b.dueAt);
}

async function getQueue(now, dueOnly) {
  const scheduledFilter = dueOnly ? `&publish_at=lte.${now}` : "";
  const legacyFilter = dueOnly ? `&published_at=lte.${now}` : "";
  const select = dueOnly
    ? "id,slug,title,publish_at,published_at,categories(slug)"
    : "slug,title,publish_at,published_at";

  const [scheduled, legacy] = await Promise.all([
    sb(
      `posts?site_id=eq.${SITE_ID}&status=eq.scheduled${scheduledFilter}` +
        `&select=${select}&order=publish_at.asc`
    ),
    sb(
      `posts?site_id=eq.${SITE_ID}&status=eq.draft${legacyFilter}` +
        `&select=${select}&order=published_at.asc`
    ),
  ]);

  return [
    ...scheduled.map((post) => ({
      ...post,
      queueStatus: "scheduled",
      dueAt: post.publish_at,
    })),
    ...legacy.map((post) => ({
      ...post,
      queueStatus: "draft",
      dueAt: post.published_at,
    })),
  ]
    .filter((post) => post.dueAt)
    .sort(byDueAt);
}

(async () => {
  const now = new Date().toISOString();

  if (listOnly) {
    const queue = await getQueue(now, false);
    if (!queue.length) return console.log("Queue is empty.");
    console.log(`Queued posts (${queue.length}):`);
    for (const p of queue) {
      const due = p.dueAt <= now ? "DUE" : "   ";
      console.log(
        `  ${due}  ${p.dueAt.slice(0, 10)}  ${p.queueStatus.padEnd(9)}  ${p.slug}`
      );
    }
    return;
  }

  // The current status is the idempotency guard: anything already published
  // has left both queue sets and cannot be picked up twice. Categories are
  // joined so revalidation can refresh the archive a post lands in.
  const due = await getQueue(now, true);

  if (!due.length) {
    console.log("Nothing due to publish.");
    return;
  }

  const batch = due.slice(0, MAX_PER_RUN);
  console.log(
    `${due.length} post(s) due (cap ${MAX_PER_RUN})${dryRun ? " [DRY RUN]" : ""}:`
  );
  for (const p of batch) {
    console.log(`  - ${p.slug} (${p.dueAt}, ${p.queueStatus})`);
  }
  if (due.length > batch.length) {
    console.log(`  ...${due.length - batch.length} more, next run will catch up.`);
  }

  if (dryRun) {
    console.log("\nDry run: nothing was changed.");
    return;
  }

  // Publish one at a time so a failure part-way leaves a clear record, and one
  // bad row cannot abort the posts behind it.
  const publishedPosts = [];
  const errors = [];
  for (const p of batch) {
    try {
      const payload =
        p.queueStatus === "scheduled"
          ? { status: "published", published_at: now, publish_at: null }
          : { status: "published" };
      const updated = await sb(
        `posts?id=eq.${p.id}&site_id=eq.${SITE_ID}` +
          `&status=eq.${p.queueStatus}&select=id`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
          headers: { Prefer: "return=representation" },
        }
      );
      if (!Array.isArray(updated) || updated.length !== 1) {
        throw new Error(
          "conditional update matched no row; it may have been published by another run"
        );
      }
      console.log(`published: ${p.slug}`);
      publishedPosts.push(p);
    } catch (err) {
      errors.push([p.slug, err.message]);
      console.error(`FAILED: ${p.slug} -> ${err.message}`);
    }
  }

  console.log(`\nDONE: published ${publishedPosts.length}/${batch.length}.`);

  // Signal the workflow so it only revalidates when something actually changed.
  // Slugs and categories go out too, so revalidation can target the handful of
  // affected pages instead of forcing a rebuild of the whole site.
  if (process.env.GITHUB_OUTPUT) {
    const slugs = publishedPosts.map((p) => p.slug).join(",");
    const categories = [
      ...new Set(publishedPosts.map((p) => p.categories?.slug).filter(Boolean)),
    ].join(",");
    require("fs").appendFileSync(
      process.env.GITHUB_OUTPUT,
      `published=${publishedPosts.length}\nslugs=${slugs}\ncategories=${categories}\n`
    );
  }

  if (errors.length) {
    console.error("ERRORS:");
    for (const [s, m] of errors) console.error(`  ${s} -> ${m}`);
    process.exit(1);
  }
})().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
