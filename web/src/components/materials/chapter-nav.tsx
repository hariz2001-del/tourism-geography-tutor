import Link from "next/link";
import type { Chapter } from "@/lib/course-brain/types";

export default function ChapterNav({ chapters, activeChapterCode }: { chapters: Chapter[]; activeChapterCode?: string }) {
  return (
    <nav aria-label="Chapters" className="flex flex-wrap gap-2">
      {chapters.map((chapter) => (
        <Link
          key={chapter.code}
          aria-current={chapter.code === activeChapterCode ? "page" : undefined}
          className={
            chapter.code === activeChapterCode
              ? "rounded-full bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white"
              : "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900"
          }
          href={`/chapters/${chapter.code}`}
        >
          {chapter.code}
        </Link>
      ))}
    </nav>
  );
}
