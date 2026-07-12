# Write Blog Post

Write and publish a new SpendWiseCents blog post. Pass the post number (01–10) or a custom brief.

## How to use

```
/write-post 05
/write-post "custom title — keyword — category"
```

## Steps

### 1. Get the brief

For numbered posts (01–10), read `.claude/briefs/post-<NN>.md`. It contains:
- Blog post brief (title, keywords, H2 structure, word count, tone)
- `printable:` field — one of three values:
  - `new:<slug>` — create a new printable (brief file includes full layout spec)
  - `existing:<slug>` — reuse an already-published printable
  - `none` — no printable needed for this post

For custom briefs, the caller must specify the printable field explicitly.

---

### 2. Write the blog post content

Follow Blog Post Structure rules in CLAUDE.md:
- Intro: ~150 words, validate the pain point
- 4–6 question-based H2s, each 134–167 words (GEO self-contained answer blocks)
- Internal links to at least 2 other published posts
- Affiliate mention: one natural reference per CLAUDE.md rules
- No FAQ in the markdown body — put 5 FAQ items in `faq_items` JSON

**For the `{{printable:}}` shortcode in the body:**
- `new:<slug>` or `existing:<slug>` → insert `{{printable:<slug>}}` twice (mid-post + end)
- `none` → no shortcode, no CTA

---

### 3. Handle the printable — based on the brief's `printable:` field

#### Case A — `printable: new:<slug>`
Create the printable from the layout spec in the brief file.

Write `public/printables/<slug>.html` using the Master Design System in `.claude/commands/create-printable.md` (all CSS is there — do NOT read biweekly-budget-template.html):
- Fonts: Playfair Display + Lato via Google Fonts
- Portrait: `@page { size: letter portrait; margin: 0; }`, `.page` 8.5in × 11in
- Landscape: `@page { size: letter landscape; margin: 0; }`, `.page` 11in × 8.5in
- `.page` padding: 0.38in top · 0.42in sides · 0.30in bottom
- Header: #7A9E7E bg · Playfair Display 22pt bold white
- Section colors: Income #C4826E · Fixed #7A9E7E · Variable #A89080 · Savings #8B7BA0 · Debt #6B8FAE · Summary #4A6B4E
- Rows: `grid-template-columns: 1fr 0.75in` · odd #FAF7F2 · even #F5F0EA
- Summary bar: #4A6B4E · Left Over cell #C4826E
- Botanical SVG: absolute · top 0.25in right 0.30in · width 0.75in · opacity 0.22
- Footer: absolute bottom 0.14in · left italic #B0A090 · right bold #7A9E7E

WeasyPrint gotchas:
- ❌ `aspect-ratio` — use explicit `width` + `height`
- ❌ `print-color-adjust: exact` — use `-webkit-print-color-adjust: exact`

Then convert: `weasyprint public/printables/<slug>.html public/printables/<slug>.pdf`

Then generate the thumbnail (first page → PNG):
```python
/tmp/docxenv/bin/python3 -c "
from pdf2image import convert_from_path
pages = convert_from_path('public/printables/<slug>.pdf', dpi=150, first_page=1, last_page=1)
pages[0].save('public/printables/<slug>-preview.png', 'PNG')
print('thumbnail ok', pages[0].size)
"
```

Then insert into Supabase (project_id: ruucexzgebbehjcrinhj):
```sql
INSERT INTO printables (site_id, slug, title, description, file_url, thumbnail_url, category_id, orientation)
VALUES ('f7998f95-ac2c-4188-8202-418c91572a45', '<slug>', '<title>', '<description>', '/printables/<slug>.pdf', '/printables/<slug>-preview.png', '<category_id>', '<portrait|landscape>')
ON CONFLICT (site_id, slug) DO NOTHING;
```

#### Case B — `printable: existing:<slug>`
No HTML creation. No PDF conversion. No Supabase printable insert.
The `{{printable:<slug>}}` shortcode in the post body will render it automatically.

#### Case C — `printable: none`
Skip everything in this section entirely.

---

### 4. Insert the post into Supabase

```sql
DO $$ BEGIN
INSERT INTO posts (site_id, slug, title, excerpt, content, quick_answer, category_id, audience_tags, status, seo_title, seo_description, faq_items, published_at)
VALUES ('f7998f95-ac2c-4188-8202-418c91572a45', '<slug>', '<title>', '<excerpt>', $BODY$<markdown>$BODY$, '<quick_answer>', '<cat_id>', ARRAY['<tags>'], 'published', '<seo_title>', '<seo_desc>', '<faq_json>'::jsonb, NOW())
ON CONFLICT (site_id, slug) DO NOTHING;
END $$;
```

---

### 5. Mark the post as published in the CLAUDE.md content priority table

---

## Category IDs
See CLAUDE.md → "Category IDs"

## Tone + SEO Rules
See CLAUDE.md → "Blog Post Structure" and "Tone Rules"
