// ── Tag, the site's signature design element ─────────────────────────────────
//
// Geist Mono · uppercase · 0.12em letter-spacing · 1px border · 3px radius
// The 1.5px offset box-shadow (shadow-[1.5px_1.5px_0_currentColor]) is the
// small-scale echo of the hard-ink shadow on panels and cards: the same solid,
// un-blurred offset, sized down to badge scale.
//
// Uses currentColor throughout so every variant needs only a text+border class.

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type TagVariant = "default" | "primary" | "accent" | "success";

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
}

const variantClasses: Record<TagVariant, string> = {
  default: "text-muted  border-muted",
  primary: "text-primary border-primary",
  // Electric lime as text would sit at roughly 1.3:1 on white, so the accent
  // variant fills instead of outlines: lime ground, ink text and ink border.
  accent:  "bg-accent text-text border-text",
  success: "text-success border-success",
};

export function Tag({ variant = "default", className, children, ...props }: TagProps) {
  return (
    <span
      className={cn(
        // stamp utility (defined in globals.css): mono, uppercase, letter-spaced, offset shadow
        "stamp",
        "inline-flex items-center",
        "px-2 py-[3px]",
        "border rounded-[3px]",
        "shadow-[1.5px_1.5px_0_currentColor]",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
