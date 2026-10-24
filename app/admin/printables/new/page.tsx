import { listCategories } from "@/lib/admin/data";
import { createPrintableAction } from "@/lib/admin/actions";
import { PageHeader } from "../../ui";
import PrintableForm from "../PrintableForm";

export const dynamic = "force-dynamic";

export default async function NewPrintablePage() {
  const categories = await listCategories();

  return (
    <>
      <PageHeader
        title="New printable"
        description="Upload the PDF now, or create the entry first and add the file later."
      />
      <PrintableForm
        action={createPrintableAction}
        categories={categories}
        submitLabel="Create printable"
      />
    </>
  );
}
