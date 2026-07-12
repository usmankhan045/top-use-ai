"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";

interface EmailSignupProps {
  /** Written to the subscribers table so you can track conversion source */
  source: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  /** "inline", input and button side by side (good for hero).
   *  "stacked", input above button (good for narrow columns / footer). */
  layout?: "inline" | "stacked";
  /** "light", for use on the white/paper background (default).
   *  "dark", for use on the primary-teal footer. */
  theme?: "light" | "dark";
}

export function EmailSignup({
  source,
  title,
  description,
  ctaLabel = "Sign up free",
  layout = "inline",
  theme = "light",
}: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const id = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const isDark = theme === "dark";

  if (status === "success") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 py-1",
          isDark ? "text-white" : "text-success"
        )}
        role="status"
        aria-live="polite"
      >
        <span className="mt-0.5 shrink-0 text-lg leading-none">✓</span>
        <div>
          <p className="font-medium text-sm">You&rsquo;re in!</p>
          <p className={cn("text-sm mt-0.5", isDark ? "text-white/70" : "text-muted")}>
            Check your inbox to confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  const inputClasses = cn(
    "w-full min-w-0 rounded-lg text-sm h-11 px-3.5",
    "transition-colors duration-150",
    "focus:outline-2 focus:outline-offset-0",
    isDark
      ? "bg-white/10 border border-white/25 text-white placeholder:text-white/45 focus:outline-white focus:bg-white/15"
      : "bg-white border border-black/15 text-text placeholder:text-muted/60 focus:outline-primary"
  );

  const buttonClasses = cn(
    "shrink-0 h-11 font-medium text-sm rounded-lg transition-opacity duration-150",
    "hover:opacity-90 active:opacity-80",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    layout === "stacked" ? "w-full" : "whitespace-nowrap px-5",
    isDark
      ? "bg-accent text-white focus-visible:outline-accent"
      : "bg-primary text-white focus-visible:outline-primary"
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      {title && (
        <p
          className={cn(
            "font-display font-semibold mb-1",
            isDark ? "text-white" : "text-text"
          )}
        >
          {title}
        </p>
      )}
      {description && (
        <p
          className={cn(
            "text-sm mb-3",
            isDark ? "text-white/65" : "text-muted"
          )}
        >
          {description}
        </p>
      )}

      <div className={cn("flex gap-2", layout === "stacked" ? "flex-col" : "flex-row flex-wrap")}>
        <label htmlFor={id} className="sr-only">Email address</label>
        <input
          id={id}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          className={inputClasses}
          autoComplete="email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={buttonClasses}
        >
          {status === "loading" ? "Signing up…" : ctaLabel}
        </button>
      </div>

      {status === "error" && (
        <p
          className={cn("mt-2 text-xs", isDark ? "text-red-300" : "text-red-600")}
          role="alert"
          aria-live="assertive"
        >
          {errorMsg}
        </p>
      )}

      <p
        className={cn(
          "mt-2 text-xs",
          isDark ? "text-white/40" : "text-muted/60"
        )}
      >
        No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
