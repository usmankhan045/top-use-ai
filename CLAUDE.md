@AGENTS.md

# Top Use AI: Project Guide for Claude

## What This Project Is

Top Use AI (topuseai.com, canonical host www.topuseai.com) is an independent AI-tools review and how-to blog for the US / Canada / UK. It publishes hands-on reviews, head-to-head comparisons, and beginner-friendly guides, plus practical "make money with AI" content. The business model is: SEO- and Pinterest-driven blog posts → email list growth → affiliate revenue (primary) + AdSense (secondary) + own digital products (later).

**This is a blog-only site.** There are NO printables (that feature lives on a separate site). `features.printables` is `false`, so `/free-printables` 404s and its nav/footer/sitemap entries are hidden.

**Stack:** Next.js 16 · Tailwind CSS 4 · Supabase (PostgreSQL, shared multi-tenant project)

**Supabase project ID:** `ruucexzgebbehjcrinhj`

**Site slug in DB:** `explained-ai-tools` (legacy slug, do not change; the live domain is topuseai.com) · **site_id:** `7635559c-2c64-4d76-8b3b-1c69e4a412f8`

The strategic blueprint (categories, sub-niches, affiliate programs) lives in `docs/AI-Tools-Site-Blueprint.md`.

---

## Database Schema (Multi-tenant)

All tables have a `site_id` column. Always filter by `site_id = '7635559c-2c64-4d76-8b3b-1c69e4a412f8'`.

**posts**: title, slug, content (markdown), excerpt, quick_answer, category_id, audience_tags[], status, seo_title, seo_description, faq_items (jsonb), published_at, featured_image_url

**categories**: see slugs/IDs below

**Status values:** `draft` | `published`

### Category IDs (explained-ai-tools site): 9 categories
| slug | name | id |
|---|---|---|
| make-money-with-ai | Make Money with AI | d53b793e-2ab6-42dd-bc5d-a72b7894e61e |
| ai-writing-content | AI Writing & Content | 3c7de857-7d53-46ca-9243-f95c712c3474 |
| ai-image-design | AI Image & Design | dab1f4b9-75e3-4cba-9386-ee64a9eba438 |
| ai-video-audio | AI Video & Audio | c40325be-2a4e-424e-bc42-fe2e47ddf021 |
| ai-seo-marketing | AI SEO & Marketing | 58e7970e-3718-4925-9a3a-528581e73725 |
| ai-sales-leadgen | AI Sales & Lead Generation | 950aefa9-0104-4e13-93e3-e445811d0d7e |
| ai-productivity-automation | AI Productivity & Automation | a2ef907d-3085-4e9f-87b9-ba9916d05bec |
| ai-prompts-templates | AI Prompts & Templates | d0346a33-7c30-4994-a0c7-eda6cafec1cc |
| ai-basics-tutorials | AI Basics & Tutorials | a0c28f3d-3e18-4cb7-b5c7-f785d2be60d0 |

---

## Content Publishing Workflow

### To publish a new blog post:
1. Write the markdown content following the blog post brief (see "Blog Post Structure" below)
2. Insert post record into Supabase: `INSERT INTO posts (site_id, slug, title, excerpt, content, quick_answer, category_id, audience_tags, status, seo_title, seo_description, faq_items, published_at) VALUES (...)`
3. Use dollar-quoting `$BODY$...$BODY$` in SQL to avoid escaping markdown content
4. A category only appears in the nav dropdown and homepage grid once it has ≥1 published post

---

## Brand & Design System

### Site Theme (blog/UI colors)
| Token | Hex | Use |
|---|---|---|
| primary | #0369A1 | Azure: sky blue; nav, buttons |
| accent | #F59E0B | Signal Amber: highlights |
| background | #F6FAFD | Sky Paper: light-theme background |
| text | #0F1B2A | Deep Navy Ink |
| muted | #5B7183 | Slate: secondary text |
| success | #10B981 | Emerald: verified/positive states |

### Fonts
| Role | Family |
|---|---|
| display | Space Grotesk |
| body | Inter |
| mono | JetBrains Mono |

Everything flows from `lib/site.config.ts` (theme/nav/brand) and `lib/fonts.ts` (font imports). Changing `siteConfig.theme.*` restyles the whole site.

---

## Writing & Research Standards

**Before writing or researching any post, read `docs/WRITING-PLAYBOOK.md`.** It
covers source tiers, price and licence verification, the house voice, GEO
techniques that measurably work, internal linking rules, and the pre-publish
checklist. The core rule: never publish a fact not verified at its source.

**Before creating any Pinterest pin, read `docs/PINTEREST-PLAYBOOK.md`.** It
covers the design rules, pin anatomy, headline shapes, scheduling and boards.
The core rule: no two pins may share a design or a sentence structure, and
every headline rests on a verified fact from the post's `quick_answer`.

These rules are enforced, not advisory. A hook validates every
`PINTEREST-BATCH-*.md` file on save and reports violations back. Check by hand
with `node scripts/pinterest/validate-pins.js`.

Key tooling:
- `scrapling-py scripts/research/verify_pricing.py <tool>`: verify vendor pricing
- `node scripts/publishing/publish-due.js --list`: inspect the publish queue

## Blog Post Structure (GEO + SEO Rules)

Every blog post must follow this structure:

1. **Intro (150 words):** Validate the reader's question or problem. No fluff. No conclusion yet.
2. **H2 sections:** 4–6 question-based H2s (e.g., "Is Jasper Worth It in 2026?")
3. **GEO rule:** Each H2 section body must be a **self-contained answer block of 134–167 words**: Google AI Overviews and Perplexity can extract and cite these directly
4. **Internal links:** Always link to at least 2 other posts: use relative paths like `/blog/<slug>`
5. **FAQ section:** 5 questions minimum, stored as JSON in `faq_items` field (not in markdown body)
6. **Schema:** BlogPosting + FAQPage (handled automatically by the app via faq_items)
7. **FTC affiliate disclosure:** every review/comparison post must carry a visible disclosure; link to `/affiliate-disclosure`

### Tone Rules
- Independent, hands-on, honest. "Tested, not hyped."
- Score tools on output quality, ease of use, speed, and value; always note free/cheaper alternatives
- Real specifics beat vague claims (actual prices, plan limits, model names, sample outputs)
- Affiliate relationships never change scores or picks, and we say so
- Target beginners-to-intermediate users choosing and monetizing AI tools

### Never use em dashes

**No em dashes (—) anywhere.** Not in posts, excerpts, SEO descriptions, FAQ
answers, commit messages, Pinterest copy, or text set inside pin images.
Heavy em dash use is one of the clearest tells of AI-written text.

Use a full stop, a comma, a colon, or brackets instead. `Whisper is free. It
is also unlimited.` never `Whisper is free — and unlimited.` En dashes are
fine in number ranges (`45–300 minutes`). Hyphens in compound words are
unaffected.

Verify with `grep -n '—' <file>` before publishing. Full guidance and a
rewrite table: `docs/WRITING-PLAYBOOK.md`.

---

## Content Categories (9 clusters)

Full plan: `docs/CONTENT-STRATEGY.md` (categories, Angle Matrix, pins, monetization, calendar). Topic architecture + affiliate map: `docs/AI-Tools-Site-Blueprint.md`. "review/comparison" is a format **tag**, not a category.

**Money clusters (affiliate):** AI Writing & Content · AI Image & Design · AI Video & Audio · AI SEO & Marketing · AI Sales & Lead Generation · AI Productivity & Automation
**Traffic clusters (Pinterest/AdSense/email):** Make Money with AI · AI Prompts & Templates · AI Basics & Tutorials

Categorize by the title's leading intent: income/outcome → Make Money with AI; a tool/tool-class → the matching function category. One category per post.

---

## Affiliate Mentions (Natural In-Post)

Join **PartnerStack** and **Impact.com** first to unlock most programs. Prioritize RECURRING commissions; mix in one flat-fee bounty (Semrush) so you're not fully exposed to churn. Starter set (2 per active category), verify current terms on each program's own page before relying on figures:

- **Writing:** Jasper, Writesonic, Copy.ai, Rytr
- **Image/Design:** Leonardo AI, Canva, HeadshotPro
- **Video/Audio:** Synthesia, Pictory, ElevenLabs, Murf
- **Productivity/Business:** Notion (Notion AI), ClickUp, Kit
- **SEO/Creator:** Surfer SEO, Semrush, TubeBuddy
- Rule: one natural mention per post, only tools you'd actually recommend. Audience fit beats commission rate.

Full 24-tool program table with rates/cookies: `docs/AI-Tools-Site-Blueprint.md` (Part 3).

---

## Key File Paths

| File | Purpose |
|---|---|
| lib/site.config.ts | Brand colors, fonts, nav, categories, feature flags |
| lib/fonts.ts | next/font imports (must match siteConfig.theme.fonts) |
| lib/queries.ts | All Supabase data access (DO NOT write queries elsewhere) |
| lib/supabase.ts | Supabase client setup |
| app/blog/[slug]/page.tsx | Blog post page |
| app/category/[slug]/page.tsx | Category archive |
| components/MarkdownContent.tsx | Renders post content |
| supabase/migrations/ | DB schema |
| docs/AI-Tools-Site-Blueprint.md | Category architecture, sub-niches, affiliate programs |
| docs/WRITING-PLAYBOOK.md | Research + writing standards (read before writing) |
| docs/PINTEREST-PLAYBOOK.md | Pin design + copy standards (read before making pins) |
| scripts/pinterest/validate-pins.js | Enforces the pin rules; run before publishing |
| docs/PINTEREST-BATCH-1.md | Pins for days 6-15 (60 pins, ready to upload) |
| docs/PINTEREST-BATCH-2.md | Pins for days 16-27 (72 pins) |
| docs/PINTEREST-BATCH-3.md | Pins for days 28-40 (78 pins) |
| scripts/research/verify_pricing.py | Verify vendor pricing before publishing |
| scripts/publishing/publish-due.js | Scheduled publishing queue |

---

## Dev Commands

```bash
npm run dev        # start dev server on localhost:3000
npm run build      # production build
npm run lint       # ESLint check
```
