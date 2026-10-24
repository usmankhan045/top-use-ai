import { siteConfig } from "@/lib/site.config";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Only ever round-trip an internal admin path back into the form.
  const safeNext = next && next.startsWith("/admin") ? next : "/admin";

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary font-display text-lg font-bold text-white"
          >
            {siteConfig.brand.monogram}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight">
              Control Room
            </h1>
            <p className="text-xs text-muted">{siteConfig.domain}</p>
          </div>
        </div>

        <div className="rounded-xl border-2 border-text bg-surface p-6 shadow-[6px_6px_0_0_var(--color-line)]">
          <LoginForm next={safeNext} />
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          Private content management for {siteConfig.name}.
        </p>
      </div>
    </main>
  );
}
