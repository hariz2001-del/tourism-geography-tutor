"use client";

import ExpandableImage from "./image-lightbox";
import type { TopicDiagram } from "@/lib/course-brain/diagrams";

export default function TopicDiagramFigure({ diagram }: { diagram: TopicDiagram }) {
  const provenance = `${diagram.caption} — ${diagram.sourceFile}, page/slide ${diagram.pageOrSlide}`;

  return (
    <figure className="overflow-hidden rounded-card border border-graticule bg-surface">
      <ExpandableImage
        image={{ src: diagram.src, alt: diagram.alt, width: 1400, height: 788 }}
        label={provenance}
        padded
        sizes="(min-width: 1024px) 720px, 100vw"
      />
      <figcaption className="border-t border-graticule bg-chart px-4 py-2.5 font-mono text-[0.8125rem] text-ink-muted">
        {provenance}
      </figcaption>
    </figure>
  );
}
