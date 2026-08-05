import Image from "next/image";
import type { TopicDiagram } from "@/lib/course-brain/diagrams";

export default function TopicDiagramFigure({ diagram }: { diagram: TopicDiagram }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <Image
        src={diagram.src}
        alt={diagram.alt}
        width={1400}
        height={788}
        className="h-auto w-full"
        priority={false}
      />
      <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
        {diagram.caption} — {diagram.sourceFile}, page/slide {diagram.pageOrSlide}
      </figcaption>
    </figure>
  );
}
