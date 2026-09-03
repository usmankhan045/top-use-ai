#!/usr/bin/env node
/**
 * Publish posts whose scheduled date has arrived.
 *
 * Posts are written as status='draft' with a future published_at. Site queries
 * filter on status='published' only (they do not compare published_at to now),
 * so a draft stays invisible until this script flips it.
 *
 * Idempotent: the database is the source of truth. A post already published is
 * never touched again, so re-runs, delayed runs and overlapping runs are safe.
 * The workflow cron therefore runs every 30 minutes rather than once a day — a
 * missed tick self-corrects on the next one instead of slipping a full day.
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (required)
 *   DRY_RUN=1        optional — log what would publish, change nothing
 *   MAX_PER_RUN=12   optional — safety cap on publishes per run (default 12)
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
const MAX_PER_RUN = Number(process.env.MAX_PER_RUN || 12);

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

(async () => {
  const now = new Date().toISOString();

  if (listOnly) {
    const queue = await sb(
      `posts?site_id=eq.${SITE_ID}&status=eq.draft&select=slug,title,published_at&order=published_at.asc`
    );
    if (!queue.length) return console.log("Queue is empty.");
    console.log(`Scheduled drafts (${queue.length}):`);
    for (const p of queue) {
      const due = p.published_at && p.published_at <= now ? "DUE" : "   ";
      console.log(`  ${due}  ${(p.published_at || "no date").slice(0, 10)}  ${p.slug}`);
    }
    return;
  }

  // status=draft is itself the idempotency guard: anything already published
  // has left this set and cannot be picked up twice. categories is joined so
  // revalidation can refresh the archive a post lands in, not just the post.
  const due = await sb(
    `posts?site_id=eq.${SITE_ID}&status=eq.draft&published_at=lte.${now}` +
      `&select=id,slug,title,published_at,categories(slug)&order=published_at.asc`
  );

  if (!due.length) {
    console.log("Nothing due to publish.");
    return;
  }

  const batch = due.slice(0, MAX_PER_RUN);
  console.log(
    `${due.length} post(s) due (cap ${MAX_PER_RUN})${dryRun ? " [DRY RUN]" : ""}:`
  );
  for (const p of batch) console.log(`  - ${p.slug} (${p.published_at})`);
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
      await sb(`posts?id=eq.${p.id}&status=eq.draft`, {
        method: "PATCH",
        body: JSON.stringify({ status: "published" }),
        headers: { Prefer: "return=minimal" },
      });
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
