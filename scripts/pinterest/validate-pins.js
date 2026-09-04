#!/usr/bin/env node
/**
 * Enforce the rules in docs/PINTEREST-PLAYBOOK.md against pin batch files.
 *
 * Run on one file, or with no arguments to check every batch:
 *   node scripts/pinterest/validate-pins.js
 *   node scripts/pinterest/validate-pins.js docs/PINTEREST-BATCH-2.md
 *
 * Exits non-zero if any rule fails, so it can gate a commit or a hook.
 */

const fs = require("fs");
const path = require("path");

const DOCS = path.join(__dirname, "..", "..", "docs");
const DEFAULT_FILES = [
  "PINTEREST-BATCH-1.md",
  "PINTEREST-BATCH-2.md",
  "PINTEREST-BATCH-3.md",
].map((f) => path.join(DOCS, f));

const BOARDS = new Set([
  "Work From Home Ideas",
  "Faceless YouTube Ideas",
  "Blogging & SEO Tips",
  "AI Art & Wall Art",
  "Passive Income Ideas",
  "Free AI Tools",
]);

// Phrases that read as income promises. Pinterest polices these and so do we.
const INCOME_CLAIMS = [
  /\bguaranteed? (?:income|money|earnings)\b/i,
  /\bmake \$[\d,]+ (?:a|per) (?:day|week|month)\b/i,
  /\bget rich\b/i,
  /\bpassive income on autopilot\b/i,
  /\bquit your job\b/i,
];

function blocks(src, label) {
  const re = new RegExp(
    `\\*\\*${label}\\*\\*\\n\`\`\`\\n([\\s\\S]*?)\\n\`\`\``,
    "g"
  );
  const out = [];
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

function parse(file) {
  const src = fs.readFileSync(file, "utf8");
  const pins = [];
  // Split on pin headings so every field stays attached to its own pin.
  const parts = src.split(/^### /m).slice(1);
  for (const part of parts) {
    const head = part.split("\n")[0];
    const slug = (head.match(/`([^`]+)`/) || [])[1] || "?";
    const chunk = "### " + part;
    pins.push({
      id: head.split(" ")[0],
      slug,
      layout: (chunk.match(/^\*Layout: (.+?)\*/m) || [])[1] || null,
      title: blocks(chunk, "Title")[0],
      description: blocks(chunk, "Description")[0],
      alt: blocks(chunk, "Alt text")[0],
      board: blocks(chunk, "Board")[0],
      link: blocks(chunk, "Link")[0],
      prompt: blocks(chunk, "Image prompt")[0],
    });
  }
  // Day headings, so per-day layout uniqueness can be checked.
  const days = [];
  let day = null;
  for (const line of src.split("\n")) {
    const d = line.match(/^## DAY (\d+)/);
    if (d) {
      day = Number(d[1]);
      continue;
    }
    const l = line.match(/^\*Layout: (.+?)\*/);
    if (l && day !== null) days.push([day, l[1]]);
  }
  return { src, pins, days };
}

function check(file) {
  const errors = [];
  const warnings = [];
  const { src, pins, days } = parse(file);
  const name = path.basename(file);
  const E = (m) => errors.push(`${name}: ${m}`);
  const W = (m) => warnings.push(`${name}: ${m}`);

  if (!pins.length) {
    E("no pins found (is this a batch file?)");
    return { errors, warnings, count: 0 };
  }

  // Em dashes, anywhere in the file.
  const emLines = src
    .split("\n")
    .map((l, i) => [i + 1, l])
    .filter(([, l]) => l.includes("—"));
  for (const [n, l] of emLines) {
    E(`line ${n}: em dash present -> ${l.trim().slice(0, 60)}`);
  }

  // Per-pin field rules.
  for (const p of pins) {
    const at = `${p.id} (${p.slug})`;
    for (const f of ["title", "description", "alt", "board", "link", "prompt"]) {
      if (!p[f]) E(`${at}: missing ${f}`);
    }
    if (!p.title) continue;

    if (p.title.length > 100) E(`${at}: title ${p.title.length} chars, max 100`);
    if (p.description) {
      const n = p.description.length;
      if (n < 290) E(`${at}: description ${n} chars, minimum 290 (thin)`);
      if (n > 500) E(`${at}: description ${n} chars, max 500`);
      for (const re of INCOME_CLAIMS) {
        if (re.test(p.description)) E(`${at}: income claim in description`);
      }
    }
    if (p.alt && p.alt.length < 20) E(`${at}: alt text too short`);
    if (p.alt && p.title && p.alt.trim() === p.title.trim()) {
      E(`${at}: alt text duplicates the title`);
    }
    if (p.board && !BOARDS.has(p.board)) E(`${at}: unknown board "${p.board}"`);
    if (p.link && !p.link.startsWith("https://www.topuseai.com/blog/")) {
      E(`${at}: link is not a topuseai blog URL`);
    }
    if (p.link && p.slug && !p.link.endsWith("/" + p.slug)) {
      E(`${at}: link does not match the pin's slug`);
    }

    if (p.prompt) {
      if (!/SUBHEAD:/.test(p.prompt)) E(`${at}: prompt has no SUBHEAD`);
      if (!/CLOSING LINE:/.test(p.prompt)) E(`${at}: prompt has no CLOSING LINE`);
      if (!/1000x1500/.test(p.prompt)) E(`${at}: prompt does not set 1000x1500`);
      if (/PHOTOGRAPH:/.test(p.prompt)) {
        if (!/no hands/i.test(p.prompt)) {
          E(`${at}: photo prompt does not exclude faces and hands`);
        }
        if (!/200px/.test(p.prompt)) {
          E(`${at}: photo prompt does not require thumbnail legibility`);
        }
      }
    }
  }

  // Uniqueness within the file.
  const dupes = (arr, label) => {
    const seen = new Map();
    arr.forEach((v, i) => {
      if (!v) return;
      if (seen.has(v)) E(`${label} duplicated: pin ${pins[i].id} and ${pins[seen.get(v)].id}`);
      else seen.set(v, i);
    });
  };
  dupes(pins.map((p) => p.title), "title");
  dupes(pins.map((p) => p.description), "description");
  dupes(pins.map((p) => p.alt), "alt text");
  dupes(
    pins.map((p) => (p.prompt || "").split("HEADLINE:")[0] || null),
    "layout block"
  );

  // No layout repeated inside one day.
  const byDay = new Map();
  for (const [d, l] of days) {
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d).push(l);
  }
  for (const [d, ls] of byDay) {
    if (new Set(ls).size !== ls.length) {
      const dup = ls.filter((l, i) => ls.indexOf(l) !== i);
      E(`day ${d}: layout repeated (${[...new Set(dup)].join(", ")})`);
    }
  }

  // Photo mix, roughly two thirds.
  const photo = pins.filter((p) => /PHOTOGRAPH:/.test(p.prompt || "")).length;
  const ratio = photo / pins.length;
  if (ratio < 0.55 || ratio > 0.8) {
    W(`photo-led ${photo}/${pins.length} (${Math.round(ratio * 100)}%), target about two thirds`);
  }

  // Opening-word spread.
  const firsts = new Map();
  for (const p of pins) {
    if (!p.title) continue;
    const w = p.title.split(" ")[0];
    firsts.set(w, (firsts.get(w) || 0) + 1);
  }
  for (const [w, n] of firsts) {
    if (n / pins.length > 0.12) {
      W(`"${w}" opens ${n}/${pins.length} titles (${Math.round((n / pins.length) * 100)}%), max 12%`);
    }
  }

  return { errors, warnings, count: pins.length };
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2).map((f) => path.resolve(f))
  : DEFAULT_FILES;

let errors = [];
let warnings = [];
let total = 0;
const boardTotals = new Map();

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error(`missing: ${f}`);
    process.exit(1);
  }
  const r = check(f);
  errors = errors.concat(r.errors);
  warnings = warnings.concat(r.warnings);
  total += r.count;
  for (const p of parse(f).pins) {
    if (p.board) boardTotals.set(p.board, (boardTotals.get(p.board) || 0) + 1);
  }
}

// Cross-file rules only make sense when checking the whole set.
if (files.length > 1) {
  const all = files.flatMap((f) => parse(f).pins);
  const seenTitle = new Map();
  const seenLayout = new Map();
  for (const p of all) {
    if (p.title) {
      if (seenTitle.has(p.title)) {
        errors.push(`title reused across batches: "${p.title}"`);
      } else seenTitle.set(p.title, p.id);
    }
    const seg = (p.prompt || "").split("HEADLINE:")[0];
    if (seg) {
      if (seenLayout.has(seg)) {
        errors.push(`layout block reused across batches (pin ${p.id})`);
      } else seenLayout.set(seg, p.id);
    }
  }
  for (const [b, n] of boardTotals) {
    if (n < 20) warnings.push(`board "${b}" has only ${n} pins, minimum 20`);
  }
}

console.log(`Checked ${total} pins across ${files.length} file(s).`);
for (const w of warnings) console.log(`  WARN  ${w}`);
for (const e of errors) console.error(`  FAIL  ${e}`);

if (errors.length) {
  console.error(
    `\n${errors.length} rule violation(s). See docs/PINTEREST-PLAYBOOK.md.`
  );
  process.exit(1);
}
console.log(warnings.length ? `\nPassed with ${warnings.length} warning(s).` : "\nAll rules passed.");
