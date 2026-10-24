import { notFound } from "next/navigation";

import { getPrintableById, listCategories } from "@/lib/admin/data";
import { updatePrintableAction, deletePrintableAction } from "@/lib/admin/actions";
import { PageHeader } from "../../ui";
import PrintableForm from "../PrintableForm";
import DeleteButton from "../../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditPrintablePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const [printable, categories] = await Promise.all([
    getPrintableById(id),
    listCategories(),
  ]);

  if (!printable) notFound();

  return (
    <>
      <PageHeader
        title="Edit printable"
        description={printable.title}
        action={
          <DeleteButton
            action={deletePrintableAction}
            id={printable.id}
            label="Delete printable"
            confirmMessage={`Delete "${printable.title}"? It will also be detached from any posts using it.`}
          />
        }
      />
      <PrintableForm
        action={updatePrintableAction.bind(null, printable.id)}
        printable={printable}
        categories={categories}
        submitLabel="Save changes"
        justCreated={Boolean(created)}
      />
    </>
  );
}
