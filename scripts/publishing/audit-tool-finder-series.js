#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SNAPSHOT = path.join(ROOT, "content", "tool-finder-article-drafts.json");
const REPORT = path.join(ROOT, "docs", "TOOL-FINDER-SERIES-AUDIT.md");
const SITE_ID = "7635559c-2c64-4d76-8b3b-1c69e4a412f8";

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

function links(content) {
  return [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
}

function shingles(content) {
  const words = content.toLowerCase().replace(/https?:\/\/\S+/g, " ").replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
  const result = new Set();
  for (let index = 0; index <= words.length - 7; index += 1) result.add(words.slice(index, index + 7).join(" "));
  return result;
}

function similarity(left, right) {
  let shared = 0;
  for (const item of left) if (right.has(item)) shared += 1;
  return shared / Math.max(1, Math.min(left.size, right.size));
}

async function fetchPublishedSlugs() {
  loadEnv();
  const base = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!base || !key) throw new Error("Missing Supabase credentials");
  const response = await fetch(`${base}/rest/v1/posts?site_id=eq.${SITE_ID}&status=eq.published&select=slug&limit=1000`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error(`Could not read published posts: ${response.status}`);
  return new Set((await response.json()).map((post) => post.slug));
}

async function checkExternal(url) {
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "TopUseAI editorial link audit" } });
    return { url, status: response.status, ok: response.ok };
  } catch (error) {
    return { url, status: error.name || "request failed", ok: false };
  }
}

(async () => {
  const posts = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  const published = await fetchPublishedSlugs();
  const scheduled = new Map(posts.map((post) => [post.slug, new Date(post.published_at)]));
  const issues = [];
  const inbound = new Map(posts.map((post) => [post.slug, 0]));
  const external = new Set();
  let internalCount = 0;
  let finderCount = 0;

  posts.forEach((post) => {
    const found = links(post.content);
    const internal = found.filter((url) => url.startsWith("/"));
    const finder = internal.filter((url) => url === "/tools" || url.startsWith("/tools/"));
    const blog = internal.filter((url) => url.startsWith("/blog/"));
    internalCount += internal.length;
    finderCount += finder.length;
    if (internal.length < 2) issues.push(`${post.slug}: fewer than two internal links`);
    if (!finder.length) issues.push(`${post.slug}: missing finder link`);
    for (const url of blog) {
      const slug = url.slice("/blog/".length).replace(/\/$/, "");
      if (published.has(slug)) continue;
      if (!scheduled.has(slug)) issues.push(`${post.slug}: missing internal target ${slug}`);
      else if (scheduled.get(slug) > new Date(post.published_at)) issues.push(`${post.slug}: forward link to ${slug}`);
      if (inbound.has(slug)) inbound.set(slug, inbound.get(slug) + 1);
    }
    found.filter((url) => /^https?:\/\//.test(url)).forEach((url) => external.add(url));
  });

  const shingleSets = posts.map((post) => shingles(post.content));
  let highest = { score: 0, pair: "" };
  for (let left = 0; left < posts.length; left += 1) {
    for (let right = left + 1; right < posts.length; right += 1) {
      const score = similarity(shingleSets[left], shingleSets[right]);
      if (score > highest.score) highest = { score, pair: `${posts[left].slug} / ${posts[right].slug}` };
      if (score >= 0.86) issues.push(`near-duplicate content ${(score * 100).toFixed(1)}%: ${posts[left].slug} / ${posts[right].slug}`);
    }
  }

  const externalResults = await Promise.all([...external].map(checkExternal));
  externalResults.filter((result) => !result.ok).forEach((result) => issues.push(`external link ${result.status}: ${result.url}`));
  const orphaned = [...inbound].filter(([, count]) => count === 0).map(([slug]) => slug);
  const report = `# Tool Finder Series Audit\n\nChecked: ${new Date().toISOString()}\n\n## Result\n\n- Drafts: ${posts.length}\n- Scheduled dates: ${new Set(posts.map((post) => post.published_at)).size}\n- Internal links: ${internalCount}\n- Finder links: ${finderCount}\n- Unique external primary sources: ${external.size}\n- Broken or premature links: ${issues.filter((issue) => issue.includes("link") || issue.includes("target")).length}\n- Highest seven-word shingle overlap: ${(highest.score * 100).toFixed(1)}%\n- Highest-overlap pair: ${highest.pair}\n- Series pages with no incoming link from another scheduled article: ${orphaned.length}\n\n## External source checks\n\n${externalResults.map((result) => `- ${result.ok ? "PASS" : "FAIL"} ${result.status}: ${result.url}`).join("\n") || "- No external links found."}\n\n## Internal-link notes\n\nScheduled posts only link to already-published pages or earlier posts in the series. This prevents readers from reaching a future draft. The series uses a chronological chain plus the evergreen finder and existing blog pages. Pages without a scheduled-series inbound link can still receive links from existing published content, category pages, and the blog index.\n\n## Backlink note\n\nThis audit validates links controlled by Top Use AI. It cannot verify independent third-party backlinks without Search Console, Bing Webmaster Tools, server logs, or a backlink index. The series includes original tables, checklists, methods, and worked examples designed to earn citations naturally.\n\n## Issues\n\n${issues.length ? issues.map((issue) => `- ${issue}`).join("\n") : "- None."}\n`;
  fs.writeFileSync(REPORT, report);
  console.log(`Audited ${posts.length} drafts, ${internalCount} internal links, and ${external.size} external sources.`);
  console.log(`Highest content overlap: ${(highest.score * 100).toFixed(1)}%`);
  console.log(`Report: ${path.relative(ROOT, REPORT)}`);
  if (issues.length) {
    console.error(`Audit failed with ${issues.length} issue(s).`);
    issues.forEach((issue) => console.error(`  - ${issue}`));
    process.exit(1);
  }
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
