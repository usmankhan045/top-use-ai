-- Complete taxonomy assignments and make ease ranking evidence-based.
-- This migration is idempotent and also repairs databases that previously ran 007.

insert into tool_niche_aliases (alias, niche_slug) values
  ('marketing for small business', 'marketing'),
  ('productivity to boost workflow', 'productivity')
on conflict (alias) do update set niche_slug=excluded.niche_slug;

update tool_catalog t
set niche_slug=a.niche_slug, category=a.niche_slug
from tool_niche_aliases a
where lower(coalesce(t.source_category, t.category))=a.alias
  and (t.niche_slug is distinct from a.niche_slug or t.category is distinct from a.niche_slug);

-- Ease is an access/setup score, not a subjective product-quality claim:
-- browser/mobile access is lower-friction; API/CLI-only or self-hosted tools
-- require more setup. Unknown access stays neutral at 3.
update tool_catalog
set ease_score=greatest(1, least(5,
  3
  + case when access_methods && array['Web App','Web','iOS App','Android App','Mobile']::text[] then 1 else 0 end
  - case when cardinality(access_methods) > 0
          and access_methods <@ array['API','SDK','CLI','Self-hosted','Local']::text[] then 1 else 0 end
  - case when coalesce((data_storage->>'self_hostable')::boolean, false)
          and not (access_methods && array['Web App','Web','iOS App','Android App','Mobile']::text[]) then 1 else 0 end
))
where source_dataset is not null;

insert into tool_feature_categories (niche_slug, slug, name, tool_count, display_order)
select niche_slug, feature_category_slug,
  coalesce(max(nullif(subcategory, '')), 'General'), count(*),
  row_number() over (partition by niche_slug order by count(*) desc, coalesce(max(nullif(subcategory, '')), 'General'))
from tool_catalog
where niche_slug is not null
group by niche_slug, feature_category_slug
on conflict (niche_slug, slug) do update set
  name=excluded.name, tool_count=excluded.tool_count, display_order=excluded.display_order;

analyze tool_niche_aliases;
analyze tool_feature_categories;
analyze tool_catalog;
