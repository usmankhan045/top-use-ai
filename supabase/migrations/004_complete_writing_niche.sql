-- Complete the initial writing niche from the CC BY 4.0 AutoVenture dataset
-- snapshot dated 2026-09-22. The dataset is a discovery source; records remain
-- editorial-seed until a TopUseAI editor independently verifies product claims.

alter table tool_sources drop constraint if exists tool_sources_source_type_check;
alter table tool_sources add constraint tool_sources_source_type_check check (source_type in (
  'official-pricing', 'official-features', 'official-terms',
  'official-documentation', 'editorial', 'github', 'huggingface', 'dataset', 'directory'
));

insert into tool_catalog
  (site_id, slug, name, category, summary, best_for, audience, strengths, limitations,
   free_plan, paid_plans, quality_score, ease_score, value_score, related_post_slugs,
   status, verification_status, last_reviewed_at)
values
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','bluehumanizer','BlueHumanizer','ai-writing-content','A focused rewriting tool for making AI-assisted drafts read more naturally while preserving meaning and citations.','Smoothing stiff AI-assisted drafts',array['beginner','creator'],array['Focused rewriting workflow','No-card starting option','Citation-preservation claim'],array['Humanizer claims are difficult to verify','Do not use it to misrepresent authorship'],'yes',true,3,5,4,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','deepl-write','DeepL Write','ai-writing-content','A multilingual assistant for improving grammar, wording, clarity, and tone.','Multilingual editing and tone improvements',array['beginner','creator','business','experienced'],array['Multilingual workflow','Clear rewrite suggestions','Polishes existing drafts'],array['Not a full content-production suite','Language and usage limits vary'],'yes',true,4,5,4,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','hemingway-editor','Hemingway Editor','ai-writing-content','A readability editor highlighting dense sentences, passive voice, and hard-to-scan prose.','Making drafts clearer and easier to read',array['beginner','creator','business'],array['Fast readability feedback','Simple visual workflow','Free online editor'],array['Rules can oversimplify style','AI features may differ from the basic editor'],'yes',true,4,5,5,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','jenni-ai','Jenni AI','ai-writing-content','An academic workspace for drafting, reading research, and working with citations.','Research papers and citation-led academic drafts',array['beginner','creator','experienced'],array['Academic workflow','Citation support','Research-oriented workspace'],array['Citations still need source checks','Institutional AI policies may restrict use'],'yes',true,4,4,4,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','languagetool','LanguageTool','ai-writing-content','A multilingual grammar, spelling, and style checker for the web and writing integrations.','Multilingual grammar and style checking',array['beginner','creator','business','experienced'],array['Broad language support','Open-source core','Useful integrations'],array['Advanced suggestions may require Premium','Not designed for complete drafts'],'yes',true,4,5,5,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','prowritingaid','ProWritingAid','ai-writing-content','An editing suite with grammar, style, readability, and manuscript feedback.','Detailed editing reports for long-form writing',array['creator','experienced'],array['Detailed editing reports','Strong long-form focus','Creative-writing workflow'],array['Can feel busy for quick edits','Free web usage may be limited'],'yes',true,4,3,4,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','undetectedgpt','UndetectedGPT','ai-writing-content','A rewriting and AI-content checking platform for making generated text more natural.','Reviewing and rewriting AI-assisted drafts',array['creator','experienced'],array['Combined rewrite and detection workflow','Free tier reported','Focused interface'],array['Detection-avoidance claims are unreliable','Never conceal prohibited AI use'],'yes',true,2,4,3,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','unfox-ai','Unfox AI','ai-writing-content','A multilingual AI-content detector with sentence-level highlighting and bulk checks.','Screening batches of text for human review',array['business','marketing-team','experienced'],array['Multilingual checking','Sentence highlighting','Bulk workflow'],array['Detectors can produce false positives','Results are not proof'],'yes',true,2,4,3,array[]::text[],'published','editorial-seed','2026-09-22'),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8','writerly-ai','Writerly AI','ai-writing-content','A team-oriented workspace for producing repeatable business and marketing copy.','Teams producing repeatable marketing content',array['marketing-team','business','experienced'],array['Team content workflow','Reusable generation tools','Free tier reported'],array['Not specialized for academic or fiction work','Plan allowances need verification'],'yes',true,3,4,4,array[]::text[],'published','editorial-seed','2026-09-22')
on conflict (site_id, slug) do update set
  summary=excluded.summary, best_for=excluded.best_for, audience=excluded.audience,
  strengths=excluded.strengths, limitations=excluded.limitations, free_plan=excluded.free_plan,
  paid_plans=excluded.paid_plans, quality_score=excluded.quality_score,
  ease_score=excluded.ease_score, value_score=excluded.value_score,
  status=excluded.status, verification_status=excluded.verification_status,
  last_reviewed_at=excluded.last_reviewed_at, updated_at=now();

update tool_catalog set free_plan='no', last_reviewed_at='2026-09-22', updated_at=now()
where site_id='7635559c-2c64-4d76-8b3b-1c69e4a412f8' and slug='jasper';

update tool_catalog set free_plan='yes', last_reviewed_at='2026-09-22', updated_at=now()
where site_id='7635559c-2c64-4d76-8b3b-1c69e4a412f8' and slug='wordtune';

insert into tool_sources (site_id, tool_id, source_type, url, label, retrieved_at, reliability)
select '7635559c-2c64-4d76-8b3b-1c69e4a412f8', id, 'dataset',
  'https://github.com/autoventure-projects/ai-tools-dataset',
  'AutoVenture Free AI Tools Dataset (CC BY 4.0)', '2026-09-22', 0.75
from tool_catalog
where site_id='7635559c-2c64-4d76-8b3b-1c69e4a412f8'
  and slug in ('jasper','wordtune','bluehumanizer','deepl-write','hemingway-editor','jenni-ai','languagetool','prowritingaid','undetectedgpt','unfox-ai','writerly-ai')
  and not exists (select 1 from tool_sources s where s.tool_id=tool_catalog.id and s.source_type='dataset');

insert into tool_sources (site_id, tool_id, source_type, url, label, retrieved_at, reliability)
select '7635559c-2c64-4d76-8b3b-1c69e4a412f8', id, 'official-features',
  case slug
    when 'bluehumanizer' then 'https://bluehumanizer.com/'
    when 'deepl-write' then 'https://www.deepl.com/write'
    when 'hemingway-editor' then 'https://hemingwayapp.com/'
    when 'jenni-ai' then 'https://jenni.ai'
    when 'languagetool' then 'https://languagetool.org/'
    when 'prowritingaid' then 'https://prowritingaid.com/'
    when 'undetectedgpt' then 'https://www.undetectedgpt.ai/'
    when 'unfox-ai' then 'https://unfox.ai/'
    when 'writerly-ai' then 'https://writerly.ai'
  end, name || ' official site', '2026-09-22', 1.0
from tool_catalog
where site_id='7635559c-2c64-4d76-8b3b-1c69e4a412f8'
  and slug in ('bluehumanizer','deepl-write','hemingway-editor','jenni-ai','languagetool','prowritingaid','undetectedgpt','unfox-ai','writerly-ai')
  and not exists (select 1 from tool_sources s where s.tool_id=tool_catalog.id and s.source_type='official-features');
