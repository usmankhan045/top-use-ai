import { siteConfig } from "@/lib/site.config";

const { author } = siteConfig;

function InitialsAvatar({ size }: { size: "sm" | "lg" }) {
  const dim = size === "lg" ? "w-14 h-14 text-lg" : "w-9 h-9 text-xs";
  return (
    <span
      className={`shrink-0 ${dim} rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center font-display font-bold text-primary`}
      aria-hidden
    >
      {author.initials}
    </span>
  );
}

/** Compact byline shown under the post title: avatar + name + role. */
export function AuthorByline() {
  return (
    <div className="flex items-center gap-3">
      <InitialsAvatar size="sm" />
      <p className="text-sm text-text">
        <span className="text-muted">By </span>
        <a
          href={author.linkedin}
          target="_blank"
          rel="author noopener noreferrer"
          className="font-semibold text-text hover:text-primary transition-colors"
        >
          {author.name}
        </a>
        <span className="text-muted"> · {author.role}</span>
      </p>
    </div>
  );
}

/** Full author bio card shown at the end of an article. */
export function AuthorBio() {
  return (
    <aside className="mt-14 border border-black/[0.08] rounded-xl bg-primary/[0.03] p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <InitialsAvatar size="lg" />
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-wide text-primary">
            About the author
          </p>
          <p className="font-display text-lg font-semibold text-text">
            {author.name}
            <span className="text-muted font-normal text-base">
              {" "}
              · {author.role}
            </span>
          </p>
          <p className="text-sm text-text/85 leading-relaxed">{author.bio}</p>
          <a
            href={author.linkedin}
            target="_blank"
            rel="author noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Connect on LinkedIn →
          </a>
        </div>
      </div>
    </aside>
  );
}
