import type { Citation } from "@/lib/course-brain/types";

export default function CitationCard({ citation }: { citation: Citation }) {
  const body = (
    <>
      <p className="font-semibold">Source</p>
      <p>{citation.sourceFile}</p>
      <p>
        {citation.chapterLabel}, Page/slide {citation.pageOrSlide}
      </p>
    </>
  );

  if (citation.chapterCode && citation.topicId && citation.contentUnitId) {
    return (
      // A plain anchor (not next/link) so same-page jumps still fire a
      // native hashchange event for ContentUnit's highlight effect to see.
      <a
        href={`/chapters/${citation.chapterCode}?topic=${encodeURIComponent(citation.topicId)}#unit-${citation.contentUnitId}`}
        className="block rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 outline-offset-2 hover:border-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900"
        aria-label="Go to this source in its topic"
      >
        {body}
      </a>
    );
  }

  return (
    <aside className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800" aria-label="Source citation">
      {body}
    </aside>
  );
}
