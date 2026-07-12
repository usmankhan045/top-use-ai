# Create Printable

Create a printable PDF for SpendWiseCents. Accepts a post number (01–10) or a custom spec.

## How to use

```
/create-printable 02
/create-printable "Monthly Budget Planner — 2 pages — sage/rose palette"
```

## Steps

1. **Read the spec** from CLAUDE.md (content priority table + Printable Layout Rules), or use the custom spec provided.

2. **Write the HTML file** at `public/printables/<slug>.html` using the Master Design System below.

---

### MASTER DESIGN SYSTEM

**Font imports (always include in `<head>`):**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
```

**Page setup CSS:**
```css
/* Portrait (default): */
@page { size: letter portrait; margin: 0; }
.page { width: 8.5in; height: 11in; }

/* Landscape (wide trackers, e.g. 100-envelope): */
/* @page { size: letter landscape; margin: 0; } */
/* .page { width: 11in; height: 8.5in; } */

* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Lato', Arial, sans-serif; color: #2D2D2D; background: #FAF7F2;
  -webkit-print-color-adjust: exact; }

.page {
  background: #FAF7F2;
  position: relative;
  page-break-after: always;
  overflow: hidden;
}
.page:last-child { page-break-after: avoid; }
```

**WeasyPrint gotchas — avoid these mistakes:**
- ❌ `aspect-ratio` — unsupported; always set both `width` and `height` explicitly
- ❌ `print-color-adjust: exact` — only `-webkit-print-color-adjust: exact` works
- ✅ For grids of circles/squares: use `grid-template-columns: repeat(N, Xpx)` + `grid-template-rows: repeat(N, Xpx)` with explicit `width: Xpx; height: Xpx` on each cell

**Colors:**
```
Warm Cream   #FAF7F2  — page bg, odd rows
Light Blush  #F5F0EA  — even rows
Soft Blush   #F2DDD5  — notes areas
Light Sage   #B5C9B7  — subheader strip, affirmation strip
Deep Sage    #7A9E7E  — header bg, fixed section headers
Dark Sage    #4A6B4E  — summary bars
Deep Rose    #C4826E  — income headers, Left Over highlight
Warm Taupe   #A89080  — variable spending headers
Muted Purple #8B7BA0  — savings headers
Steel Blue   #6B8FAE  — debt headers
Border       #DDD5C8  — section borders
Field Border #C4B5A5  — input underlines
Dollar Gray  #8A7A6A  — $ prefix
Charcoal     #2D2D2D  — body text
```

**Header (every page):**
```css
.header {
  background: #7A9E7E;
  border-radius: 8px 8px 0 0;
  margin: 0.38in 0.42in 0;
  padding: 8px 14px 10px;
  display: flex; justify-content: space-between; align-items: flex-end;
}
/* Title: Playfair Display 22pt bold white, letter-spacing 0.5px */
/* Subtitle: Lato 7.5pt italic rgba(255,255,255,0.78) */
/* Right side: 2 fill-in fields — white underline lines, 6.5pt uppercase labels */
```

**Subheader strip (directly below header):**
```css
.subheader {
  background: #B5C9B7;
  margin: 0 0.42in;
  padding: 5px 10px;
  display: flex; justify-content: space-between; align-items: center;
}
/* Left: Lato 7pt italic #2D2D2D  |  Right tag: Lato 7.5pt bold uppercase #4A6B4E */
```

**Body container:**
```css
.body { margin: 6px 0.42in 0; }
```

**Two-column layout (main content pages):**
```css
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.14in; }
/* Left col: Income → Fixed Expenses → Debt Minimums */
/* Right col: Variable Spending → Savings & Goals → Affirmation → Notes */
```

**Section blocks:**
```css
.section { margin-bottom: 6px; border-radius: 7px; border: 1px solid #DDD5C8; overflow: hidden; }
.section-header { font-family: 'Playfair Display', Georgia, serif; font-size: 8.5pt; font-weight: 600; color: #fff; padding: 5px 10px; }

/* Section header colors by type: */
.sh-income   { background: #C4826E; }  /* Income */
.sh-fixed    { background: #7A9E7E; }  /* Fixed Expenses */
.sh-variable { background: #A89080; }  /* Variable Spending */
.sh-savings  { background: #8B7BA0; }  /* Savings & Goals */
.sh-debt     { background: #6B8FAE; }  /* Debt Minimums */
.sh-summary  { background: #4A6B4E; }  /* Month-end / Summary */
```

**Table rows:**
```css
.row {
  display: grid; grid-template-columns: 1fr 0.75in;
  padding: 4px 10px; align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.row:last-child { border-bottom: none; }
.row.odd  { background: #FAF7F2; }
.row.even { background: #F5F0EA; }
.row.total-row { background: rgba(0,0,0,0.04); border-top: 1px solid #DDD5C8; border-bottom: none; }

.row-label { font-family: 'Lato', Arial, sans-serif; font-size: 7.8pt; color: #3D3530; }
.row.total-row .row-label { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }

/* Field cell: flex row with $ prefix + underline */
.field-cell { display: flex; align-items: flex-end; gap: 2px; }
.dollar-sign { font-size: 7.5pt; color: #8A7A6A; }
.field-line { flex: 1; border-bottom: 1.2px solid #C4B5A5; height: 14px; }
.row.total-row .field-line { border-bottom: 2px solid #7A9E7E; }
```

**Summary bar:**
```css
.summary-bar {
  background: #4A6B4E; border-radius: 7px; padding: 0.10in 0.14in;
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px;
}
.sum-label { font-size: 6pt; color: rgba(255,255,255,0.70); text-transform: uppercase; }
.sum-value { background: rgba(255,255,255,0.92); border-radius: 4px; font-size: 9pt; font-weight: 700; min-height: 22px; }
.sum-cell.highlight .sum-value { background: #C4826E; color: #fff; }  /* Left Over cell */
```

**Botanical SVG (absolute, top-right of every page):**
```html
<svg style="position:absolute;top:0.25in;right:0.30in;width:0.75in;opacity:0.22;z-index:2;" viewBox="0 0 54 90" fill="none">
  <line x1="27" y1="82" x2="27" y2="10" stroke="#7A9E7E" stroke-width="1.5"/>
  <path d="M27 42 C20 32 10 30 6 25 C13 23 22 28 27 42Z" fill="#B5C9B7" fill-opacity="0.3" stroke="#7A9E7E" stroke-width="1"/>
  <path d="M27 55 C34 45 44 43 48 38 C41 36 32 41 27 55Z" fill="#B5C9B7" fill-opacity="0.3" stroke="#7A9E7E" stroke-width="1"/>
  <path d="M27 28 C21 20 15 16 11 12 C16 12 23 17 27 28Z" fill="#B5C9B7" fill-opacity="0.3" stroke="#7A9E7E" stroke-width="1"/>
  <path d="M27 67 C33 58 40 56 44 52 C39 50 32 55 27 67Z" fill="#B5C9B7" fill-opacity="0.3" stroke="#7A9E7E" stroke-width="1"/>
  <circle cx="27" cy="8" r="3.5" fill="#C4826E"/>
</svg>
```

**Affirmation strip:**
```css
.affirmation {
  background: #B5C9B7; border-radius: 5px; padding: 5px 10px; margin-bottom: 6px;
  font-family: 'Playfair Display', Georgia, serif; font-size: 7.5pt; font-style: italic; color: #3D5C40;
}
```

**Notes area:**
```css
.notes {
  background: #F2DDD5; border: 1px solid #E0C4B8; border-radius: 7px; padding: 6px 10px 8px;
}
.notes-title { font-family: 'Playfair Display', Georgia, serif; font-size: 7.5pt; font-weight: 600; color: #C4826E; margin-bottom: 5px; }
.notes-line { border-bottom: 1px solid #D4B4A8; height: 16px; }
```

**Footer (absolute):**
```css
.footer {
  position: absolute; bottom: 0.14in; left: 0.42in; right: 0.42in;
  border-top: 1px solid #DDD5C8; padding-top: 5px;
  display: flex; justify-content: space-between; align-items: center;
}
/* Left: Lato 6.5pt italic #B0A090 — "Free Printable — Print as many copies as you need 🌿" */
/* Right: Lato 7pt bold #7A9E7E — "SpendWiseCents.com" */
```

---

3. **Convert to PDF**:
   ```bash
   weasyprint public/printables/<slug>.html public/printables/<slug>.pdf
   ```
   Verify the PDF exists and is >20KB before proceeding.

4. **Generate thumbnail** (first page → PNG):
   ```bash
   /tmp/docxenv/bin/python3 -c "
   from pdf2image import convert_from_path
   pages = convert_from_path('public/printables/<slug>.pdf', dpi=150, first_page=1, last_page=1)
   pages[0].save('public/printables/<slug>-preview.png', 'PNG')
   print('thumbnail ok', pages[0].size)
   "
   ```

5. **Insert into Supabase** (project_id: ruucexzgebbehjcrinhj):
   ```sql
   INSERT INTO printables (site_id, slug, title, description, file_url, thumbnail_url, category_id, orientation)
   VALUES ('f7998f95-ac2c-4188-8202-418c91572a45', '<slug>', '<title>', '<description>', '/printables/<slug>.pdf', '/printables/<slug>-preview.png', '<category_id>', '<portrait|landscape>')
   ON CONFLICT (site_id, slug) DO UPDATE SET file_url = EXCLUDED.file_url, title = EXCLUDED.title, thumbnail_url = EXCLUDED.thumbnail_url, orientation = EXCLUDED.orientation;
   ```
   Set `orientation` to `'landscape'` when `@page { size: letter landscape; }` is used, otherwise `'portrait'`.

## Reference implementation
`public/printables/biweekly-budget-template.html` — canonical 3-page example of the complete master design system. Read it before writing a new printable.
