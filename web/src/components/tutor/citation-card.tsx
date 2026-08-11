import type { Citation } from "@/lib/course-brain/types";

export default function CitationCard({ citation }: { citation: Citation }) {
  const body = (
    <>
      <p className="uppercase tracking-[0.14em] text-meridian">Source</p>
      <p className="underline decoration-graticule underline-offset-2">{citation.sourceFile}</p>
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
        className="block rounded-card border border-graticule bg-chart p-3 font-mono text-[0.8125rem] text-ink-muted transition-colors duration-150 hover:border-meridian/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        aria-label={`Go to this source in its topic: Source ${citation.sourceFile}, ${citation.chapterLabel}, Page/slide ${citation.pageOrSlide}`}
      >
        {body}
      </a>
    );
  }

  return (
    <aside className="rounded-card border border-graticule bg-chart p-3 font-mono text-[0.8125rem] text-ink-muted" aria-label="Source citation">
      {body}
    </aside>
  );
}
