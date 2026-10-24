import { listCategories } from "@/lib/admin/data";
import { PageHeader } from "../ui";
import CategoryManager from "./CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await listCategories();

  return (
    <>
      <PageHeader
        title="Categories"
        description="Category slugs are indexed at /category/<slug>. Renaming a slug changes a live URL."
      />
      <CategoryManager categories={categories} />
    </>
  );
}
