import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { Container } from "@/components/ui";
import { BrandMark } from "@/components/BrandMark";

// Pinterest SVG, inlined to avoid package dependency.
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  );
}

type CategoryLink = { slug: string; name: string };

export function Footer({ categories = [] }: { categories?: CategoryLink[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <Container>

        {/* ── Main grid ──────────────────────────────────────────────────────
            Link lists run in two sub-columns rather than one tall stack. A
            single column of seven links was what made this footer twice as
            tall as it needed to be. */}
        <div className="pt-8 pb-6 grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 lg:gap-x-12">

          {/* Column 1: Brand. Spans the full width on small screens so the two
              link lists can sit side by side beneath it. */}
          <div className="col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity mb-2 w-fit"
            >
              {/* Same mark as the header and the favicon, inverted for the
                  graphite ground. */}
              <BrandMark size={26} ground="dark" className="shrink-0" />
              <span className="font-display text-2xl font-extrabold text-white tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-white/65 text-sm leading-relaxed mb-4">
              {siteConfig.tagline}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {siteConfig.social.pinterest && (
                <a
                  href={siteConfig.social.pinterest}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${siteConfig.name} on Pinterest`}
                  className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                >
                  <PinterestIcon />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <p className="stamp text-white/40 mb-3">
              Navigation
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 leading-tight">
              {siteConfig.footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/65 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Browse. Previously an "Explore" list that rendered a
              single "Blog" link, because printables are off and there are no
              audience segments — one live link next to a seven-link column,
              which is what left the dead space. Carrying the categories here
              balances the row and gives every category an internal link from
              every page. */}
          <div>
            <p className="stamp text-white/40 mb-3">
              Browse
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 leading-tight">
              <li>
                <Link href="/blog" className="text-sm text-white/65 hover:text-accent transition-colors">
                  All posts
                </Link>
              </li>
              {siteConfig.features.printables && (
                <li>
                  <Link href="/free-printables" className="text-sm text-white/65 hover:text-accent transition-colors">
                    Free Printables
                  </Link>
                </li>
              )}
              {siteConfig.audienceSegments.slice(0, 4).map((seg) => (
                <li key={seg.slug}>
                  <Link
                    href={`/${seg.slug}`}
                    className="text-sm text-white/65 hover:text-accent transition-colors"
                  >
                    {seg.label}
                  </Link>
                </li>
              ))}
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-sm text-white/65 hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <div className="border-t border-white/10 py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-white/35">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <p>{siteConfig.legal.disclaimer}</p>
        </div>

      </Container>
    </footer>
  );
}
