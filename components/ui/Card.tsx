import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// The 3px left border is the "ledger tab" — a direct reference to the colored
// tab dividers in physical accounting ledgers. Every card is a record entry.

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
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl",
        "border border-black/[0.07]",
        "shadow-sm",
        variant === "ledger" && "border-l-[3px] border-l-primary",
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
