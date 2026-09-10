# Pinterest Board Descriptions

Copy-paste descriptions for the six boards on `pinterest.com/topuseai`. Each is
written from the posts that actually pin into that board, so the keywords match
the pins Pinterest will crawl underneath them.

## Rules these follow

- **Under 500 characters.** Pinterest's field caps at 500. Search snippets cut
  around 50 to 60, so the first sentence has to carry the keyword and stand
  alone.
- **Front-loaded keywords.** The phrase a searcher types comes first, not after
  a throat-clearing intro. Board titles are the stronger ranking signal, so the
  description's job is to widen the net with synonyms and long-tail phrasing.
- **Named tools.** Pinterest search indexes these terms, and they are what
  people actually search. Every tool named here appears in a pin on that board.
- **No income claims.** Same rule as pin descriptions, enforced by
  `scripts/pinterest/validate-pins.js`. No "make $X", no earnings promises.
- **No em dashes.** House rule, sitewide.
- **Facts are verified.** Every specific below traces to a `quick_answer` in the
  post that pins into that board. Prices and limits change, so re-check before
  reusing these in ad copy.

---

## Faceless YouTube Ideas

*21 posts, 63 pins. The largest board.*

```
Faceless YouTube channel ideas, AI video tools and voiceover tips for creators who never show their face. Honest comparisons of ElevenLabs, Murf, Synthesia, HeyGen and free open-source tools like MoneyPrinterTurbo, plus what a faceless channel really costs to run each month. Covers YouTube's inauthentic content policy and what it means for AI video monetisation. Text to video, AI voice cloning, faceless niches and setup guides. Tested, not hyped.
```

**Why this shape:** "Faceless YouTube" is the head term and opens the
description. Tool names carry the long-tail. The policy line is the board's
genuine differentiator: most faceless-YouTube boards ignore monetisation rules
entirely, and it is the question that sends people searching.

---

## Work From Home Ideas

*20 posts, 60 pins.*

```
Work from home tools and AI automation for freelancers, solopreneurs and small teams. Real comparisons of n8n, Zapier, Make, Notion alternatives, Otter, Fireflies and Whisper for transcription, plus AI lead generation, cold email and chatbot tools that fit a one-person business. Includes which automation tools are genuinely free, which licences let you resell, and where the per-task billing catches you out. Remote work setups, productivity stacks and honest tool reviews.
```

**Why this shape:** This board mixes productivity, automation and business
tools, so the description has to signal all three without becoming a list. The
licence and billing angles are the specific hooks from
`free-zapier-alternatives-compared` and `n8n-vs-zapier-make`, and they separate
this from generic WFH boards.

---

## AI Art & Wall Art

*11 posts, 33 pins.*

```
AI art, printable wall art and image generator guides for creators selling their work. Midjourney, DALL-E, Ideogram, Leonardo, Canva and free local tools like Stable Diffusion and FLUX compared on quality, cost and licence. Covers the commercial rights question properly: which models let you sell what you generate, which restrict the model but not the output, and where the revenue caps sit. Prompt ideas, printable art, logo design and gallery wall inspiration.
```

**Why this shape:** Commercial licensing is the buried question for anyone
selling AI art, and `ai-image-commercial-licences` has a genuinely
counterintuitive answer (FLUX.1 dev is labelled non-commercial yet permits
selling the output). Leading with it in sentence three earns the click from
sellers, while "printable wall art" and "gallery wall" keep the decor searchers.

---

## Blogging & SEO Tips

*11 posts, 33 pins.*

```
Blogging and SEO tips for new bloggers using AI the honest way. Surfer SEO, Semrush, Frase and free tools like Search Console, Bing Webmaster and Google Trends compared on what they actually cost and who each one suits. Covers starting an AI blog, writing posts with AI without sounding like AI, keyword research, and Pinterest strategy with Ideogram and Canva for pins that rank. On-page SEO, content planning and blog traffic growth.
```

**Why this shape:** "Blogging tips" and "SEO tips" both open the description
because the board serves two search intents. "Without sounding like AI" is
deliberate: it is high-intent long-tail with far less competition than "write
with AI", and it matches what `how-to-write-blog-post-with-ai` actually covers.

---

## Free AI Tools

*9 posts, 27 pins.*

```
Free AI tools and open-source models you can run on your own laptop, no subscription needed. Ollama, LM Studio, Kimi, GLM and open-weight models compared against ChatGPT Plus, Claude Pro and Google AI Pro on cost, privacy and what they realistically handle. Covers the RAM and VRAM you need, which models fit 8GB, and where local AI still falls short on hard reasoning. Free ChatGPT alternatives, offline AI and private AI assistants.
```

**Why this shape:** This board is specifically local and open-source AI, not
"free tools" in general, so the description narrows fast to keep the audience
right. Naming the RAM question surfaces `best-local-coding-model-vram`, and
admitting the weakness matches the site's voice and pre-empts the obvious
objection.

---

## Passive Income Ideas

*8 posts, 24 pins. Smallest board, keep feeding it.*

```
Passive income ideas using AI tools, written without the hype. Digital products, printables, prompt packs, Notion and Canva templates, selling AI art on Etsy, print on demand and affiliate marketing for beginners. Covers what each one actually involves, the platform rules that catch people out (Etsy requires you to disclose AI use), and which formats are realistic to start small. Side hustle ideas, online income streams and honest first steps.
```

**Why this shape:** Passive-income boards are saturated with unrealistic
promises, so "without the hype" and "realistic" are the positioning. The Etsy
disclosure rule is a concrete, checkable fact that signals the board is written
by someone who read the terms. No earnings figures anywhere, per the validator.

---

## The seventh board

The account shows **Digital Products to Sell** with 0 pins. It is not one of the
six in `PINTEREST-PLAYBOOK.md`, and its topic is already covered by Passive
Income Ideas (`sell-digital-products-with-ai`, `sell-ai-art-on-etsy`,
`chatgpt-prompts-to-make-money` all pin there).

The playbook's rule is that boards below 20 pins get merged rather than left
thin, and an empty board is a weak signal on a young account. Either delete it
and let Passive Income Ideas carry the topic, or commit to filling it by
reassigning the digital-product posts out of Passive Income Ideas. Do not leave
it at zero.

If you do keep it:

```
Digital products to sell online, made faster with AI. Printables, prompt packs, ebooks, Notion and Canva templates, planners and spreadsheets, with what each format takes to produce and where to sell it. Etsy for built-in traffic, Gumroad for control and lower fees. Covers the platform rules on AI-generated listings, and how to test an idea cheaply before you build the full product. Digital product ideas, template shops and passive income starters.
```

---

## Board balance

| Board | Posts | Pins |
|---|---|---|
| Faceless YouTube Ideas | 21 | 63 |
| Work From Home Ideas | 20 | 60 |
| AI Art & Wall Art | 11 | 33 |
| Blogging & SEO Tips | 11 | 33 |
| Free AI Tools | 9 | 27 |
| Passive Income Ideas | 8 | 24 |

Every board clears the 20-pin threshold once all three batches are uploaded.
Faceless YouTube and Work From Home carry more than half the pins between them,
which matches where the affiliate money is, so that skew is intentional.
