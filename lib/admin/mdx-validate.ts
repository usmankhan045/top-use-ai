import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

/**
 * Compile-check post/page body content before it is allowed into the database.
 *
 * This exists because of a real incident recorded in components/MarkdownContent.tsx:
 * content is rendered as MDX, not plain markdown, so MDX parses `{...}` as a JS
 * expression and `<...>` as JSX. A stray brace or an unclosed angle bracket is a
 * HARD BUILD FAILURE, not a cosmetic glitch — 15 migrated WordPress articles took
 * the production build down exactly this way.
 *
 * Without this check, the admin dashboard would be a one-click way to break the
 * live site. So: we compile the content with the same plugin set the renderer
 * uses, and refuse the write if it throws.
 */

/**
 * Mirror of the renderer's shortcode stripping. MarkdownContent.tsx removes
 * `{{PLACEHOLDER}}` tokens before parsing, so we must strip them here too —
 * otherwise we'd reject content that actually renders fine in production.
 */
export function expandShortcodes(content: string): string {
  return content.replace(/\{\{[^}\n]*\}\}/g, "");
}

export interface MdxValidationResult {
  ok: boolean;
  /** Reader-facing message, safe to show in the editor. */
  error?: string;
  /** 1-based line number the compiler blamed, when it reported one. */
  line?: number;
  column?: number;
}

export async function validateMdx(
  content: string | null | undefined
): Promise<MdxValidationResult> {
  if (!content || !content.trim()) return { ok: true };

  try {
    await compile(expandShortcodes(content), {
      remarkPlugins: [remarkGfm],
      // Match the renderer: next-mdx-remote/rsc compiles to the automatic
      // JSX runtime. We only care whether it parses, not the output.
      outputFormat: "function-body",
      development: false,
    });
    return { ok: true };
  } catch (err: unknown) {
    const e = err as {
      message?: string;
      reason?: string;
      line?: number;
      column?: number;
      place?: { start?: { line?: number; column?: number } };
    };

    const line = e.line ?? e.place?.start?.line;
    const column = e.column ?? e.place?.start?.column;
    const reason = e.reason ?? e.message ?? "Content is not valid MDX.";

    return {
      ok: false,
      line,
      column,
      error: line
        ? `Line ${line}: ${reason}`
        : reason,
    };
  }
}

/**
 * Human-readable hint for the most common authoring mistakes, appended to the
 * raw compiler error because MDX's own messages assume you know it's JSX.
 */
export function mdxHint(error: string): string {
  const lower = error.toLowerCase();

  if (lower.includes("acorn") || lower.includes("expression")) {
    return "MDX reads { } as JavaScript. To write a literal brace, escape it as \\{ or wrap the block in a code fence.";
  }
  if (lower.includes("unexpected closing") || lower.includes("before the end") || lower.includes("tag")) {
    return "MDX reads < > as JSX tags. Close every tag, or escape a literal < as &lt;.";
  }
  return "Content is parsed as MDX (markdown + JSX), so { } and < > are special characters.";
}
