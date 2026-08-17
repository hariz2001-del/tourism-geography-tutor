"use client";

import { useState, useTransition } from "react";
import { toggleBookmark } from "@/app/bookmark-actions";

export default function BookmarkToggle({
  contentUnitId,
  title,
  initiallySaved,
  source = "content",
}: {
  contentUnitId: string;
  title: string;
  initiallySaved: boolean;
  source?: "content" | "flashcard";
}) {
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Deliberately not optimistic. Navigating away cancels the transition, so
  // showing "Saved" before the server confirms would claim a write that never
  // landed. The label only changes once the round trip has actually completed.
  function toggle() {
    const next = !isSaved;
    setError(null);
    startTransition(async () => {
      const result = await toggleBookmark(contentUnitId, source, next);
      setIsSaved(result.saved);
      setError(result.error);
    });
  }

  const label = isPending ? (isSaved ? "Removing…" : "Saving…") : isSaved ? "Saved" : "Save";

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-busy={isPending}
        aria-pressed={isSaved}
        aria-label={isSaved ? `Remove ${title} from saved material` : `Save ${title}`}
        className={
          isSaved
            ? "inline-flex min-h-11 items-center gap-1.5 rounded-card border border-meridian bg-meridian/12 px-3 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-meridian transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            : "inline-flex min-h-11 items-center gap-1.5 rounded-card border border-graticule bg-chart px-3 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-ink-muted transition-colors hover:border-meridian hover:text-meridian disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        }
      >
        <span aria-hidden="true">{isSaved ? "★" : "☆"}</span>
        {label}
      </button>
      {error ? (
        <span role="alert" className="text-[0.8125rem] text-danger">
          {error}
        </span>
      ) : null}
    </span>
  );
}
