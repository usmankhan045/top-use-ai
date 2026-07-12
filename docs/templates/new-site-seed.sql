-- ═══════════════════════════════════════════════════════════════════════════
-- NEW SITE SEED TEMPLATE
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this ONCE against the shared Supabase project (ruucexzgebbehjcrinhj) to
-- register a new tenant site + its categories. Every site shares the same
-- database and tables; rows are isolated by `site_id`.
--
-- This file lives OUTSIDE supabase/migrations/ on purpose so migration tooling
-- never auto-runs it. Copy it, fill in the placeholders, and execute it via the
-- Supabase SQL editor or psql.
--
-- IMPORTANT: the `slug` below MUST exactly match `siteConfig.slug` in the new
-- site's lib/site.config.ts. That slug is how the running app looks up its
-- site_id (see lib/supabase.ts → getCurrentSiteId).
--
-- Placeholders to replace:
--   <SLUG>       url-safe id, e.g. 'mynewblog'  (must equal siteConfig.slug)
--   <DOMAIN>     e.g. 'mynewblog.com'
--   <NAME>       display name, e.g. 'My New Blog'
--   <NICHE>      one-line description of the site's topic
--   <DEPLOY_URL> the Vercel URL, e.g. 'https://mynewblog.vercel.app'
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Register the site ────────────────────────────────────────────────────
insert into sites (slug, domain, name, niche, deploy_url)
values (
  '<SLUG>',
  '<DOMAIN>',
  '<NAME>',
  '<NICHE>',
  '<DEPLOY_URL>'
)
on conflict (slug) do nothing;

-- ── 2. Seed categories ──────────────────────────────────────────────────────
-- Edit the (slug, name, description) rows below to match THIS site's topics.
-- A blog-only site does NOT need a 'printables' category; drop that row.
insert into categories (site_id, slug, name, description)
select
  s.id,
  c.slug,
  c.name,
  c.description
from sites s
cross join (values
  ('<CATEGORY_SLUG_1>', '<Category Name 1>', '<Short description of this category>'),
  ('<CATEGORY_SLUG_2>', '<Category Name 2>', '<Short description of this category>'),
  ('<CATEGORY_SLUG_3>', '<Category Name 3>', '<Short description of this category>')
) as c(slug, name, description)
where s.slug = '<SLUG>'
on conflict (site_id, slug) do nothing;

-- ── 3. (Optional) Seed the About page body ──────────────────────────────────
-- The /about page falls back to hardcoded intro copy if no 'about' page row
-- exists. To override just the intro paragraph from the DB, uncomment:
--
-- insert into pages (site_id, slug, title, content)
-- select s.id, 'about', 'About', '<Your about-page intro paragraph>'
-- from sites s where s.slug = '<SLUG>'
-- on conflict (site_id, slug) do nothing;

-- ── Verify ──────────────────────────────────────────────────────────────────
-- select id, slug, name from sites where slug = '<SLUG>';
-- select slug, name from categories c
--   join sites s on s.id = c.site_id where s.slug = '<SLUG>' order by name;
