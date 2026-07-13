import Link from "next/link";

export type Crumb = { name: string; href: string };

/**
 * Visible breadcrumb trail. Mirrors the BreadcrumbList JSON-LD already emitted
 * on post/category pages so the on-page hierarchy matches the structured data
 * (the last item is the current page and is not linked).
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono uppercase tracking-wide text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-x-2">
              {isLast ? (
                <span aria-current="page" className="text-text/70">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && <span className="text-muted/50">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
