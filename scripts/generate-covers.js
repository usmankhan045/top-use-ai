/**
 * Generate social/preview covers for published posts.
 *
 *   node scripts/generate-covers.js              # every published post
 *   node scripts/generate-covers.js --missing    # only posts without a /covers/ image
 *   node scripts/generate-covers.js --slug=foo   # a single post
 *   node scripts/generate-covers.js --write-db   # also point featured_image_url at the new file
 *
 * Requires playwright (dev-only, not a runtime dependency):
 *   npm i -D playwright && npx playwright install chromium
 *
 * Output: public/covers/<slug>.png at 1200x630, the standard OG size.
 *
 * Design notes
 * ------------
 * The plate is graphite, not paper. That is deliberate: these covers sit inside
 * white cards on the blog grid, and a paper-colored cover disappeared into them.
 * Type is set in the site's own three faces, embedded here as woff2 so a cover
 * rendered on any machine is byte-identical.
 *
 * The motif is one constant graphic shared by every cover — a radial scorecard,
 * four concentric arcs at different sweeps standing in for the criteria this
 * site rates a tool on. One arc is lime and the rest are dim, so there is a
 * single place for the eye to land. The hub sits near the right edge and the
 * rings run off it, so each plate reads as a crop of a larger dial. Keeping the
 * motif constant is deliberate: the set should read as one publication, not
 * forty one-off illustrations.
 *
 * The headline is intentionally repeated in the cover art and in the card's
 * markup — the card's copy is visually hidden (sr-only) rather than removed,
 * because text baked into a PNG is invisible to search engines and screen
 * readers. Do not "clean that up" by deleting the heading.
 *
 * To restore the pre-redesign images, run scripts/rollback-covers.sql.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'covers');
const SITE_ID = '7635559c-2c64-4d76-8b3b-1c69e4a412f8';

const args = process.argv.slice(2);
const ONLY_MISSING = args.includes('--missing');
const WRITE_DB = args.includes('--write-db');
const ONE_SLUG = (args.find(a => a.startsWith('--slug=')) || '').split('=')[1];

// ── Brand tokens ─────────────────────────────────────────────────────────────
// Kept in sync with lib/site.config.ts by hand: this script runs outside the
// Next build and cannot import the TS config.
const INK = '#17161F';
const GRAPHITE = '#22202E';
const PAPER = '#FBFAF6';
const LIME = '#D6FF3F';
const SLATE = '#5C5A68';

const STROKE = 'rgba(251,250,246,0.17)'; // dim paper, outlines every motif shape
const FILL = 'rgba(214,255,63,0.15)';    // dim lime, the interior of each node

// ── Fonts ────────────────────────────────────────────────────────────────────
const font = f => fs.readFileSync(path.join(__dirname, 'fonts', f)).toString('base64');
const FONTS = {
  bricolage: font('bricolage-grotesque.woff2'),
  hanken: font('hanken-grotesk.woff2'),
  mono: font('geist-mono.woff2'),
};

// ── Content-derived bits ─────────────────────────────────────────────────────

/**
 * The badge names the *format* of the post, which is what a reader most wants
 * from a thumbnail: is this a verdict, a matchup, or a walkthrough. Order
 * matters — the first match wins, so the most specific patterns come first.
 */
function badgeFor(title) {
  const t = title.toLowerCase();
  if (/\bvs\.?\b/.test(t)) return 'Head to head';
  if (/^how to|step by step|\(step by step\)/.test(t)) return 'Step-by-step guide';
  if (/\breview\b/.test(t)) return 'Hands-on review';
  if (/^best\b|\bbest\b.*\b(tools|apps|generators|makers)\b/.test(t)) return 'Tested & ranked';
  if (/prompts?\b/.test(t)) return 'Copy-paste prompts';
  if (/make money|side hustle|earn\b/.test(t)) return 'Make money with AI';
  if (/how much|\bcost\b|pricing\b/.test(t)) return 'What it really costs';
  if (/\bfree alternatives?\b|alternatives? to\b/.test(t)) return 'Free alternatives';
  if (/beginners?\b/.test(t)) return "Beginner's guide";
  // Never fall back to the site tagline: it already sits in the footer of every
  // plate, and repeating it reads as a template that failed to fill in.
  return 'Hands-on guide';
}

/** Step the headline down in size so long titles never overflow the plate. */
function titleSize(title) {
  const n = title.length;
  if (n <= 34) return 78;
  if (n <= 52) return 66;
  if (n <= 72) return 57;
  return 50;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Hyphenated product names ("DALL-E", "text-to-video") are one token to a
 * reader but a line-break opportunity to the browser. Non-breaking hyphens keep
 * them whole; titles are short enough that this can never cause overflow.
 */
const nbHyphen = s => s.replace(/(\w)-(\w)/g, '$1‑$2');

// ── The motif ────────────────────────────────────────────────────────────────
// A radial scorecard: four concentric arcs at different sweeps, the way this
// site actually rates a tool — ease of use, output quality, value, speed. One
// arc is lime and the rest are dim, so there is a single place for the eye to
// land. The hub sits near the right edge and the rings run off it, so the plate
// reads as a crop of a larger dial rather than a self-contained badge.
const HUB_X = 1060;
const HUB_Y = 286;

// [radius, sweep end angle, is this the highlighted score]
// Angles are degrees clockwise from 12 o'clock. Every arc starts at 188°, so
// the set shares a baseline and the differing end points read as different
// scores rather than as arbitrary decoration.
const ARC_START = 202;
const RINGS = [
  [222, 338, false],
  [182, 316, true],
  [142, 296, false],
  [102, 330, false],
];

/** Point on a circle, measured in degrees clockwise from 12 o'clock. */
function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const [x1, y1] = polar(cx, cy, r, startDeg);
  const [x2, y2] = polar(cx, cy, r, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

function motifSvg() {
  const rings = RINGS.map(([r, end, lit]) => {
    const stroke = lit ? 'rgba(214,255,63,0.62)' : STROKE;
    const width = lit ? 15 : 12;
    const [ex, ey] = polar(HUB_X, HUB_Y, r, end);
    // A cap dot on each arc end, the way a progress readout terminates.
    return `<path d="${arcPath(HUB_X, HUB_Y, r, ARC_START, end)}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"/>
      <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="${lit ? 11 : 8}" fill="${lit ? 'rgba(214,255,63,0.85)' : 'rgba(251,250,246,0.26)'}"/>`;
  }).join('\n      ');

  // Tick marks around the outside, the scale the arcs are read against.
  let ticks = '';
  for (let deg = 202; deg <= 342; deg += 8.5) {
    const [x1, y1] = polar(HUB_X, HUB_Y, 242, deg);
    const [x2, y2] = polar(HUB_X, HUB_Y, 256, deg);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(251,250,246,0.14)" stroke-width="3" stroke-linecap="round"/>`;
  }

  return `<svg class="motif" viewBox="0 0 1156 586" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="glow" cx="88%" cy="46%" r="52%">
          <stop offset="0%" stop-color="rgba(214,255,63,0.11)"/>
          <stop offset="100%" stop-color="rgba(214,255,63,0)"/>
        </radialGradient>
      </defs>
      <rect width="1156" height="586" fill="url(#glow)"/>
      ${ticks}
      ${rings}
      <circle cx="${HUB_X}" cy="${HUB_Y}" r="30" fill="rgba(214,255,63,0.88)"/>
      <circle cx="${HUB_X}" cy="${HUB_Y}" r="12" fill="${GRAPHITE}"/>
    </svg>`;
}

/**
 * The brand mark, identical in geometry to app/icon.svg and components/
 * BrandMark.tsx. Lime tile with a graphite mark, the inverted form used on
 * dark grounds. Change one, change all three.
 */
function markSvg(size) {
  return `<svg class="tile" width="${size}" height="${size}" viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="128" fill="${LIME}"/>
      <path d="M256 406 A150 150 0 1 1 406 256" fill="none" stroke="${GRAPHITE}" stroke-width="56" stroke-linecap="round"/>
      <circle cx="256" cy="256" r="62" fill="${GRAPHITE}"/>
    </svg>`;
}

// ── The plate ────────────────────────────────────────────────────────────────

function html(post) {
  const title = post.title;
  const category = post.categories?.name || 'AI Tools';

  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Bricolage;font-weight:600 800;src:url(data:font/woff2;base64,${FONTS.bricolage}) format("woff2")}
@font-face{font-family:Hanken;font-weight:100 900;src:url(data:font/woff2;base64,${FONTS.hanken}) format("woff2")}
@font-face{font-family:GeistMono;font-weight:100 900;src:url(data:font/woff2;base64,${FONTS.mono}) format("woff2")}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{background:${GRAPHITE};font-family:Hanken,sans-serif;-webkit-font-smoothing:antialiased;position:relative;overflow:hidden}
.plate{
  position:absolute; inset:22px;
  border:2px solid rgba(255,255,255,0.16); border-radius:28px; background:${GRAPHITE};
  overflow:hidden;
  display:flex; flex-direction:column; justify-content:space-between;
  padding:44px 52px;
}
.motif{position:absolute; inset:0; width:100%; height:100%; z-index:0}

.top{display:flex; align-items:flex-start; justify-content:space-between; gap:28px; position:relative; z-index:1}
.eyebrow{font-family:GeistMono,monospace; font-size:19px; font-weight:500; letter-spacing:.14em; text-transform:uppercase; color:${LIME}; display:flex; align-items:center; gap:14px}
.bar{width:32px;height:10px;border-radius:99px;background:${LIME};flex:none}
.brand{display:flex; align-items:center; gap:12px; flex:none}
.tile{display:block;width:38px;height:38px;flex:none}
.bname{font-family:Bricolage;font-weight:800;font-size:27px;letter-spacing:-.02em;color:${PAPER}}

/* Held clear of the motif's left-hand nodes so the headline never collides. */
.mid{position:relative; z-index:1; max-width:672px; margin-top:auto; margin-bottom:auto; padding-right:20px}
h1{font-family:Bricolage; font-weight:800; color:${PAPER}; font-size:${titleSize(title)}px; line-height:.99; letter-spacing:-.032em; text-wrap:balance}
.badge{
  display:inline-flex; align-items:center; gap:11px; margin-top:30px;
  background:${LIME}; color:${GRAPHITE}; border:2px solid ${LIME};
  border-radius:999px; padding:11px 22px;
  font-family:Hanken; font-weight:600; font-size:22px;
}
.badge .dot{width:9px;height:9px;border-radius:50%;background:${GRAPHITE};flex:none}

.bot{display:flex; align-items:flex-end; justify-content:space-between; gap:24px; position:relative; z-index:1}
.foot{font-family:GeistMono,monospace; font-size:19px; font-weight:500; color:rgba(251,250,246,0.72)}
.foot.dim{color:rgba(251,250,246,0.42)}
</style></head><body>
<div class="plate">
  ${motifSvg()}
  <div class="top">
    <span class="eyebrow"><span class="bar"></span>${esc(category)}</span>
    <span class="brand">${markSvg(38)}<span class="bname">Top Use AI</span></span>
  </div>
  <div class="mid">
    <h1>${esc(nbHyphen(title))}</h1>
    <span class="badge"><span class="dot"></span>${esc(badgeFor(title))}</span>
  </div>
  <div class="bot">
    <span class="foot">topuseai.com</span>
    <span class="foot dim">Tested, not hyped.</span>
  </div>
</div>
</body></html>`;
}

// ── Runner ───────────────────────────────────────────────────────────────────

function loadEnv() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) throw new Error('.env.local not found');
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}

(async () => {
  loadEnv();
  const { createClient } = require('@supabase/supabase-js');
  const { chromium } = require('playwright');

  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  let query = db.from('posts')
    .select('slug,title,featured_image_url,categories(name)')
    .eq('site_id', SITE_ID)
    .eq('status', 'published');
  if (ONE_SLUG) query = query.eq('slug', ONE_SLUG);

  const { data: posts, error } = await query.order('published_at', { ascending: false });
  if (error) throw new Error('Supabase: ' + error.message);

  const targets = ONLY_MISSING
    ? posts.filter(p => !p.featured_image_url?.startsWith('/covers/'))
    : posts;

  if (!targets.length) {
    console.log('Nothing to generate.');
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });

  for (const post of targets) {
    await page.setContent(html(post), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT_DIR, post.slug + '.png') });
    console.log('✓', post.slug);
  }
  await browser.close();

  if (WRITE_DB) {
    for (const post of targets) {
      const { error: e } = await db.from('posts')
        .update({ featured_image_url: '/covers/' + post.slug + '.png' })
        .eq('site_id', SITE_ID).eq('slug', post.slug);
      if (e) console.error('DB FAIL', post.slug, e.message);
    }
    console.log('featured_image_url updated for', targets.length, 'post(s)');
  }

  console.log('\n' + targets.length + ' cover(s) → public/covers/');
  if (!WRITE_DB) console.log('Re-run with --write-db to point posts at them.');
})();
