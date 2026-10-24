import { notFound } from "next/navigation";

import { getPageById } from "@/lib/admin/data";
import { updatePageAction, deletePageAction } from "@/lib/admin/actions";
import { PageHeader } from "../../ui";
import PageForm from "../PageForm";
import DeleteButton from "../../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditPageRoute({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <>
      <PageHeader
        title="Edit page"
        description={page.title ?? `/${page.slug}`}
        action={
          <DeleteButton
            action={deletePageAction}
            id={page.id}
            label="Delete page"
            confirmMessage={`Delete "${page.title || page.slug}"? This cannot be undone.`}
          />
        }
      />
      <PageForm
        action={updatePageAction.bind(null, page.id)}
        page={page}
        submitLabel="Save changes"
        justCreated={Boolean(created)}
      />
    </>
  );
}
