# Content Guidelines — Explained AI Tools

These guidelines keep every article consistent, scannable, and optimised for both readers and AI discovery tools (Google AI Overviews, ChatGPT, Perplexity).

---

## Page structure

### One H1 per page

Every page has exactly **one `<h1>`** — the article title. Never add a second H1 in the body copy.

### Heading hierarchy

Use headings to express genuine content structure, not to add visual variety:

```
H1 — Article title (rendered by the page template automatically)
H2 — Major sections
H3 — Sub-topics within a section
H4 — Use sparingly; prefer restructuring as H3 sub-sections
```

Do not skip levels (H2 → H4). Screen readers and AI parsers depend on a logical hierarchy.

### One topic per section

Each H2 section covers one idea completely before moving to the next. If you find yourself writing "also…" or "another thing…" mid-section, that's a new H2.

---

## Answer-first writing

### Lead with the answer

Open every article — and every section — with the direct answer to the question the reader came with. Explanation, context, and caveats follow.

**Good:**
> Jasper is best for teams that need on-brand marketing copy at scale, and its output quality justifies the price. Solo creators on a budget should start with Rytr or Copy.ai's free plan instead.
>
> Here's how the two compare in practice…

**Not good:**
> There are many AI writing tools on the market today, and over the past few years the space has evolved rapidly with a wide variety of options. One of the most well-known is Jasper, which was originally launched as…

### Quick Answer box

Use the `quick_answer` field in every post for a 1–3 sentence plain-English answer to the article's core question. This renders as a distinct callout box at the top of the article and is the primary target for AI Overview extraction.

Rules:
- Maximum 3 sentences
- No jargon
- Answers the H1 question directly
- Does not require reading the article to understand

### FAQ section

Every post should include 3–6 FAQ items covering secondary questions readers have about the topic. These render as structured FAQ schema and target long-tail AI snippet extraction.

Format:
- Question phrased exactly as a reader would type it
- Answer is 1–3 sentences, complete without context
- Do not duplicate what the Quick Answer already covers

---

## Writing standards

### Paragraph length

Keep paragraphs to 3–5 sentences. One idea per paragraph. Walls of text are skipped by both readers and AI parsers.

### Active voice and plain language

Write at a 7th–8th grade reading level (Flesch-Kincaid). Avoid passive voice. Use contractions. Write like you're explaining to a friend, not a client.

### Lists

Use bullet lists when:
- 3 or more parallel items need to be compared
- A process has discrete steps (use numbered list)
- You're summarising key points at the end of a section

Do not use lists just to break up text. If items are connected by narrative flow, prose works better.

### Length targets

| Page type | Target word count |
|---|---|
| Core how-to guide | 1,200–2,000 words |
| Audience hub intro copy | 400–600 words |
| Category archive intro | 100–200 words |
| FAQ answer | 50–150 words each |
| Quick answer | 30–75 words |

### No filler phrases

Remove on sight:
- "In today's world…"
- "It's no secret that…"
- "Many people struggle with…"
- "In conclusion…"
- Any sentence that doesn't add information

---

## Images

- Every post should have a `featured_image_url` (used for OG and article header)
- Use descriptive `alt` text that describes what's in the image, not the article topic
- Image dimensions: 1200×630 minimum for OG; 1600×900 or wider preferred for in-article
- Upload via `/api/admin/media` to Supabase Storage; use the returned URL in the post

---

## SEO fields (filled per post via admin API)

| Field | Purpose | Max length |
|---|---|---|
| `seo_title` | `<title>` tag and OG title | 60 characters |
| `seo_description` | Meta description and OG description | 155 characters |
| `slug` | URL path (`/blog/your-slug`) | 60 characters |

### seo_title format

```
[Primary keyword] | Explained AI Tools
```

Example: `Jasper vs Copy.ai: Which AI Writer Wins? | Explained AI Tools`

### seo_description format

Lead with what the reader gets. Include the primary keyword. End with a benefit or call to action.

Example: `We tested Jasper and Copy.ai on the same brief — here's which AI writer produced better copy, and which is the better value.`

### slug format

- All lowercase
- Hyphens, no underscores
- 3–5 words matching the H1
- No stop words (the, a, an, of, for) unless essential for keyword

---

## Categories, not audience hubs

This site is organized by tool category, not audience, so there are **no audience hub pages** (`audienceSegments` is empty in `lib/site.config.ts`). The `audience_tags` field is therefore unused — assign every post a `category_id` instead. See the 6 categories in `CLAUDE.md` and the topic architecture in `docs/AI-Tools-Site-Blueprint.md`.

---

## Quick Answer component — developer notes

The Quick Answer renders when `post.quick_answer` is non-null. It appears as a green left-bordered callout at the top of the article body, before the main content.

Location: [app/blog/[slug]/page.tsx](../app/blog/[slug]/page.tsx) — the `{post.quick_answer && (...)}` block.

It is styled with role="note" and aria-label="Quick answer" for accessibility. The label uses the `.stamp` utility class (IBM Plex Mono, uppercase, off-register shadow).

The content of this box is also what AI systems are most likely to excerpt when answering a user's question — keep it factually precise and self-contained.
