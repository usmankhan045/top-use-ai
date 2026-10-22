import type { FinderAnswers, Recommendation, WritingTool } from "./types";

type WritingGoal = FinderAnswers["goal"];

const TOOL_GOALS: Record<string, WritingGoal[]> = {
  jasper: ["marketing", "social", "long-form"],
  "copy-ai": ["marketing", "social"],
  writesonic: ["long-form", "marketing", "seo", "social"],
  rytr: ["marketing", "social", "long-form"],
  grammarly: ["editing", "academic", "long-form"],
  quillbot: ["editing", "academic"],
  wordtune: ["editing", "long-form"],
  sudowrite: ["creative", "long-form"],
  anyword: ["marketing", "social"],
  simplified: ["social", "marketing"],
  "hypotenuse-ai": ["marketing", "long-form", "seo"],
  scalenut: ["seo", "long-form"],
  "originality-ai": ["review", "academic"],
  bluehumanizer: ["editing", "review"],
  "deepl-write": ["editing", "academic", "long-form"],
  "hemingway-editor": ["editing", "long-form"],
  "jenni-ai": ["academic", "long-form"],
  languagetool: ["editing", "academic"],
  prowritingaid: ["editing", "creative", "long-form"],
  undetectedgpt: ["editing", "review"],
  "unfox-ai": ["review", "academic"],
  "writerly-ai": ["marketing", "social", "long-form"],
};

const GOAL_LABELS: Record<WritingGoal, string> = {
  "long-form": "long-form writing",
  marketing: "marketing copy",
  social: "social content",
  editing: "editing and rewriting",
  seo: "SEO content",
  creative: "creative writing",
  academic: "academic writing",
  review: "content review",
  general: "general writing",
};

const GOAL_KEYWORDS: Record<WritingGoal, string[]> = {
  "long-form": ["blog", "article", "long-form", "newsletter", "report", "document"],
  marketing: ["marketing", "copywriting", "sales", "landing page", "advertising", "product description"],
  social: ["social media", "caption", "social post", "instagram", "linkedin", "twitter"],
  editing: ["editing", "grammar", "rewrite", "rewriting", "paraphras", "readability", "proofread"],
  seo: ["seo", "search engine", "keyword", "content optimization", "serp"],
  creative: ["creative writing", "fiction", "story", "novel", "screenplay", "character"],
  academic: ["academic", "citation", "research paper", "student", "essay", "scholarly"],
  review: ["originality", "plagiarism", "ai detection", "content detection", "fact-check", "quality check"],
  general: [],
};

function inferGoals(tool: WritingTool): WritingGoal[] {
  const explicit = TOOL_GOALS[tool.slug];
  if (explicit) return explicit;

  const searchable = [
    tool.name,
    tool.sourceCategory,
    tool.subcategory,
    tool.summary,
    tool.bestFor,
    ...(tool.tags ?? []),
    ...(tool.useCases ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (Object.keys(GOAL_KEYWORDS) as WritingGoal[]).filter((goal) =>
    GOAL_KEYWORDS[goal].some((keyword) => searchable.includes(keyword))
  );
}

function addReason(reasons: string[], reason: string) {
  if (!reasons.includes(reason)) reasons.push(reason);
}

export function recommendWritingTools(
  answers: FinderAnswers,
  tools: WritingTool[]
): Recommendation[] {
  const eligibleTools =
    answers.budget === "free-only"
      ? tools.filter((tool) => tool.freePlan === "yes")
      : tools;

  return eligibleTools
    .map((tool) => {
      const reasons: string[] = [];
      let score = 0;

      const supportedGoals = inferGoals(tool);
      if (answers.goal === "general" || supportedGoals.includes(answers.goal)) {
        score += answers.goal === "general" ? 15 : 40;
        addReason(
          reasons,
          answers.goal === "general"
            ? "Flexible enough for a general writing workflow."
            : `Built for ${GOAL_LABELS[answers.goal]}.`
        );
      } else {
        score -= 15;
      }

      if (answers.budget === "free-only") {
        score += 35;
        addReason(reasons, "Has a reported free plan or free web version.");
      } else if (answers.budget === "under-30") {
        score += tool.valueScore * 6;
        if (tool.valueScore >= 4) addReason(reasons, "Scores well for value in our editorial review.");
      } else {
        score += tool.qualityScore * 6;
      }

      if (answers.priority === "quality") score += tool.qualityScore * 8;
      if (answers.priority === "ease") score += tool.easeScore * 8;
      if (answers.priority === "value") score += tool.valueScore * 8;

      if (answers.experience === "beginner" && tool.audience.includes("beginner")) {
        score += 15;
        addReason(reasons, "Suited to beginners.");
      }
      if (answers.experience === "experienced" && tool.audience.includes("experienced")) {
        score += 15;
        addReason(reasons, "Has features aimed at experienced users.");
      }

      const labels = [
        tool.freePlan === "yes" ? "Free plan reported" : "Free status needs checking",
        tool.verification === "verified"
          ? "Verified"
          : tool.verification === "needs-review"
            ? "Catalog data - verify before buying"
            : "Editorial seed",
      ];

      return { tool, score, reasons, labels };
    })
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
}
