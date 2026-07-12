# SEO / AEO / GEO Implementation Checklist

Status as of 2026-06-14. AEO (Answer Engine Optimisation) and GEO (Generative Engine Optimisation) build on standard SEO by adding an AI-discovery layer.

---

## ✅ Implemented

### Metadata (every page)

- [x] Title template `%s | SpendWiseCents` via root layout metadata
- [x] Default `description` from `siteConfig.tagline`
- [x] `metadataBase` set to `https://spendwisecents.com` for absolute URL resolution
- [x] Canonical `alternates.canonical` on every page (layout default `/`, overridden per route)
- [x] OpenGraph `siteName`, `type`, `locale`, default `og:image` (`/og-default.jpg`)
- [x] Twitter card `summary_large_image` default with fallback image
- [x] Per-post: OG `title`, `description`, `type: "article"`, `publishedTime`, `modifiedTime`, `authors`
- [x] Per-post: Twitter card with post's `featured_image_url` when available
- [x] Legal pages (`/privacy-policy`, `/disclaimer`, `/terms-of-use`) set `robots: { index: false }`

### JSON-LD Structured Data

- [x] **WebSite** schema on every page (via RootLayout) — includes `SearchAction` potential action
- [x] **Organization** schema on every page (via RootLayout) — `sameAs` Pinterest
- [x] **Article** schema on every post page — headline, description, image, datePublished, dateModified, author, publisher
- [x] **FAQPage** schema on posts with `faq_items` — targets featured snippets and AI Overview FAQ extraction
- [x] **BreadcrumbList** schema on post pages and category pages

### AEO — Answer-First Content Architecture

- [x] **Quick Answer box** rendered at top of every post when `post.quick_answer` is non-null (green callout, role="note", aria-label="Quick answer")
- [x] **FAQ section** rendered at bottom of every post when `post.faq_items.length > 0` (structured with H3 per question)
- [x] FAQ items also emit `FAQPage` JSON-LD — dual targeting (featured snippets + AI Overviews)
- [x] Content guidelines documented in `/docs/content-guidelines.md`

### GEO — AI Discovery

- [x] **`/public/llms.txt`** — Markdown-formatted site description with links to all major sections; follows llmstxt.org spec; includes key facts for AI citation
- [x] **`robots.ts`** — explicitly permits GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, cohere-ai (all on `/`, blocked from `/api/` and `/admin/`)
- [x] Answer-first writing format targets AI passage extraction (best signal for Perplexity/ChatGPT citations)

### Crawlability & Indexability

- [x] **`app/sitemap.ts`** — dynamic sitemap covering: homepage, blog index, start-here, free-printables, about, contact, all audience hub pages (from `siteConfig`), all published posts (from Supabase), all category pages (from Supabase); `revalidate = 3600`
- [x] **`app/robots.ts`** — `Sitemap:` directive included; `/api/` and `/admin/` disallowed
- [x] `generateStaticParams` on all dynamic routes (posts, categories, hub pages) for pre-rendering

### Performance

- [x] `next/font` — Fraunces, Public Sans, IBM Plex Mono loaded via `lib/fonts.ts` with `display: "swap"`; font variables injected as CSS custom properties
- [x] `next/image` on all blog post featured images — `fill` layout, `sizes="100vw"`, `priority` on hero (above-fold image)
- [x] `next.config.ts` — Supabase Storage remote pattern configured (`**.supabase.co`)
- [x] ISR (`revalidate = 3600`) on all dynamic pages — 1-hour cache with on-demand revalidation via admin API writes

---

## 📋 Manual Follow-ups Required

### Search Console & Bing Webmaster

1. **Google Search Console**
   - Add property for `spendwisecents.com`
   - Verify via DNS TXT record or HTML file in `/public/`
   - Submit `https://spendwisecents.com/sitemap.xml`
   - Monitor Core Web Vitals report after launch

2. **Bing Webmaster Tools**
   - Add site and verify
   - Submit sitemap URL
   - Import from Google Search Console for faster setup

3. **Pinterest domain verification**
   - In Pinterest Business account → Claim website → get meta tag
   - Add the `name="p:domain_verify"` meta tag to layout.tsx:
     ```ts
     other: { "p:domain_verify": "YOUR_CODE_HERE" }
     ```
   - Pinterest is in `siteConfig.social.pinterest` — this signals brand authority to Google

### OG Default Image

- Create `/public/og-default.jpg` at **1200×630px**
- Design: site name, tagline, brand colors (primary `#2A5C55`, accent `#C8943A`, background `#F5F4F0`)
- Use Fraunces for the title, Public Sans for the tagline
- This image appears in social shares for any page without a post-specific featured image

### Per-post OG Images

- Ideal: auto-generate OG images using Next.js `opengraph-image.tsx` (dynamic text-on-brand-bg)
- Or: manually create and upload per post via admin media API, set as `featured_image_url`

### Twitter/X Account

- Create `@spendwisecents` on X (if not already done)
- Add to `siteConfig.social` and update the Twitter card metadata:
  ```ts
  twitter: { card: "summary_large_image", creator: "@spendwisecents" }
  ```

### Core Web Vitals

Run Lighthouse after deploying to Vercel:
```bash
# Install globally
npm install -g lighthouse

# Run against production URL
lighthouse https://spendwisecents.com --output=html --output-path=lighthouse-report.html
```

Target scores: **Performance ≥ 90, Accessibility ≥ 95, Best Practices = 100, SEO = 100**

Key things to watch:
- **LCP** (Largest Contentful Paint): ensure hero image uses `priority` on `<Image>` — already done
- **CLS** (Cumulative Layout Shift): set explicit `width`/`height` on any fixed-size images
- **INP** (Interaction to Next Paint): minimal JS on these pages; EmailSignup is the main interactive element

### Structured Data Validation

- Validate with Google Rich Results Test: https://search.google.com/test/rich-results
- Test: homepage (Organization), a post with FAQs (Article + FAQPage + BreadcrumbList)
- Validate sitemap at Search Console → Sitemaps

### llms.txt Enhancements

Once real posts are published, add a "Top Articles" section to `/public/llms.txt`:
```markdown
## Top Articles

- [Title](/blog/slug): One-sentence description of the answer it provides.
```
This helps AI systems surface specific articles in responses.

### Analytics

- Set up Google Analytics 4 or Plausible
- Create a custom event for email signups (POST to /api/subscribe)
- Track hub page → blog post conversion funnel

---

## Architecture Notes

| Layer | Implementation | File |
|---|---|---|
| Metadata | Next.js Metadata API | Every `page.tsx`, `layout.tsx` |
| JSON-LD injection | `<JsonLd>` component | `components/JsonLd.tsx` |
| Schema builders | Pure functions | `lib/schema.ts` |
| Sitemap | `app/sitemap.ts` (dynamic) | `app/sitemap.ts` |
| Robots | `app/robots.ts` | `app/robots.ts` |
| AI discovery | `llms.txt` | `public/llms.txt` |
| Answer-first content | `quick_answer` field + callout | `app/blog/[slug]/page.tsx` |
| FAQ schema | `faq_items` field + FAQPage JSON-LD | `app/blog/[slug]/page.tsx`, `lib/schema.ts` |
| ISR + on-demand | `revalidate = 3600` + admin API writes | All dynamic pages + `lib/revalidatePortfolio.ts` |
