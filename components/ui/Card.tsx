import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// The 5px left border is the "tab", a strip of electric lime down the edge of
// the card. It is the one place the accent appears at card scale, so a grid of
// cards reads as a set of tabbed records rather than a wall of white boxes.

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** "ledger" (default) adds the 3px primary-color left tab.
   *  "plain" omits it for contexts where the tab would be redundant. */
  variant?: "ledger" | "plain";
  /** Reduces padding for dense list contexts */
  compact?: boolean;
}

export function Card({
  variant = "ledger",
  compact = false,
  className,
  children, ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-[var(--radius)]",
        // A 2px outline plus a solid un-blurred offset shadow, so the card reads
        // as a physical card lying on the paper ground rather than a soft panel.
        "border-2 border-black/[0.09]",
        "shadow-[3px_3px_0_rgba(34,32,46,0.07)]",
        // Lift on hover, driven by a `group` on the wrapping link where present.
        "transition duration-200",
        "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5",
        "group-hover:shadow-[6px_6px_0_var(--color-text)] group-hover:border-text",
        variant === "ledger" && "border-l-[5px] border-l-accent",
        compact ? "p-4" : "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Compound sub-components ───────────────────────────────────────────────────

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("mb-3", className)} {...props}>
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ as: Tag = "h3", className, children, ...props }: CardTitleProps) {
  return (
    <Tag
      className={cn(
        "font-display text-xl font-semibold text-text leading-snug",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn("text-muted text-sm leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-black/[0.07]", className)} {...props}>
      {children}
    </div>
  );
}
