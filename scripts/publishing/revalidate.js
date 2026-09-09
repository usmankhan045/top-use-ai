#!/usr/bin/env node
/**
 * Purge the Next.js static cache for one or more paths.
 *
 * Blog pages are built with `export const revalidate = 3600`, so a post edited
 * directly in Supabase keeps serving stale HTML for up to an hour. Writing to
 * the database does not tell Next.js anything. Run this after any SQL edit.
 *
 *   node scripts/publishing/revalidate.js best-ai-logo-generators
 *   node scripts/publishing/revalidate.js --path /blog /category/ai-image-design
 *
 * Needs REVALIDATION_SECRET (same value as the Vercel env var) in .env.local.
 */

const fs = require("fs");
const path = require("path");

const SITE = process.env.SITE_URL || "https://www.topuseai.com";

function loadSecret() {
  if (process.env.REVALIDATION_SECRET) return process.env.REVALIDATION_SECRET;

  const envPath = path.join(__dirname, "..", "..", ".env.local");
  if (!fs.existsSync(envPath)) return null;

  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*REVALIDATION_SECRET\s*=\s*(.*)$/);
    if (match) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node scripts/publishing/revalidate.js <slug|--path <path>...>");
    process.exit(1);
  }

  // Bare arguments are post slugs; anything after --path is a literal path.
  const paths = [];
  let literal = false;
  for (const arg of args) {
    if (arg === "--path") {
      literal = true;
      continue;
    }
    paths.push(literal || arg.startsWith("/") ? arg : `/blog/${arg}`);
  }

  const secret = loadSecret();
  if (!secret) {
    console.error("REVALIDATION_SECRET not set. Add it to .env.local (match the Vercel value).");
    process.exit(1);
  }

  const response = await fetch(`${SITE}/api/revalidate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, paths }),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`Failed (${response.status}): ${body.error || "unknown error"}`);
    if (response.status === 401) {
      console.error("The secret does not match. Redeploy after changing it in Vercel.");
    }
    process.exit(1);
  }

  console.log(`Revalidated ${paths.length} path(s):`);
  for (const p of paths) console.log(`  ${p}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
