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

/**
 * Keys a network adds to the LANDING url when it attributes a click itself,
 * rather than carrying a parameter through from the href. PartnerStack and
 * Impact links look bare (try.vendor.com/abc123) and only reveal tracking
 * after the redirect, so a link with no TRACKING_KEYS of its own still counts
 * as tracked when the page it lands on carries one of these.
 */
const LANDING_TRACKING_KEYS = [
  "ps_partner_key", "ps_xid", "pscd", "gspk", "gsxid",
  "irclickid", "utm_source", "aff_id", "ref",
];

function landingTracking(url) {
  try {
    const qs = new URL(url).searchParams;
    return LANDING_TRACKING_KEYS.filter((k) => qs.has(k));
  } catch {
    return [];
  }
}

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

  // A single network blip should not read as a dead affiliate link: a false
  // alarm here sends you hunting through a programme dashboard for nothing.
  // Retry before believing a failure.
  let res;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      res = await fetch(entry.href, {
        redirect: "follow",
        // Some networks (PartnerStack notably) 404 a request that does not look
        // like a browser, so send the headers a browser would.
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(25000),
      });
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  if (lastErr) {
    return { slug, ok: false, note: `unreachable after 3 tries (${lastErr.message})` };
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

  // A network-hosted link carries no parameter of its own, so look at where it
  // landed instead. Without this, a working PartnerStack link reads as an
  // untracked fallback.
  const landedKeys = landingTracking(res.url);
  if (landedKeys.length) {
    return {
      slug,
      ok: true,
      note: `HTTP 200, network tracking applied on landing (${landedKeys.join(", ")})`,
    };
  }

  if (entry.affiliate) {
    return {
      slug,
      ok: false,
      note: `HTTP 200 but no tracking found in href or landing url (${res.url})`,
    };
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

  // A working link on a tool no post mentions earns nothing. That is a content
  // gap, not a broken link, so report it separately and never fail on it.
  const unused = entries
    .filter(([, e]) => e.affiliate && e.unused)
    .map(([slug]) => slug);
  if (unused.length) {
    console.log(
      `\n${unused.length} link(s) work but no post links to them yet:\n  ` +
        unused.join(", ")
    );
  }

  if (failed) process.exitCode = 1;
})();
