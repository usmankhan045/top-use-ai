# Create Printable

**Not used on Explained AI Tools — this is a blog-only site.**

Per `docs/AI-Tools-Site-Blueprint.md`, printables and downloads intentionally live on the
separate finance site, not here. This site runs with `features.printables: false` in
`lib/site.config.ts`, so:

- The `/free-printables` routes 404
- The printables nav item, footer link, and sitemap entries are hidden
- There is no printable design system for this brand

## If you ever want to add downloads

1. Decide it fits the niche (e.g. an AI prompt pack or a tool-comparison cheat sheet — not
   budgeting worksheets).
2. Set `features.printables: true` in `lib/site.config.ts`.
3. Build the printable HTML → PDF with an on-brand design using the site theme tokens
   (Azure `#0369A1`, Amber `#F59E0B`, Sky Paper `#F6FAFD`) and fonts (Space Grotesk / Inter),
   save to `public/printables/<slug>.pdf`.
4. Insert a `printables` row for site_id `7635559c-2c64-4d76-8b3b-1c69e4a412f8`.

Until then, keep everything content-only — use `/write-post` to publish reviews, comparisons,
and guides.
