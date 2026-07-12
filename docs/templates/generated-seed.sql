-- ═══════════════════════════════════════════════════════════════════════════
-- GENERATED SEED — Explained AI Tools
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this ONCE against the shared Supabase project (ruucexzgebbehjcrinhj) via
-- the Supabase SQL editor or psql. It registers the site + its 6 categories.
--
-- The `slug` below ('explained-ai-tools') MUST match siteConfig.slug in
-- lib/site.config.ts — that is how the running app looks up its site_id.
--
-- (Auto-seeding over PostgREST was attempted during /new-site but this
-- environment had no network access, so this file is the fallback.)
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Register the site ────────────────────────────────────────────────────
insert into sites (slug, domain, name, niche, deploy_url)
values (
  'explained-ai-tools',
  'explainedaitools.com',
  'Explained AI Tools',
  'AI tool reviews, comparisons, and how-tos for making money with AI',
  'https://explained-ai-tools.vercel.app'
)
on conflict (slug) do nothing;

-- ── 2. Seed categories (9 clusters — see docs/CONTENT-STRATEGY.md) ──────────
insert into categories (site_id, slug, name, description)
select
  s.id,
  c.slug,
  c.name,
  c.description
from sites s
cross join (values
  ('make-money-with-ai',         'Make Money with AI',           'AI side hustles, faceless content, and selling digital products with AI.'),
  ('ai-writing-content',         'AI Writing & Content',         'AI writing tools plus AI for blogging, copy, and social media content.'),
  ('ai-image-design',            'AI Image & Design',            'AI art generators, design tools, and AI headshot & photo apps.'),
  ('ai-video-audio',             'AI Video & Audio',             'AI video tools, faceless video creation, and AI voice / text-to-speech.'),
  ('ai-seo-marketing',           'AI SEO & Marketing',           'AI tools for SEO, content optimization, social media, and ad creative.'),
  ('ai-sales-leadgen',           'AI Sales & Lead Generation',   'AI tools for lead generation, outreach, CRM, and sales automation.'),
  ('ai-productivity-automation', 'AI Productivity & Automation', 'AI automation, agents, and productivity tools for work and small business.'),
  ('ai-prompts-templates',       'AI Prompts & Templates',       'Prompt packs, template libraries, and AI resources you can save and use.'),
  ('ai-basics-tutorials',        'AI Basics & Tutorials',        'Beginner-friendly ChatGPT and AI explainers, tutorials, and how-tos.')
) as c(slug, name, description)
where s.slug = 'explained-ai-tools'
on conflict (site_id, slug) do nothing;

-- ── Verify ──────────────────────────────────────────────────────────────────
-- select id, slug, name from sites where slug = 'explained-ai-tools';
-- select slug, name from categories c
--   join sites s on s.id = c.site_id where s.slug = 'explained-ai-tools' order by name;
