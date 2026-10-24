"use client";

import { useRef, useState, useTransition } from "react";

import { uploadPrintableFileAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
import { Field, inputClass } from "./ui";

/**
 * A URL field with an "upload a file" shortcut.
 *
 * The upload cannot be its own <form> — this control renders inside the
 * printable/post form and nested forms are invalid HTML. So the Server Action
 * is invoked imperatively from the change handler instead, wrapped in a
 * transition. The resulting public URL is written straight into the text input,
 * which is what actually gets submitted with the parent form.
 */
export function FileUploadField({
  label,
  name,
  hint,
  accept,
  defaultValue = "",
  placeholder = "https://…",
}: {
  label: string;
  name: string;
  hint?: string;
  accept?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (file: File | undefined) => {
    if (!file) return;
    setError(undefined);

    const fd = new FormData();
    fd.set("file", file);

    startTransition(async () => {
      const result = await uploadPrintableFileAction({}, fd);
      if (result.ok && result.url) {
        setUrl(result.url);
      } else {
        setError(result.error ?? "Upload failed.");
      }
      // Let the same file be re-picked after a failure.
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <Field label={label} htmlFor={name} hint={hint}>
      <input
        id={name}
        name={name}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder}
        className={cn(inputClass, "font-mono text-xs")}
      />

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={pending}
          onChange={(e) => onPick(e.target.files?.[0])}
          className="max-w-full text-xs file:mr-2 file:rounded-md file:border-2 file:border-text file:bg-background file:px-2.5 file:py-1 file:text-xs file:font-bold disabled:opacity-60"
        />
        {pending ? (
          <span className="stamp text-muted">Uploading…</span>
        ) : url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="stamp text-muted underline hover:text-text"
          >
            Clear
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-text">
          {error}
        </p>
      ) : null}
    </Field>
  );
}
