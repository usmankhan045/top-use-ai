#!/usr/bin/env node

/*
 * Build, validate, snapshot, and optionally upsert the 50-post tool-finder
 * series. The database remains the publishing source of truth: posts are
 * stored as drafts with one 13:00 UTC slot per day, then the existing GitHub
 * Actions publisher makes each one live when due.
 *
 * Usage:
 *   node scripts/publishing/seed-tool-finder-series.js --dry-run
 *   node scripts/publishing/seed-tool-finder-series.js --apply
 *   node scripts/publishing/seed-tool-finder-series.js --apply --start=2026-10-23T16:00:00Z
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SITE_ID = "7635559c-2c64-4d76-8b3b-1c69e4a412f8";
const PLAN = path.join(ROOT, "docs", "TOOL-FINDER-50-ARTICLE-PLAN.md");
const SNAPSHOT = path.join(ROOT, "content", "tool-finder-article-drafts.json");
const APPLY = process.argv.includes("--apply");
const START_ARG = process.argv.find((argument) => argument.startsWith("--start="))?.slice("--start=".length);

function loadEnv() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

loadEnv();
const BASE = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
if (!BASE || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function sb(endpoint, init = {}) {
  const response = await fetch(`${BASE}/rest/v1/${endpoint}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function fetchAll(endpoint, pageSize = 1000) {
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const page = await sb(endpoint, { headers: { Range: `${from}-${from + pageSize - 1}` } });
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 72);
}

function sentences(items) {
  return items.map((item) => item.trim().replace(/[.]$/, "")).join(", ");
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function parsePlan() {
  const source = fs.readFileSync(PLAN, "utf8");
  const blocks = [...source.matchAll(/^### (\d+)\. (.+)\n\n([\s\S]*?)(?=^### \d+\.|^## |\Z)/gm)];
  return blocks.map((match) => {
    const field = (name) => match[3].match(new RegExp(`- \\*\\*${name}:\\*\\* (.+)`))?.[1]?.trim() || "";
    return {
      number: Number(match[1]),
      title: match[2].trim(),
      query: field("Query family"),
      intent: field("Intent"),
      asset: field("Citation asset"),
      finder: field("Finder path"),
    };
  });
}

const niches = [
  ["ai-assistants", "AI assistants", "What kind of assistant do you need?", ["general conversation", "current sourced research", "work with files", "enterprise integration"], ["citation quality", "file support", "connected apps"], "An assistant that is excellent at general chat can still be the wrong choice for private files or source-heavy research."],
  ["agentic-and-automation", "AI automation", "What do you want to automate?", ["connect applications", "run repeatable workflows", "delegate multi-step work"], ["no-code setup", "developer control", "autonomous execution"], "Autonomy adds risk as well as convenience. Start with the smallest level of permission that completes the job."],
  ["audio-and-music", "AI audio and music", "What are you creating?", ["music", "speech", "podcasts", "transcripts", "cloned voices"], ["studio control", "real-time performance", "fast creator exports"], "Voice rights, commercial terms, latency, and export quality matter more than the most impressive demo."],
  ["coding", "AI coding", "Where do you need coding help?", ["inside an IDE", "in a terminal", "during code review", "for testing", "through an API"], ["completion speed", "repository context", "local control"], "Do not compare a completion extension with an autonomous coding agent as if they perform the same job."],
  ["content-creation", "AI writing and content", "What are you writing?", ["long-form articles", "brand copy", "stories", "rewrites", "editing"], ["structure", "brand consistency", "clarity"], "Publishing volume does not rescue generic writing. The winning workflow keeps human judgment at research, positioning, and final editing."],
  ["customer-support", "AI customer support", "Which support channel are you improving?", ["help desk", "website chatbot", "live chat", "voice support"], ["self-service", "agent assistance", "multiple channels"], "A chatbot is not a help desk, and contact storage is not a complete support operation."],
  ["data-and-analytics", "AI data and analytics", "What data job are you doing?", ["business intelligence", "data preparation", "prediction", "visualization", "statistics"], ["analyst depth", "business accessibility", "embedded delivery"], "Natural-language analysis is useful only when the calculation and source data remain inspectable."],
  ["design", "AI design", "What are you designing?", ["graphics", "presentations", "interfaces", "logos", "brand systems"], ["template speed", "editable output", "collaboration"], "A beautiful preview is less valuable when the output cannot be edited, exported, or reused in the rest of the design system."],
  ["e-commerce", "AI e-commerce", "What store problem are you solving?", ["recommendations", "product descriptions", "reviews", "inventory", "pricing"], ["storefront conversion", "back-office operations", "marketplace selling"], "Choose against the store platform and catalog workflow first. A disconnected AI feature creates another queue to maintain."],
  ["education", "AI education", "What learning task do you need?", ["tutoring", "course creation", "study", "quizzes", "grading", "language learning"], ["individual learning", "teaching", "institutional administration"], "The best educational tool makes reasoning visible and encourages verification instead of merely producing an answer."],
  ["finance", "AI finance", "Which financial workflow do you need?", ["planning", "analysis", "accounting", "tax", "trading", "risk"], ["personal use", "business operations", "professional analysis"], "Financial output needs traceable inputs, clear limitations, and human review. Convenience is not a substitute for accountability."],
  ["hr-and-recruitment", "AI HR and recruitment", "Which people workflow are you improving?", ["job search", "candidate sourcing", "screening", "interviews", "onboarding"], ["candidate help", "recruiter efficiency", "HR operations"], "Selection tools need bias, privacy, and human-review checks because mistakes directly affect people."],
  ["healthcare", "AI healthcare", "Which healthcare workflow do you need?", ["wellness tracking", "documentation", "patient engagement", "medical imaging", "research"], ["consumer wellness", "clinical support", "life-science research"], "Wellness, clinical support, and diagnosis are different risk levels. Never let a broad AI label erase that boundary."],
  ["image-generation", "AI image", "What image task do you need?", ["generation", "editing", "enhancement", "background removal", "upscaling"], ["creative control", "speed", "commercial output"], "Check rights, export size, editing control, and watermarks before judging an image tool by prompt quality alone."],
  ["legal", "AI legal", "Which legal task are you handling?", ["contract analysis", "document review", "research", "discovery", "compliance"], ["individual help", "law-firm workflow", "enterprise control"], "Confidentiality, jurisdiction, source traceability, and qualified review are part of the product requirement."],
  ["marketing", "AI marketing", "Which marketing channel matters most?", ["email", "content", "SEO", "analytics", "brand", "advertising"], ["creation speed", "performance improvement", "brand consistency"], "A tool should match the channel bottleneck. More generated assets do not fix poor distribution or measurement."],
  ["productivity", "AI productivity", "Which part of work needs help?", ["documents", "tasks", "knowledge", "calendar", "email", "notes"], ["personal organization", "team collaboration", "automation"], "Setup and maintenance are part of the cost. A system that saves ten minutes but needs an hour of weekly care is not productive."],
  ["project-management", "AI project management", "What project need comes first?", ["collaboration", "agile delivery", "resource planning"], ["simple projects", "sprints and backlogs", "portfolio planning"], "Choose the planning model your team already uses. AI cannot repair a workflow nobody follows."],
  ["real-estate", "AI real estate", "Which property workflow do you need?", ["lead generation", "valuation", "market analysis", "virtual tours", "property management"], ["agent work", "investment analysis", "property operations"], "Local data quality and operational fit matter more than a generic claim that a tool understands real estate."],
  ["research", "AI research", "What kind of research are you doing?", ["academic discovery", "literature review", "data mining", "market research", "patent research"], ["credible sources", "document synthesis", "structured analysis"], "A fluent answer is not evidence. The source must exist, support the exact claim, and remain easy to inspect."],
  ["sales-and-crm", "AI sales and CRM", "Where is your sales bottleneck?", ["prospecting", "outreach", "pipeline", "proposals", "deal management"], ["finding prospects", "starting conversations", "managing revenue"], "Buying an outreach tool when the real problem is pipeline follow-up simply creates more neglected leads."],
  ["security", "AI security", "Which security job do you need?", ["monitoring", "vulnerability scanning", "threat detection", "fraud", "penetration testing"], ["application security", "security operations", "business risk"], "Security recommendations must be reviewable, permissioned, and tied to the environment they protect."],
  ["social-media", "AI social media", "Which social workflow do you need?", ["scheduling", "engagement", "analytics"], ["one brand", "several platforms", "agency clients"], "Count profiles, approval steps, and reporting needs before paying for generation features available elsewhere."],
  ["translation-and-language", "AI translation and language", "What content are you translating?", ["everyday text", "documents", "products", "websites", "live speech"], ["general translation", "localization", "real-time conversation"], "Terminology control, privacy, supported formats, and latency can matter more than raw language count."],
  ["video", "AI video", "What kind of video are you making?", ["short social clips", "marketing explainers", "product videos", "animation", "creative production"], ["fast repurposing", "brand control", "detailed editing"], "Generation and editing are separate jobs. A strong generator can still be a poor place to finish a video."],
].map(([slug, label, question, goals, workflows, warning]) => ({ slug, label, question, goals, workflows, warning }));

const existingFallback = [
  "best-free-ai-writing-tools", "best-ai-productivity-tools", "best-ai-video-generators",
  "best-ai-social-media-tools", "best-ai-lead-generation-tools", "best-ai-seo-tools",
  "best-ai-chatbots-for-websites", "best-ai-meeting-note-takers",
];

const slugOverrides = new Map([
  [1, "we-analyzed-1196-ai-tools-how-many-are-free"],
  [2, "free-forever-vs-freemium-vs-free-trial"],
  [3, "how-top-use-ai-ranks-tools"],
  [7, "ai-tool-verification-checklist"],
  [8, "how-to-choose-an-ai-tool-in-five-questions"],
  [50, "five-requirements-47-tools-three-finalists"],
]);

const guideProfiles = {
  1: ["catalog study", "Count tools by published status, niche, pricing label, and free-plan evidence instead of treating every free claim as equivalent.", "A usable free option can be recurring, capped, open source, or limited to a narrow workflow. The count needs definitions beside it.", "Use the niche distribution to find categories with real choice, then inspect the exact free-plan limits in the finder.", "A large headline number becomes misleading when trials, dead listings, and duplicate products are mixed into it."],
  2: ["pricing field guide", "Separate free forever, freemium, free trial, open source, and paid access before comparing products.", "The label describes the access model, not the generosity of the allowance or the total cost of running the tool.", "Verify expiry, card requirement, recurring allowance, export restrictions, commercial rights, and API access in that order.", "Calling a seven-day trial free creates the wrong shortlist for anyone who needs a durable no-cost workflow."],
  3: ["ranking methodology", "Rank for a stated use case by combining relevance, evidence quality, practical access, value, and penalties for missing data.", "A transparent score should explain why one tool moved above another and should never convert unknown information into a positive signal.", "Use the score to order a qualified pool, then let the reader's five answers rerank that pool for personal fit.", "A universal top-match badge is false precision when two readers have different jobs, platforms, budgets, or privacy needs."],
  4: ["category analysis", "Compare both the number and share of free-option tools in each niche before calling a category free-friendly.", "Raw counts favor large categories, while percentage share can exaggerate tiny categories. The useful view shows free count, total count, and share together.", "Use the table to choose a promising niche, then inspect what free means for the exact products returned.", "A category with many free signups can still be a poor choice when the needed export, capacity, or commercial right sits behind payment."],
  5: ["access comparison", "Choose web, mobile, API, desktop, extension, or local access from the place where the work starts and where the result must go.", "Access labels overlap and do not promise feature parity. The same product can offer a full web app, a limited phone app, and a separately priced API.", "Map input, work location, output, integration, and data boundary before selecting the access filter.", "Choosing by output quality before checking access can leave a strong tool disconnected from the real workflow."],
  6: ["control comparison", "Compare open source and freemium through hosting, setup, privacy, updates, support, license, and total operating effort.", "Open source can increase deployment and modification control. Freemium can reduce setup and maintenance. Neither label guarantees privacy, low cost, or long-term availability.", "Choose the dimensions of control that matter, verify the license or free limits, and test the full operating path.", "Treating open source as automatically free or freemium as automatically managed hides the costs that appear after adoption."],
  7: ["verification checklist", "Verify identity, availability, pricing, access, ownership, privacy, integrations, and the exact use case before recommending a tool.", "Verification should produce a compact evidence record that another editor can reproduce, not a vague checked badge.", "Use official product and policy pages first, date the check, and mark unclear claims as unknown.", "Affiliate pages, copied directories, and search snippets can help discovery but are weak final evidence for changing product terms."],
  8: ["decision framework", "Ask five questions in sequence: job, workflow, usage, access, and deciding priority.", "Each answer removes a different failure mode, and together they turn a broad catalog into a shortlist small enough to test.", "Keep the first four as qualification gates and use the fifth as the tie-breaker among valid candidates.", "Starting with a brand or a feature checklist encourages comparison before the real requirement is known."],
  34: ["free-plan filter", "Require recurring access without a card, then verify limits, exports, ownership, and whether the useful feature is actually included.", "No-card access is valuable for exploration, classrooms, and low-risk trials, but it says nothing about monthly capacity.", "Begin with free-plan evidence, exclude trial-only products, and run one complete workflow before depending on it.", "A free signup is not a permanent free plan, and a permanent plan can still be unusable for the intended volume."],
  35: ["student toolkit", "Build a free student toolkit around learning, research, notes, writing support, and source checking without depending on expiring trials.", "The tool should help the student understand and verify the work, not simply replace the work or hide where an answer came from.", "Choose one tool per study task, confirm recurring limits, protect school data, and keep sources visible through the final draft.", "A polished generated answer can create academic-integrity and learning problems when the reasoning and sources are missing."],
  36: ["local-first filter", "Choose local or desktop tools when the data must stay on the device, offline work matters, or cloud upload is unacceptable.", "Local operation improves control only when telemetry, model downloads, updates, backups, and exported files are also understood.", "Test installation, hardware load, offline behavior, file retention, and the path for removing data.", "A desktop interface can still send prompts or files to a remote service, so the label alone is not proof of privacy."],
  37: ["API filter", "Start with the integration contract: input, output, latency, volume, authentication, observability, and failure handling.", "An API badge does not reveal whether the useful model, endpoint, rate limit, or commercial right is included in the free tier.", "Prototype one end-to-end request, record cost per successful job, and test retries plus degraded behavior.", "A cheap call can become an expensive system when retries, context size, storage, and human review are ignored."],
  38: ["self-hosting filter", "Separate truly self-hosted products from local clients, open-weight models, hosted demos, and source-available projects.", "Deployment control brings maintenance, identity, monitoring, backup, security, and hardware work that a feature checklist can hide.", "Verify the license and production path, estimate total operating effort, and test upgrades plus recovery before a team depends on it.", "Self-hosting can improve control without automatically improving security or reducing cost."],
  39: ["mobile creator filter", "Judge mobile AI tools by the creative job completed away from a desk, not by whether a vendor happens to ship an app.", "Capture, voice input, camera access, editing, export, sharing, and cross-device continuity are the practical differentiators.", "Test the full task on a real phone, including a difficult edit and final export, before making mobile access decisive.", "A small web wrapper may technically run on mobile while remaining painful for repeated creative work."],
  40: ["privacy filter", "Translate private into testable requirements such as data location, retention, training use, encryption, access control, and deletion.", "Privacy is not a single catalog badge. The correct threshold changes with the data and the consequences of exposure.", "Classify the data first, read the current policy and contract, test deletion, and choose local deployment when cloud processing is not acceptable.", "Marketing language like secure or enterprise ready cannot replace specific controls and written terms."],
  41: ["developer open-source filter", "Separate open-source application code from open weights, hosted demos, source-available licenses, and genuinely self-hostable developer tools.", "The license, extension model, repository context, model choice, release activity, and maintenance burden determine how much control developers gain.", "Confirm the repository and license, run the local setup, inspect permissions, and test a real code change before adopting it.", "A public repository does not guarantee commercial permission, maintainability, secure defaults, or a complete production product."],
  42: ["high-stakes checklist", "Require human review, evidence, auditability, access controls, security, and a clear failure path before using AI in regulated or high-stakes work.", "A useful evaluation states which decisions the tool may support and which decisions remain with a qualified person.", "Classify the risk, verify controls and contracts, test adverse cases, log decisions, and obtain domain-specific review where required.", "A confident output, an enterprise label, or a disclaimer does not make a system appropriate for legal, medical, financial, employment, or security decisions."],
  43: ["citation-quality rubric", "Evaluate sourced AI answers by checking that the source exists, supports the exact claim, is represented accurately, and can be exported for review.", "Citation count is weaker than citation quality. A long reference list can still contain irrelevant, circular, or secondary evidence.", "Open every decisive source, compare the cited passage with the claim, prefer primary evidence, and preserve links in the final notes.", "A fluent synthesis with fabricated or mismatched references is more dangerous than an answer that clearly admits uncertainty."],
  44: ["solo stack", "Build a one-person automation stack around capture, generation, handoff, and review rather than collecting disconnected AI apps.", "A small business gains more from one reliable path between a few tools than from ten isolated assistants.", "Choose the system of record first, automate one repeated handoff, measure time saved, and add a paid tier only at a proven bottleneck.", "Free tools create hidden work when formats, accounts, and duplicated data are not planned as one workflow."],
  45: ["online-store stack", "Connect product data, content, support, sales follow-up, and operations around the store platform as the source of truth.", "A small store gains more from clean handoffs and current catalog data than from isolated generators in every department.", "Choose the commerce system first, automate one repeated store task, preserve human approval for claims, and measure conversion plus time saved.", "Disconnected AI outputs create stale descriptions, inconsistent offers, duplicated customer data, and another queue to maintain."],
  46: ["content workflow", "Connect research, outlining, drafting, editing, publishing, distribution, and measurement with human approval at claims and final output.", "The workflow should preserve source notes, editorial decisions, brand voice, and a repeatable prepublication check.", "Start with one audience and search intent, verify sources before drafting, and reuse the approved core across channels.", "Automating volume before establishing evidence and a point of view produces more commodity content with less reason to cite or return."],
  47: ["brand-launch stack", "Build a launch system for positioning, name and voice, logo, copy, images, and store assets while preserving editable masters.", "A coherent brand comes from shared decisions and constraints, not from asking five tools to invent five unrelated directions.", "Write the audience and promise first, establish a compact creative brief, then test every deliverable against it before publishing.", "Free generation becomes expensive when inconsistent files must be remade or cannot be exported in usable formats."],
  48: ["student research stack", "Separate discovery, source collection, notes, synthesis, citation management, and final verification into visible student-controlled stages.", "Research quality and academic integrity depend on whether every important claim can be traced to a source that actually supports it.", "Save primary sources, distinguish quotations from summaries, keep uncertainty visible, and audit citations before submission.", "A polished synthesis with fabricated or mismatched references is worse than a slower transparent workflow."],
  49: ["creator repurposing workflow", "Turn one verified idea into a written core, audio treatment, video asset, and platform-specific social posts without losing meaning between handoffs.", "The workflow needs one canonical source, editable assets, format-specific review, and measured limits for each free plan.", "Approve the core message first, then transform it one format at a time and inspect every export before scheduling.", "Automatic repurposing multiplies factual errors, weak hooks, and inconsistent branding as easily as it multiplies good work."],
  50: ["decision diary", "Apply five requirements one at a time and record why candidates leave the list until only three testable finalists remain.", "The value of the finder is not a mysterious score. It is the visible sequence from a broad category to a defensible shortlist.", "Start with the job, then workflow, usage, access, and priority. Test the final three with the same input.", "Changing several filters at once hides which compromise created or removed a useful match."],
};

function categoryFor(niche) {
  if (["content-creation", "research", "education", "translation-and-language"].includes(niche)) return "ai-writing-content";
  if (["image-generation", "design"].includes(niche)) return "ai-image-design";
  if (["video", "audio-and-music"].includes(niche)) return "ai-video-audio";
  if (["sales-and-crm", "customer-support", "hr-and-recruitment", "real-estate"].includes(niche)) return "ai-sales-leadgen";
  if (["marketing", "social-media", "e-commerce"].includes(niche)) return "ai-seo-marketing";
  if (["automation", "agentic-and-automation", "productivity", "project-management", "coding", "data-and-analytics"].includes(niche)) return "ai-productivity-automation";
  return "ai-basics-tutorials";
}

function findNiche(spec) {
  if (spec.number >= 9 && spec.number <= 33) return niches[spec.number - 9];
  const finder = spec.finder.match(/`\/tools\/([^`]+)`/)?.[1];
  return niches.find((item) => item.slug === finder) || null;
}

function toolTable(rows) {
  if (!rows.length) return "The catalog currently has no sufficiently complete examples for this exact combination. Widen one requirement instead of accepting an invented match.";
  const head = "| Tool | Best fit | Pricing label | Access |\n|---|---|---|---|";
  const body = rows.slice(0, 5).map((tool) => {
    const access = (tool.access_methods || []).slice(0, 2).join(", ") || "Check current access";
    return `| ${tool.name} | ${tool.best_for || tool.subcategory || "General use"} | ${tool.pricing_model || "Verify pricing"} | ${access} |`;
  });
  return [head, ...body].join("\n");
}

function catalogNotes(rows) {
  if (!rows.length) return "No catalog records meet this exact combination yet. Keep the requirement visible and widen only one constraint.";
  return rows.slice(0, 5).map((tool) => {
    const access = (tool.access_methods || []).join(", ") || "access not yet verified";
    const focus = tool.best_for || tool.subcategory || "general use";
    const summary = (tool.summary || "The catalog record needs a fresh capability review.").replace(/\s+/g, " ").trim();
    return `- **${tool.name}:** The current record places it under ${tool.subcategory || "the broader category"} and describes its best fit as ${focus}. Recorded access is ${access}, with pricing labeled ${tool.pricing_model || "not yet verified"}. ${summary} Treat that description as the hypothesis for the controlled test, then verify the deciding limit on the official site.`;
  }).join("\n");
}

function countTable(title, values) {
  const lines = Object.entries(values).sort((a, b) => b[1] - a[1]);
  return `### ${title}\n\n| Label | Published tools |\n|---|---:|\n${lines.map(([label, count]) => `| ${label} | ${count} |`).join("\n")}`;
}

function catalogAssetFor(spec, rows, totals) {
  if (spec.number === 1) {
    return `${countTable("Pricing labels in the 1,196-tool snapshot", totals.byPricing)}\n\nThe headline free-option count includes records with usable free access, while the table preserves the more specific pricing label. This prevents open source, freemium, and fully free products from being presented as identical.`;
  }
  if (spec.number === 4) {
    const top = Object.entries(totals.byNiche).sort((a, b) => b[1].free - a[1].free).slice(0, 10);
    return `### Niches with the most free-option records\n\n| Niche | Free option | Total | Share |\n|---|---:|---:|---:|\n${top.map(([name, value]) => `| ${name} | ${value.free} | ${value.total} | ${Math.round(value.free / value.total * 100)}% |`).join("\n")}\n\nAbsolute count and share answer different questions. A large niche can have many free tools and still have a lower free share than a smaller niche.`;
  }
  if (spec.number === 5) return `${countTable("Access methods recorded in the catalog", totals.byAccess)}\n\nA tool can appear in more than one row because access methods overlap. The table describes availability, not feature parity between the web app, API, mobile app, extension, or desktop client.`;
  if (spec.number === 6) return `### Control is not one label\n\n| Catalog label | Published tools | What still needs verification |\n|---|---:|---|\n| Open source | ${totals.byPricing["open-source"] || 0} | License, repository, deployment, models, maintenance |\n| Freemium | ${totals.byPricing.freemium || 0} | Recurring limits, data terms, exports, paid threshold |\n\nOpen source can offer deployment and modification control. Freemium can offer lower setup effort. Neither label alone answers privacy, ownership, reliability, or total cost.`;
  if (spec.number === 7) return `### The 12-claim verification record\n\n| Area | Claim to verify |\n|---|---|\n| Identity | Official name and canonical website |\n| Availability | Product is accessible and accepting intended users |\n| Job | The claimed capability exists in the current product |\n| Pricing | Current label and paid threshold |\n| Free access | Expiry, card, credits, limits, and watermark |\n| Platforms | Web, mobile, extension, desktop, CLI, plugin, or API |\n| Export | Formats, resolution, portability, and lock-in |\n| Ownership | Input and output rights |\n| Privacy | Retention, training use, deletion, and data location |\n| Integrations | The named connection and what it actually transfers |\n| Support | Documentation, recovery, and escalation path |\n| Freshness | Source URL, checked date, and next review trigger |`;
  if (spec.number === 8) return `### Five-question decision card\n\n| Order | Question | What it removes |\n|---:|---|---|\n| 1 | What exact job must be completed? | Wrong product type |\n| 2 | How should the workflow operate? | Wrong level of control |\n| 3 | How much will you use it? | Wrong plan or capacity |\n| 4 | Where must it work? | Wrong platform or integration |\n| 5 | What should win a close comparison? | Wrong final tradeoff |`;
  if (spec.number === 50) {
    const finalists = rows.slice(0, 3).map((tool) => tool.name).join(", ");
    return `### The decision diary\n\nThe starting pool contained ${rows.length} published writing and content tools. The five requirements were long-form writing, an editing-oriented workflow, recurring use without trial-only access, web availability, and output quality as the final priority. Requirements one through four qualified the pool. The fifth ordered the survivors using the catalog's quality and value evidence.\n\nThe three candidates selected for the controlled test were **${finalists}**. That is not a permanent top three. It is the reproducible result for this requirement set and this catalog snapshot. A different workflow or access requirement can produce a different trio.`;
  }
  return `### The page's reusable asset\n\n**${spec.asset}.** Keep this asset beside its definitions and verification date so it can be quoted without losing the conditions that make it accurate.`;
}

function nicheArticle(spec, niche, rows, counts, related) {
  const quick = `Choose among ${niche.label.toLowerCase()} by starting with the job, then narrowing by workflow, budget, access, and the outcome that matters most. The catalog currently contains ${counts.total} published options in this niche, including ${counts.free} marked with a free option. A five-question shortlist is more useful than a universal ranking because the right answer changes with your constraints.`;
  const goals = niche.goals.map((x) => `- **${x[0].toUpperCase() + x.slice(1)}:** define the output you need before comparing feature lists.`).join("\n");
  const workflows = niche.workflows.map((x) => `- **${x[0].toUpperCase() + x.slice(1)}:** treat this as a workflow requirement, not a bonus feature.`).join("\n");
  return {
    quick,
    content: `**${quick}**

## Key takeaways

- Start with the task, not the best-known brand.
- Separate permanent free access from trials and promotional credits.
- Decide where the tool must work before comparing output quality.
- Keep the deciding requirement visible so a long feature list does not distract you.
- Use the [${niche.label} finder](/tools/${niche.slug}) to recalculate the shortlist as each answer changes.

## Start with the job

The first question is simple: **${niche.question}** A broad category can contain products built for completely different work. Comparing them in one ranking rewards tools with the longest feature pages, not the tools that fit the task.

${goals}

Write the expected output in one sentence before opening a pricing page. Include who uses it, what goes in, what must come out, and how often the job happens. This sentence becomes the standard against which every candidate is judged.

## Choose the workflow before the vendor

The second decision is how the work should happen. In this niche the useful workflow distinctions are ${sentences(niche.workflows)}. Two tools can promise the same result while demanding very different setup, review, and integration work.

${workflows}

${niche.warning} That is why the finder gives workflow its own question instead of hiding it inside a generic feature score.

## Decide what “free” needs to mean

Top Use AI currently lists ${counts.free} of ${counts.total} published ${niche.label.toLowerCase()} tools with a free option. That number is a discovery starting point, not a promise that every free plan is unlimited. A free trial, recurring free allowance, open-source package, and limited free account create different long-term costs.

Check whether the plan expires, asks for a card, watermarks output, blocks export, restricts commercial work, or removes the API. Our guide to [free forever, freemium, and free trials](/blog/free-forever-vs-freemium-vs-free-trial) explains the labels used across the finder.

## Shortlist examples from the catalog

These examples show the range inside the niche. They are not a universal top-five ranking. Re-run the finder with your answers before choosing.

${toolTable(rows)}

### What to verify in these examples

${catalogNotes(rows)}

Catalog descriptions and pricing labels are snapshots. Open the vendor page and verify current limits before buying. A product with incomplete evidence should not outrank a less famous product with clear documentation.

## Ask all five questions

1. **Job:** what exact output must the tool produce?
2. **Workflow:** how much control, automation, or collaboration do you need?
3. **Usage:** is this occasional work, regular use, or production volume?
4. **Access:** must it run on the web, mobile, API, desktop, or locally?
5. **Priority:** should quality, ease, privacy, or value decide close matches?

Each answer removes a different kind of mismatch. Budget alone leaves unusable tools. Quality alone ignores access. Feature count ignores whether the workflow fits. The combination is what turns a catalog into a shortlist.

## How to test the final three

Give every finalist the same small real task. Record setup time, corrections, export quality, and anything you had to do outside the product. Repeat with a difficult example, because polished demos usually represent the easiest case.

Do not migrate a team during the test. Prove the result with one user and one workflow first. If the tool needs an integration, test that integration instead of assuming a logo on the vendor page means the workflow is complete.

## Which should you choose?

Choose the simplest candidate that completes the real job and preserves the control you need. Pay for higher limits only after the free or small test exposes a genuine limit. Choose local or self-hosted access when data location is a requirement, not because it sounds more technical. Choose an API when the result must enter another system without copying and pasting.

Skip any tool whose pricing, export, ownership, or privacy answer remains unclear after checking its official documentation. Ambiguity becomes expensive after the workflow depends on it.

## The verdict

There is no single best ${niche.label.toLowerCase()} tool. There is a best fit for a specific job, workflow, usage level, access requirement, and priority. Use the [live ${niche.label} finder](/tools/${niche.slug}) to make those tradeoffs visible and keep the final test small enough to reverse.

*Related reading: [${related.title}](/blog/${related.slug}) and [how to choose an AI tool in five questions](/blog/how-to-choose-an-ai-tool-in-five-questions).*

*Catalog counts and labels checked October 2026. Product plans change, so verify current details on the vendor's official site.*`,
  };
}

function generalArticle(spec, rows, totals, related) {
  const finderLink = spec.finder.match(/`(\/tools[^`]*)`/)?.[1] || "/tools";
  const [format, premise, evidence, action, risk] = guideProfiles[spec.number];
  const quick = `${premise} This ${format} uses a dated snapshot of ${totals.total} published tools and turns the result into a decision the reader can reproduce.`;
  const examples = rows.slice(0, 5);
  const catalogAsset = catalogAssetFor(spec, rows, totals);
  const decisionGuideLink = spec.number > 8 ? ", [how to choose an AI tool in five questions](/blog/how-to-choose-an-ai-tool-in-five-questions)" : "";
  const officialSources = spec.number === 3
    ? `## How this method supports discovery and citations

[Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) says the same core SEO practices apply to AI Overviews and AI Mode, including crawlability, internal links, useful text, page experience, and structured data that matches visible content. Google also says there is no special AI schema required. [OpenAI's crawler documentation](https://developers.openai.com/api/docs/bots) distinguishes OAI-SearchBot, which supports appearance in ChatGPT search, from GPTBot, which relates to model training. Site owners can make separate choices for those crawlers. [Bing's AI Performance announcement](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) documents citation counts, cited pages, and sampled grounding queries.

The practical conclusion is restrained: publish original evidence with a transparent method, keep it discoverable, and measure citations where a platform exposes them. No publisher can guarantee a citation. Retrieval and presentation remain decisions made by each search or answer system.`
    : `## Evidence to keep with the decision

${evidence} Record the source, the date, and any uncertainty beside the field that affected the choice. That small evidence trail is what lets another person repeat the comparison after a plan, policy, or product changes.

The citation asset for this page is **${spec.asset}.** It should remain useful without the surrounding sales copy: a reader or answer engine can extract the definition, table, checklist, or worked example and still understand its scope.`;
  return {
    quick,
    content: `**${quick}**

## Key takeaways

- This page is a ${format}, so its method matters as much as its conclusion.
- ${evidence}
- ${action}
- ${risk}
- Continue in the [AI Tool Finder](${finderLink}) and keep the deciding requirement visible.

## The decision behind this guide

The search problem behind this page is **${spec.query}.** That phrase can attract huge roundups, but a huge roundup rarely resolves the decision. The reader needs a definition, a bounded pool, a sequence of checks, and a final action.

Our working rule is: ${premise} The rule deliberately narrows the problem. It prevents a recognizable brand, an impressive demo, or a long feature list from becoming the answer before the requirement has been stated.

## Scope and method

This analysis uses the October 2026 Top Use AI catalog snapshot: ${totals.total} published tools across 25 specialist niches, ${totals.free} entries marked with a free option, and ${totals.openSource} entries carrying the open-source pricing label. Drafts, rejected candidates, and unpublished imports are outside the count.

We separate catalog facts from vendor claims and editorial judgment. Catalog facts are calculated from structured records. A changing vendor claim needs an official source and a check date. Editorial judgment explains how a verified field should influence the choice. Unknown remains unknown rather than being silently scored as good or bad.

${catalogAsset}

${officialSources}

## Current catalog examples

${toolTable(examples)}

### Candidate-level verification notes

${catalogNotes(examples)}

These are examples from the qualified pool, not permanent winners. Their role is to expose the range of products and the fields that still need verification. Open each official page before relying on a pricing limit, license, platform, or privacy statement.

## A repeatable evaluation

1. Write the required result in one sentence, including the user and frequency.
2. Turn that sentence into hard requirements and preferences.
3. Apply one hard requirement at a time so every removal has a visible reason.
4. Verify the deciding fields against current primary evidence.
5. Give the final candidates the same representative task and record corrections, setup, export behavior, and total effort.

This order matters. ${action} If the result set falls to zero, reverse only the last constraint and inspect what returns. That reveals the real tradeoff instead of sending the reader back to a list of hundreds.

## The failure mode to avoid

${risk} This is easy to miss because the product can appear to satisfy the broad category while failing the condition that made the search necessary.

Treat missing evidence as a question, not permission to assume the best case. A shortlist of three documented candidates is more useful than a ranked list of fifty entries whose critical limits remain unclear.

## Maintenance and measurement

Recheck the fields that can change the conclusion: availability, price model, included limits, access methods, ownership terms, and privacy controls. High-traffic pages and volatile claims deserve the shortest review interval. A correction should update both the structured catalog record and the explanation readers see.

Measure whether the page helps someone complete the next step. Useful signals include finder visits, filters applied, finalist comparisons, outbound visits to official product pages, and return visits after an update. For citation-oriented pages, also monitor which URLs and query themes appear in the available webmaster reporting. Do not invent a single GEO score when the underlying platforms expose different evidence.

## Which action should you take now?

${action} Then open the [relevant finder](${finderLink}), preserve the hard requirement, and reduce the pool until it is small enough for a controlled test.

For a team decision, save the rejection reason beside each removed candidate. For a personal decision, a short note is enough. In both cases the record prevents the same weak option from returning when memory fades or a new stakeholder joins.

## The verdict

${premise} The conclusion is useful because its scope, evidence, and next action are visible. It can be challenged and updated without rebuilding the entire page.

Use the live finder for the current shortlist and this guide for the reasoning. The database can change as products change, while the decision method remains stable enough to reuse.

*Related reading: [${related.title}](/blog/${related.slug})${decisionGuideLink}, and [the AI Tool Finder](/tools).*

*Catalog snapshot checked October 2026. Verify vendor-specific terms at the official source before making a purchase or compliance decision.*`,
  };
}

function faqFor(spec, niche, counts) {
  const subject = niche?.label || "AI tools";
  return [
    { question: `How do I choose ${subject.toLowerCase()}?`, answer: `Start with the exact job, then compare workflow, usage level, access method, and the priority that should break a tie. Use the finder to reduce the catalog before testing the final candidates on the same real task.` },
    { question: `Are free ${subject.toLowerCase()} actually free?`, answer: `Some provide permanent limited access, while others offer trials, credits, or open-source software that you run yourself. Check expiry, card requirements, exports, commercial rights, and API limits before treating a plan as free forever.` },
    { question: `How many ${subject.toLowerCase()} are in Top Use AI?`, answer: niche ? `The October 2026 catalog contains ${counts.total} published options in this niche, including ${counts.free} marked with a free option. Counts change as products and verification records are updated.` : `Top Use AI contained 1,196 published tools across 25 specialist niches in the October 2026 snapshot used for this series.` },
    { question: `Can I trust an AI tool comparison?`, answer: `Trust comparisons that define their method, date changing facts, link important claims to primary sources, state limitations, and distinguish vendor claims from editorial testing. Treat unexplained scores and undated pricing as weak evidence.` },
    { question: `What should I test before paying for an AI tool?`, answer: `Run the same representative task in each finalist. Record setup time, corrections, output quality, export behavior, and any work required outside the product. Test integrations and privacy controls directly when they are purchase requirements.` },
  ];
}

function descriptionFor(spec) {
  let base = `${spec.title.replace(/[?]$/, "")}. Compare fit, free access, workflow, limitations, and the exact questions to ask before choosing.`;
  if (base.length < 140) base += " Build a shortlist with current catalog data and a repeatable test.";
  if (base.length < 140) base += " See the method and examples.";
  return base.length > 160 ? `${base.slice(0, 157).replace(/\s+\S*$/, "")}...` : base;
}

function poolForGuide(spec, tools) {
  const hasAccess = (tool, value) => (tool.access_methods || []).includes(value);
  if (spec.number === 34) return tools.filter((tool) => tool.free_plan === "yes" && ["free", "freemium", "open-source"].includes(tool.pricing_model));
  if (spec.number === 35) return tools.filter((tool) => tool.free_plan === "yes" && ["education", "research", "content-creation", "ai-assistants"].includes(tool.niche_slug));
  if (spec.number === 36) return tools.filter((tool) => hasAccess(tool, "Desktop App") || hasAccess(tool, "CLI"));
  if (spec.number === 37) return tools.filter((tool) => hasAccess(tool, "API"));
  if (spec.number === 38) return tools.filter((tool) => tool.pricing_model === "open-source" && ["agentic-and-automation", "customer-support"].includes(tool.niche_slug));
  if (spec.number === 39) return tools.filter((tool) => (hasAccess(tool, "Android App") || hasAccess(tool, "iOS App")) && ["audio-and-music", "design", "image-generation", "social-media", "translation-and-language", "video"].includes(tool.niche_slug));
  if (spec.number === 40) return tools.filter((tool) => tool.pricing_model === "open-source" || hasAccess(tool, "Desktop App") || hasAccess(tool, "CLI"));
  if (spec.number === 41) return tools.filter((tool) => tool.pricing_model === "open-source" && ["coding", "security"].includes(tool.niche_slug));
  if (spec.number === 42) return tools.filter((tool) => ["finance", "hr-and-recruitment", "healthcare", "legal", "security"].includes(tool.niche_slug));
  if (spec.number === 43) return tools.filter((tool) => ["research", "ai-assistants"].includes(tool.niche_slug));
  if (spec.number === 44) return tools.filter((tool) => ["agentic-and-automation", "productivity", "sales-and-crm", "finance"].includes(tool.niche_slug));
  if (spec.number === 45) return tools.filter((tool) => ["e-commerce", "customer-support", "sales-and-crm", "marketing"].includes(tool.niche_slug));
  if (spec.number === 46) return tools.filter((tool) => ["research", "content-creation", "marketing", "social-media"].includes(tool.niche_slug));
  if (spec.number === 47) return tools.filter((tool) => ["design", "image-generation", "content-creation", "e-commerce", "marketing"].includes(tool.niche_slug));
  if (spec.number === 48) return tools.filter((tool) => ["education", "research", "productivity", "content-creation"].includes(tool.niche_slug));
  if (spec.number === 49) return tools.filter((tool) => ["audio-and-music", "video", "social-media", "content-creation"].includes(tool.niche_slug));
  if (spec.number === 50) return tools.filter((tool) => tool.niche_slug === "content-creation");
  return tools;
}

function seoTitleFor(spec) {
  if (spec.title.length <= 60) return spec.title;
  const simplified = spec.title
    .replace(/: A Five-Question Decision Guide$/i, "")
    .replace(/\? A Five-Question Decision Guide$/i, "?")
    .replace(/ Without Confusing Wellness With Clinical Use$/i, "")
    .replace(/ for the Person You Are Helping$/i, "")
    .replace(/ for Social, Marketing, or Creative Production$/i, "")
    .replace(/ for One Brand, Many Platforms, or Clients$/i, "")
    .replace(/ for Individual, Firm, or Enterprise Work$/i, "");
  if (simplified.length <= 60) return simplified;
  return simplified.slice(0, 60).replace(/\s+\S*$/, "").replace(/[,:;]$/, "");
}

function validate(posts, knownSlugs) {
  const errors = [];
  const seen = new Set();
  const dates = new Set();
  posts.forEach((post, index) => {
    if (seen.has(post.slug)) errors.push(`${post.slug}: duplicate slug`);
    seen.add(post.slug);
    if (dates.has(post.published_at)) errors.push(`${post.slug}: duplicate schedule`);
    dates.add(post.published_at);
    if (wordCount(post.content) < 800) errors.push(`${post.slug}: only ${wordCount(post.content)} words`);
    if ((post.seo_title || "").length > 60) errors.push(`${post.slug}: SEO title over 60 characters`);
    if ((post.seo_description || "").length < 140 || post.seo_description.length > 160) errors.push(`${post.slug}: meta description length ${post.seo_description.length}`);
    if (!Array.isArray(post.faq_items) || post.faq_items.length < 5) errors.push(`${post.slug}: fewer than five FAQs`);
    if (/\u2014/.test(JSON.stringify(post))) errors.push(`${post.slug}: contains an em dash`);
    if (!post.content.includes("## Key takeaways") || !post.content.includes("## The verdict")) errors.push(`${post.slug}: missing house sections`);
    for (const match of post.content.matchAll(/\]\(\/blog\/([a-z0-9-]+)/g)) {
      const target = match[1];
      if (!knownSlugs.has(target) && !posts.slice(0, index).some((x) => x.slug === target)) errors.push(`${post.slug}: forward or missing link ${target}`);
    }
  });
  return errors;
}

(async () => {
  const [tools, posts, categories] = await Promise.all([
    fetchAll(`tool_catalog?site_id=eq.${SITE_ID}&status=eq.published&select=slug,name,niche_slug,subcategory,best_for,summary,free_plan,pricing_model,access_methods,quality_score,value_score,website_url&order=slug.asc`),
    fetchAll(`posts?site_id=eq.${SITE_ID}&select=slug,title,status,published_at&order=published_at.asc`),
    sb(`categories?site_id=eq.${SITE_ID}&select=id,slug,name`),
  ]);

  const plan = parsePlan();
  if (plan.length !== 50) throw new Error(`Expected 50 plan topics, found ${plan.length}`);
  const seriesSlugs = new Set(plan.map((spec) => slugOverrides.get(spec.number) || slugify(spec.title.replace(/\b(a|an|the)\b/gi, " "))));
  const knownSlugs = new Set(posts.filter((p) => p.status === "published").map((p) => p.slug));
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));
  const totals = {
    total: tools.length,
    free: tools.filter((x) => x.free_plan === "yes").length,
    openSource: tools.filter((x) => x.pricing_model === "open-source").length,
    byPricing: tools.reduce((acc, tool) => {
      const label = tool.pricing_model || "not verified";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {}),
    byAccess: tools.reduce((acc, tool) => {
      for (const method of tool.access_methods || []) acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}),
    byNiche: tools.reduce((acc, tool) => {
      const label = niches.find((niche) => niche.slug === tool.niche_slug)?.label || tool.niche_slug;
      acc[label] ||= { total: 0, free: 0 };
      acc[label].total += 1;
      if (tool.free_plan === "yes") acc[label].free += 1;
      return acc;
    }, {}),
  };

  const latest = posts.reduce((max, post) => !seriesSlugs.has(post.slug) && post.published_at && post.published_at > max ? post.published_at : max, "2026-10-24T13:00:00.000Z");
  const start = START_ARG ? new Date(START_ARG) : new Date(latest);
  if (Number.isNaN(start.getTime())) throw new Error(`Invalid --start value: ${START_ARG}`);
  if (!START_ARG) {
    start.setUTCDate(start.getUTCDate() + 1);
    start.setUTCHours(13, 0, 0, 0);
  }

  const generated = [];
  for (const spec of plan) {
    const niche = findNiche(spec);
    const pool = niche ? tools.filter((x) => x.niche_slug === niche.slug) : poolForGuide(spec, tools);
    const ranked = pool.slice().sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0) || (b.value_score || 0) - (a.value_score || 0) || a.name.localeCompare(b.name));
    const counts = { total: pool.length, free: pool.filter((x) => x.free_plan === "yes").length };
    const fallbackSlug = existingFallback.find((slug) => knownSlugs.has(slug)) || [...knownSlugs][0];
    const previous = generated.length ? generated[generated.length - 1] : { slug: fallbackSlug, title: posts.find((p) => p.slug === fallbackSlug)?.title || "AI tool guides" };
    const article = niche && spec.number >= 9 && spec.number <= 33
      ? nicheArticle(spec, niche, ranked, counts, previous)
      : generalArticle(spec, ranked, totals, previous);
    const scheduled = new Date(start);
    scheduled.setUTCDate(start.getUTCDate() + generated.length);
    const slug = slugOverrides.get(spec.number) || slugify(spec.title.replace(/\b(a|an|the)\b/gi, " "));
    const categorySlug = categoryFor(niche?.slug || "");
    generated.push({
      site_id: SITE_ID,
      slug,
      title: spec.title,
      excerpt: article.quick.slice(0, 220),
      content: article.content,
      quick_answer: article.quick,
      category_id: categoryMap.get(categorySlug) || categoryMap.get("ai-basics-tutorials"),
      audience_tags: ["ai-tool-finder", niche?.slug || "tool-selection", spec.intent.toLowerCase()],
      status: "draft",
      seo_title: seoTitleFor(spec),
      seo_description: descriptionFor(spec),
      faq_items: faqFor(spec, niche, counts),
      published_at: scheduled.toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  const errors = validate(generated, knownSlugs);
  if (errors.length) {
    console.error(`Validation failed with ${errors.length} issue(s):`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  fs.writeFileSync(SNAPSHOT, JSON.stringify(generated, null, 2) + "\n");
  console.log(`Validated ${generated.length} drafts.`);
  console.log(`Words: ${generated.reduce((n, p) => n + wordCount(p.content), 0).toLocaleString()}`);
  console.log(`Schedule: ${generated[0].published_at} to ${generated.at(-1).published_at}`);
  console.log(`Snapshot: ${path.relative(ROOT, SNAPSHOT)}`);

  if (!APPLY) {
    console.log("Dry run complete. Use --apply to upsert the validated drafts.");
    return;
  }

  for (let index = 0; index < generated.length; index += 10) {
    const batch = generated.slice(index, index + 10);
    await sb("posts?on_conflict=site_id,slug", {
      method: "POST",
      body: JSON.stringify(batch),
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    });
    console.log(`Upserted ${Math.min(index + 10, generated.length)}/${generated.length}`);
  }

  const stored = await sb(`posts?site_id=eq.${SITE_ID}&status=eq.draft&slug=in.(${generated.map((p) => p.slug).join(",")})&select=slug,status,published_at,content,faq_items&order=published_at.asc&limit=100`);
  if (stored.length !== generated.length) throw new Error(`Stored ${stored.length}/${generated.length} drafts`);
  const expected = new Map(generated.map((post) => [post.slug, post]));
  const mismatches = stored.filter((row) => {
    const post = expected.get(row.slug);
    return !post || new Date(row.published_at).getTime() !== new Date(post.published_at).getTime() || row.content !== post.content || row.faq_items.length < 5;
  });
  if (mismatches.length) throw new Error(`Post-write verification failed for ${mismatches.map((x) => x.slug).join(", ")}`);
  console.log(`Verified ${stored.length} scheduled drafts in Supabase.`);
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

