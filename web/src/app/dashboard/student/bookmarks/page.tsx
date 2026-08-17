import Link from "next/link";
import DashboardShell, { EmptyPanel } from "@/components/dashboard/dashboard-shell";
import CitationCard from "@/components/tutor/citation-card";
import { requireProfile } from "@/lib/auth/session";
import { studentTabs } from "@/lib/learners/navigation";
import { listBookmarks } from "@/lib/learners/student";
import type { SavedBookmark } from "@/lib/learners/types";
import RemoveBookmarkButton from "./remove-bookmark-button";

export const metadata = { title: "Saved · Tourism Geography Tutor" };

function groupByChapter(bookmarks: SavedBookmark[]) {
  const groups = new Map<string, { chapterCode: string; chapterTitle: string; items: SavedBookmark[] }>();
  for (const bookmark of bookmarks) {
    const group = groups.get(bookmark.chapterCode) ?? {
      chapterCode: bookmark.chapterCode,
      chapterTitle: bookmark.chapterTitle,
      items: [],
    };
    group.items.push(bookmark);
    groups.set(bookmark.chapterCode, group);
  }
  return [...groups.values()].sort((a, b) => a.chapterCode.localeCompare(b.chapterCode));
}

export default async function StudentBookmarks() {
  const profile = await requireProfile("student");
  const bookmarks = await listBookmarks(profile.id);
  const groups = groupByChapter(bookmarks);

  return (
    <DashboardShell
      eyebrow="My learning"
      title="Saved material"
      description="Material you bookmarked while reading, and flashcards you marked for review. Only you can see this."
      tabs={studentTabs}
      activeHref="/dashboard/student/bookmarks"
    >
      {groups.length === 0 ? (
        <EmptyPanel
          title="You have not saved anything yet."
          detail="Use the Save button on any piece of course material, or mark a flashcard for review."
          action={
            <Link className="font-medium text-meridian underline underline-offset-4" href="/flashcards">
              Open the flashcards
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.chapterCode} className="space-y-4">
              <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">
                {group.chapterCode}: {group.chapterTitle}
              </h2>
              <ul className="space-y-4">
                {group.items.map((bookmark) => (
                  <li key={bookmark.id} className="space-y-3 rounded-card border border-graticule bg-surface p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
                          {bookmark.topicName}
                          {bookmark.source === "flashcard" ? " · from flashcards" : ""}
                        </p>
                        <h3 className="mt-1 font-display text-[1.25rem] font-semibold text-ink-strong">
                          {bookmark.title}
                        </h3>
                      </div>
                      <RemoveBookmarkButton bookmarkId={bookmark.id} title={bookmark.title} />
                    </div>
                    <p className="whitespace-pre-wrap text-ink">{bookmark.body}</p>
                    <CitationCard citation={bookmark.citation} actionLabel="Open in the chapter" />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
