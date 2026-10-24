"use client";

import { useFormStatus } from "react-dom";

/**
 * Destructive action with a confirmation step.
 *
 * The confirm lives in onSubmit rather than onClick so it also catches an
 * Enter-key submit, and returning false from the handler cancels the POST.
 */
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border-2 border-text bg-surface px-4 py-2 font-body text-sm font-bold transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting…" : label}
    </button>
  );
}

export default function DeleteButton({
  action,
  id,
  label,
  confirmMessage,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} />
    </form>
  );
}
