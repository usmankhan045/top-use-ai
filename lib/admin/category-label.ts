import type { Category } from "@/lib/queries";

/** Disambiguate duplicate child names in admin controls without changing SEO-facing names. */
export function adminCategoryLabel(
  category: Category,
  categories: readonly Category[]
): string {
  if (!category.parent_id) return category.name;
  const parent = categories.find((item) => item.id === category.parent_id);
  return parent ? `${category.name} (${parent.name})` : category.name;
}
