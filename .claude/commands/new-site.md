# New Site

Turn this freshly-cloned template into a brand-new site from a short description
of its **theme** and **content**. You (Claude) do all the wiring — config,
slugs, DB seed, placeholder content, build check. The user only supplies the
description and a filled-in `.env.local`.

## How to use

```
/new-site
```
Then the user describes the site, e.g.:
> "Blog-only site called TrailNotes, trailnotes.co, about beginner hiking.
>  Earthy theme — forest green + warm tan, clean sans-serif. Categories: Gear,
>  Trails, Safety, Trip Reports. Contact hello@trailnotes.co."

---

## Guardrails

- **This is a repeatable setup for a cloned repo.** Assume the codebase is
  currently the SpendWiseCents template. Your job is to replace all
  SpendWiseCents-specific identity + content with the new site's, consistently.
- **Everything flows from `lib/site.config.ts`.** The running app derives its
  `site_id` from `siteConfig.slug`, and its theme/nav/brand from the same file.
  Set the slug **once** and reuse it verbatim in the DB seed — a mismatch makes
  every page 404.
- **Do not touch** `lib/queries.ts`, `lib/supabase.ts`, `app/api/**`, the data
  model, or component logic. They're shared and correct.
- If the user's description is missing something **required** (site name,
  domain, blog-only vs. blog+printables, category list), ask a single batched
  clarifying question via AskUserQuestion, then proceed. For theme details given
  as a vibe ("earthy, calm"), pick concrete values yourself and show them.

---

## Step 1 — Gather + confirm the inputs

Resolve these from the description (derive sensible values; don't over-ask):

| Field | Notes |
|---|---|
| `name` | Display/brand name |
| `slug` | kebab-case of the name, url-safe. **This is the master key.** |
| `domain` | e.g. `trailnotes.co` |
| `tagline`, `niche` | one-liners |
| `features.printables` | `false` unless the user wants printables |
| Theme `colors` | 6 hex tokens: primary, accent, background, text, muted, success. Pick a coherent palette from the described vibe. Ensure text/background contrast is accessible. |
| Theme `fonts` | display / body / mono — real Google Font family names |
| `theme.radius` | e.g. `"0.75rem"` |
| `contact.email`, `contact.privacyEmail` | real inboxes if given, else `contact@<domain>` / `privacy@<domain>` |
| `legal.disclaimer` | one-liner suited to the niche (drop finance wording for non-finance sites) |
| `legal.lastUpdated` | today's date, human format |
| `brand.monogram` | 2 letters from the name |
| `brand.foundedYear` | current year unless told |
| `nav`, `footerLinks` | keep structure; drop "Free Printables" from nav if blog-only |
| `social` | only what's given |
| `audienceSegments` | keep ONLY if the niche has real audience hubs; otherwise set to `[]` (removes the `/<segment>` hub pages entirely) |
| `categories` | list of `{slug, name, description}` for the blog's topics |

Print a compact summary of the resolved values (especially the palette + slug +
categories) so the user can see what you chose before you write files.

## Step 2 — Rewrite `lib/site.config.ts`

Replace the values (NOT the structure/comments) with the resolved inputs. Keep
the `features`, `contact`, `legal`, `brand`, `theme`, `nav`, `footerLinks`,
`social`, `audienceSegments` keys and the derived `navLinks` export intact.

## Step 3 — Seed the database

Read `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` (the user
provides this file). These point at the shared project. Insert the site + its
categories via PostgREST. The `slug` MUST equal `siteConfig.slug`.

```bash
# Insert the site (returns the new row incl. id)
curl -sS -X POST "$SUPABASE_URL/rest/v1/sites" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation,resolution=merge-duplicates" \
  -d '{"slug":"<SLUG>","domain":"<DOMAIN>","name":"<NAME>","niche":"<NICHE>","deploy_url":"<DEPLOY_URL_OR_PLACEHOLDER>"}'
```

Capture the returned `id`. Then insert categories (one array POST, each row
carrying that `site_id`):

```bash
curl -sS -X POST "$SUPABASE_URL/rest/v1/categories" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '[{"site_id":"<ID>","slug":"gear","name":"Gear","description":"..."}, ...]'
```

- If `.env.local` is missing or the calls fail (no network/creds), DON'T block:
  write the ready-to-run SQL to `docs/templates/generated-seed.sql` using the
  same slug/categories and tell the user to run it in the Supabase SQL editor.
- Verify afterward: `GET $SUPABASE_URL/rest/v1/sites?slug=eq.<SLUG>&select=id,slug,name`.

## Step 4 — Replace the placeholder CONTENT for the new niche

The template ships with SpendWiseCents copy. Rewrite these surfaces so the site
reads as its own brand (brand tokens like name/domain already come from config;
you're replacing the *prose and niche-specific demos*):

- **`app/page.tsx`** — the homepage. Update: `metadata` (title/description/OG),
  the hero heading + subcopy, `VALUE_PROPS`, `PLACEHOLDER_POSTS` (titles/
  excerpts/category names fitting the niche), and the about-teaser blockquote.
  The hero artifact `BudgetLedgerCard` + `LEDGER_ROWS` is a **finance-specific
  demo** — for a non-finance site, replace it with a simple on-brand hero visual
  (or a clean text/image hero) so it doesn't show a budget worksheet.
- **`app/about/page.tsx`** — rewrite the "Our story" paragraphs and the "What
  you'll find here" list for the new niche and voice.
- **`app/disclaimer/page.tsx`** — the Financial / Earnings disclaimer sections
  are finance-only. Rewrite or remove them for the niche; keep Affiliate/
  Advertising/External-Links/No-Warranties if relevant.
- **`app/privacy-policy/page.tsx`** — update the third-party services list
  (Google AdSense, Resend, etc.) to what this site actually uses.
- **`app/terms-of-use/page.tsx`** — drop the "printable worksheets" clause in
  §2 for a blog-only site.

Keep tone/reading level appropriate to the niche. Do NOT reintroduce hardcoded
brand literals — reference `siteConfig` where a value is brand identity.

## Step 5 — Brand assets (flag, don't fake)

`app/favicon.ico` and `public/og-default.jpg` still carry SpendWiseCents art.
You can't author a good logo/OG image blind — leave them and list them as
manual to-dos in the final report (or offer to generate an OG image if the user
wants).

## Step 6 — Verify

```bash
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json   # expect exit 0
npm run build                                                    # expect success
```
Fix anything your edits broke. Confirm: nav has no "Free Printables" (if
blog-only), `/free-printables` 404s (if blog-only), theme colors applied.

## Step 7 — Final report

Tell the user, concisely:
- The resolved slug + confirmation the DB row exists (or the SQL file to run).
- Which content surfaces you rewrote.
- The manual to-dos left: **replace `app/favicon.ico` + `public/og-default.jpg`**,
  set Vercel env vars + custom domain, and have the legal pages reviewed.
- That `.env.local` is assumed already in place (shared Supabase creds).

---

## Reference
Full architecture rationale + shared-vs-per-site breakdown:
`docs/NEW_SITE_GUIDE.md`. DB seed template: `docs/templates/new-site-seed.sql`.
