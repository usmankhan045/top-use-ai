# Scheduled publishing

Posts scheduled in the admin use `status='scheduled'` with a future
`publish_at`. A GitHub Action flips them to `published`, stamps `published_at`
with the time they actually went live, and clears `publish_at` once due.

The publisher also supports the legacy queue format (`status='draft'` with a
future `published_at`) until those older posts have all been published.

## Why queued statuses are required

`lib/queries.ts` filters on `status = 'published'` and only checks that
`published_at` is not null - it never compares the date to now. Setting a
future `published_at` alone would publish the post immediately. Keeping posts
as `scheduled` until due works with the existing public queries.

## Commands

```bash
node scripts/publishing/publish-due.js --list      # show the queue
node scripts/publishing/publish-due.js --dry-run   # what would publish now
node scripts/publishing/publish-due.js             # publish anything due
```

Each run publishes at most 50 posts by default so a recovered outage can catch
up in one run without allowing an unbounded update. Override with
`MAX_PER_RUN=<positive integer>` when a smaller operational cap is needed.

Needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the environment
(`set -a && . ./.env.local && set +a` locally).

## The workflow

`.github/workflows/publish-scheduled-posts.yml` runs daily at 13:15 and 16:15
UTC and can be triggered manually, with a dry-run option.

Required repository secrets:

| Secret | Purpose |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (write access) |
| `REVALIDATION_SECRET` | Revalidates affected pages after publishing |

Revalidation matters because a database change alone may leave statically
generated pages stale. The workflow only calls it when a post actually
published.

## Scheduling cadence

The workflow has two daily lanes. Keep each cron later than the posts it is
intended to publish; GitHub Actions schedules can start later than their stated
time, but the next run safely catches anything overdue.
