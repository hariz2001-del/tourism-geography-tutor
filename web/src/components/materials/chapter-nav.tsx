import Link from "next/link";
import { formatChapterLabel } from "@/lib/course-brain/chapter-label";
import type { Chapter } from "@/lib/course-brain/types";

export default function ChapterNav({ chapters, activeChapterCode }: { chapters: Chapter[]; activeChapterCode?: string }) {
  return (
    <nav aria-label="Chapters" className="flex flex-wrap gap-2 border-b border-graticule pb-5">
      {chapters.map((chapter) => (
        <Link
          key={chapter.code}
          aria-current={chapter.code === activeChapterCode ? "page" : undefined}
          className={
            chapter.code === activeChapterCode
              ? "inline-flex min-h-11 items-center rounded-full bg-meridian px-4 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-chart"
              : "inline-flex min-h-11 items-center rounded-full border border-graticule bg-surface px-4 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors duration-150 hover:border-meridian hover:text-meridian active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          }
          href={`/chapters/${chapter.code}`}
        >
          {formatChapterLabel(chapter.code)}
        </Link>
      ))}
    </nav>
  );
}
