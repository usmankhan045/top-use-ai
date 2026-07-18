"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "accent";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border-2 border-primary " +
    "hover:opacity-90 active:opacity-80 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  outline:
    "bg-transparent text-primary border-2 border-primary " +
    "hover:bg-primary hover:text-white " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  ghost:
    "bg-transparent text-primary border-2 border-transparent " +
    "hover:bg-primary/10 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",

  // Electric lime is far too bright to carry white text, so the accent button
  // takes ink text and a hard ink border instead. This is the loudest control
  // on the site and is reserved for the single primary action on a page.
  accent:
    "bg-accent text-text border-2 border-text " +
    "hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--color-text)] " +
    "active:translate-x-0 active:translate-y-0 active:shadow-none " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text",
};

// Fully rounded pills, matching the rest of the system. The radius is
// intentionally not derived from --radius: cards use that token for a soft
// rectangle, while controls are unambiguously pill-shaped.
const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm rounded-full",
  md: "px-6 py-2.5 text-base rounded-full",
  lg: "px-8 py-3.5 text-lg rounded-full",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "font-body font-semibold",
        "transition duration-150 cursor-pointer",
        "disabled:opacity-50 disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
