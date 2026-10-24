import { listMedia } from "@/lib/admin/media";
import { PageHeader } from "../ui";
import MediaLibrary from "./MediaLibrary";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const { items, unavailable } = await listMedia();

  return (
    <>
      <PageHeader
        title="Media"
        description="Images and PDFs stored in Supabase Storage. Copy a URL to use it as a post's featured image."
      />
      <MediaLibrary items={items} unavailable={unavailable} />
    </>
  );
}
