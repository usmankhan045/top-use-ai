# Pending internal links

These 15 internal links were removed on 2026-09-03 because their target posts
were still scheduled drafts, so every one was a live 404. The drafts were left
on their original publish dates deliberately — the schedule is the point, and
publishing early to satisfy a link is the wrong trade.

**Restore each link on or after its target's publish date.** Nothing does this
automatically; `scripts/publishing/publish-due.js` only flips post status.

The removals took two shapes. Most were a standalone paragraph whose only job
was pointing at the missing post, so the whole paragraph went. Two carried a
real sentence first, so only the trailing pointer was cut and the sentence was
rewritten to stand alone.

| Target (publish date) | Restore into | Original text |
|---|---|---|
| `youtube-ai-content-monetization` (Sep 15) | `best-ai-video-tools-faceless-youtube` | Worth knowing before you upload: [YouTube's AI monetization policy](/blog/youtube-ai-content-monetization) targets templated output regardless of which tool made it. |
| `youtube-ai-content-monetization` (Sep 15) | `moneyprinterturbo-review` | The monetization question deserves its own answer, and we cover the full policy in [can you monetize AI videos on YouTube](/blog/youtube-ai-content-monetization). |
| `ai-image-commercial-licences` (Sep 17) | `sell-ai-art-on-etsy` | Partial cut. Now reads "Before you list anything, check the model licence, since not every image generator lets you sell what it produces." Original: `Before you list anything, check the model licence. Our guide to [AI image commercial licences](/blog/ai-image-commercial-licences) covers which models you may legally sell from.` |
| `free-ai-transcription-tools` (Sep 21) | `best-ai-meeting-note-takers` | If you would rather not pay at all, our guide to [free AI transcription with Whisper](/blog/free-ai-transcription-tools) covers unlimited local transcription. |
| `free-ai-transcription-tools` (Sep 21) | `best-ai-productivity-tools` | For transcription and meeting notes at no cost, see [free AI transcription tools](/blog/free-ai-transcription-tools). |
| `free-ai-music-commercial-rights` (Sep 22) | `best-ai-music-generators` | Partial cut. Now reads "Before you monetize anything, check the model licence, since not every generator permits commercial use of its output." Original: `Before you monetize anything, check the model licence. Our guide to [free AI music you can actually sell](/blog/free-ai-music-commercial-rights) explains which tools permit commercial use.` |
| `free-notion-alternatives` (Sep 27) | `notion-ai-vs-chatgpt` | If Notion's pricing is the sticking point, our guide to [free Notion alternatives](/blog/free-notion-alternatives) covers which are genuinely free including sync. |
| `moneyprinterturbo-vs-paid-tools` (Oct 5) + `free-ai-video-generators-open-source` (Oct 11) | `moneyprinterturbo-review` | One line, both links: `If you want the polished commercial route instead, our comparison of [MoneyPrinterTurbo versus paid video tools](/blog/moneyprinterturbo-vs-paid-tools) covers what Pictory, InVideo and Synthesia give you for the money. For the wider free landscape, see the [best free AI video generators](/blog/free-ai-video-generators-open-source).` Restore in two stages, or wait until Oct 11 for both. |
| `best-free-ai-logo-generators` (Oct 17) | `best-ai-logo-generators` | If your budget is strictly zero, we tested which tools are genuinely free in [best free AI logo generators](/blog/best-free-ai-logo-generators). |
| `surfer-seo-alternatives` (Oct 18) | `best-ai-seo-tools` | If Surfer is your starting point but the price is not, we compared seven [Surfer SEO alternatives](/blog/surfer-seo-alternatives) on verified 2026 pricing. |
| `surfer-seo-alternatives` (Oct 18) | `surfer-seo-vs-semrush` | For a fuller breakdown of each option including current pricing, see our guide to [Surfer SEO alternatives](/blog/surfer-seo-alternatives). |
| `is-canva-magic-studio-free` (Oct 19) | `canva-ai-review` | Wondering exactly what the free plan covers? Our guide answers [whether Canva Magic Studio is free](/blog/is-canva-magic-studio-free) and which features stay locked behind Pro. |
| `predis-ai-vs-socialbee` (Oct 20) | `best-ai-social-media-tools` | Two of these come up together constantly, so we compared them directly in [Predis.ai versus SocialBee](/blog/predis-ai-vs-socialbee). |
| `ai-lead-generation-landing-pages-crm` (Oct 21) | `best-ai-lead-generation-tools` | If you specifically want AI landing pages and a CRM in one place, read our honest assessment of [AI lead generation tools with landing pages and CRM](/blog/ai-lead-generation-landing-pages-crm). |

## Why the links were cut rather than unwrapped

Unwrapping to plain text would have left sentences promising content that does
not exist — "read our honest assessment of AI lead generation tools with
landing pages and CRM" with nothing to read. That reads worse than a 404.

## Check for regressions

Every published post must link only to other published posts:

```sql
SELECT p.slug AS src, m[1] AS dst
FROM posts p, LATERAL regexp_matches(p.content, '\]\(/blog/([a-zA-Z0-9_-]+)', 'g') AS m
WHERE p.site_id = '7635559c-2c64-4d76-8b3b-1c69e4a412f8'
  AND p.status = 'published'
  AND m[1] IN (SELECT slug FROM posts
               WHERE site_id = '7635559c-2c64-4d76-8b3b-1c69e4a412f8'
                 AND status = 'draft');
```

Zero rows is correct. Each post must also keep at least two internal links per
the writing playbook; all 13 edited posts still do.
