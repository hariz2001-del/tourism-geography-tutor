"use client";

import { useTransition } from "react";
import { removeBookmark } from "./actions";

export default function RemoveBookmarkButton({ bookmarkId, title }: { bookmarkId: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => removeBookmark(bookmarkId))}
      aria-label={`Remove ${title} from saved material`}
      className="inline-flex min-h-11 shrink-0 items-center rounded-card border border-graticule bg-chart px-3 text-[0.9375rem] font-medium text-ink-muted transition-colors hover:border-danger hover:text-danger disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}
