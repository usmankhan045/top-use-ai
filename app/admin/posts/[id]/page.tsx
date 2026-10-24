import { notFound } from "next/navigation";

import {
  getPostById,
  listCategories,
} from "@/lib/admin/data";
import { updatePostAction, deletePostAction } from "@/lib/admin/actions";
import { PageHeader } from "../../ui";
import PostForm from "../PostForm";
import DeleteButton from "../../DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const [post, categories] = await Promise.all([
    getPostById(id),
    listCategories(),
  ]);

  if (!post) notFound();

  // Bind the row id so the action signature stays (prevState, formData) and the
  // form keeps working without client JS.
  const action = updatePostAction.bind(null, post.id);

  return (
    <>
      <PageHeader
        title="Edit post"
        description={post.title}
        action={
          <DeleteButton
            action={deletePostAction}
            id={post.id}
            label="Delete post"
            confirmMessage={`Delete "${post.title}"? This cannot be undone.`}
          />
        }
      />
      <PostForm
        action={action}
        post={post}
        categories={categories}
        printables={[]}
        attachedPrintableIds={[]}
        submitLabel="Save changes"
        justCreated={Boolean(created)}
      />
    </>
  );
}
