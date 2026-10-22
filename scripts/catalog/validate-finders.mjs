import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);

async function loadTypeScriptModule(path, mocks = {}) {
  const source = await readFile(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => specifier in mocks ? mocks[specifier] : require(specifier);
  new Function("require", "module", "exports", output)(localRequire, module, module.exports);
  return module.exports;
}

const filterCopy = await loadTypeScriptModule("lib/tool-finder/niche-filter-copy.ts");
const { NICHES, categorySlug } = await loadTypeScriptModule("lib/tool-finder/niches.ts", { "./niche-filter-copy": filterCopy });
const { recommendCatalogTools } = await loadTypeScriptModule("lib/tool-finder/catalog-recommend.ts");
const source = require("/tmp/aifoxx-tools.json");

const pricingModel = (tool) => {
  if (tool.pricing === "Free") return "free";
  if (tool.pricing === "Freemium") return "freemium";
  if (tool.pricing === "Open Source") return "open-source";
  if (tool.pricing === "Pay-as-you-go") return "pay-as-you-go";
  if (tool.pricing === "Contact Sales") return "contact-sales";
  if (tool.pricing === "Paid" && /trial/i.test(tool.pricing_detail?.free_tier ?? "")) return "free-trial";
  return tool.pricing === "Paid" ? "paid" : "unknown";
};

const normalize = (tool) => ({
  slug: tool.slug, name: tool.name, category: categorySlug(tool.category),
  sourceCategory: tool.category, subcategory: tool.subcategory, summary: tool.description,
  bestFor: tool.use_cases?.[0] ?? tool.subcategory, audience: [], strengths: tool.use_cases ?? [],
  limitations: tool.not_good_for ?? [], freePlan: ["Free", "Freemium", "Open Source"].includes(tool.pricing) ? "yes" : "no",
  paidPlans: tool.pricing !== "Free" && tool.pricing !== "Open Source", pricingModel: pricingModel(tool),
  pricingDetails: tool.pricing_detail, qualityScore: 3, easeScore: 3, valueScore: 3,
  tags: tool.tags ?? [], useCases: tool.use_cases ?? [], notGoodFor: tool.not_good_for ?? [],
  industries: tool.industries ?? [], accessMethods: tool.access_methods ?? [], dataStorage: tool.data_storage ?? {},
  featured: tool.featured ?? false, popular: tool.popular ?? false, sources: [], verification: "needs-review",
  lastReviewedLabel: tool.last_verified, relatedPostSlugs: [],
});

const failures = [];
const seenNiches = new Set();
let combinations = 0;

if (NICHES.length !== 25) failures.push(`Expected 25 niches, received ${NICHES.length}.`);
for (const key of ["budget", "access", "priority"]) {
  const questions = NICHES.map((niche) => niche.filters?.[key]?.question);
  if (questions.some((question) => !question)) failures.push(`One or more niches are missing the ${key} question.`);
  if (new Set(questions).size !== NICHES.length) failures.push(`${key} questions are not unique across all niches.`);
}

for (const niche of NICHES) {
  if (seenNiches.has(niche.slug)) failures.push(`Duplicate niche slug: ${niche.slug}`);
  seenNiches.add(niche.slug);
  const tools = source.filter((tool) => tool.category === niche.category).map(normalize);
  if (!tools.length) failures.push(`${niche.label} has no source tools.`);

  const sourceSubcategories = new Set(tools.map((tool) => tool.subcategory));
  const configured = new Set(niche.goals.map((goal) => goal.label));
  for (const subcategory of sourceSubcategories) {
    if (!configured.has(subcategory)) failures.push(`${niche.label} misses subcategory ${subcategory}.`);
  }
  if (new Set(niche.goals.map((goal) => goal.value)).size !== niche.goals.length) failures.push(`${niche.label} has duplicate goal values.`);
  if (new Set(niche.workflows.map((item) => item.value)).size !== niche.workflows.length) failures.push(`${niche.label} has duplicate workflow values.`);
  const expectedFilterOptions = { budget: 3, access: 5, priority: 4 };
  for (const [key, expected] of Object.entries(expectedFilterOptions)) {
    if (niche.filters[key].options.length !== expected) failures.push(`${niche.label} has an invalid ${key} option count.`);
  }

  for (const goal of niche.goals) for (const flow of niche.workflows) {
    for (const budget of ["free-only", "free-or-trial", "any"]) for (const access of ["any", "web", "mobile", "api", "desktop"]) {
      for (const priority of ["fit", "ease", "privacy", "value"]) {
        const answers = { goal: goal.value, workflow: flow.value, budget, access, priority };
        const results = recommendCatalogTools(niche, answers, tools);
        combinations++;
        if (results.some((item, index) => index > 0 && item.score > results[index - 1].score)) failures.push(`${niche.label} produced an unsorted result.`);
        if (budget === "free-only" && results.some(({ tool }) => !["free", "freemium", "open-source"].includes(tool.pricingModel))) failures.push(`${niche.label} leaked a paid tool into free-only results.`);
        if (results.some(({ tool }) => {
          const text = [tool.name, tool.subcategory, tool.summary, tool.bestFor, ...(tool.tags ?? []), ...(tool.useCases ?? []), ...(tool.strengths ?? [])].filter(Boolean).join(" ").toLowerCase();
          return tool.subcategory?.toLowerCase() !== goal.label.toLowerCase()
            && !goal.keywords.some((keyword) => text.includes(keyword));
        })) failures.push(`${niche.label} leaked an unrelated tool into ${goal.label}.`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.slice(0, 30).join("\n"));
  process.exit(1);
}
console.log(`Validated ${NICHES.length} niches, ${NICHES.reduce((n, x) => n + x.goals.length, 0)} feature categories, and ${combinations.toLocaleString()} filter combinations.`);
