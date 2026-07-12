-- ── Multi-tenant schema ────────────────────────────────────────────────────

create table sites (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  domain      text unique not null,
  name        text not null,
  niche       text,
  deploy_url  text not null,
  theme_config jsonb,
  created_at  timestamptz default now()
);

create table categories (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid references sites(id) not null,
  slug        text not null,
  name        text not null,
  description text,
  unique(site_id, slug)
);

create table posts (
  id                 uuid primary key default gen_random_uuid(),
  site_id            uuid references sites(id) not null,
  slug               text not null,
  title              text not null,
  excerpt            text,
  content            text,
  quick_answer       text,
  featured_image_url text,
  category_id        uuid references categories(id),
  audience_tags      text[] default '{}',
  status             text default 'draft',
  seo_title          text,
  seo_description    text,
  faq_items          jsonb default '[]',
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  published_at       timestamptz,
  unique(site_id, slug)
);

create table pages (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid references sites(id) not null,
  slug            text not null,
  title           text,
  content         text,
  seo_title       text,
  seo_description text,
  updated_at      timestamptz default now(),
  unique(site_id, slug)
);

create table printables (
  id            uuid primary key default gen_random_uuid(),
  site_id       uuid references sites(id) not null,
  slug          text not null,
  title         text not null,
  description   text,
  file_url      text,
  thumbnail_url text,
  category_id   uuid references categories(id),
  created_at    timestamptz default now(),
  unique(site_id, slug)
);

create table subscribers (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid references sites(id) not null,
  email      text not null,
  source     text,
  created_at timestamptz default now()
);

create table contact_messages (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid references sites(id) not null,
  name       text,
  email      text,
  message    text,
  created_at timestamptz default now()
);

-- ── Indexes ────────────────────────────────────────────────────────────────

create index idx_posts_site       on posts(site_id);
create index idx_posts_status     on posts(site_id, status);
create index idx_pages_site       on pages(site_id);
create index idx_categories_site  on categories(site_id);
create index idx_printables_site  on printables(site_id);
create index idx_subscribers_site on subscribers(site_id);
create index idx_contact_site     on contact_messages(site_id);

-- ── Seed: SpendWiseCents site ──────────────────────────────────────────────

insert into sites (slug, domain, name, niche, deploy_url)
values (
  'spendwisecents',
  'spendwisecents.com',
  'SpendWiseCents',
  'Personal finance & budgeting for women',
  'https://spendwisecents.vercel.app'
);

-- ── Seed: Categories ───────────────────────────────────────────────────────

insert into categories (site_id, slug, name, description)
select
  s.id,
  c.slug,
  c.name,
  c.description
from sites s
cross join (values
  ('family-budget',      'Family Budgeting',          'Budgeting tips and systems for families and moms'),
  ('single-mom-money',   'Single Mom Money',           'Financial guidance for single mothers managing on their own'),
  ('college-budget',     'College Budgeting',          'Money tips for college students living on a tight budget'),
  ('low-income-budget',  'Low Income Budgeting',       'Practical budgeting when money is really tight'),
  ('first-job-finance',  'First Job Finance',          'What to do with your money when you''re just starting out'),
  ('couples-money',      'Couples & Money',            'How couples can manage money together without fighting'),
  ('saving-money',       'Saving Money',               'Simple strategies to save more on everyday spending'),
  ('debt-payoff',        'Debt Payoff',                'Plans and motivation for paying off debt faster'),
  ('budgeting-basics',   'Budgeting Basics',           'Foundational budgeting concepts for beginners'),
  ('printables',         'Free Printables',            'Free budget worksheets, trackers, and planners')
) as c(slug, name, description)
where s.slug = 'spendwisecents';
