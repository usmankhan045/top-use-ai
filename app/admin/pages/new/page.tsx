import { createPageAction } from "@/lib/admin/actions";
import { PageHeader } from "../../ui";
import PageForm from "../PageForm";

export const dynamic = "force-dynamic";

export default function NewPage() {
  return (
    <>
      <PageHeader title="New page" />
      <PageForm action={createPageAction} submitLabel="Create page" />
    </>
  );
}
