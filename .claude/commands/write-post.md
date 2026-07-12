# Write Blog Post

Write and publish a new Explained AI Tools blog post (a review, comparison, or how-to). Pass a brief.

## How to use

```
/write-post "Jasper vs Copy.ai — jasper vs copy.ai — ai-tool-reviews"
/write-post "Best AI Art Generators in 2026 — best ai art generator — ai-image-design"
```

Brief format: `title — primary keyword — category-slug`. Valid category slugs are in
CLAUDE.md → "Category IDs". Need ideas? See `docs/AI-Tools-Site-Blueprint.md` (sub-niche
priority tiers and the affiliate program map).

This is a **blog-only** site — there are no printables. Do not create PDFs or use a
`{{printable:}}` shortcode.

## Steps

### 1. Write the blog post content

Follow the Blog Post Structure rules in CLAUDE.md:
- Intro: ~150 words, validate the reader's question (which tool? is it worth it?). No conclusion yet.
- 4–6 question-based H2s, each a 134–167 word GEO self-contained answer block
- For reviews/comparisons: score on output quality, ease of use, speed, and value; note free/cheaper alternatives
- Internal links to at least 2 other published posts (`/blog/<slug>`)
- One natural affiliate mention per CLAUDE.md rules (only tools you'd recommend)
- For any review/comparison post, add a visible FTC affiliate disclosure and link to `/affiliate-disclosure`
- No FAQ in the markdown body — put 5+ FAQ items in `faq_items` JSON
- `quick_answer`: a 1–3 sentence plain-English answer to the post's core question (renders as a callout, primary AI-Overview target)

### 2. Insert the post into Supabase

Project `ruucexzgebbehjcrinhj` · site_id `7635559c-2c64-4d76-8b3b-1c69e4a412f8`.
Get the `category_id` from CLAUDE.md → "Category IDs".

```sql
DO $$ BEGIN
INSERT INTO posts (site_id, slug, title, excerpt, content, quick_answer, category_id, audience_tags, status, seo_title, seo_description, faq_items, published_at)
VALUES ('7635559c-2c64-4d76-8b3b-1c69e4a412f8', '<slug>', '<title>', '<excerpt>', $BODY$<markdown>$BODY$, '<quick_answer>', '<cat_id>', ARRAY[]::text[], 'published', '<seo_title>', '<seo_desc>', '<faq_json>'::jsonb, NOW())
ON CONFLICT (site_id, slug) DO NOTHING;
END $$;
```

`audience_tags` is unused on this site (no audience hubs) — leave it an empty array.

### 3. Done

A category only appears in the nav dropdown and homepage grid once it has ≥1 published
post, so publishing the first post in a category lights it up automatically.

## Reference
- Category IDs → CLAUDE.md → "Category IDs"
- Tone + SEO rules → CLAUDE.md → "Blog Post Structure" and "Tone Rules"
- Topics + affiliate programs → `docs/AI-Tools-Site-Blueprint.md`
