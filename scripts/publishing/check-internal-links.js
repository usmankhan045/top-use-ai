#!/usr/bin/env node
/**
 * Fail if any published post links to a /blog/<slug> that is not published.
 *
 * Those links are hard 404s for readers and wasted crawl budget. The site hit
 * 15 of them at once in September 2026 because posts were written to link
 * forward to drafts that had not shipped yet, so this check exists to catch
 * that before it reaches production rather than in the next audit.
 *
 *   node scripts/publishing/check-internal-links.js
 *
 * Exit 0 = clean, 1 = broken links found (prints them).
 *
 * See docs/PENDING-INTERNAL-LINKS.md for links deliberately removed and
 * awaiting their target's publish date.
 */

const fs = require("fs");
const path = require("path");

const SITE_ID = "7635559c-2c64-4d76-8b3b-1c69e4a412f8";
const ROOT = path.join(__dirname, "..", "..");

// Prefer real env vars (CI); fall back to .env.local for local runs.
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const envFile = path.join(ROOT, ".env.local");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  }
}

const BASE = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
if (!BASE || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

(async () => {
  const res = await fetch(
    `${BASE}/rest/v1/posts?site_id=eq.${SITE_ID}&select=slug,status,content`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  );
  if (!res.ok) {
    console.error(`Supabase ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const posts = await res.json();

  const published = new Set(
    posts.filter((p) => p.status === "published").map((p) => p.slug)
  );
  const known = new Set(posts.map((p) => p.slug));

  const broken = [];
  for (const p of posts.filter((x) => x.status === "published")) {
    const seen = new Set();
    for (const m of (p.content || "").matchAll(/\]\(\/blog\/([a-zA-Z0-9_-]+)/g)) {
      const target = m[1];
      if (published.has(target) || seen.has(target)) continue;
      seen.add(target);
      broken.push({
        from: p.slug,
        to: target,
        why: known.has(target) ? "still a draft" : "no such post",
      });
    }
  }

  if (!broken.length) {
    console.log(`✓ ${published.size} published posts, no broken internal links`);
    return;
  }
  console.error(`✗ ${broken.length} broken internal link(s):\n`);
  for (const b of broken) console.error(`  ${b.from} -> /blog/${b.to}  (${b.why})`);
  console.error("\nRemove the link, or publish the target. See docs/PENDING-INTERNAL-LINKS.md");
  process.exit(1);
})();
