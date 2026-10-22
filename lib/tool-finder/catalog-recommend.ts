import type { NicheConfig } from "./niches";
import type { Recommendation, WritingTool } from "./types";

export interface CatalogAnswers {
  goal: string;
  workflow: string;
  budget: "free-only" | "free-or-trial" | "any";
  access: "any" | "web" | "mobile" | "api" | "desktop";
  priority: "fit" | "ease" | "privacy" | "value";
}

function searchable(tool: WritingTool) {
  return [
    tool.name,
    tool.subcategory,
    tool.summary,
    tool.bestFor,
    ...(tool.tags ?? []),
    ...(tool.useCases ?? []),
    ...(tool.strengths ?? []),
  ].filter(Boolean).join(" ").toLowerCase();
}

function matchesAccess(tool: WritingTool, access: CatalogAnswers["access"]) {
  if (access === "any") return true;
  const methods = (tool.accessMethods ?? []).join(" ").toLowerCase();
  const keywords: Record<Exclude<CatalogAnswers["access"], "any">, string[]> = {
    web: ["web"], mobile: ["ios", "android", "mobile"], api: ["api", "sdk"], desktop: ["desktop", "cli", "self-host"],
  };
  return keywords[access].some((keyword) => methods.includes(keyword) || searchable(tool).includes(keyword));
}

function effectivePricing(tool: WritingTool) {
  return tool.pricingModel ?? (tool.freePlan === "yes" ? "freemium" : tool.freePlan === "no" ? "paid" : "unknown");
}

export function recommendCatalogTools(
  niche: NicheConfig,
  answers: CatalogAnswers,
  tools: WritingTool[]
): Recommendation[] {
  const goal = niche.goals.find((item) => item.value === answers.goal);
  const workflow = niche.workflows.find((item) => item.value === answers.workflow);

  const eligibleTools = tools.filter((tool) => {
      const pricing = effectivePricing(tool);
      const pricingEligible = answers.budget === "free-only"
        ? ["free", "freemium", "open-source"].includes(pricing)
        : answers.budget === "free-or-trial"
          ? ["free", "freemium", "open-source", "free-trial", "pay-as-you-go"].includes(pricing)
          : true;
      return pricingEligible && matchesAccess(tool, answers.access);
    });
  const goalMatches = eligibleTools.filter((tool) => {
    const text = searchable(tool);
    return tool.subcategory?.toLowerCase() === goal?.label.toLowerCase()
      || goal?.keywords.some((keyword) => text.includes(keyword));
  });
  return goalMatches
    .map((tool) => {
      let score = 0;
      const reasons: string[] = [];
      const pricing = effectivePricing(tool);
      const text = searchable(tool);
      const exactGoal = tool.subcategory?.toLowerCase() === goal?.label.toLowerCase();
      const relatedGoal = goal?.keywords.some((keyword) => text.includes(keyword));
      if (exactGoal) {
        score += 55;
        reasons.push(`Focused on ${goal?.label.toLowerCase()}.`);
      } else if (relatedGoal) {
        score += 24;
        reasons.push(`Supports ${goal?.label.toLowerCase()} workflows.`);
      } else {
        score -= 12;
      }

      const workflowHits = workflow?.keywords.filter((keyword) => text.includes(keyword)).length ?? 0;
      score += Math.min(workflowHits, 3) * 9;
      if (workflowHits) reasons.push(`Matches your preference: ${workflow?.label.toLowerCase()}.`);

      if (answers.access !== "any") {
        if (matchesAccess(tool, answers.access)) {
          score += 18;
          reasons.push(`${answers.access === "desktop" ? "Desktop, CLI, or local" : answers.access.toUpperCase()} access reported.`);
        } else score -= 8;
      }

      if (answers.budget === "free-only") {
        score += pricing === "free" || pricing === "open-source" ? 28 : 18;
        reasons.push(pricing === "open-source" ? "Open-source option reported." : "Ongoing free access reported.");
      } else if (answers.budget === "free-or-trial" && tool.freePlan === "yes") score += 12;

      if (answers.priority === "ease") score += tool.easeScore * 5;
      if (answers.priority === "value") score += tool.valueScore * 5;
      if (answers.priority === "fit") score += tool.qualityScore * 5;
      if (answers.priority === "privacy") {
        const privacySignals = [tool.dataStorage?.self_hostable, tool.dataStorage?.trains_on_data === false];
        score += privacySignals.filter(Boolean).length * 14;
        if (privacySignals.some(Boolean)) reasons.push("Has a reported privacy or local-control advantage.");
      }

      if (tool.featured) score += 5;
      if (tool.popular) score += 3;
      const labels = [
        effectivePricing(tool).replaceAll("-", " "),
        tool.verification === "verified" ? "Verified" : "Verify details",
      ];
      return { tool, score, reasons: reasons.slice(0, 3), labels };
    })
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
}

export function filterCatalogTools(tools: WritingTool[], answers: CatalogAnswers) {
  return tools.filter((tool) => {
    const allowed = answers.budget === "free-only"
      ? ["free", "freemium", "open-source"]
      : answers.budget === "free-or-trial"
        ? ["free", "freemium", "open-source", "free-trial", "pay-as-you-go"]
        : null;
    return (!allowed || allowed.includes(effectivePricing(tool))) && matchesAccess(tool, answers.access);
  });
}
