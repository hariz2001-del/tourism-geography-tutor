import Link from "next/link";
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
              ? "rounded-full bg-meridian px-4 py-1.5 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-chart"
              : "rounded-full border border-graticule bg-surface px-4 py-1.5 font-mono text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-ink-muted transition-colors duration-150 hover:border-meridian hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          }
          href={`/chapters/${chapter.code}`}
        >
          {chapter.code}
        </Link>
      ))}
    </nav>
  );
}
