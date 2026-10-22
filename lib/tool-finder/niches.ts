import { NICHE_FILTER_COPY, type NicheFilterCopy } from "./niche-filter-copy";

export interface NicheOption {
  value: string;
  label: string;
  description: string;
  keywords: string[];
}

export interface NicheConfig {
  slug: string;
  category: string;
  label: string;
  shortLabel: string;
  description: string;
  goalQuestion: string;
  goals: NicheOption[];
  workflowQuestion: string;
  workflows: NicheOption[];
  filters: NicheFilterCopy;
}

const option = (label: string, description = `Tools focused on ${label.toLowerCase()}.`): NicheOption => ({
  value: label.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  label,
  description,
  keywords: [label.toLowerCase()],
});

const workflow = (value: string, label: string, description: string, keywords: string[]): NicheOption => ({
  value, label, description, keywords,
});

function niche(
  category: string,
  label: string,
  description: string,
  goalQuestion: string,
  goals: string[],
  workflowQuestion: string,
  workflows: NicheOption[]
): NicheConfig {
  return {
    slug: category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    category,
    label,
    shortLabel: label.replace(/^AI /, ""),
    description,
    goalQuestion,
    goals: goals.map((goal) => option(goal)),
    workflowQuestion,
    workflows,
    filters: NICHE_FILTER_COPY[category],
  };
}

export const NICHES: NicheConfig[] = [
  niche("AI Assistants", "AI Assistants", "General, personal, search, and enterprise assistants.", "What kind of assistant do you need?", ["General Chatbot", "Personal Assistant", "Search Engine", "Enterprise Assistant", "Conversational AI"], "What matters most in your assistant?", [
    workflow("research", "Current, sourced answers", "Prioritize research and citations.", ["research", "search", "citation", "real-time"]),
    workflow("files", "Work with my files", "Prioritize documents, analysis, and uploads.", ["document", "file", "summariz", "analysis"]),
    workflow("integration", "Connect to my work", "Prioritize integrations and enterprise workflows.", ["integration", "workspace", "enterprise", "automation"]),
  ]),
  niche("Agentic & Automation", "AI Automation", "Agents, integrations, and workflow automation.", "What do you want to automate?", ["Integration Platform", "AI Agents", "Workflow Automation"], "How should the automation run?", [
    workflow("no-code", "Visual and no-code", "Build without writing much code.", ["no-code", "visual", "drag", "template"]),
    workflow("developer", "Developer controlled", "APIs, SDKs, and programmable workflows.", ["api", "sdk", "developer", "code"]),
    workflow("autonomous", "Multi-step autonomy", "Agents that plan and complete longer tasks.", ["agent", "autonomous", "multi-step", "orchestrat"]),
  ]),
  niche("Audio & Music", "AI Audio & Music", "Music, speech, voice, podcast, and audio editing tools.", "What are you creating?", ["Music Generation", "Audio Editing", "Text-to-Speech", "Speech-to-Text", "Voice Synthesis", "Podcast Tools", "Voice Cloning"], "What audio workflow do you need?", [
    workflow("studio", "Studio-quality production", "Prioritize control and high-quality output.", ["professional", "studio", "quality", "editing"]),
    workflow("realtime", "Real-time audio", "Prioritize low latency and live use.", ["real-time", "realtime", "low latency", "stream"]),
    workflow("creator", "Fast creator workflow", "Prioritize simple web tools and quick exports.", ["creator", "easy", "web", "export"]),
  ]),
  niche("Coding", "AI Coding Tools", "Code generation, IDE assistants, review, testing, and APIs.", "Where do you need coding help?", ["API Development", "Code Generation", "IDE Assistant", "Code Completion", "Code Review", "Testing", "Low-Code/No-Code"], "How do you prefer to work?", [
    workflow("ide", "Inside my IDE", "Prioritize editor extensions and completions.", ["ide", "extension", "completion", "vscode"]),
    workflow("terminal", "Terminal or local", "Prioritize CLI and local workflows.", ["cli", "terminal", "local", "self-host"]),
    workflow("team", "Team and repository", "Prioritize reviews, collaboration, and repositories.", ["team", "review", "repository", "pull request"]),
  ]),
  niche("Content Creation", "AI Writing & Content", "Writing, blogs, copy, stories, and rewriting tools.", "What are you writing?", ["Writing", "Blog Writing", "Copywriting", "Storytelling", "Paraphrasing"], "What should the writing workflow emphasize?", [
    workflow("long-form", "Long-form structure", "Articles, reports, and longer drafts.", ["long-form", "article", "blog", "document"]),
    workflow("brand", "Marketing and brand voice", "Campaigns, product copy, and consistent tone.", ["marketing", "brand", "copy", "campaign"]),
    workflow("editing", "Editing and clarity", "Grammar, rewriting, tone, and readability.", ["editing", "grammar", "rewrite", "clarity"]),
  ]),
  niche("Customer Support", "AI Customer Support", "Help desks, support chatbots, live chat, and voice bots.", "Which support channel are you improving?", ["Help Desk", "Chatbot Builder", "Live Chat", "Voice Bot"], "What support outcome matters most?", [
    workflow("self-service", "Customer self-service", "Resolve common questions automatically.", ["self-service", "knowledge base", "faq", "automation"]),
    workflow("agents", "Assist human agents", "Speed up replies, routing, and summaries.", ["agent assist", "routing", "summary", "ticket"]),
    workflow("omnichannel", "Multiple channels", "Connect chat, email, voice, and messaging.", ["omnichannel", "email", "voice", "messaging"]),
  ]),
  niche("Data & Analytics", "AI Data & Analytics", "BI, preparation, prediction, visualization, and statistics.", "What data job are you doing?", ["Business Intelligence", "Data Preparation", "Predictive Analytics", "Data Visualization", "Statistical Analysis"], "Who will use the result?", [
    workflow("analyst", "Analysts and data teams", "Prioritize depth, SQL, and modeling.", ["sql", "analyst", "model", "statistics"]),
    workflow("business", "Business users", "Prioritize natural language and dashboards.", ["natural language", "dashboard", "business", "no-code"]),
    workflow("embedded", "Product or API", "Prioritize APIs and embedded analytics.", ["api", "embedded", "developer", "integration"]),
  ]),
  niche("Design", "AI Design", "Graphics, presentations, UI/UX, logos, and typography.", "What are you designing?", ["Graphic Design", "Presentation Design", "UI/UX Design", "Logo Design", "Color & Typography", "UI Design"], "What kind of design workflow fits you?", [
    workflow("templates", "Quick templates", "Start quickly with guided layouts.", ["template", "easy", "presentation", "social"]),
    workflow("editable", "Editable professional output", "Prioritize control, layers, and export formats.", ["editable", "vector", "export", "professional"]),
    workflow("collaboration", "Team collaboration", "Prioritize shared brand and review workflows.", ["team", "collaboration", "brand", "comment"]),
  ]),
  niche("E-commerce", "AI E-commerce", "Recommendations, product content, reviews, inventory, and pricing.", "What store problem are you solving?", ["Product Recommendations", "Product Description", "Review Management", "Inventory Management", "Visual Search", "Pricing Optimization"], "Where should it fit?", [
    workflow("storefront", "Customer-facing storefront", "Improve discovery and conversion.", ["storefront", "customer", "recommendation", "conversion"]),
    workflow("operations", "Back-office operations", "Inventory, pricing, and catalog workflows.", ["inventory", "pricing", "catalog", "operations"]),
    workflow("marketplaces", "Marketplace selling", "Prioritize listings and multichannel commerce.", ["marketplace", "amazon", "shopify", "listing"]),
  ]),
  niche("Education", "AI Education", "Tutoring, course creation, study, grading, and learning tools.", "What learning task do you need?", ["Tutoring", "Course Creation", "Study Tools", "Learning Management", "Quiz Generation", "Grading", "Language Learning"], "Who is it for?", [
    workflow("student", "Individual learner", "Study guidance, practice, and explanations.", ["student", "study", "learner", "practice"]),
    workflow("teacher", "Teacher or instructor", "Create lessons, assessments, and feedback.", ["teacher", "lesson", "grading", "quiz"]),
    workflow("institution", "School or organization", "Prioritize administration and learning platforms.", ["institution", "school", "lms", "classroom"]),
  ]),
  niche("Finance", "AI Finance", "Planning, analysis, accounting, tax, trading, and risk tools.", "Which financial workflow do you need?", ["Financial Planning", "Financial Analysis", "Accounting", "Tax", "Trading", "Risk Management"], "What environment is this for?", [
    workflow("personal", "Personal finance", "Budgeting, planning, and individual decisions.", ["personal", "individual", "budget", "planning"]),
    workflow("business", "Business finance", "Accounting, reporting, and operations.", ["business", "accounting", "invoice", "reporting"]),
    workflow("professional", "Finance professional", "Analysis, trading, risk, and institutional data.", ["professional", "trading", "risk", "portfolio"]),
  ]),
  niche("HR & Recruitment", "AI HR & Recruitment", "Hiring, sourcing, interviews, onboarding, and workforce tools.", "Which people workflow are you improving?", ["Resume Screening", "Candidate Sourcing", "Workforce Planning", "Interview Tools", "Onboarding", "Performance Management", "Job Search"], "Who are you helping?", [
    workflow("candidate", "Job seeker", "Applications, resumes, and interview preparation.", ["job seeker", "resume", "application", "candidate"]),
    workflow("recruiter", "Recruiter", "Sourcing, screening, and interview workflows.", ["recruiter", "sourcing", "screening", "interview"]),
    workflow("hr-team", "HR team", "Workforce, onboarding, and performance management.", ["hr", "workforce", "onboarding", "performance"]),
  ]),
  niche("Healthcare", "AI Healthcare", "Clinical, imaging, drug, mental health, and patient tools.", "Which healthcare workflow do you need?", ["Clinical AI", "Medical Imaging", "Drug Discovery", "Mental Health", "Patient Engagement", "Medical Documentation", "Health Monitoring"], "What level of use is intended?", [
    workflow("consumer", "Personal wellness", "Non-clinical guidance and tracking.", ["wellness", "personal", "consumer", "tracking"]),
    workflow("clinician", "Clinical support", "Documentation and clinician decision support.", ["clinical", "clinician", "medical", "documentation"]),
    workflow("research", "Research and life sciences", "Imaging, discovery, and medical research.", ["research", "drug discovery", "imaging", "life sciences"]),
  ]),
  niche("Image Generation", "AI Image Tools", "Art, generation, editing, enhancement, avatars, and upscaling.", "What image task do you need?", ["Art Generation", "Text-to-Image", "Image Editing", "Photo Enhancement", "Avatar Generation", "Background Removal", "Upscaling"], "What matters for your output?", [
    workflow("control", "Detailed creative control", "Prioritize styles, settings, and iteration.", ["control", "style", "prompt", "professional"]),
    workflow("speed", "Fast, simple results", "Prioritize quick generation and easy editing.", ["easy", "fast", "one-click", "template"]),
    workflow("commercial", "Commercial assets", "Prioritize export quality and business use.", ["commercial", "marketing", "product", "high resolution"]),
  ]),
  niche("Legal", "AI Legal", "Contracts, review, research, discovery, and compliance.", "Which legal task are you handling?", ["Contract Analysis", "Document Review", "Legal Research", "E-Discovery", "Compliance"], "What kind of legal workflow is this?", [
    workflow("individual", "Individual or small business", "Simpler document and contract assistance.", ["small business", "individual", "self-service", "simple"]),
    workflow("firm", "Law firm", "Research, matters, and document-heavy workflows.", ["law firm", "attorney", "legal research", "matter"]),
    workflow("enterprise", "Enterprise legal team", "Compliance, security, and organization-wide controls.", ["enterprise", "compliance", "security", "team"]),
  ]),
  niche("Marketing", "AI Marketing", "Email, content, SEO, analytics, brand, and advertising.", "Which marketing channel matters most?", ["Email Marketing", "Content Marketing", "SEO", "Analytics", "Brand Management", "Ad Optimization"], "What is your primary outcome?", [
    workflow("create", "Create campaigns faster", "Generate and repurpose campaign content.", ["create", "content", "campaign", "copy"]),
    workflow("optimize", "Improve performance", "Analytics, testing, SEO, and ad optimization.", ["analytics", "optimiz", "seo", "performance"]),
    workflow("brand", "Maintain brand consistency", "Coordinate voice, assets, and team output.", ["brand", "consistency", "team", "guideline"]),
  ]),
  niche("Productivity", "AI Productivity", "Documents, tasks, knowledge, schedules, email, and notes.", "Which part of your work needs help?", ["Document Management", "Task Management", "Knowledge Management", "Workflow Automation", "Calendar & Scheduling", "Email Management", "Note-Taking"], "How will you use it?", [
    workflow("personal", "Personal organization", "A simple individual workspace.", ["personal", "individual", "notes", "tasks"]),
    workflow("team", "Team collaboration", "Shared knowledge, projects, and handoffs.", ["team", "collaboration", "shared", "project"]),
    workflow("automation", "Automate repetitive work", "Connections, triggers, and workflows.", ["automation", "integration", "workflow", "trigger"]),
  ]),
  niche("Project Management", "AI Project Management", "Collaboration, agile work, and resource planning.", "What project need comes first?", ["Collaboration", "Agile Tools", "Resource Planning"], "How does your team plan work?", [
    workflow("simple", "Simple projects", "Tasks, timelines, and straightforward collaboration.", ["simple", "task", "timeline", "collaboration"]),
    workflow("agile", "Agile delivery", "Sprints, backlogs, and engineering workflows.", ["agile", "sprint", "backlog", "scrum"]),
    workflow("portfolio", "Resources and portfolio", "Capacity, reporting, and multiple projects.", ["resource", "capacity", "portfolio", "reporting"]),
  ]),
  niche("Real Estate", "AI Real Estate", "Leads, valuations, market analysis, tours, and property operations.", "Which property workflow do you need?", ["Lead Generation", "Property Valuation", "Market Analysis", "Virtual Tours", "Property Management"], "Who will use it?", [
    workflow("agent", "Agent or broker", "Leads, listings, and client communication.", ["agent", "broker", "lead", "listing"]),
    workflow("investor", "Investor or analyst", "Valuation, markets, and investment decisions.", ["investor", "valuation", "market", "analysis"]),
    workflow("manager", "Property manager", "Operations, tenants, and property portfolios.", ["property management", "tenant", "operations", "portfolio"]),
  ]),
  niche("Research", "AI Research", "Academic research, reviews, mining, markets, and patents.", "What kind of research are you doing?", ["Academic Research", "Literature Review", "Data Mining", "Market Research", "Patent Research"], "What research capability matters most?", [
    workflow("sources", "Find credible sources", "Discovery, citations, and evidence trails.", ["citation", "source", "paper", "evidence"]),
    workflow("synthesis", "Synthesize many documents", "Summaries, comparisons, and literature reviews.", ["synthes", "summary", "literature", "document"]),
    workflow("analysis", "Analyze research data", "Extraction, mining, and structured analysis.", ["data mining", "extract", "analysis", "dataset"]),
  ]),
  niche("Sales & CRM", "AI Sales & CRM", "CRM, outreach, intelligence, proposals, leads, and deals.", "Which sales workflow needs help?", ["CRM", "Outreach Automation", "Revenue Intelligence", "Sales Intelligence", "Lead Generation", "Proposal Generation", "Deal Management"], "Where is your sales bottleneck?", [
    workflow("prospecting", "Finding prospects", "Research, intent, and lead generation.", ["prospect", "lead", "intent", "contact"]),
    workflow("outreach", "Starting conversations", "Personalized email and multichannel outreach.", ["outreach", "email", "personaliz", "sequence"]),
    workflow("pipeline", "Managing pipeline", "CRM updates, forecasts, deals, and proposals.", ["pipeline", "crm", "forecast", "deal"]),
  ]),
  niche("Security", "AI Security", "Monitoring, scanning, threats, fraud, and penetration testing.", "Which security job do you need?", ["Security Monitoring", "Vulnerability Scanning", "Threat Detection", "Fraud Prevention", "Penetration Testing"], "What environment are you protecting?", [
    workflow("developer", "Applications and code", "Developer security and vulnerability workflows.", ["application", "code", "developer", "vulnerability"]),
    workflow("operations", "Security operations", "Monitoring, incidents, and threat response.", ["soc", "monitoring", "incident", "threat"]),
    workflow("business", "Fraud and business risk", "Transactions, identities, and fraud prevention.", ["fraud", "transaction", "identity", "risk"]),
  ]),
  niche("Social Media", "AI Social Media", "Scheduling, engagement, and social analytics.", "Which social workflow do you need?", ["Content Scheduling", "Engagement Tools", "Analytics"], "How many channels do you manage?", [
    workflow("creator", "One creator or brand", "Simple creation and scheduling.", ["creator", "simple", "content", "schedule"]),
    workflow("multi", "Several platforms", "Cross-posting and unified engagement.", ["multi-platform", "cross-post", "channels", "inbox"]),
    workflow("agency", "Clients or a larger team", "Approvals, reporting, and multiple accounts.", ["agency", "client", "approval", "team"]),
  ]),
  niche("Translation & Language", "AI Translation & Language", "Translation, localization, and live language tools.", "What language task do you need?", ["Machine Translation", "Localization", "Real-time Translation"], "What content are you translating?", [
    workflow("everyday", "Everyday text and documents", "Fast general-purpose translation.", ["document", "text", "general", "writing"]),
    workflow("product", "Products and websites", "Localization workflows and terminology.", ["localization", "website", "product", "terminology"]),
    workflow("live", "Speech and live conversation", "Low-latency voice translation.", ["real-time", "speech", "conversation", "meeting"]),
  ]),
  niche("Video", "AI Video", "Generation, editing, enhancement, captions, and animation.", "What video task do you need?", ["Video Generation", "Video Editing", "Video Enhancement", "Subtitles & Captions", "Animation"], "What kind of video are you making?", [
    workflow("short", "Short social video", "Quick clips, captions, and repurposing.", ["short", "social", "clip", "caption"]),
    workflow("marketing", "Marketing or product video", "Brand, avatars, explainers, and promotion.", ["marketing", "product", "avatar", "explainer"]),
    workflow("creative", "Creative production", "Generation, animation, and detailed editing.", ["creative", "cinematic", "animation", "editing"]),
  ]),
];

export const NICHE_BY_SLUG = new Map(NICHES.map((item) => [item.slug, item]));

export function categorySlug(category: string) {
  return category.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
