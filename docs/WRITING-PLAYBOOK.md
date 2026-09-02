# Writing Playbook

How posts on this site are researched, written and published. Derived from the
September 2026 rebuild, when an audit found the site's own flagship post citing
Surfer and Semrush plan names both vendors had retired.

This is the operational companion to `content-guidelines.md` (structure and
formatting) and `CONTENT-STRATEGY.md` (topics and clusters). Read this one for
**how to establish what is true and how to say it**.

---

## The one rule everything else serves

**Never publish a fact we have not verified at its source.**

Page one for most of our topics is dominated by content mills recycling each
other's errors: dead tools, misread licences, invented hardware requirements,
retired product names. We do not compete with them on authority. We compete on
being right.

That is also what earns AI citations. The peer-reviewed GEO research (Aggarwal
et al., KDD '24, 10,000 queries) found the highest-performing techniques were
quotation addition, statistics addition, and citing sources — and that keyword
stuffing performed *worse than doing nothing*. Being accurate and specific is
the optimisation.

---

## Research

### Source tiers

| Tier | What | Use |
|---|---|---|
| 1 | Vendor pricing pages, official docs, LICENSE files, GitHub API, statutes, court judgments | Cite freely |
| 2 | Peer-reviewed papers, primary research (Epoch AI, Stanford, Pew) | Cite freely |
| 3 | Established press (TechCrunch, The Register, Engadget) | Cite for events, not specs |
| 4-5 | SEO blogs, aggregators, "best of" listicles | **Never cite.** Use only to detect that something changed, then verify at source |

**Cross-source clustering.** Eight blogs paraphrasing one vendor page is one
source, not eight. Trace claims upstream before counting them as corroboration.

**Competitor-authored content is not neutral.** Most search results for
"Otter pricing" are written by companies selling rival transcription tools.

### Verifying prices

Prices go stale constantly and vendors rename tiers without notice. Both Surfer
and Semrush retired their entire plan lineups in 2026.

```bash
scrapling-py scripts/research/verify_pricing.py surfer ahrefs
```

Flags mean different things:

- `OK` — prices found, safe to publish with a date
- `QUOTE` — vendor sells by quote only. Write "check current pricing", never a figure from a blog
- `NONE` — page loaded, nothing matched. Inspect by hand
- `FAIL` — fetch error

`QUOTE` and `NONE` are **different failures**. Confusing them is how articles
end up repeating invented MarketMuse prices.

When `StealthyFetcher` still fails, a plain web search across several
independent outlets is acceptable for widely published consumer pricing —
label it as secondary-sourced and date it.

**Geolocation warning.** This connection egresses from Pakistan, so vendors
that localise pricing (OpenAI notably) serve non-USD figures. Locale headers do
not override server-side IP geolocation. Never convert and publish; verify in a
browser or search instead.

### Verifying licences

For any open-source tool, check the actual LICENSE file, not the README badge
and not the repo's marketing.

Recurring traps found in this niche:

- **Split licences.** Meta's AudioCraft is MIT for code, **CC-BY-NC 4.0 for weights**. The weights are what matter.
- **Model vs output.** FLUX.1 dev is a non-commercial *model* whose *outputs* the licence explicitly permits selling.
- **"Open source" that is not.** n8n is fair-code (Sustainable Use License). Anytype is source-available (ASAL 1.0). Neither is OSI-approved.
- **No licence at all.** A repo with no LICENSE grants no permission, regardless of star count.
- **Revenue gates.** Kimi K3 requires a separate agreement above $20M MaaS revenue.

### Verifying a project is alive

Star counts do not decay. Check `pushed_at` and the releases page.

Found dead or stalled while still widely recommended: Magenta (archived Jan
2026), AUTOMATIC1111 (last release Feb 2025), GPT4All (Feb 2025), Play.ht
(shut down Dec 2025), Coda (now Superhuman Docs).

### Validating demand before writing

```bash
scrapling-py -c "from scrapling.fetchers import Fetcher; import json; \
print(json.loads(Fetcher.get('https://suggestqueries.google.com/complete/search?client=firefox&q=YOUR+QUERY').body)[1])"
```

Google autocomplete confirms people actually search a phrasing. Cross-check
against Search Console impressions for queries we already appear for — those
are the highest-value targets because demand is proven.

---

## Writing

### Structure

Every post follows the same shape:

1. **Bold lede paragraph.** The complete answer in 2-4 sentences. Someone who reads only this should have what they came for.
2. **Key takeaways.** 5 bullets, each a specific verified fact with a number where possible.
3. **4-8 H2 sections**, each a self-contained answer block of roughly 134-167 words.
4. **"Which should you choose?"** — concrete recommendations by user situation, not a summary.
5. **The verdict.** What we actually think, including the honest caveat.
6. **Related reading** — italic footer with 2 internal links.

### Voice

- Second person, present tense, active voice.
- Plain words. "Costs" not "is priced at". "Needs" not "requires".
- One idea per sentence. Vary sentence length.
- No hype adjectives: revolutionary, game-changing, must-have, cutting-edge.
- No hedging stacks: "it might potentially be somewhat useful".
- Contractions sparingly; they read as filler in comparison tables.

### What makes a post worth publishing

Every post must carry at least one **verified fact competitors get wrong**.
If research turns up nothing others are missing, the post is a commodity and
we should target a different angle.

Examples from the current queue:

- MusicGen's weights are CC-BY-NC — you cannot sell its output
- X charges $0.200 per link post against $0.015 plain
- GLM-5.3 is not MIT; only GLM-5.3-Flash is
- open-seo needs a $50 API deposit before returning a single result
- SiYuan charges to sync to storage you already own

### Say what is wrong with the thing

Every post names real limitations. Not false balance — actual failure modes,
hidden costs and who should skip it.

A post that only lists strengths reads as marketing and gets treated as such.
"Who should skip this" sections are frequently the most useful part.

### Handling uncertainty

Three permitted forms:

1. **Verified** — state it plainly, dated. "Verified September 2026."
2. **Attributed** — "Mistral claims 7x more cost-efficient", "its own paper reports"
3. **Unverified** — "check current pricing" and move on

Never a fourth form where an unverified number appears as fact. If a figure
cannot be verified, the sentence works without it.

### Numbers

- Always dated: "verified September 2026"
- Always exact: "$16.99/user/month" not "around $17"
- Always attributed when they come from a vendor's own benchmark
- Promotional prices flagged as promotional. Scalenut's "60% off for life" is not its regular rate.

---

## SEO, AEO and GEO

### On-page

- SEO title under 60 characters or it truncates in the SERP
- Meta description 140-160 characters, containing the primary keyword
- Slug short and keyword-led, no dates (posts get updated)
- One H1, logical H2/H3 hierarchy, no skipped levels

### FAQs

5 per post minimum, stored in `faq_items`, not in the markdown body.

Questions must be **phrasings people actually search**, taken from autocomplete
or Search Console — not invented. Answers are 40-80 words and self-contained.

Note: Google retired FAQ rich results for all sites on 7 May 2026. We keep
`faq_items` for AI citation value, not for SERP snippets.

### GEO techniques that measurably work

From the KDD '24 GEO paper, in order of measured effect:

1. **Quotation addition** (27.2 vs 19.3 baseline) — quote licences, docs and policies verbatim
2. **Statistics addition** (25.2) — specific verified numbers throughout
3. **Cite sources** (24.6) — name where each fact came from
4. **Fluency optimisation** (24.7) — clear readable prose
5. **Keyword stuffing** (17.7) — **worse than doing nothing**

The same paper found citing sources produced a **+115% visibility increase for
pages ranked #5**, while the #1-ranked page lost 30%. GEO disproportionately
helps lower-ranked sites, which is why it is our strongest channel.

**Correction worth remembering:** Perplexity is the *most* Google-aligned
assistant (28.6% overlap with Google's top 10 per Ahrefs; 91% domain overlap
per Semrush), not the most open to small sites. ChatGPT, Gemini and Copilot
cite outside the top 10 far more often.

**Do not build an `llms.txt` for SEO.** Google confirmed in June 2026 that
Search ignores it. It is an agent-documentation convention, not a ranking factor.

---

## Internal linking

- **Minimum 2, target 3-5** contextual internal links per post
- Placed inside relevant prose, never dumped in a block
- Plus an italic *Related reading* footer with 2 links
- **Zero orphans.** Every new post needs inbound links from existing posts before it publishes
- Descriptive anchors, never "click here"

Check the whole graph after any batch:

```bash
# broken links, orphans, self-links
scrapling-py -c "..."   # see git history for the audit snippet
```

A new post with no inbound links gets crawled late and inherits no authority.
That was the single biggest fixable problem in the September 2026 audit: nine
orphan pages including the site's three highest-impression posts.

---

## Mining existing posts for new ones

The most efficient source of new posts is the ones already written.

A section with standalone search demand is a better post than a buried
subsection, because a subsection cannot rank for its own query.

Process:

1. List H2 sections across published posts
2. Test each against Google autocomplete
3. Where demand exists, expand it into a full post
4. Link the new post to and from its parent

Posts created this way from existing drafts: YouTube AI monetization policy,
AI image commercial licences, open source LLM API pricing, X API pricing,
voice cloning legality, Whisper implementations.

---

## Publishing

Posts are written as `status='draft'` with a future `published_at`. A daily
GitHub Action flips them when due.

```bash
node scripts/publishing/publish-due.js --list      # queue
node scripts/publishing/publish-due.js --dry-run   # what would publish
```

**Drafts rather than future dates** because `lib/queries.ts` filters on status
and only null-checks `published_at` — a future date alone publishes immediately.

### Cadence

Publishing velocity is weighed against domain authority. A young domain
publishing daily looks like a content farm.

- New domain, no backlinks: every 2-3 days
- After clean indexing is confirmed: daily is defensible
- Never a large batch at once. The 40-post single-day launch in July 2026 is a
  significant part of why this site sat at position 68

### Commits

**Do not add `Co-Authored-By` trailers.** Vercel validates every commit author
against project members, and on Hobby plan with a private repo a second author
blocks deployment.

---

## Pre-publish checklist

- [ ] Every price verified at source and dated, or marked "check current pricing"
- [ ] Every licence read from the LICENSE file, not the README badge
- [ ] Project confirmed alive (`pushed_at`, releases page)
- [ ] At least one verified fact competitors get wrong
- [ ] Real limitations and a "who should skip this" section
- [ ] Bold lede answers the question completely
- [ ] 5+ FAQs using real search phrasings
- [ ] SEO title under 60 chars, description 140-160
- [ ] 3-5 contextual internal links plus Related reading footer
- [ ] Inbound links added from existing posts (no orphans)
- [ ] No Tier 4-5 sources cited anywhere
- [ ] Scheduled at the right cadence for current domain authority
