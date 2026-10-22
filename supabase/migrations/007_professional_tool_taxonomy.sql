-- Canonical niche taxonomy. Upstream labels are retained in source_category;
-- category is normalized for fast, predictable application filtering.

create table if not exists tool_niches (
  slug text primary key,
  name text not null unique,
  display_order integer not null,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tool_niche_aliases (
  alias text primary key,
  niche_slug text references tool_niches(slug) on delete cascade not null
);

create table if not exists tool_feature_categories (
  niche_slug text references tool_niches(slug) on delete cascade not null,
  slug text not null,
  name text not null,
  tool_count integer not null default 0,
  display_order integer not null default 0,
  primary key (niche_slug, slug)
);

insert into tool_niches (slug, name, display_order) values
  ('ai-assistants','AI Assistants',1), ('agentic-and-automation','Agentic & Automation',2),
  ('audio-and-music','Audio & Music',3), ('coding','Coding',4),
  ('content-creation','Content Creation',5), ('customer-support','Customer Support',6),
  ('data-and-analytics','Data & Analytics',7), ('design','Design',8),
  ('e-commerce','E-commerce',9), ('education','Education',10), ('finance','Finance',11),
  ('hr-and-recruitment','HR & Recruitment',12), ('healthcare','Healthcare',13),
  ('image-generation','Image Generation',14), ('legal','Legal',15), ('marketing','Marketing',16),
  ('productivity','Productivity',17), ('project-management','Project Management',18),
  ('real-estate','Real Estate',19), ('research','Research',20),
  ('sales-and-crm','Sales & CRM',21), ('security','Security',22),
  ('social-media','Social Media',23), ('translation-and-language','Translation & Language',24),
  ('video','Video',25)
on conflict (slug) do update set name=excluded.name, display_order=excluded.display_order, updated_at=now();

insert into tool_niche_aliases (alias, niche_slug) values
  ('ai assistants','ai-assistants'), ('chatbot','ai-assistants'),
  ('agentic & automation','agentic-and-automation'), ('automation','agentic-and-automation'),
  ('audio & music','audio-and-music'), ('audio','audio-and-music'),
  ('coding','coding'), ('code','coding'),
  ('content creation','content-creation'), ('writing','content-creation'),
  ('customer support','customer-support'), ('customer service','customer-support'),
  ('data & analytics','data-and-analytics'), ('data','data-and-analytics'),
  ('design','design'), ('e-commerce','e-commerce'), ('ecommerce','e-commerce'),
  ('education','education'), ('finance','finance'),
  ('hr & recruitment','hr-and-recruitment'), ('hiring','hr-and-recruitment'),
  ('healthcare','healthcare'), ('health','healthcare'),
  ('image generation','image-generation'), ('image generators','image-generation'),
  ('legal','legal'), ('marketing','marketing'), ('email','marketing'), ('seo','marketing'),
  ('marketing for small business','marketing'),
  ('productivity','productivity'), ('meeting','productivity'),
  ('productivity to boost workflow','productivity'),
  ('project management','project-management'), ('real estate','real-estate'),
  ('research','research'), ('sales & crm','sales-and-crm'),
  ('security','security'), ('social media','social-media'),
  ('translation & language','translation-and-language'), ('translation','translation-and-language'),
  ('video','video')
on conflict (alias) do update set niche_slug=excluded.niche_slug;

alter table tool_catalog
  add column if not exists niche_slug text references tool_niches(slug),
  add column if not exists feature_category_slug text;

update tool_catalog t set niche_slug=a.niche_slug, category=a.niche_slug
from tool_niche_aliases a
where lower(coalesce(t.source_category, t.category))=a.alias;

-- Legacy editorial writing records do not have a source_category.
update tool_catalog set niche_slug='content-creation', category='content-creation'
where category='ai-writing-content';

update tool_catalog set feature_category_slug=
  lower(regexp_replace(coalesce(nullif(subcategory, ''), 'General'), '[^a-zA-Z0-9]+', '-', 'g'));

insert into tool_feature_categories (niche_slug, slug, name, tool_count, display_order)
select niche_slug, feature_category_slug,
  coalesce(max(nullif(subcategory, '')), 'General'), count(*),
  row_number() over (partition by niche_slug order by count(*) desc, coalesce(max(nullif(subcategory, '')), 'General'))
from tool_catalog
where niche_slug is not null
group by niche_slug, feature_category_slug
on conflict (niche_slug, slug) do update set
  name=excluded.name, tool_count=excluded.tool_count, display_order=excluded.display_order;

alter table tool_catalog drop constraint if exists tool_catalog_feature_category_fk;
alter table tool_catalog add constraint tool_catalog_feature_category_fk
  foreign key (niche_slug, feature_category_slug)
  references tool_feature_categories(niche_slug, slug);

create index if not exists idx_tool_catalog_niche_filters
  on tool_catalog(site_id, niche_slug, feature_category_slug, pricing_model, status);

analyze tool_niches;
analyze tool_feature_categories;
analyze tool_catalog;
