import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Shared admin building blocks.
 *
 * These mirror the site's editorial design language — flat fills, 2px ink
 * borders, hard offset shadows, no gradients or blurred shadows. They're kept
 * separate from components/ui/* because those are tuned for the public site's
 * editorial layout, not dense data screens.
 *
 * Note: lib/utils.ts `cn()` is a plain joiner, NOT tailwind-merge — it does not
 * resolve conflicting classes. Pass additive classes only; a `className` that
 * fights a base class will produce two competing rules, not an override.
 */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border-2 border-text bg-surface p-5 shadow-[6px_6px_0_0_var(--color-line)]",
        className
      )}
    >
      {title ? (
        <h2 className="stamp mb-4 text-muted">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  href,
  tone = "default",
}: {
  label: string;
  value: number | string;
  href?: string;
  tone?: "default" | "warn";
}) {
  const body = (
    <div
      className={cn(
        "rounded-xl border-2 border-text bg-surface p-4 transition-transform",
        tone === "warn" && "bg-accent/15",
        href && "hover:-translate-y-0.5"
      )}
    >
      <div className="stamp text-muted">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold tabular-nums">{value}</div>
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export function StatusPill({ status }: { status: string }) {
  const published = status === "published";
  const scheduled = status === "scheduled";
  return (
    <span
      className={cn(
        "stamp inline-block rounded-full border-2 px-2.5 py-0.5",
        published
          ? "border-success bg-success/15 text-success"
          : scheduled
            ? "border-accent-ink bg-accent/15 text-accent-ink"
            : "border-muted bg-background text-muted"
      )}
    >
      {published ? "Live" : scheduled ? "Scheduled" : "Draft"}
    </span>
  );
}

/** Inline error banner for a failed action. */
export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="mb-4 rounded-lg border-2 border-text bg-accent/25 px-4 py-3 text-sm font-medium"
    >
      {message}
    </p>
  );
}

export function SuccessBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className="mb-4 rounded-lg border-2 border-success bg-success/15 px-4 py-3 text-sm font-medium text-success"
    >
      {message}
    </p>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="font-display text-lg font-bold">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** Primary action, styled as a link. */
export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-block rounded-lg border-2 border-text px-4 py-2 font-body text-sm font-bold transition-transform hover:-translate-y-0.5",
        variant === "primary"
          ? "bg-primary text-white shadow-[4px_4px_0_0_var(--color-text)]"
          : "bg-surface text-text"
      )}
    >
      {children}
    </Link>
  );
}

export const inputClass =
  "w-full rounded-lg border-2 border-line bg-surface px-3 py-2 font-body text-sm text-text outline-none transition-colors focus:border-primary";

export const labelClass = "stamp mb-1.5 block text-muted";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
