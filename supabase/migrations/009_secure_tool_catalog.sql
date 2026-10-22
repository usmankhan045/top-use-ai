-- Keep the catalog behind the server-side API. The application reads these
-- tables with the service-role client; browsers must not access them directly.

alter table tool_catalog enable row level security;
alter table tool_facts enable row level security;
alter table tool_sources enable row level security;
alter table tool_candidates enable row level security;
alter table tool_changes enable row level security;
alter table tool_catalog_imports enable row level security;
alter table catalog_data_sources enable row level security;
alter table catalog_source_records enable row level security;
alter table tool_niches enable row level security;
alter table tool_niche_aliases enable row level security;
alter table tool_feature_categories enable row level security;

revoke all on table
  tool_catalog,
  tool_facts,
  tool_sources,
  tool_candidates,
  tool_changes,
  tool_catalog_imports,
  catalog_data_sources,
  catalog_source_records,
  tool_niches,
  tool_niche_aliases,
  tool_feature_categories
from anon, authenticated;

grant select, insert, update, delete on table
  tool_catalog,
  tool_facts,
  tool_sources,
  tool_candidates,
  tool_changes,
  tool_catalog_imports,
  catalog_data_sources,
  catalog_source_records,
  tool_niches,
  tool_niche_aliases,
  tool_feature_categories
to service_role;
