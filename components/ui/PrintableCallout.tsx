import { Tag } from "./Tag";
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

// The dashed border references the "cut here" line on physical printable sheets, // the dotted perforation that separates the document from the margin.

interface PrintableCalloutProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  href?: string;
  badge?: string;
}

export function PrintableCallout({
  title,
  description,
  href = "/free-printables",
  badge = "Free Download",
  className, ...props
}: PrintableCalloutProps) {
  return (
    <div
      className={cn(
        // Dashed accent border, the "cut here" perforation motif
        "border-2 border-dashed border-accent/60",
        "rounded-xl p-6",
        // Very subtle accent wash so it reads as a special callout without screaming
        "bg-accent/[0.05]",
        "flex flex-col sm:flex-row items-start sm:items-center gap-5",
        className
      )}
      {...props}
    >
      {/* Printable icon, a ruled-paper glyph */}
      <div
        className="shrink-0 w-14 h-16 rounded-lg bg-white border border-accent/30 shadow-sm flex flex-col justify-center items-center gap-1.5 px-2"
        aria-hidden
      >
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="block h-px bg-muted/40 rounded-full"
            style={{ width: i === 0 ? "60%" : "100%" }}
          />
        ))}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Tag variant="accent">{badge}</Tag>
        </div>
        <p className="font-display font-semibold text-text text-base leading-snug mb-1">
          {title}
        </p>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
      </div>

      {/* CTA, plain anchor with button styling; no onClick needed */}
      <a
        href={href}
        className={cn(
          "shrink-0 inline-flex items-center justify-center gap-2",
          "bg-accent text-white border-2 border-accent",
          "px-3.5 py-1.5 text-sm rounded-lg",
          "font-medium transition-all duration-150",
          "hover:opacity-90 active:opacity-80",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        )}
      >
        Download
      </a>
    </div>
  );
}
