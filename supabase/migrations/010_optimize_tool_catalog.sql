-- Cover catalog foreign keys used by joins/deletes and pin the trigger
-- function's search path so it cannot resolve attacker-controlled objects.

create index if not exists idx_catalog_source_records_source_key
  on catalog_source_records(source_key);
create index if not exists idx_tool_candidates_duplicate_of
  on tool_candidates(duplicate_of);
create index if not exists idx_tool_catalog_feature_category_fk
  on tool_catalog(niche_slug, feature_category_slug);
create index if not exists idx_tool_changes_tool_id
  on tool_changes(tool_id);
create index if not exists idx_tool_facts_source_id
  on tool_facts(source_id);
create index if not exists idx_tool_niche_aliases_niche_slug
  on tool_niche_aliases(niche_slug);
create index if not exists idx_tool_sources_site_id
  on tool_sources(site_id);

alter function public.refresh_tool_catalog_search_document()
  set search_path = pg_catalog, public;

analyze tool_catalog;
analyze catalog_source_records;
