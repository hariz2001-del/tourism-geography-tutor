import type { Citation } from "@/lib/course-brain/types";

export default function CitationCard({ citation }: { citation: Citation }) {
  return (
    <aside className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800" aria-label="Source citation">
      <p className="font-semibold">Source</p>
      <p>{citation.sourceFile}</p>
      <p>
        {citation.chapterLabel}, Page/slide {citation.pageOrSlide}
      </p>
    </aside>
  );
}
