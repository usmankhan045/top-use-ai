#!/usr/bin/env node
/**
 * Verify every affiliate link in data/affiliate-links.json still resolves and
 * still carries its tracking parameter after the redirect chain.
 *
 * Affiliate links die quietly. A programme lapses, a tracking parameter is
 * reissued, a vendor redesigns and drops the query string. Nothing on the site
 * breaks visibly, the clicks just stop paying. This catches that.
 *
 * What it CANNOT check: whether the tracking cookie is actually set. Rewardful,
 * FirstPromoter and similar set their cookie in JavaScript, which this does not
 * execute. A link can pass here and still not track if the programme lapsed.
 * Confirm a new link once by hand in the programme's own dashboard.
 *
 * Exit code is 1 if any link fails, so this can gate CI.
 *
 * Usage:
 *   node scripts/publishing/verify-affiliate-links.js
 *   node scripts/publishing/verify-affiliate-links.js --all   # include fallbacks
 */

const { links } = require("../../data/affiliate-links.json");

const includeAll = process.argv.includes("--all");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/125.0 Safari/537.36";

/** The query keys affiliate programmes use to attribute a click. */
const TRACKING_KEYS = ["via", "ref", "fpr", "aff", "atp", "utm_campaign"];

function trackingParams(url) {
  try {
    const qs = new URL(url).searchParams;
    return TRACKING_KEYS.filter((k) => qs.has(k)).map((k) => `${k}=${qs.get(k)}`);
  } catch {
    return [];
  }
}

async function check(slug, entry) {
  const expected = trackingParams(entry.href);

  let res;
  try {
    res = await fetch(entry.href, {
      redirect: "follow",
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(25000),
    });
  } catch (err) {
    return { slug, ok: false, note: `unreachable (${err.message})` };
  }

  if (!res.ok) {
    return { slug, ok: false, note: `HTTP ${res.status}` };
  }

  // A vendor that strips the tracking parameter on redirect pays nobody, so a
  // 200 alone is not success for an affiliate link.
  if (expected.length) {
    const landed = trackingParams(res.url);
    const lost = expected.filter((p) => !landed.includes(p));
    if (lost.length) {
      return {
        slug,
        ok: false,
        note: `HTTP 200 but tracking lost: ${lost.join(", ")} (landed on ${res.url})`,
      };
    }
    return { slug, ok: true, note: `HTTP 200, tracking intact (${expected.join(", ")})` };
  }

  return { slug, ok: true, note: `HTTP 200 (fallback, no tracking)` };
}

(async () => {
  const entries = Object.entries(links).filter(
    ([slug]) => !slug.startsWith("$") && (includeAll || links[slug].affiliate)
  );

  if (!entries.length) {
    console.log("No affiliate links to check.");
    return;
  }

  console.log(
    `Checking ${entries.length} link(s)${includeAll ? " (including fallbacks)" : ""}...\n`
  );

  const results = await Promise.all(entries.map(([s, e]) => check(s, e)));

  let failed = 0;
  for (const r of results.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`  ${r.ok ? "OK  " : "FAIL"}  ${r.slug.padEnd(14)} ${r.note}`);
    if (!r.ok) failed++;
  }

  console.log(
    `\n${results.length - failed}/${results.length} passed.` +
      (failed ? ` ${failed} need attention.` : "")
  );
  if (failed) process.exitCode = 1;
})();
