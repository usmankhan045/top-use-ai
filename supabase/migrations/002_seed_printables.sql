-- ── Seed: Sample printables for SpendWiseCents ────────────────────────────────
--
-- Run this in the Supabase SQL editor after 001_initial.sql.
--
-- file_url: Uses a public W3C test PDF for development.
--   Replace with actual uploaded PDFs before going live:
--   1. Upload your PDF via POST /api/admin/media
--   2. UPDATE printables SET file_url = '<returned-url>' WHERE slug = '<slug>';
--
-- thumbnail_url: Set to NULL here — the UI renders a styled placeholder.
--   Upload thumbnails via the media API and UPDATE after uploading.
-- ─────────────────────────────────────────────────────────────────────────────

insert into printables (site_id, slug, title, description, file_url, thumbnail_url, category_id)
select
  s.id                          as site_id,
  p.slug,
  p.title,
  p.description,
  p.file_url,
  p.thumbnail_url,
  (
    select id
    from categories
    where site_id = s.id
      and slug = p.cat_slug
    limit 1
  )                             as category_id
from sites s
cross join (values
  (
    'monthly-budget-tracker',
    'Monthly Budget Tracker — Zero-Based Template',
    'Give every dollar a job before the month starts. This one-page worksheet walks you through income, fixed expenses, variable expenses, savings goals, and debt payments — and shows you when everything adds up to zero. Works for any income level.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    null,
    'budgeting-basics'
  ),
  (
    'savings-goal-tracker',
    'Savings Goal Tracker',
    'Set a goal, track your progress, and celebrate milestones. Whether you are saving for an emergency fund, a vacation, new tires, or a down payment — this printable keeps you motivated and accountable month by month.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    null,
    'saving-money'
  ),
  (
    'debt-snowball-worksheet',
    'Debt Snowball Payoff Worksheet',
    'List every debt — balance, minimum payment, and interest rate — and use the snowball method to plan your path to debt freedom. Includes a payoff order guide and a space to track each payment. Satisfying to fill in.',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    null,
    'debt-payoff'
  )
) as p(slug, title, description, file_url, thumbnail_url, cat_slug)
where s.slug = 'spendwisecents';
