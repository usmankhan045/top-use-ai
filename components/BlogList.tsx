"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardTitle, CardBody, Tag, SectionDivider } from "@/components/ui";
import { cn } from "@/lib/utils";

// Slim, serializable shape, deliberately excludes the heavy `content` field so
// the static payload sent to the browser stays small.
export interface BlogListPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: string | null;
  categoryName: string | null;
  featuredImage: string | null;
}

const PAGE_SIZE = 12;

/**
 * Renders the blog grid with client-side progressive reveal ("Show more").
 * This lets the /blog route be fully static (no `?page=` searchParams, so no
 * per-request server render) while keeping the initial DOM small.
 */
export function BlogList({ posts }: { posts: BlogListPost[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = posts.slice(0, visible);
  const hasMore = visible < posts.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {shown.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            aria-label={post.title}
            className="group block h-full focus-visible:outline-none"
          >
            <Card
              className={cn(
                "h-full flex flex-col overflow-hidden",
                "transition-all duration-200",
                "group-hover:shadow-md group-hover:-translate-y-0.5",
                "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
              )}
            >
              {post.featuredImage && (
                <div className="relative -mx-6 -mt-6 mb-4 aspect-[16/9] overflow-hidden bg-primary/[0.05]">
                  <Image
                    src={post.featuredImage}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              {post.categoryName && (
                <Tag variant="default" className="mb-3 self-start">
                  {post.categoryName}
                </Tag>
              )}
              <CardTitle
                as="h2"
                className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
              >
                {post.title}
              </CardTitle>
              {post.excerpt && (
                <CardBody className="flex-1 line-clamp-3 text-sm">
                  {post.excerpt}
                </CardBody>
              )}
              {post.publishedAt && (
                <p className="mt-4 text-xs font-mono text-muted/60 uppercase tracking-wide">
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {hasMore && (
        <>
          <SectionDivider spacing="md" />
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full border border-primary/40 px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Show more
            </button>
            <p className="text-xs font-mono text-muted uppercase tracking-wide">
              Showing {shown.length} of {posts.length}
            </p>
          </div>
        </>
      )}
    </>
  );
}
