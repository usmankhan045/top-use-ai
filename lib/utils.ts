type ClassValue = string | undefined | null | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 1)
    .filter(Boolean)
    .join(" ");
}

/** Canonical path for a blog post. Keep admin previews and public links aligned. */
export function postPath(slug: string): string {
  return `/blog/${slug}`;
}
