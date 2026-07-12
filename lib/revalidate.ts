"use server";

import { revalidatePath } from "next/cache";

export function revalidatePost(slug: string) {
  revalidatePath(`/blog/${slug}`);
}

export function revalidateCategory(slug: string) {
  revalidatePath(`/category/${slug}`);
  revalidatePath("/blog");
}

export function revalidateSite() {
  revalidatePath("/", "layout");
}
