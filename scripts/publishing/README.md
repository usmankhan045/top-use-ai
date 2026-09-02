# Scheduled publishing

Posts are written as `status='draft'` with a future `published_at`. A GitHub
Action flips them to `published` once that date arrives.

## Why drafts rather than future dates

`lib/queries.ts` filters on `status = 'published'` and only checks that
`published_at` is not null — it never compares the date to now. Setting a
future date alone would publish the post immediately. Keeping posts as drafts
until due works with the existing queries instead of requiring a rewrite.

## Commands

```bash
node scripts/publishing/publish-due.js --list      # show the queue
node scripts/publishing/publish-due.js --dry-run   # what would publish now
node scripts/publishing/publish-due.js             # publish anything due
```

Needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment
(`set -a && . ./.env.local && set +a` locally).

## The workflow

`.github/workflows/publish-scheduled-posts.yml` runs daily at 13:00 UTC and
can be triggered manually, with a dry-run option.

Required repository secrets:

| Secret | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (write access) |
| `VERCEL_DEPLOY_HOOK_URL` | Optional. Triggers a rebuild after publishing |

The deploy hook matters if pages are cached: a database change alone may not
appear on the site until the next build. The workflow only calls it when a
post actually published.

## Scheduling cadence

Current queue publishes every 2 days. For a young domain, steady beats fast —
a large batch landing at once is what a content farm looks like.
