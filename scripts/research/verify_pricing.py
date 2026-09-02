#!/usr/bin/env scrapling-py
"""Verify tool pricing against vendor pages before publishing.

Scrapes the pricing pages of tools cited across the blog so posts can quote
real numbers instead of figures copied from other people's articles.

Usage:
    scrapling-py scripts/research/verify_pricing.py            # all tools
    scrapling-py scripts/research/verify_pricing.py surfer ahrefs
    scrapling-py scripts/research/verify_pricing.py --json out.json

Notes:
  - Prices appear in several formats ("$99", "USD 99", "99/mo"), so we match
    broadly and let a human pick the right number.
  - A page that renders fine but shows no price usually means quote-only
    pricing (MarketMuse), not a scrape failure. That distinction is reported.
"""
import argparse, json, re, sys
from datetime import date

# static=True uses a plain HTTP request (fast); static=False renders JS.
TOOLS = {
    "surfer":        ("https://surferseo.com/pricing/", False),
    "semrush":       ("https://www.semrush.com/pricing/", False),
    "ahrefs":        ("https://ahrefs.com/pricing", False),
    "clearscope":    ("https://www.clearscope.io/pricing", False),
    "frase":         ("https://www.frase.io/pricing/", False),
    "neuronwriter":  ("https://neuronwriter.com/pricing/", False),
    "scalenut":      ("https://www.scalenut.com/pricing", False),
    "seranking":     ("https://seranking.com/pricing.html", False),
    "marketmuse":    ("https://www.marketmuse.com/pricing/", False),
    "socialbee":     ("https://socialbee.com/pricing/", False),
    "predis":        ("https://predis.ai/pricing/", False),
    "buffer":        ("https://buffer.com/pricing", False),
    "later":         ("https://later.com/pricing/", False),
    "hootsuite":     ("https://www.hootsuite.com/plans", False),
    "contentstudio": ("https://contentstudio.io/pricing", False),
    "taplio":        ("https://taplio.com/pricing", False),
    "publer":        ("https://publer.com/pricing", False),
    "metricool":     ("https://metricool.com/pricing/", False),
    "logomaster":    ("https://app.logomaster.ai/pricing", True),
    "tailorbrands":  ("https://www.tailorbrands.com/pricing", True),
    "looka":         ("https://looka.com/pricing/", True),
    "namecheap":     ("https://www.namecheap.com/logo-maker/", False),
    "recraft":       ("https://www.recraft.ai/pricing", False),
    "canva":         ("https://www.canva.com/pricing/", True),
    "jasper":        ("https://www.jasper.ai/pricing", False),
    "copyai":        ("https://www.copy.ai/prices", False),
    "elevenlabs":    ("https://elevenlabs.io/pricing", False),
    "synthesia":     ("https://www.synthesia.io/pricing", False),
}

PRICE_RES = [
    r"\$\s?[0-9][0-9,]*(?:\.[0-9]{2})?",   # $99, $1,499, $12.50
    r"USD\s+[0-9][0-9,]*",                  # USD 39
    r"\b[0-9]+(?:\.[0-9]{2})?\s?(?:/|per\s)\s?mo\b",  # 99/mo
]
QUOTE_RE = r"(?i)\b(book a demo|contact sales|request a demo|talk to sales|custom pricing|get a quote)\b"


def prices_in(text):
    found = []
    for rx in PRICE_RES:
        found += re.findall(rx, text)
    cleaned = {re.sub(r"\s+", " ", f).strip() for f in found}
    # drop $0 and bare cents, which are almost always overage rates or noise
    return sorted(c for c in cleaned if not re.fullmatch(r"\$\s?0(\.00)?", c))


def check(name, url, needs_js):
    from scrapling.fetchers import Fetcher, DynamicFetcher
    try:
        if needs_js:
            page = DynamicFetcher.fetch(url, network_idle=True, headless=True, wait=4000)
        else:
            page = Fetcher.get(url, stealthy_headers=True)
        text = page.get_all_text()
        # A JS shell renders almost no text; retry with a browser.
        if not needs_js and (len(text) < 500 or not prices_in(text)):
            page = DynamicFetcher.fetch(url, network_idle=True, headless=True, wait=4000)
            text = page.get_all_text()
        found = prices_in(text)
        quote_only = bool(re.search(QUOTE_RE, text)) and not found
        return {
            "tool": name, "url": url, "status": page.status,
            "prices": found[:25],
            "quote_only": quote_only,
            "note": "quote-based pricing, no public figures" if quote_only else "",
        }
    except Exception as e:
        return {"tool": name, "url": url, "status": None, "prices": [],
                "quote_only": False, "note": f"ERROR {type(e).__name__}: {e}"[:200]}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("tools", nargs="*", help="tool names (default: all)")
    ap.add_argument("--json", metavar="PATH", help="write results to a JSON file")
    args = ap.parse_args()

    names = args.tools or list(TOOLS)
    unknown = [n for n in names if n not in TOOLS]
    if unknown:
        sys.exit(f"Unknown tool(s): {', '.join(unknown)}\nAvailable: {', '.join(TOOLS)}")

    results = []
    for n in names:
        url, js = TOOLS[n]
        r = check(n, url, js)
        results.append(r)
        if r["note"].startswith("ERROR"):
            flag = "FAIL"
        elif r["quote_only"]:
            flag = "QUOTE"
        elif r["prices"]:
            flag = "OK"
        else:
            flag = "NONE"
        print(f"[{flag:5}] {n:14} {', '.join(r['prices'][:8]) or r['note']}")

    if args.json:
        with open(args.json, "w") as f:
            json.dump({"checked": date.today().isoformat(), "results": results}, f, indent=2)
        print(f"\nWrote {args.json}")

    print("\nVerify anything you publish against the page itself. Scraped values "
          "can be promos, geo-variants, or A/B tests.")


if __name__ == "__main__":
    main()
