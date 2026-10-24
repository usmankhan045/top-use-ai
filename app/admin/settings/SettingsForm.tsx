"use client";

import { useActionState, useState } from "react";

import { updateSettingsAction, type ActionState } from "@/lib/admin/actions";
import type { NavItem, ResolvedSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { ErrorBanner, Field, Panel, SuccessBanner, inputClass } from "../ui";

const initialState: ActionState = {};

const COLOR_LABELS: Record<string, string> = {
  primary: "Primary (Pitch Green)",
  accent: "Accent (Floodlight Amber)",
  background: "Background (Chalk White)",
  text: "Text (Boot Black)",
  muted: "Muted (Touchline Grey)",
  success: "Success (Goal Green)",
  primaryDark: "Primary dark",
  surface: "Surface",
  line: "Hairline",
};

export default function SettingsForm({
  settings,
  readOnly,
}: {
  settings: ResolvedSettings;
  readOnly: { slug: string; domain: string; siteId: string };
}) {
  const [state, formAction, pending] = useActionState(
    updateSettingsAction,
    initialState
  );

  const [nav, setNav] = useState<NavItem[]>(settings.nav);
  const [footer, setFooter] = useState<NavItem[]>(settings.footerLinks);
  const [colors, setColors] = useState<Record<string, string>>(
    settings.themeColors as unknown as Record<string, string>
  );

  return (
    <form action={formAction} className="max-w-4xl space-y-6">
      <ErrorBanner message={state.error} />
      <SuccessBanner message={state.ok ? "Settings saved." : undefined} />

      {!settings.fromDatabase ? (
        <p className="rounded-lg border-2 border-text bg-accent/25 px-4 py-3 text-sm">
          These values are currently coming from{" "}
          <span className="font-mono">lib/site.config.ts</span>. Saving here
          creates a database override that wins over the file. If the{" "}
          <span className="font-mono">site_settings</span> table doesn&apos;t exist
          yet, run{" "}
          <span className="font-mono">
            supabase/migrations/004_site_settings.sql
          </span>{" "}
          first.
        </p>
      ) : null}

      <Panel title="Identity">
        <div className="space-y-4">
          <Field label="Site name" htmlFor="name">
            <input
              id="name"
              name="name"
              required
              defaultValue={settings.name}
              className={inputClass}
            />
          </Field>

          <Field label="Tagline" htmlFor="tagline">
            <input
              id="tagline"
              name="tagline"
              defaultValue={settings.tagline}
              className={inputClass}
            />
          </Field>

          <Field label="Contact email" htmlFor="contact_email">
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={settings.contactEmail}
              className={inputClass}
            />
          </Field>
        </div>

        {/* Tenancy keys — shown for reference, never editable. */}
        <div className="mt-5 rounded-lg border-2 border-line bg-background p-4">
          <p className="stamp mb-2 text-muted">Fixed</p>
          <dl className="space-y-1 font-mono text-xs text-muted">
            <div className="flex justify-between gap-4">
              <dt>domain</dt>
              <dd>{readOnly.domain}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>site slug</dt>
              <dd>{readOnly.slug}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>site_id</dt>
              <dd className="truncate">{readOnly.siteId}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">
            These key every query against a database shared with other live
            sites, so they can&apos;t be changed from here.
          </p>
        </div>
      </Panel>

      <Panel title="Navigation">
        <NavRows
          items={nav}
          onChange={setNav}
          prefix="nav"
          hint="Shown in the header. Use root-relative paths like /blog."
        />
      </Panel>

      <Panel title="Footer links">
        <NavRows items={footer} onChange={setFooter} prefix="footer" />
      </Panel>

      <Panel title="Theme">
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(colors).map(([token, value]) => (
            <div key={token}>
              <label htmlFor={`color_${token}`} className="stamp mb-1.5 block text-muted">
                {COLOR_LABELS[token] ?? token}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label={`${COLOR_LABELS[token] ?? token} colour picker`}
                  value={value}
                  onChange={(e) =>
                    setColors({ ...colors, [token]: e.target.value })
                  }
                  className="h-9 w-12 shrink-0 cursor-pointer rounded border-2 border-line bg-surface"
                />
                <input
                  id={`color_${token}`}
                  name={`color_${token}`}
                  value={value}
                  onChange={(e) =>
                    setColors({ ...colors, [token]: e.target.value })
                  }
                  className={cn(inputClass, "font-mono text-xs uppercase")}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Six-digit hex only. These become CSS variables in the root layout, so a
          change here restyles the whole site.
        </p>
      </Panel>

      <Panel title="Social">
        <div className="space-y-4">
          {(["pinterest", "x", "instagram"] as const).map((platform) => (
            <Field
              key={platform}
              label={platform === "x" ? "X (Twitter)" : platform}
              htmlFor={`social_${platform}`}
            >
              <input
                id={`social_${platform}`}
                name={`social_${platform}`}
                type="url"
                defaultValue={settings.social[platform] ?? ""}
                placeholder="https://…"
                className={cn(inputClass, "font-mono text-xs")}
              />
            </Field>
          ))}
        </div>
      </Panel>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border-2 border-text bg-primary px-5 py-2.5 font-body text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function NavRows({
  items,
  onChange,
  prefix,
  hint,
}: {
  items: NavItem[];
  onChange: (next: NavItem[]) => void;
  prefix: string;
  hint?: string;
}) {
  const update = (i: number, patch: Partial<NavItem>) =>
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));

  const move = (i: number, delta: number) => {
    const target = i + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div>
      {hint ? <p className="mb-3 text-xs text-muted">{hint}</p> : null}

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2">
            <input
              name={`${prefix}_label`}
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Label"
              className={cn(inputClass, "min-w-[120px] flex-1")}
            />
            <input
              name={`${prefix}_href`}
              value={item.href}
              onChange={(e) => update(i, { href: e.target.value })}
              placeholder="/path"
              className={cn(inputClass, "min-w-[140px] flex-1 font-mono text-xs")}
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="rounded-md border-2 border-line px-2 py-1.5 text-xs text-muted disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label="Move down"
                className="rounded-md border-2 border-line px-2 py-1.5 text-xs text-muted disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                aria-label="Remove link"
                className="rounded-md border-2 border-line px-2 py-1.5 text-xs text-muted hover:border-text hover:text-text"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChange([...items, { label: "", href: "/" }])}
        className="stamp mt-3 rounded-md border-2 border-text bg-background px-2.5 py-1 transition-colors hover:bg-primary hover:text-white"
      >
        + Add link
      </button>

      {items.length === 0 ? (
        <p className="mt-2 text-xs text-muted">
          With no links saved, the site falls back to the defaults in
          site.config.ts.
        </p>
      ) : null}
    </div>
  );
}
