"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";

interface PrintableEmailGateProps {
  printableSlug: string;
  fileUrl: string | null;
  title: string;
}

type Status = "idle" | "loading" | "success" | "error";

export function PrintableEmailGate({
  printableSlug,
  fileUrl,
  title,
}: PrintableEmailGateProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
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
        body: JSON.stringify({ email, source: `printable-${printableSlug}` }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
      } else {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        className="flex flex-col gap-5"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span
            className="shrink-0 w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center text-sm font-bold leading-none mt-0.5"
            aria-hidden
          >
            ✓
          </span>
          <div>
            <p className="font-display font-semibold text-text text-lg leading-snug">
              You&rsquo;re in. Your download is ready.
            </p>
            <p className="text-muted text-sm mt-1 leading-relaxed">
              Check your inbox for future budgeting tools and guides.
            </p>
          </div>
        </div>

        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download ${title}`}
            className={cn(
              "flex items-center justify-center gap-2 w-full",
              "bg-success text-white rounded-xl",
              "h-12 font-medium text-sm",
              "transition-opacity duration-150 hover:opacity-90 active:opacity-80",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
            )}
          >
            <span aria-hidden>↓</span>
            Download Now (free)
          </a>
        ) : (
          <p className="text-sm text-muted border border-black/[0.07] rounded-xl px-4 py-3 leading-relaxed">
            This printable is coming soon. We&rsquo;ll email you as soon as it&rsquo;s ready.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === "loading"}
        autoComplete="email"
        className={cn(
          "w-full rounded-xl h-12 px-4 text-sm",
          "border border-black/15 bg-white text-text placeholder:text-muted/60",
          "transition-colors duration-150",
          "focus:outline-2 focus:outline-offset-0 focus:outline-primary",
          "disabled:opacity-60"
        )}
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "w-full h-12 rounded-xl font-medium text-sm",
          "bg-primary text-white",
          "transition-opacity duration-150 hover:opacity-90 active:opacity-80",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:opacity-60"
        )}
      >
        {status === "loading" ? "Sending…" : "Get the free download →"}
      </button>

      {status === "error" && (
        <p
          className="text-xs text-red-600"
          role="alert"
          aria-live="assertive"
        >
          {errorMsg}
        </p>
      )}

      <p className="text-xs text-muted/60 text-center leading-relaxed">
        Free forever. No spam. Unsubscribe anytime.
      </p>
    </form>
  );
}
