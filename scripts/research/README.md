# Research tooling

Scrapes vendor pricing pages so posts cite real numbers instead of figures
copied from other articles. Built after a September 2026 audit found
`surfer-seo-vs-semrush` quoting plan names both vendors had retired.

## Setup

Scrapling is installed once at user level and is available in every project,
so there is nothing to install per repo:

```bash
uv tool install --python 3.13 "scrapling[fetchers,ai]"
scrapling install     # downloads Playwright browsers, ~320MB, one time
```

That puts three commands on your PATH:

| Command | Purpose |
|---|---|
| `scrapling` | CLI (`scrapling shell` for an interactive console) |
| `scrapling-mcp` | MCP server, lets an AI agent scrape through Scrapling |
| `scrapling-py` | Python interpreter with Scrapling importable |

`scrapling-py` is a small shim at `~/.local/bin/scrapling-py` pointing at the
interpreter uv manages. Use it to run any script that imports Scrapling:

```bash
scrapling-py some_script.py
scrapling-py -c "from scrapling.fetchers import Fetcher; print(Fetcher.get('https://example.com').status)"
```

Scrapling supports Python 3.10-3.13. The system Python is 3.14, which is why
this is pinned to 3.13 rather than using the default interpreter.

## Verifying prices

```bash
scrapling-py scripts/research/verify_pricing.py                 # all tools
scrapling-py scripts/research/verify_pricing.py surfer ahrefs   # a subset
scrapling-py scripts/research/verify_pricing.py --json out.json
```

Each line is flagged:

| Flag | Meaning |
|---|---|
| `OK` | Prices found on the vendor page |
| `QUOTE` | Page loads but sells by quote only (MarketMuse, Canva) — no number to publish |
| `NONE` | Page loaded, no prices matched — inspect by hand |
| `FAIL` | Fetch error |

`QUOTE` and `NONE` are different failures. `QUOTE` means the vendor publishes
no price, so write "check current pricing" rather than repeating a figure from
a third-party blog.

Add a tool by extending `TOOLS` in `verify_pricing.py`. Set the second tuple
value to `True` for pages that render pricing via JavaScript.

## Rules for using the output

1. **Scraped is not verified.** The scraper returns whatever is on screen,
   including promos, geo-variants and A/B tests. Scalenut's "60% off for life"
   scrapes as a normal price. Check the page before publishing.
2. **Pick the plan, not the number.** A sweep returns every price on the page
   including add-ons and overage rates. Match figures to plan names by hand.
3. **Date what you publish.** Say "verified September 2026" so the claim is
   falsifiable and re-checkable.
4. **Re-run quarterly.** Vendors rename tiers without notice; both Surfer and
   Semrush did it in 2026.

## Ad-hoc scraping

```python
from scrapling.fetchers import Fetcher, DynamicFetcher

Fetcher.get(url, stealthy_headers=True)                      # fast, beats most bot blocks
DynamicFetcher.fetch(url, network_idle=True, headless=True)  # renders JS
```

`StealthyFetcher` also exists for Cloudflare-protected pages. Prefer the
lighter fetchers, and respect each site's terms of service.

Three ways to get content off a page, cheapest first:

```python
page.css('.pricing-tier h3')   # targeted, use this when you know the shape
page.get_all_text()            # everything as plain text
page.markdown()                # clean markdown, good for reading a whole page
```

`markdown()` needs the `ai` extra, which is why the install above includes it.
Prefer a CSS selector when you can: a pricing page is ~40k characters as
markdown but a handful as a selector, and narrower output is easier to check.

## Upgrading

```bash
uv tool upgrade scrapling
scrapling install     # only if the Playwright version changed
```
