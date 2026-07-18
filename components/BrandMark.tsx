/**
 * The brand mark: an open gauge ring with an aperture at its centre.
 *
 * Geometry is kept identical to app/icon.svg so the favicon, the header, the
 * footer and the post covers are all literally the same shape. If you change
 * one, change the other — they are the same mark at different sizes.
 *
 * Two grounds:
 *   "light" — graphite tile, lime mark   (header, on paper)
 *   "dark"  — lime tile, graphite mark   (footer, on graphite)
 *
 * The tile inverts rather than disappearing so the silhouette stays constant
 * wherever it sits. Decorative in every current usage: the site name always
 * sits beside it, so the mark is hidden from assistive tech.
 */
export function BrandMark({
  size = 28,
  ground = "light",
  className,
}: {
  size?: number;
  ground?: "light" | "dark";
  className?: string;
}) {
  const tile = ground === "light" ? "var(--color-primary)" : "var(--color-accent)";
  const mark = ground === "light" ? "var(--color-accent)" : "var(--color-primary)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="512" height="512" rx="128" fill={tile} />
      {/* 270° of ring, open at the lower right — the asymmetry is what makes
          the mark readable when it is only a few pixels wide. */}
      <path
        d="M256 406 A150 150 0 1 1 406 256"
        fill="none"
        stroke={mark}
        strokeWidth="56"
        strokeLinecap="round"
      />
      <circle cx="256" cy="256" r="62" fill={mark} />
    </svg>
  );
}
