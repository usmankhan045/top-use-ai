@AGENTS.md

# SpendWiseCents — Project Guide for Claude

## What This Project Is

SpendWiseCents (spendwisecents.com) is a personal finance blog targeting US women aged 25–34 who are living paycheck to paycheck or restarting their budgeting journey. The business model is: free SEO-optimized blog posts + free printable downloads → email list growth → affiliate revenue (YNAB, EveryDollar, Amazon) + digital product sales.

**Stack:** Next.js 16 · Tailwind CSS 4 · Supabase (PostgreSQL) · WeasyPrint (HTML→PDF for printables)

**Supabase project ID:** `ruucexzgebbehjcrinhj`

**Site slug in DB:** `spendwisecents` · **site_id:** `f7998f95-ac2c-4188-8202-418c91572a45`

---

## Database Schema (Multi-tenant)

All tables have a `site_id` column. Always filter by `site_id = 'f7998f95-ac2c-4188-8202-418c91572a45'`.

**posts** — title, slug, content (markdown), excerpt, quick_answer, category_id, audience_tags[], status, seo_title, seo_description, faq_items (jsonb), published_at, featured_image_url

**printables** — title, slug, description, file_url, thumbnail_url, category_id

**categories** — see slugs below

**Status values:** `draft` | `published`

### Category IDs (spendwisecents site)
| slug | id |
|---|---|
| budgeting-basics | 823b89f4-5540-42f0-a287-e888fb0adef1 |
| printables | bfb77e91-73ca-4b78-8e03-b034c3f08356 |
| saving-money | 8b8ab022-9cd9-4b10-a67e-9d23c2ae8e6b |
| debt-payoff | ddbb0983-77db-4227-8ea1-9ff08a689612 |
| family-budget | 12de1380-0ba7-4cb2-aefc-d3f72b1693fb |
| low-income-budget | daf6134b-f413-4a5d-84ff-fcc4e66ddae7 |
| single-mom-money | 7a10fb83-23b6-48d6-a79d-7ac4f75916ae |
| college-budget | 0d5a5c7e-68c7-4e8a-9ede-666eafbece0f |
| first-job-finance | d555cb29-7e39-4046-bada-8d5b3acaf763 |
| couples-money | 180d20c6-5677-4fe9-b717-2d887a76bc1c |

---

## Content Publishing Workflow

### To publish a new blog post:
1. Write the markdown content following the blog post brief (see "Blog Post Structure" below)
2. Generate the printable HTML → convert to PDF with WeasyPrint → save to `public/printables/<slug>.pdf`
3. Insert printable record into Supabase: `INSERT INTO printables (site_id, slug, title, description, file_url, category_id) VALUES (...)`
4. Insert post record into Supabase: `INSERT INTO posts (site_id, slug, title, excerpt, content, quick_answer, category_id, audience_tags, status, seo_title, seo_description, faq_items, published_at) VALUES (...)`
5. Use dollar-quoting `$BODY$...$BODY$` in SQL to avoid escaping markdown content

### Printable file path convention:
- HTML source: `public/printables/<slug>.html`
- PDF output: `public/printables/<slug>.pdf`
- Database file_url: `/printables/<slug>.pdf`
- WeasyPrint command: `weasyprint public/printables/<slug>.html public/printables/<slug>.pdf`

---

## Brand & Design System

### Site Theme (blog/UI colors)
| Token | Hex | Use |
|---|---|---|
| primary | #2A5C55 | Ledger Teal — nav, buttons |
| accent | #C8943A | Ink Amber — highlights |
| background | #F5F4F0 | Bond Paper |
| text | #1C2421 | Ledger Ink |
| muted | #7B8C88 | Ruled Line |
| success | #3D8C74 | Balance Green |

### Printable Color Palette (ALWAYS use these in printables)
| Name | HEX | Use For |
|---|---|---|
| Warm Cream | #FAF7F2 | Page background, odd rows |
| Light Blush | #F5F0EA | Even rows |
| Soft Blush | #F2DDD5 | Notes areas, reflection boxes |
| Light Sage | #B5C9B7 | Subheader strip, affirmation strip |
| Deep Sage | #7A9E7E | Header bg, fixed section headers |
| Dark Sage | #4A6B4E | Summary bars, darkest accents |
| Deep Rose | #C4826E | Income headers, Left Over highlight, CTA |
| Warm Taupe | #A89080 | Variable spending headers |
| Muted Purple | #8B7BA0 | Savings & Goals headers |
| Steel Blue | #6B8FAE | Debt section headers |
| Border | #DDD5C8 | Section borders |
| Field Border | #C4B5A5 | Input field underlines, dividers |
| Charcoal | #2D2D2D | Body text, labels |
| Dollar Gray | #8A7A6A | $ prefix on fields |

### Printable Typography (Master Design System)
| Element | Font | Size / Style |
|---|---|---|
| Page Title | Playfair Display (serif) | 22pt, Bold 700, white — in header bar |
| Section Headers | Playfair Display (serif) | 8.5pt, SemiBold 600, white |
| Affirmation / Notes title | Playfair Display (serif) | 7.5pt, Italic, #3D5C40 or #C4826E |
| Row Labels | Lato (sans-serif) | 7.8pt, Regular, #3D3530 |
| Total Row Labels | Lato (sans-serif) | 7.5pt, Bold uppercase, letter-spacing 0.4px |
| Subheader / Footer | Lato (sans-serif) | 6.5–7.5pt, varies |
| Dollar Prefix | Lato (sans-serif) | 7.5pt, #8A7A6A |

**Font import (include in every printable `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
```
Fallbacks: `'Playfair Display', Georgia, serif` · `'Lato', Arial, sans-serif`

### Printable Layout Rules (Master Design System)

**Page setup:**
- Size: 8.5in × 11in, portrait (landscape only for 100-envelope tracker)
- `@page { size: letter portrait; margin: 0; }` — margins handled by `.page` padding
- `.page` padding: 0.38in top · 0.42in sides · 0.30in bottom
- `.page` height: 11in, position: relative, overflow: hidden
- `page-break-after: always` on all `.page` divs except the last

**Header (every page):**
- Background: #7A9E7E · border-radius: 8px 8px 0 0 · margin: 0.38in 0.42in 0
- Title: Playfair Display 22pt bold white, letter-spacing 0.5px
- Subtitle: Lato 7.5pt italic rgba(255,255,255,0.78)
- Right side: 2 fill-in fields with white underline lines, 6.5pt uppercase labels

**Subheader strip (directly below header):**
- Background: #B5C9B7 · margin: 0 0.42in · padding: 5px 10px
- Left: Lato 7pt italic #2D2D2D — descriptive text or fill-in fields
- Right tag: Lato 7.5pt bold uppercase #4A6B4E (e.g. "PAGE 1 OF 3")

**Section blocks:**
- border-radius: 7px · border: 1px solid #DDD5C8 · overflow: hidden · margin-bottom: 6px
- Section header colors by type:
  - Income → #C4826E (deep rose)
  - Fixed Expenses → #7A9E7E (deep sage)
  - Variable Spending → #A89080 (warm taupe)
  - Savings & Goals → #8B7BA0 (muted purple)
  - Debt Minimums → #6B8FAE (steel blue)
  - Summary / Month-end → #4A6B4E (dark sage)

**Table rows (inside sections):**
- Layout: `display: grid; grid-template-columns: 1fr 0.75in; padding: 4px 10px;`
- Odd rows: background #FAF7F2 · Even rows: background #F5F0EA
- Labels: Lato 7.8pt #3D3530
- Field cell: `display: flex; align-items: flex-end; gap: 2px;`
- Dollar prefix: Lato 7.5pt #8A7A6A · Field underline: `border-bottom: 1.2px solid #C4B5A5`

**Total rows:**
- Background: rgba(0,0,0,0.04) · border-top: 1px solid #DDD5C8
- Label: Lato 7.5pt bold uppercase, letter-spacing 0.4px
- Field underline: `border-bottom: 2px solid #7A9E7E`

**Summary bar:**
- Background: #4A6B4E · border-radius: 7px · padding: 0.10in 0.14in · margin-top: 8px
- `display: grid; grid-template-columns: repeat(4,1fr); gap: 8px;`
- Cell labels: Lato 6pt uppercase rgba(255,255,255,0.70)
- Cell values: white rounded box rgba(255,255,255,0.92), Lato 9pt bold
- "Left Over" cell: background #C4826E, white text — always highlighted

**Two-column layout (main content pages):**
- `display: grid; grid-template-columns: 1fr 1fr; gap: 0.14in;`
- Left col: Income → Fixed Expenses → Debt Minimums
- Right col: Variable Spending → Savings & Goals → Affirmation → Notes

**Botanical SVG (top-right of every page, inline):**
- `position: absolute; top: 0.25in; right: 0.30in; width: 0.75in; opacity: 0.22; z-index: 2;`
- Vertical leaf/stem: `stroke="#7A9E7E"`, leaf fills `fill="#B5C9B7" fill-opacity="0.3"`, rose dot at tip `fill="#C4826E"`
- Use the SVG from `public/printables/biweekly-budget-template.html` as canonical reference

**Affirmation strip:**
- Background: #B5C9B7 · border-radius: 5px · padding: 5px 10px · margin-bottom: 6px
- Font: Playfair Display 7.5pt italic #3D5C40

**Notes areas:**
- Background: #F2DDD5 · border: 1px solid #E0C4B8 · border-radius: 7px · padding: 6px 10px
- Title: Playfair Display 7.5pt bold #C4826E
- Lines: `border-bottom: 1px solid #D4B4A8; height: 16px;`

**Footer (absolute positioned):**
- `position: absolute; bottom: 0.14in; left: 0.42in; right: 0.42in;`
- `border-top: 1px solid #DDD5C8; padding-top: 5px; display: flex; justify-content: space-between;`
- Left: Lato 6.5pt italic #B0A090 — "Free Printable — Print as many copies as you need 🌿"
- Right: Lato 7pt bold #7A9E7E — "SpendWiseCents.com"

**Reference implementation:** `public/printables/biweekly-budget-template.html` is the canonical 3-page example of the complete master design system.

---

## Blog Post Structure (GEO + SEO Rules)

Every blog post must follow this structure:

1. **Intro (150 words):** Validate the reader's pain point. No judgment. No solution yet.
2. **H2 sections:** 4–6 question-based H2s (e.g., "Why Is Biweekly Budgeting Different?")
3. **GEO rule:** Each H2 section body must be a **self-contained answer block of 134–167 words** — Google AI Overviews and Perplexity can extract and cite these directly
4. **Printable CTA:** Use `{{printable:<slug>}}` shortcode where the printable download should appear (rendered by the app)
5. **Internal links:** Always link to at least 2 other posts — use relative paths like `/blog/<slug>`
6. **FAQ section:** 5 questions minimum, stored as JSON in `faq_items` field (not in markdown body)
7. **Schema:** BlogPosting + FAQPage (handled automatically by the app via faq_items)

### Tone Rules
- Warm, judgment-free, practical — "knowledgeable friend" voice
- Never shame or lecture about spending
- Use "spending plan" or "budget" interchangeably — never "you're bad with money"
- Real dollar amounts beat generic advice (e.g., "$3,000/month" not "your income")
- Target US women 25–34; paid biweekly or monthly; income $1,500–$4,000/month

---

## The 10 Content Priorities (from SpendWiseCents_Content_Strategy.docx)

These are the 10 posts to write, in priority order. Posts already published are marked ✅.

| # | Title | Slug | Target Keyword | Category | Status |
|---|---|---|---|---|---|
| 01 | Free Biweekly Budget Template (For Paycheck-to-Paycheck Families) | free-biweekly-budget-template | biweekly budget template | budgeting-basics | ✅ Published |
| 02 | Free Monthly Budget Template Printable (That Actually Works) | free-monthly-budget-template-printable | monthly budget template | budgeting-basics | ✅ Published |
| 03 | 100 Envelope Challenge Printable: Save $5,050 in 100 Days | 100-envelope-challenge-printable | 100 envelope challenge | saving-money | ✅ Published |
| 04 | Free Budget Binder Printables: Complete Starter Pack (10 Pages) | free-budget-binder-printables | budget binder printables free | budgeting-basics | ✅ Published |
| 05 | Sinking Funds Explained: What They Are + Free Tracker Printable | sinking-funds-explained | sinking fund | budgeting-basics | ✅ Published |
| 06 | Cash Envelope System for Beginners: How to Start (Free Printable) | cash-envelope-system-beginners | cash envelope system | budgeting-basics | ✅ Published |
| 07 | How to Budget on Low Income: A Real Plan ($1,500–$2,500/Month) | how-to-budget-on-low-income | budget on low income | low-income-budget | ✅ Published |
| 08 | 52-Week Savings Challenge Printable: Save $1,378 This Year | 52-week-savings-challenge | 52 week savings challenge | saving-money | ✅ Published |
| 09 | Grocery Budget for a Family of 4: Spend $100–$150/Week | grocery-budget-family-of-4 | grocery budget family of 4 | family-budget | ✅ Published |
| 10 | Free Debt Payoff Tracker Printable: The Snowball Method Made Visual | free-debt-payoff-tracker-printable | debt payoff tracker | debt-payoff | ✅ Published |

### Printable slugs to create (one PDF per post)
01 → biweekly-budget-template ✅
02 → monthly-budget-template
03 → 100-envelope-challenge-printable
04 → budget-binder-starter-pack
05 → sinking-fund-tracker
06 → cash-envelope-printable ✅
07 → low-income-budget-worksheet
08 → 52-week-savings-challenge
09 → grocery-budget-planner
10 → debt-snowball-tracker

---

## Audience Segments (Hub Pages)

These are dynamic hub pages at `/<segment-slug>`:

| Slug | Label | Tone |
|---|---|---|
| budgeting-for-moms | Families & Moms | practical, warm |
| single-mom-budget | Single Moms | empathetic, dignified |
| college-student-budget | College Students | light, relatable |
| budget-on-low-income | Low Income | respectful, non-judgmental, NO hustle culture |
| first-job-budget | First Job | exciting, milestone-focused |
| couples-budget | Couples | relatable, solution-focused |

---

## Key File Paths

| File | Purpose |
|---|---|
| lib/site.config.ts | Brand colors, nav, audience segments |
| lib/queries.ts | All Supabase data access (DO NOT write queries elsewhere) |
| lib/supabase.ts | Supabase client setup |
| app/blog/[slug]/page.tsx | Blog post page |
| app/free-printables/[slug]/page.tsx | Printable page |
| components/MarkdownContent.tsx | Renders post content including {{printable:}} shortcode |
| public/printables/ | PDF files served directly |
| supabase/migrations/ | DB schema + seed files |

---

## Affiliate Mentions (Natural In-Post)

- **YNAB (You Need A Budget)** — mention in "tools" or "tips" sections for budgeting posts
- **EveryDollar** — alternative to YNAB, biweekly/envelope posts
- **Amazon affiliate** — binders, cash wallets, sheet protectors in binder/envelope posts
- **Undebt.it / Tally** — debt payoff posts
- Rule: one natural mention per post, never a dedicated "review" section

---

## dev Commands

```bash
npm run dev        # start dev server on localhost:3000
npm run build      # production build
npm run lint       # ESLint check
```

WeasyPrint: `weasyprint <input.html> <output.pdf>`
