export type BudgetChoice = "free-only" | "free-or-trial" | "any";
export type AccessChoice = "any" | "web" | "mobile" | "api" | "desktop";
export type PriorityChoice = "fit" | "ease" | "privacy" | "value";

export interface FilterChoice<T extends string> {
  value: T;
  label: string;
}

export interface NicheFilterCopy {
  budget: { question: string; options: FilterChoice<BudgetChoice>[] };
  access: { question: string; options: FilterChoice<AccessChoice>[] };
  priority: { question: string; options: FilterChoice<PriorityChoice>[] };
}

const choices = <T extends string>(values: readonly T[], labels: readonly string[]): FilterChoice<T>[] =>
  values.map((value, index) => ({ value, label: labels[index] }));

const BUDGET_VALUES = ["free-only", "free-or-trial", "any"] as const;
const ACCESS_VALUES = ["any", "web", "mobile", "api", "desktop"] as const;
const PRIORITY_VALUES = ["fit", "ease", "privacy", "value"] as const;

function copy(
  budgetQuestion: string,
  budgetLabels: readonly [string, string, string],
  accessQuestion: string,
  accessLabels: readonly [string, string, string, string, string],
  priorityQuestion: string,
  priorityLabels: readonly [string, string, string, string],
): NicheFilterCopy {
  return {
    budget: { question: budgetQuestion, options: choices(BUDGET_VALUES, budgetLabels) },
    access: { question: accessQuestion, options: choices(ACCESS_VALUES, accessLabels) },
    priority: { question: priorityQuestion, options: choices(PRIORITY_VALUES, priorityLabels) },
  };
}

export const NICHE_FILTER_COPY: Record<string, NicheFilterCopy> = {
  "AI Assistants": copy(
    "How heavily will you use the assistant?", ["Light use · free", "Free limits or trial", "Heavy use · paid okay"],
    "Where should your assistant be available?", ["Any workspace", "Browser", "Phone", "API / apps", "Desktop / local"],
    "What matters most in daily use?", ["Answer quality", "Easy to learn", "Data control", "Best value"],
  ),
  "Agentic & Automation": copy(
    "What automation scale are you planning?", ["Free experiments", "Pilot with trials", "Production budget"],
    "How will workflows be built and run?", ["Any setup", "Visual web builder", "Mobile operations", "API / webhooks", "Self-hosted / local"],
    "What is the deciding factor?", ["Workflow coverage", "Setup speed", "Data control", "Run cost"],
  ),
  "Audio & Music": copy(
    "How much audio will you produce?", ["Hobby · free exports", "Try before paying", "Production volume"],
    "Where will you record or edit?", ["Any studio", "Browser studio", "Phone / tablet", "Audio API", "Desktop / local"],
    "What must the audio tool get right?", ["Sound quality", "Fast workflow", "Voice / file privacy", "Cost per export"],
  ),
  Coding: copy(
    "How much code assistance do you need?", ["Free personal use", "Trial for a project", "Team / paid usage"],
    "Where must it fit your development flow?", ["Any environment", "Browser IDE", "Mobile access", "API / SDK", "IDE / terminal / local"],
    "What is most important for your codebase?", ["Codebase fit", "Low learning curve", "Code privacy", "Value per developer"],
  ),
  "Content Creation": copy(
    "How much content do you publish?", ["Occasional · free", "Regular · free limits", "High volume · paid okay"],
    "Where does writing happen?", ["Any workspace", "Web editor", "Phone / tablet", "API / CMS", "Desktop / local"],
    "What should the writing tool protect most?", ["Output quality", "Easy editing", "Draft privacy", "Words per dollar"],
  ),
  "Customer Support": copy(
    "What support volume are you handling?", ["Small queue · free", "Pilot or seasonal", "Production support"],
    "Where should support automation connect?", ["Any channel", "Web help desk", "Mobile agents", "API / integrations", "On-prem / desktop"],
    "What matters most to support operations?", ["Resolution fit", "Fast rollout", "Customer-data control", "Cost per resolution"],
  ),
  "Data & Analytics": copy(
    "What analysis scale do you need?", ["Small data · free", "Trial on real data", "Team / production"],
    "Where will analysis run?", ["Any environment", "Cloud / browser", "Mobile dashboards", "API / embedded", "Desktop / local"],
    "What is your main analytics requirement?", ["Analytical depth", "Usability", "Data governance", "Value for workload"],
  ),
  Design: copy(
    "How many design assets will you create?", ["Occasional · free", "Campaign trial", "Ongoing production"],
    "Where should design work happen?", ["Any workspace", "Browser canvas", "Phone / tablet", "Design API", "Desktop app"],
    "What makes the design usable?", ["Editable quality", "Fast creation", "Brand / asset control", "Export value"],
  ),
  "E-commerce": copy(
    "What store scale are you supporting?", ["Starter store · free", "Pilot / trial", "Growing catalog · paid"],
    "Where must the tool connect?", ["Any commerce stack", "Store admin / web", "Mobile commerce", "API / platform apps", "Desktop / self-hosted"],
    "What should improve first?", ["Commerce fit", "Merchant ease", "Shopper-data control", "Return on cost"],
  ),
  Education: copy(
    "How many learners will use it?", ["Individual · free", "Classroom trial", "School / paid rollout"],
    "Where will learning happen?", ["Any environment", "Web / LMS", "Phone / tablet", "API / LMS integration", "Desktop / offline"],
    "What is the key learning requirement?", ["Learning fit", "Ease for learners", "Student privacy", "Value per learner"],
  ),
  Finance: copy(
    "What level of financial use is this?", ["Personal · free", "Business trial", "Professional / paid"],
    "Where must financial data flow?", ["Any system", "Cloud / browser", "Mobile finance", "API / accounting stack", "Desktop / on-prem"],
    "What is non-negotiable?", ["Accuracy and fit", "Workflow speed", "Financial-data control", "Return on cost"],
  ),
  "HR & Recruitment": copy(
    "What hiring volume are you planning for?", ["Occasional · free", "Hiring sprint / trial", "Ongoing recruiting"],
    "Where should it fit the hiring stack?", ["Any workflow", "Web / ATS", "Mobile recruiters", "API / HRIS", "Desktop / on-prem"],
    "What matters most in selection?", ["Candidate-workflow fit", "Recruiter adoption", "Candidate privacy", "Cost per hire"],
  ),
  Healthcare: copy(
    "What level of healthcare use is intended?", ["Personal wellness · free", "Controlled evaluation", "Clinical / research budget"],
    "Where will it be used?", ["Any setting", "Web portal", "Mobile / bedside", "API / health system", "Local / on-prem"],
    "What must be prioritized?", ["Clinical-use fit", "Workflow usability", "Patient-data control", "Value for use case"],
  ),
  "Image Generation": copy(
    "How many images will you generate or edit?", ["Occasional · free", "Trial / limited credits", "Production volume"],
    "Where should image work happen?", ["Any workspace", "Browser studio", "Phone / tablet", "Image API", "Desktop / local"],
    "What defines a good result?", ["Creative control", "One-click ease", "Image / prompt privacy", "Cost per usable image"],
  ),
  Legal: copy(
    "What document or matter volume do you handle?", ["Occasional · free", "Matter trial", "Firm / enterprise volume"],
    "Where must the legal tool operate?", ["Any workflow", "Web workspace", "Mobile review", "API / matter system", "Local / on-prem"],
    "What is the legal team’s priority?", ["Task and citation fit", "Reviewability", "Client confidentiality", "Value per matter"],
  ),
  Marketing: copy(
    "What campaign volume are you running?", ["Small / free", "Campaign trial", "Always-on marketing"],
    "Where should it join your marketing stack?", ["Any stack", "Web platform", "Mobile publishing", "API / automation", "Desktop / local"],
    "What should drive the recommendation?", ["Channel performance", "Team ease", "Brand / audience control", "Campaign value"],
  ),
  Productivity: copy(
    "How broad is the rollout?", ["Personal · free", "Team trial", "Company rollout"],
    "Where does your work already live?", ["Any ecosystem", "Browser workspace", "Phone / tablet", "API / integrations", "Desktop / local"],
    "What will make it stick?", ["Workflow fit", "Easy adoption", "Workspace privacy", "Value per user"],
  ),
  "Project Management": copy(
    "How many projects or teammates are involved?", ["Small team · free", "Project trial", "Portfolio / paid"],
    "Where does the team manage work?", ["Any setup", "Web workspace", "Mobile field work", "API / integrations", "Desktop / self-hosted"],
    "What should the PM tool optimize?", ["Planning fit", "Team adoption", "Project-data control", "Value per seat"],
  ),
  "Real Estate": copy(
    "What property or lead volume do you manage?", ["Individual · free", "Portfolio trial", "Agency / paid volume"],
    "Where must it fit the property stack?", ["Any workflow", "Web / CRM", "Mobile / field", "API / listing systems", "Desktop / local"],
    "What is the buying priority?", ["Property-workflow fit", "Agent ease", "Client-data control", "Value per lead"],
  ),
  Research: copy(
    "How much literature or data will you process?", ["Small project · free", "Research trial", "Lab / team volume"],
    "Where should research happen?", ["Any environment", "Web workspace", "Mobile reading", "API / data pipeline", "Desktop / local"],
    "What makes a result trustworthy?", ["Evidence and citations", "Researcher ease", "Source / data privacy", "Value per project"],
  ),
  "Sales & CRM": copy(
    "What sales volume are you supporting?", ["Solo / free", "Pipeline trial", "Team / paid scale"],
    "Where must it connect?", ["Any sales stack", "Web / CRM", "Mobile selling", "API / integrations", "Desktop / on-prem"],
    "What should improve the most?", ["Pipeline fit", "Rep adoption", "Prospect-data control", "Value per rep"],
  ),
  Security: copy(
    "What security scale are you covering?", ["Personal lab · free", "Evaluation / trial", "Production estate"],
    "Where must detection or scanning run?", ["Any environment", "Cloud console", "Mobile response", "API / SIEM", "Local / self-hosted"],
    "What is the security team’s priority?", ["Detection coverage", "Deployment speed", "Telemetry control", "Value per asset"],
  ),
  "Social Media": copy(
    "How many accounts and posts do you manage?", ["One account · free", "Campaign trial", "Agency / high volume"],
    "Where will social work happen?", ["Any setup", "Web dashboard", "Mobile publishing", "API / automation", "Desktop / local"],
    "What should the social tool protect?", ["Channel workflow", "Publishing ease", "Brand / account access", "Value per account"],
  ),
  "Translation & Language": copy(
    "How much content will you translate?", ["Occasional · free", "Project trial", "Localization volume"],
    "Where must translation work?", ["Any environment", "Web / documents", "Mobile / live", "Translation API", "Desktop / offline"],
    "What matters most across languages?", ["Language quality", "Workflow speed", "Content confidentiality", "Cost per word"],
  ),
  Video: copy(
    "How much video will you produce?", ["Occasional · free", "Trial / limited exports", "Production volume"],
    "Where should video production happen?", ["Any workspace", "Browser editor", "Phone / tablet", "Video API", "Desktop / local"],
    "What defines the right video tool?", ["Output control", "Editing speed", "Footage privacy", "Cost per finished video"],
  ),
};

