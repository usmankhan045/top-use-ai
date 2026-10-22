-- Expand the AI writing finder after the initial catalog migration.
-- These records remain editorial-seed until their current plan facts are checked.
insert into tool_catalog
  (site_id, slug, name, category, summary, best_for, audience, strengths, limitations,
   free_plan, paid_plans, quality_score, ease_score, value_score, related_post_slugs,
   status, verification_status, last_reviewed_at)
values
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'grammarly', 'Grammarly',
   'ai-writing-content', 'A writing assistant for polishing drafts, correcting errors, and keeping tone consistent.',
   'Editing, proofreading, and everyday writing support',
   array['beginner','creator','business','experienced'],
   array['Fast editing feedback','Clear writing suggestions','Useful across many writing contexts'],
   array['More focused on editing than long-form generation','Some features may require a paid plan'],
   'unknown', true, 4, 5, 4, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'quillbot', 'QuillBot',
   'ai-writing-content', 'A practical rewriting and editing toolkit for improving clarity, tone, and originality.',
   'Paraphrasing, rewriting, and polishing existing text',
   array['beginner','creator','experienced'],
   array['Straightforward rewriting workflow','Useful editing utilities','Approachable for beginners'],
   array['Best for transforming existing text','Output still needs a human quality check'],
   'unknown', true, 4, 5, 4, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'wordtune', 'Wordtune',
   'ai-writing-content', 'An editing-focused assistant for rewriting sentences and adjusting tone without starting from scratch.',
   'Rewriting sentences and improving tone',
   array['beginner','creator','business','experienced'],
   array['Quick sentence-level edits','Tone and clarity options','Low-friction workflow'],
   array['Not a full content production suite','Free usage limits need checking'],
   'unknown', true, 4, 5, 3, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'sudowrite', 'Sudowrite',
   'ai-writing-content', 'A creative-writing workspace designed to help fiction writers develop scenes, characters, and drafts.',
   'Fiction, storytelling, and creative writing',
   array['creator','experienced'],
   array['Creative ideation tools','Story-development workflow','Useful for overcoming blank-page friction'],
   array['Narrower fit for business writing','Generated prose still needs a strong editorial pass'],
   'unknown', true, 4, 4, 3, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'anyword', 'Anyword',
   'ai-writing-content', 'A marketing copy platform built around campaign variations, messaging, and performance-oriented workflows.',
   'Marketing teams testing multiple copy variations',
   array['marketing-team','business','experienced'],
   array['Campaign-focused workflows','Copy variation generation','Useful for marketing teams'],
   array['More specialized than a general writing assistant','Paid-first positioning may not suit casual users'],
   'unknown', true, 4, 4, 3, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'simplified', 'Simplified',
   'ai-writing-content', 'An all-in-one creator workspace combining writing, design, social content, and publishing workflows.',
   'Creators who want writing and social tools together',
   array['beginner','creator','marketing-team'],
   array['Broad creator toolkit','Social content workflows','Useful for consolidating several tools'],
   array['Breadth can make the workspace feel busy','Feature and plan limits need checking'],
   'unknown', true, 3, 4, 4, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'hypotenuse-ai', 'Hypotenuse AI',
   'ai-writing-content', 'A content platform for product descriptions, marketing copy, and longer-form drafts.',
   'Product content and ecommerce writing workflows',
   array['creator','marketing-team','business'],
   array['Product-content use cases','Long-form drafting','Marketing workflow support'],
   array['Best fit is narrower than a general-purpose assistant','Pricing and usage limits need verification'],
   'unknown', true, 4, 4, 3, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'scalenut', 'Scalenut',
   'ai-writing-content', 'An SEO content workflow combining topic research, briefs, optimization, and AI-assisted drafting.',
   'SEO-focused content teams and blog workflows',
   array['marketing-team','business','experienced'],
   array['SEO content workflow','Research and briefing tools','Useful for repeatable publishing'],
   array['More involved than a simple writing assistant','Optimization advice still needs editorial judgment'],
   'unknown', true, 4, 3, 3, array[]::text[], 'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'originality-ai', 'Originality AI',
   'ai-writing-content', 'A content-quality toolkit focused on AI detection, originality checks, and editorial review workflows.',
   'Publishers checking originality and content quality',
   array['marketing-team','business','experienced'],
   array['Content review workflow','Useful for publisher teams','Originality-focused checks'],
   array['Not primarily a first-draft writing tool','Detection results need careful interpretation'],
   'unknown', true, 4, 3, 3, array[]::text[], 'published', 'editorial-seed', now())
on conflict (site_id, slug) do nothing;

insert into tool_sources (site_id, tool_id, source_type, url, label, reliability)
select '7635559c-2c64-4d76-8b3b-1c69e4a412f8', id, 'official-pricing',
  case slug
    when 'grammarly' then 'https://www.grammarly.com/plans'
    when 'quillbot' then 'https://quillbot.com/plans'
    when 'wordtune' then 'https://www.wordtune.com/plans'
    when 'sudowrite' then 'https://www.sudowrite.com/pricing'
    when 'anyword' then 'https://anyword.com/pricing'
    when 'simplified' then 'https://simplified.com/pricing'
    when 'hypotenuse-ai' then 'https://www.hypotenuse.ai/pricing'
    when 'scalenut' then 'https://www.scalenut.com/pricing'
    when 'originality-ai' then 'https://originality.ai'
  end,
  name || ' official pricing', 1.0
from tool_catalog
where site_id = '7635559c-2c64-4d76-8b3b-1c69e4a412f8'
  and slug in ('grammarly', 'quillbot', 'wordtune', 'sudowrite', 'anyword', 'simplified', 'hypotenuse-ai', 'scalenut', 'originality-ai')
  and not exists (
    select 1 from tool_sources s
    where s.tool_id = tool_catalog.id and s.source_type = 'official-pricing'
  );
