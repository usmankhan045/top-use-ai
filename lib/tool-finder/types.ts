export type ToolCategory = string;
export type FreePlanStatus = "yes" | "no" | "unknown";
export type VerificationStatus = "editorial-seed" | "verified" | "needs-review";
export type PricingModel =
  | "free"
  | "freemium"
  | "free-trial"
  | "paid"
  | "pay-as-you-go"
  | "contact-sales"
  | "open-source"
  | "unknown";

export interface ToolSource {
  label: string;
  href: string;
  kind: "editorial" | "official" | "dataset";
}

export interface WritingTool {
  slug: string;
  name: string;
  category: ToolCategory;
  summary: string;
  bestFor: string;
  audience: Array<"beginner" | "creator" | "marketing-team" | "business" | "experienced">;
  strengths: string[];
  limitations: string[];
  freePlan: FreePlanStatus;
  paidPlans: boolean;
  qualityScore: number;
  easeScore: number;
  valueScore: number;
  sources: ToolSource[];
  verification: VerificationStatus;
  lastReviewedLabel: string;
  relatedPostSlugs: string[];
  sourceCategory?: string;
  subcategory?: string | null;
  websiteUrl?: string | null;
  pricingModel?: PricingModel | null;
  pricingDetails?: {
    free_tier?: string | null;
    paid_plans?: string | null;
    api_cost?: string | null;
  };
  tags?: string[];
  useCases?: string[];
  notGoodFor?: string[];
  industries?: string[];
  accessMethods?: string[];
  compliance?: Record<string, boolean | null>;
  dataStorage?: Record<string, string | boolean | null>;
  featured?: boolean;
  popular?: boolean;
}

export interface FinderAnswers {
  goal:
    | "long-form"
    | "marketing"
    | "social"
    | "editing"
    | "seo"
    | "creative"
    | "academic"
    | "review"
    | "general";
  priority: "quality" | "ease" | "value";
  budget: "free-only" | "under-30" | "flexible";
  experience: "beginner" | "experienced";
}

export interface Recommendation {
  tool: WritingTool;
  score: number;
  reasons: string[];
  labels: string[];
}
