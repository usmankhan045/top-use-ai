#!/usr/bin/env node
/**
 * Ping IndexNow so Bing, Yandex, Naver and Seznam learn about new or changed
 * pages immediately instead of waiting to recrawl.
 *
 * Google does not participate, so this does nothing for Google Search. It is
 * still worth running: a new domain gets crawled slowly everywhere, and Bing
 * feeds ChatGPT's and Copilot's search results, which matters more than Bing's
 * own market share suggests.
 *
 * The key is a file at public/<key>.txt whose contents are the key itself.
 * That file proves to the engines that we control the domain.
 *
 *   node scripts/publishing/indexnow.js best-ai-logo-generators
 *   node scripts/publishing/indexnow.js --path /blog /category/ai-video-audio
 *   node scripts/publishing/indexnow.js --all     # every published post
 *
 * Submitting a URL that 404s or is not ours gets the whole batch rejected,
 * so paths are built from slugs rather than accepted raw.
 */

const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE_URL || "https://www.topuseai.com";
const HOST = new URL(SITE).host;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

/** The key is whatever public/<hex>.txt is named, so there is one source of truth. */
function loadKey() {
  if (process.env.INDEXNOW_KEY) return process.env.INDEXNOW_KEY;

  const publicDir = path.join(__dirname, "..", "..", "public");
  const candidates = fs
    .readdirSync(publicDir)
    .filter((f) => /^[0-9a-f]{8,128}\.txt$/.test(f));

  if (candidates.length !== 1) return null;
  return candidates[0].replace(/\.txt$/, "");
}

async function main() {
  const key = loadKey();
  if (!key) {
    console.error(
      "No IndexNow key found. Expected exactly one public/<hex>.txt file,\n" +
        "or set INDEXNOW_KEY in the environment."
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  let urls = [];

  if (args[0] === "--all") {
    // Read straight from the sitemap: it already contains exactly the pages we
    // consider indexable, so the two can never drift apart.
    const res = await fetch(`${SITE}/sitemap.xml`);
    if (!res.ok) {
      console.error(`Could not read sitemap: HTTP ${res.status}`);
      process.exit(1);
    }
    const xml = await res.text();
    urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  } else if (args[0] === "--path") {
    urls = args.slice(1).map((p) => `${SITE}${p.startsWith("/") ? p : `/${p}`}`);
  } else if (args.length) {
    urls = args.map((slug) => `${SITE}/blog/${slug}`);
  }

  if (!urls.length) {
    console.error(
      "Usage: node scripts/publishing/indexnow.js <slug>... | --path <path>... | --all"
    );
    process.exit(1);
  }

  // A single bad URL rejects the whole submission, so check first.
  const bad = urls.filter((u) => !u.startsWith(SITE));
  if (bad.length) {
    console.error(`Refusing to submit URLs outside ${SITE}:\n  ${bad.join("\n  ")}`);
    process.exit(1);
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${SITE}/${key}.txt`,
      urlList: urls,
    }),
  });

  // 200 and 202 both mean accepted. 422 usually means the key file is
  // unreachable, which is the one failure worth spelling out.
  if (res.status === 200 || res.status === 202) {
    console.log(`Submitted ${urls.length} URL(s) to IndexNow (HTTP ${res.status}).`);
    for (const u of urls.slice(0, 10)) console.log(`  ${u}`);
    if (urls.length > 10) console.log(`  ... and ${urls.length - 10} more`);
    return;
  }

  console.error(`IndexNow returned HTTP ${res.status}: ${await res.text()}`);
  if (res.status === 422) {
    console.error(`Check that ${SITE}/${key}.txt is live and contains exactly the key.`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
