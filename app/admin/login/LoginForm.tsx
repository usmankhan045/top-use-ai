"use client";

import { useActionState } from "react";

import { loginAction, type ActionState } from "@/lib/admin/actions";
import { ErrorBanner, Field, inputClass } from "../ui";

const initialState: ActionState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <ErrorBanner message={state.error} />

      {/* Carried through so a deep link resumes where it was interrupted. */}
      <input type="hidden" name="next" value={next} />

      <Field label="Admin password" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg border-2 border-text bg-primary px-4 py-2.5 font-body text-sm font-bold text-white shadow-[4px_4px_0_0_var(--color-text)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
