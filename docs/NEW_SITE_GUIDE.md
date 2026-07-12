# Spinning Up a New Site From This Template

This codebase is a **multi-site template**. Every site built from it shares one
Supabase database, one admin API, and one code architecture. The only things
that differ per site are **content** (posts/printables/categories rows in the
DB, keyed by `site_id`) and **theme + identity** (`lib/site.config.ts`).

You do **not** fork the data layer, the admin API, or the query code. You clone
the repo, change one config file, set env vars, and seed one row.

---

## What's shared vs. per-site

| Concern | Where | Shared or per-site |
|---|---|---|
| Database tables, admin API, query layer | `lib/queries.ts`, `app/api/admin/*` | **Shared** (identical code) |
| Supabase project + credentials | `.env.local` (`SUPABASE_*`) | **Shared** (same project) |
| `site_id` isolation | resolved at runtime from `siteConfig.slug` | mechanism shared, value per-site |
| Brand identity (name, domain, emails, disclaimer) | `lib/site.config.ts` | **Per-site** |
| Theme (colors, fonts, radius) | `lib/site.config.ts` → `theme` | **Per-site** |
| Navigation, footer links, audience segments | `lib/site.config.ts` | **Per-site** |
| **Printables on/off** | `lib/site.config.ts` → `features.printables` | **Per-site** |
| Posts, printables, categories, pages | Supabase rows (filtered by `site_id`) | **Per-site** |

> The `sites.theme_config` DB column exists but is **not** read by the app —
> theme lives entirely in `site.config.ts`. Ignore the DB column.

---

## Blog-only vs. blog + printables

This template supports both. A **blog-only** site simply sets one flag:

```ts
// lib/site.config.ts
features: {
  printables: false,   // ← blog-only
},
```

Flipping this to `false` automatically:
- 404s `/free-printables` and `/free-printables/[slug]`
- removes the "Free Printables" item from the header nav and footer
- hides the printables CTAs on the homepage
- drops printables URLs from `sitemap.xml`

No routes or components need to be deleted. SpendWiseCents keeps
`printables: true`; nothing about it changes.

---

## Fast path: the `/new-site` command (recommended)

After cloning and adding `.env.local`, just run **`/new-site`** in Claude Code
and describe the site's theme + content. The command (`.claude/commands/new-site.md`)
does the whole setup for you — writes `lib/site.config.ts`, keeps all slugs
consistent, seeds the DB (site row + categories) against the shared Supabase
project, rewrites the placeholder homepage/about/legal copy for the new niche,
and runs the build to verify. It ends with a short list of the only manual
to-dos left (replace `favicon.ico` + `og-default.jpg`, set Vercel env + domain,
review legal pages).

The manual steps below document what that command automates — use them if you
prefer to do it by hand.

## Step-by-step: create a new site (manual)

### 1. Clone the repo
```bash
git clone <this-repo> my-new-site && cd my-new-site
npm install
```

### 2. Configure identity + theme — `lib/site.config.ts`
Edit these fields (they drive branding, legal pages, footer, schema, and theme
across the whole site):

- `slug` — url-safe id, e.g. `"mynewblog"`. **Must match the `slug` you seed in
  the DB** (this is how the app finds its `site_id`).
- `domain`, `name`, `tagline`, `niche`
- `features.printables` — `false` for a blog-only site
- `contact.email`, `contact.privacyEmail`
- `legal.lastUpdated`, `legal.disclaimer` (the footer/legal one-liner — swap the
  finance wording for your niche)
- `brand.monogram` (2-letter mark), `brand.foundedYear`
- `theme.colors` / `theme.fonts` / `theme.radius` — restyles the entire site
- `nav`, `footerLinks`, `social`
- `audienceSegments` — the dynamic `/<segment-slug>` hub pages. Delete the array
  entries you don't want, or replace them for your niche. (Leaving it empty
  removes the hubs entirely.)

### 3. Set env vars — copy `.env.local.example` → `.env.local`
The `SUPABASE_*`, `ADMIN_API_TOKEN`, and `REVALIDATION_SECRET` values are the
**same** as SpendWiseCents (shared project). See `.env.local.example` for which
vars are shared vs per-site.

### 4. Register the site + categories in the DB
Copy `docs/templates/new-site-seed.sql`, fill in the placeholders (the `<SLUG>`
must equal `siteConfig.slug` from step 2), and run it once in the Supabase SQL
editor. This inserts one `sites` row and its `categories`. A blog-only site
should drop the `printables` category row.

### 5. Review the per-site content pages
These pages carry brand tokens from config automatically (name/domain/emails/
disclaimer), but their **prose is still SpendWiseCents placeholder copy**.
Rewrite the narrative for your niche:
- `app/page.tsx` — homepage hero, value props, about teaser
- `app/about/page.tsx` — the "Our story" section (or seed an `about` page row)
- `app/disclaimer/page.tsx` — **finance-specific sections** (Financial /
  Earnings / Affiliate disclaimers). Edit or remove for a non-finance niche.
- `app/privacy-policy/page.tsx` / `app/terms-of-use/page.tsx` — the third-party
  services list (Google AdSense, etc.) and any niche wording

> Legal pages are boilerplate starting points, **not legal advice** — have them
> reviewed before launch.

### 6. Run locally
```bash
npm run dev      # http://localhost:3000
```
Verify: nav has no "Free Printables" (if blog-only), theme colors applied,
`/free-printables` returns 404 (if blog-only), categories dropdown populates.

### 7. Write content
Use the existing publishing workflow (see `CLAUDE.md` → "Content Publishing
Workflow" and the `write-post` / `publish-all-posts` skills). Posts insert into
the shared `posts` table with this site's `site_id` — the admin API defaults to
the current site automatically.

### 8. Deploy
Create a new Vercel project pointed at this repo, add the same env vars, and set
the custom domain. Update the `deploy_url` in the site's DB row if needed.

---

## Launch checklist

- [ ] `siteConfig.slug` matches the DB `sites.slug`
- [ ] `features.printables` set correctly for this site type
- [ ] Theme colors/fonts set; site visually rebranded
- [ ] `contact.email` / `contact.privacyEmail` are real, monitored inboxes
- [ ] `legal.disclaimer` reworded for the niche
- [ ] Homepage + About prose rewritten (not SpendWiseCents copy)
- [ ] Legal pages reviewed for the niche (esp. `disclaimer` finance sections)
- [ ] `audienceSegments` set or emptied
- [ ] `.env.local` filled; Vercel env vars set
- [ ] DB seeded (site row + categories); verified with the queries at the bottom
      of the seed template
- [ ] `favicon.ico` and `/public/og-default.jpg` replaced
- [ ] `npm run build` passes

---

## Files you will typically touch per new site

| File | Change |
|---|---|
| `lib/site.config.ts` | **Always** — identity, theme, features, nav, segments |
| `.env.local` | **Always** — from `.env.local.example` |
| DB (via `docs/templates/new-site-seed.sql`) | **Always** — site + categories |
| `app/page.tsx`, `app/about/page.tsx` | Rewrite placeholder prose |
| `app/disclaimer|privacy-policy|terms-of-use/page.tsx` | Review niche wording |
| `app/favicon.ico`, `public/og-default.jpg` | Replace brand assets |
| `CLAUDE.md` | Update the site-specific sections for the new site's content plan |

Files you should **not** need to touch: `lib/queries.ts`, `lib/supabase.ts`,
`app/api/**`, the data model, or any component logic.
