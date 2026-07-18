/**
 * Rasterise app/icon.svg into the PNG/ICO variants Next.js serves.
 *
 *   node scripts/generate-icons.js
 *
 * Requires playwright (dev-only):
 *   npm i -D playwright && npx playwright install chromium
 *
 * Writes:
 *   app/icon.png        512x512, rounded — the general-purpose icon
 *   app/apple-icon.png  180x180, square  — iOS applies its own squircle mask,
 *                                          so rounding it here double-rounds it
 *   app/favicon.ico     16/32/48 multi-size, via the Pillow step printed at the end
 *
 * app/icon.svg is the single source of truth; edit that, then re-run this.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const SVG_PATH = path.join(ROOT, 'app', 'icon.svg');

/** Render an SVG string to a PNG of the given size, with a transparent page. */
async function render(page, svg, size, out) {
  const src = 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<body style="margin:0"><img src="${src}" width="${size}" height="${size}" style="display:block"></body>`
  );
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, omitBackground: true });
  console.log('✓', path.relative(ROOT, out), `(${size}px)`);
}

(async () => {
  const svg = fs.readFileSync(SVG_PATH, 'utf8');
  // iOS masks the apple-touch icon itself, so serve it square and full-bleed.
  const squareSvg = svg.replace(/rx="\d+"/, 'rx="0"');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await render(page, svg, 512, path.join(ROOT, 'app', 'icon.png'));
  await render(page, squareSvg, 180, path.join(ROOT, 'app', 'apple-icon.png'));
  // Rendered large, then downsampled into the .ico so the small sizes stay sharp.
  await render(page, svg, 256, path.join(ROOT, 'app', '_ico-source.png'));

  await browser.close();

  // .ico is a container format Playwright cannot emit, so the last step goes
  // through Pillow. Printed rather than shelled out so the dependency stays
  // optional and visible.
  console.log(`
Final step — build the multi-size .ico from the 256px render:

  python3 -c "from PIL import Image; im=Image.open('app/_ico-source.png').convert('RGBA'); im.save('app/favicon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48)])"
  rm app/_ico-source.png
`);
})();
