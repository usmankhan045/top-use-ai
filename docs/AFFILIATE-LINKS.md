# Affiliate Links

How affiliate links are stored, added and verified. Read this before touching
any affiliate URL.

## The rule

**A post never contains an affiliate URL.** Posts link to `/go/<slug>`. The
`/go/[tool]` route looks the slug up and 302-redirects to the real destination.

This matters because an affiliate URL changes: a programme moves network, a
tracking parameter is reissued, a link is suspended. When the URL lives in one
place, that is a one-line edit. When it is pasted into forty posts, it is a
migration, and any post you miss sends traffic out untracked forever.

It also keeps `/go/` disallowed in robots.txt and marked `noindex`, so outbound
affiliate links never leak into the crawl as canonical URLs.

## Where the links live

| File | Role |
|---|---|
| `data/affiliate-links.json` | **Source of truth.** Every URL, its network, terms and verification date. |
| `lib/affiliate-links.ts` | Types and re-exports the JSON. No URLs here. |
| `app/go/[tool]/route.ts` | The redirect. Unknown slug 404s rather than silently going to the homepage. |
| `scripts/publishing/verify-affiliate-links.js` | Checks every link still resolves with its tracking parameter. |

The master spreadsheet (`TopUseAI_AI_Affiliate_Master_Sheet.xlsx`) is the record
of applications and commission terms. It is **not** the source of truth for the
site: nothing reads it at build time. When a link changes there, copy it into
the JSON.

## Each entry

```json
"rytr": {
  "name": "Rytr",
  "href": "https://rytr.me/?via=topuseai",
  "affiliate": true,
  "network": "Direct",
  "terms": "30% recurring",
  "verified": "2026-09-21"
}
```

- **href**: the affiliate URL when you have one, otherwise the tool's official
  homepage. A homepage fallback means links still work before approval, so you
  can publish now and monetise later.
- **affiliate**: `true` only when `href` carries real tracking. This is what
  tells you at a glance which posts are earning and which are not.
- **network**: who runs the programme, or `"applied"` when the application is
  in and you are waiting for the link, or `"none"`.
- **verified**: ISO date the href was last confirmed to resolve with its
  tracking parameter intact. `null` for homepage fallbacks.

## Adding a link

1. Copy the URL from the master sheet **exactly**, including the query string.
   `?via=topuseai` and `?ref=topuseai` are not interchangeable, and a link with
   the parameter stripped pays nobody.
2. Add or update the entry in `data/affiliate-links.json`. Set `affiliate` to
   `true` and `verified` to today.
3. Run the verifier:

   ```bash
   node scripts/publishing/verify-affiliate-links.js
   ```

4. If the tool is mentioned in existing posts but not linked, add `/go/<slug>`
   links to those posts, then purge their cache:

   ```bash
   node scripts/publishing/revalidate.js <post-slug>
   ```

A registry change alone needs no revalidation: `/go/` is `force-dynamic`, so
the redirect picks up a new URL on the next request. Only edits to post
**content** need a purge.

## Verifying

`verify-affiliate-links.js` follows every href and checks the tracking
parameter survives the redirect chain. Run it after any change, and
periodically: affiliate links go dead quietly, and a 404 on an outbound link is
invisible until someone tells you.

What it cannot check: **whether the cookie is actually set.** Rewardful,
FirstPromoter and similar set their cookie in JavaScript, which a plain HTTP
request does not execute. A link can return 200 with the parameter intact and
still not track, if the programme has lapsed. Confirm a new link by clicking it
in a private window and checking the click registers in the programme's own
dashboard. Do this once per link, when you add it.

## Do not

- Put an affiliate URL in a post, a Pinterest pin, or an email. Pins in
  particular: Pinterest disallows undisclosed affiliate links, and the pin
  playbook forbids them outright.
- Add a `/go/` link for a tool the post does not genuinely discuss. A link only
  earns when it is the natural next step for a reader, and forced mentions cost
  more in trust than they return in commission.
- Change a `?via=` value to match another tool's. Each is issued per programme.

## Current state

Run this for a live count:

```bash
node -e "const l=require('./data/affiliate-links.json').links; \
const a=Object.entries(l).filter(([,v])=>v.affiliate); \
console.log(a.length+'/'+Object.keys(l).length+' active'); \
Object.entries(l).filter(([,v])=>!v.affiliate).forEach(([k,v])=>console.log('  pending:',k,'('+v.network+')'))"
```
