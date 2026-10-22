-- Tool finder foundation. Public results should only use approved records.
create table tool_catalog (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) not null,
  slug text not null,
  name text not null,
  category text not null,
  summary text not null,
  best_for text not null,
  audience text[] not null default '{}',
  strengths text[] not null default '{}',
  limitations text[] not null default '{}',
  free_plan text not null default 'unknown' check (free_plan in ('yes', 'no', 'unknown')),
  paid_plans boolean not null default false,
  quality_score integer check (quality_score between 1 and 5),
  ease_score integer check (ease_score between 1 and 5),
  value_score integer check (value_score between 1 and 5),
  related_post_slugs text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  verification_status text not null default 'needs-review'
    check (verification_status in ('editorial-seed', 'verified', 'needs-review')),
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(site_id, slug)
);

create table tool_facts (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references tool_catalog(id) on delete cascade not null,
  fact_key text not null,
  fact_value jsonb not null,
  source_id uuid,
  confidence numeric(3,2) check (confidence >= 0 and confidence <= 1),
  verified_at timestamptz,
  expires_at timestamptz,
  unique(tool_id, fact_key)
);

create table tool_sources (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) not null,
  tool_id uuid references tool_catalog(id) on delete cascade,
  source_type text not null check (source_type in (
    'official-pricing', 'official-features', 'official-terms',
    'official-documentation', 'editorial', 'github', 'huggingface', 'dataset', 'directory'
  )),
  url text not null,
  label text not null,
  retrieved_at timestamptz,
  content_hash text,
  reliability numeric(3,2) check (reliability >= 0 and reliability <= 1),
  created_at timestamptz default now()
);

alter table tool_facts
  add constraint tool_facts_source_fk foreign key (source_id) references tool_sources(id);

create table tool_candidates (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) not null,
  name text not null,
  website_url text,
  source_url text not null,
  source_type text not null,
  raw_data jsonb not null default '{}',
  review_status text not null default 'new'
    check (review_status in ('new', 'duplicate', 'needs-verification', 'approved', 'rejected', 'archived')),
  duplicate_of uuid references tool_catalog(id),
  discovered_at timestamptz default now()
);

create table tool_changes (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid references tool_catalog(id) on delete cascade not null,
  field_name text not null,
  old_value jsonb,
  new_value jsonb,
  source_url text not null,
  detected_at timestamptz default now(),
  review_status text not null default 'needs-review'
    check (review_status in ('needs-review', 'approved', 'dismissed'))
);

create index idx_tool_catalog_public on tool_catalog(site_id, status, category);
create index idx_tool_facts_expiry on tool_facts(expires_at);
create index idx_tool_sources_tool on tool_sources(tool_id);
create index idx_tool_candidates_status on tool_candidates(site_id, review_status);
create index idx_tool_changes_status on tool_changes(review_status);

-- Development seed for the first niche. Records remain editorial-seed until
-- pricing and plan facts are checked against the official source URLs.
insert into tool_catalog
  (site_id, slug, name, category, summary, best_for, audience, strengths, limitations,
   free_plan, paid_plans, quality_score, ease_score, value_score, related_post_slugs,
   status, verification_status, last_reviewed_at)
values
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'jasper', 'Jasper',
   'ai-writing-content', 'A marketing-focused AI writer for teams that need repeatable brand content.',
   'On-brand marketing copy and team workflows',
   array['marketing-team','business','experienced'],
   array['Marketing workflows','Brand voice controls','Team-oriented content'],
   array['Usually a paid-first choice','May be more than a solo creator needs'],
   'unknown', true, 4, 4, 3, array['jasper-vs-copyai'],
   'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'copy-ai', 'Copy.ai',
   'ai-writing-content', 'A flexible writing platform for marketing copy, repurposing, and quick drafts.',
   'Marketing copy and flexible content workflows',
   array['beginner','creator','marketing-team'],
   array['Accessible starting point','Marketing use cases','Fast first drafts'],
   array['Plan limits can affect frequent users','Output still needs editing'],
   'yes', true, 4, 4, 4, array['jasper-vs-copyai','best-ai-writing-tools'],
   'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'writesonic', 'Writesonic',
   'ai-writing-content', 'A broad AI writing option for creators who want templates and content tools in one place.',
   'Creators comparing many writing and content formats',
   array['beginner','creator','marketing-team'],
   array['Broad content toolkit','Useful templates','Good fit for experimentation'],
   array['Usage limits need careful checking','Quality varies by format'],
   'unknown', true, 4, 4, 4, array['best-ai-writing-tools'],
   'published', 'editorial-seed', now()),
  ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', 'rytr', 'Rytr',
   'ai-writing-content', 'A lower-cost writing option for short-form copy and straightforward drafts.',
   'Budget-conscious creators and short-form copy',
   array['beginner','creator'],
   array['Simple workflow','Budget-friendly positioning','Useful for short drafts'],
   array['Less suitable for complex brand systems','Drafts still need fact checking'],
   'yes', true, 3, 5, 5, array['best-ai-writing-tools'],
   'published', 'editorial-seed', now())
on conflict (site_id, slug) do nothing;

insert into tool_sources (site_id, tool_id, source_type, url, label, reliability)
select '7635559c-2c64-4d76-8b3b-1c69e4a412f8', id, 'editorial',
  case slug
    when 'jasper' then 'https://topuseai.com/blog/jasper-vs-copyai'
    when 'copy-ai' then 'https://topuseai.com/blog/jasper-vs-copyai'
    else 'https://topuseai.com/blog/best-ai-writing-tools'
  end,
  'Top Use AI editorial coverage', 0.8
from tool_catalog
where site_id = '7635559c-2c64-4d76-8b3b-1c69e4a412f8'
  and slug in ('jasper', 'copy-ai', 'writesonic', 'rytr')
  and not exists (
    select 1 from tool_sources s where s.tool_id = tool_catalog.id and s.source_type = 'editorial'
  );

insert into tool_sources (site_id, tool_id, source_type, url, label, reliability)
select '7635559c-2c64-4d76-8b3b-1c69e4a412f8', id, 'official-pricing',
  case slug
    when 'jasper' then 'https://www.jasper.ai/pricing'
    when 'copy-ai' then 'https://www.copy.ai/pricing'
    when 'writesonic' then 'https://writesonic.com/pricing'
    when 'rytr' then 'https://rytr.me/pricing'
  end,
  name || ' official pricing', 1.0
from tool_catalog
where site_id = '7635559c-2c64-4d76-8b3b-1c69e4a412f8'
  and slug in ('jasper', 'copy-ai', 'writesonic', 'rytr')
  and not exists (
    select 1 from tool_sources s where s.tool_id = tool_catalog.id and s.source_type = 'official-pricing'
  );
