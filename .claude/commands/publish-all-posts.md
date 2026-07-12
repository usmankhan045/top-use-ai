# Publish All Pending Posts

Write and publish a batch of Explained AI Tools blog posts (reviews, comparisons, how-tos).

## How to use

```
/publish-all-posts            # publish every pending post in the queue
/publish-all-posts 02         # publish a specific queue number
/publish-all-posts 02 03 05   # publish specific ones
```

This is a **blog-only** site — no printables. Each post is content-only.

## Starter queue

Content strategy is still TBD. This starter queue is seeded from the Tier 1 sub-niches in
`docs/AI-Tools-Site-Blueprint.md`. **Validate each keyword in Pinterest Trends + the Ads
planner (US/CA/UK) before committing**, then edit titles/slugs and add rows as you plan.

| # | Post (title → slug) | Category | Status |
|---|---|---|---|
| 01 | Best AI Writing Tools in 2026 → best-ai-writing-tools | ai-writing-content | pending |
| 02 | Jasper vs Copy.ai → jasper-vs-copyai | ai-tool-reviews | pending |
| 03 | 11 AI Side Hustles You Can Start This Weekend → ai-side-hustles | make-money-with-ai | pending |
| 04 | How to Start a Faceless YouTube Channel With AI → faceless-youtube-with-ai | ai-video-audio | pending |
| 05 | Best AI Art Generators in 2026 → best-ai-art-generators | ai-image-design | pending |
| 06 | AI for Beginners: Where to Start → ai-for-beginners | ai-guides-how-tos | pending |

## Process for each post

For each pending queue item, run `/write-post "<title> — <keyword> — <category-slug>"`, which:
1. Writes the full blog post content (answer-first, GEO blocks, FAQ, affiliate disclosure)
2. Publishes it to Supabase (site_id `7635559c-2c64-4d76-8b3b-1c69e4a412f8`)

After publishing, update the Status column above and cross-link related posts
(`/blog/<slug>`) so every post links to at least 2 others.

## Reference
Category architecture, sub-niche priority tiers, and the affiliate program map:
`docs/AI-Tools-Site-Blueprint.md`.
