import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SectionDividerProps extends HTMLAttributes<HTMLDivElement> {
  /** "plain" — a single ruled line (default).
   *  "titled" — the label sits centered between two rules, like a ledger section header. */
  variant?: "plain" | "titled";
  label?: string;
  /** Extra vertical spacing around the divider */
  spacing?: "sm" | "md" | "lg";
}

const spacingClasses = {
  sm: "my-6",
  md: "my-10",
  lg: "my-16",
};

export function SectionDivider({
  variant = "plain",
  label,
  spacing = "md",
  className,
  ...props
}: SectionDividerProps) {
  if (variant === "titled" && label) {
    return (
      <div
        className={cn(
          "flex items-center gap-4",
          spacingClasses[spacing],
          className
        )}
        role="separator"
        aria-label={label}
        {...props}
      >
        <Rule />
        <span className="stamp text-muted whitespace-nowrap shrink-0">{label}</span>
        <Rule />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-4", spacingClasses[spacing], className)}
      role="separator"
      {...props}
    >
      <Rule />
      {/* A single tally mark centered in the rule — a nod to the counting gesture */}
      <span
        className="font-mono text-muted/50 text-xs shrink-0 select-none leading-none"
        aria-hidden
      >
        |
      </span>
      <Rule />
    </div>
  );
}

function Rule() {
  return (
    <span
      className="block flex-1 h-px bg-gradient-to-r from-transparent via-muted/30 to-transparent"
    />
  );
}
