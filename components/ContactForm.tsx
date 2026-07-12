"use client";

import { useState, useId } from "react";
import { cn } from "@/lib/utils";

export function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  const set =
    (field: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFields({ name: "", email: "", message: "" });
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
        className="flex items-start gap-3 py-4"
        role="status"
        aria-live="polite"
      >
        <span className="mt-0.5 shrink-0 text-lg leading-none text-success">✓</span>
        <div>
          <p className="font-medium text-text">Message received!</p>
          <p className="text-sm text-muted mt-0.5">
            Thanks for reaching out. I&rsquo;ll get back to you within 1 to 3 business days.
          </p>
        </div>
      </div>
    );
  }

  const inputBase = cn(
    "w-full rounded-lg text-sm h-11 px-3.5",
    "bg-white border border-black/15 text-text placeholder:text-muted/60",
    "transition-colors duration-150",
    "focus:outline-2 focus:outline-offset-0 focus:outline-primary",
    "disabled:opacity-50"
  );

  const isLoading = status === "loading";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor={nameId} className="block text-sm font-medium text-text mb-1.5">
          Your name
        </label>
        <input
          id={nameId}
          type="text"
          value={fields.name}
          onChange={set("name")}
          placeholder="First name is fine"
          required
          disabled={isLoading}
          className={inputBase}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor={emailId} className="block text-sm font-medium text-text mb-1.5">
          Email address
        </label>
        <input
          id={emailId}
          type="email"
          value={fields.email}
          onChange={set("email")}
          placeholder="you@example.com"
          required
          disabled={isLoading}
          className={inputBase}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor={messageId} className="block text-sm font-medium text-text mb-1.5">
          Message
        </label>
        <textarea
          id={messageId}
          value={fields.message}
          onChange={set("message")}
          placeholder="What's on your mind?"
          required
          rows={5}
          disabled={isLoading}
          className={cn(inputBase, "h-auto py-3 resize-y")}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert" aria-live="assertive">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full h-11 rounded-xl text-sm font-medium text-white",
          "bg-primary hover:opacity-90 active:opacity-80",
          "transition-opacity duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:opacity-50 disabled:pointer-events-none"
        )}
      >
        {isLoading ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}
