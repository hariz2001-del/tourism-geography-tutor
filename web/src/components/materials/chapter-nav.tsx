import Link from "next/link";
import { chapterAccent } from "@/lib/course-brain/chapter-accent";
import { formatChapterLabel } from "@/lib/course-brain/chapter-label";
import type { Chapter } from "@/lib/course-brain/types";

export default function ChapterNav({ chapters, activeChapterCode }: { chapters: Chapter[]; activeChapterCode?: string }) {
  return (
    <nav aria-label="Chapters" className="flex flex-wrap gap-2 border-b border-graticule pb-5">
      {chapters.map((chapter) => {
        // Each chapter keeps its own colour, selected or not.
        const accent = chapterAccent(chapter.code);
        return (
          <Link
            key={chapter.code}
            aria-current={chapter.code === activeChapterCode ? "page" : undefined}
            className={
              chapter.code === activeChapterCode
                ? `inline-flex min-h-11 items-center rounded-full px-4 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] shadow-sm ${accent.solid}`
                : `inline-flex min-h-11 items-center rounded-full border border-graticule bg-surface px-4 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 ${accent.hover}`
            }
            href={`/chapters/${chapter.code}`}
          >
            {formatChapterLabel(chapter.code)}
          </Link>
        );
      })}
    </nav>
  );
}
