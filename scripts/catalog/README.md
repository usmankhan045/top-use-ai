# Tool catalog snapshot

The application uses its own Supabase `tool_catalog` table at runtime. It does
not call the upstream catalog from a user request.

`005_import_complete_tool_catalog.sql` contains the complete validated AIFOXX
snapshot: 993 tools across 25 categories. It also adds the structured metadata,
provenance, full-text search document, and indexes used by `/api/tools`.

`006_secondary_catalog_sources.sql` adds 568 independently auditable records:
450 from AutoVenture, 42 from Awesome AI Tools 2026, and 76 from Free AI Atlas.
Records are matched to canonical tools by exact slug and normalized domain. Only
new AutoVenture tools are published automatically; secondary conflicts remain
separate evidence instead of overwriting the primary record.

To regenerate a later snapshot:

```sh
curl -fsSL https://raw.githubusercontent.com/withkarann/aifoxx/main/src/data/tools.json \
  -o /tmp/aifoxx-tools.json
npm run catalog:generate
```

The secondary generator expects validated snapshots at `/tmp/autoventure-tools.json`,
`/tmp/divjangid-tools.json`, and `/tmp/free-ai-atlas.json`, then runs with:

```sh
npm run catalog:generate-secondary
```

The generator stops if the input has fewer than 900 records, required fields
are missing, or source IDs/slugs are duplicated. The migration uses upserts, so
it can be applied safely after the earlier editorial seed migrations.

Imported pricing and feature claims retain `needs-review` status. “Free plan”
means the source reports an ongoing Free, Freemium, or Open Source offering;
free trials are stored separately and are not labeled as free plans.
