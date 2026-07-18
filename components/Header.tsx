"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, navLinks } from "@/lib/site.config";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui";
import { BrandMark } from "@/components/BrandMark";

type CategoryLink = { slug: string; name: string };

// Icons as tiny SVGs, no package dependency needed for two shapes.
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden
    >
      <path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path d="M3.5 5.25L7 8.75l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Header({ categories = [] }: { categories?: CategoryLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);          // desktop dropdown
  const [mobileCatOpen, setMobileCatOpen] = useState(false); // mobile accordion
  const pathname = usePathname();
  const catRef = useRef<HTMLDivElement>(null);

  const hasCategories = categories.length > 0;
  const isCategoryActive = pathname.startsWith("/category");

  const close = useCallback(() => setIsOpen(false), []);

  // Close everything on route change
  useEffect(() => {
    setIsOpen(false);
    setCatOpen(false);
    setMobileCatOpen(false);
  }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        setCatOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [close]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!catOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [catOpen]);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Opaque background (not translucent + backdrop-blur): a sticky blurred header
  // re-composites the whole viewport behind it on every scroll frame, which is
  // the main cause of scroll jank on long pages.
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-black/[0.07]">
      <Container>
        <div className="flex items-center justify-between h-16 gap-6">

          {/* ── Logo ─────────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
            aria-label={`${siteConfig.name} home`}
          >
            {/* Purely decorative: the site name beside it carries the label. */}
            <BrandMark size={28} ground="light" className="shrink-0" />
            <span className="font-display text-xl font-extrabold text-text tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              const navLink = (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "text-text bg-accent"
                      : "text-muted hover:text-text hover:bg-black/[0.04]"
                  )}
                >
                  {link.label}
                </Link>
              );

              // Inject the Categories dropdown immediately after the Blog link.
              if (link.href === "/blog" && hasCategories) {
                return (
                  <div key="blog-and-categories" className="flex items-center gap-1">
                    {navLink}
                    <div
                      ref={catRef}
                      className="relative"
                      onMouseEnter={() => setCatOpen(true)}
                      onMouseLeave={() => setCatOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setCatOpen((v) => !v)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150",
                          isCategoryActive || catOpen
                            ? "text-text bg-accent"
                            : "text-muted hover:text-text hover:bg-black/[0.04]"
                        )}
                        aria-haspopup="true"
                        aria-expanded={catOpen}
                      >
                        Categories
                        <ChevronIcon
                          className={cn(
                            "transition-transform duration-150",
                            catOpen && "rotate-180"
                          )}
                        />
                      </button>

                      {catOpen && (
                        <div
                          className={cn(
                            "absolute left-0 top-full pt-2 w-60 z-50"
                          )}
                          role="menu"
                        >
                          <div className="rounded-xl border border-black/[0.08] bg-background shadow-lg p-1.5">
                            {categories.map((cat) => {
                              const active = pathname === `/category/${cat.slug}`;
                              return (
                                <Link
                                  key={cat.slug}
                                  href={`/category/${cat.slug}`}
                                  role="menuitem"
                                  className={cn(
                                    "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    active
                                      ? "text-text bg-accent"
                                      : "text-text hover:bg-black/[0.04]"
                                  )}
                                >
                                  {cat.name}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return navLink;
            })}
          </nav>

          {/* ── Hamburger ────────────────────────────────────────────────── */}
          <button
            className={cn(
              "md:hidden p-2 -mr-2 rounded-lg transition-colors",
              "text-text hover:bg-black/[0.04]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            )}
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

        </div>
      </Container>

      {/* ── Mobile nav drawer ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-black/[0.07] bg-background"
        >
          <Container>
            <nav
              className="py-4 flex flex-col gap-0.5"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                const navLink = (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-3 rounded-xl text-base font-medium transition-colors",
                      isActive
                        ? "text-text bg-accent"
                        : "text-text hover:bg-black/[0.04]"
                    )}
                  >
                    {link.label}
                  </Link>
                );

                // Categories accordion after the Blog link.
                if (link.href === "/blog" && hasCategories) {
                  return (
                    <div key="blog-and-categories-mobile" className="flex flex-col gap-0.5">
                      {navLink}
                      <button
                        type="button"
                        onClick={() => setMobileCatOpen((v) => !v)}
                        className={cn(
                          "flex items-center justify-between px-3 py-3 rounded-xl text-base font-medium transition-colors",
                          isCategoryActive
                            ? "text-text bg-accent"
                            : "text-text hover:bg-black/[0.04]"
                        )}
                        aria-expanded={mobileCatOpen}
                      >
                        Categories
                        <ChevronIcon
                          className={cn(
                            "transition-transform duration-150",
                            mobileCatOpen && "rotate-180"
                          )}
                        />
                      </button>
                      {mobileCatOpen && (
                        <div className="flex flex-col gap-0.5 pl-3 mb-1 border-l border-black/[0.07] ml-3">
                          {categories.map((cat) => {
                            const active = pathname === `/category/${cat.slug}`;
                            return (
                              <Link
                                key={cat.slug}
                                href={`/category/${cat.slug}`}
                                className={cn(
                                  "px-3 py-2.5 rounded-lg text-[15px] font-medium transition-colors",
                                  active
                                    ? "text-text bg-accent"
                                    : "text-muted hover:text-text hover:bg-black/[0.04]"
                                )}
                              >
                                {cat.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return navLink;
              })}
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
