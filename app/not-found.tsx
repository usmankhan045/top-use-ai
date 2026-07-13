import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { navLinks } from "@/lib/site.config";

// Keep 404s out of the index. Next still returns a 404 status with this page.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background py-20 sm:py-28">
        <Container width="narrow">
          <p className="font-mono text-sm uppercase tracking-widest text-primary mb-4">
            404
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5">
            We couldn&rsquo;t find that page.
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-8 max-w-xl">
            The link may be broken or the page may have moved. Try one of these
            instead, or head back to the homepage.
          </p>
          <div className="flex flex-wrap gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
