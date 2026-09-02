#!/usr/bin/env node
/**
 * Publish posts whose scheduled date has arrived.
 *
 * Posts are written as status='draft' with published_at set to a future date.
 * Site queries filter on status='published' only (they do not compare
 * published_at to now), so a draft stays invisible until this script flips it.
 *
 * Usage:
 *   node scripts/publishing/publish-due.js            # publish anything due
 *   node scripts/publishing/publish-due.js --dry-run  # show what would publish
 *   node scripts/publishing/publish-due.js --list     # show the whole queue
 */

const SITE_ID = "7635559c-2c64-4d76-8b3b-1c69e4a412f8";
const SUPABASE_URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const listOnly = process.argv.includes("--list");

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function sb(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
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

  const due = await sb(
    `posts?site_id=eq.${SITE_ID}&status=eq.draft&published_at=lte.${now}&select=id,slug,title,published_at&order=published_at.asc`
  );

  if (!due.length) {
    console.log("Nothing due to publish.");
    return;
  }

  console.log(`${due.length} post(s) due:`);
  for (const p of due) console.log(`  - ${p.slug}`);

  if (dryRun) {
    console.log("\nDry run: nothing was changed.");
    return;
  }

  // Publish one at a time so a failure part-way leaves a clear record.
  let published = 0;
  for (const p of due) {
    await sb(`posts?id=eq.${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "published" }),
      headers: { Prefer: "return=minimal" },
    });
    console.log(`published: ${p.slug}`);
    published++;
  }

  console.log(`\nPublished ${published}/${due.length}.`);
  // Signal the workflow so it only redeploys when something actually changed.
  if (process.env.GITHUB_OUTPUT) {
    require("fs").appendFileSync(process.env.GITHUB_OUTPUT, `published=${published}\n`);
  }
})().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
