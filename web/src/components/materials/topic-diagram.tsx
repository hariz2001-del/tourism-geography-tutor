"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { TopicDiagram } from "@/lib/course-brain/diagrams";

export default function TopicDiagramFigure({ diagram }: { diagram: TopicDiagram }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <figure className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => { setIsZoomed(false); setIsOpen(true); }}
          className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-slate-900"
          aria-label={`Expand diagram: ${diagram.caption}`}
        >
          <Image src={diagram.src} alt={diagram.alt} width={1400} height={788} className="h-auto w-full" priority={false} />
        </button>
        <figcaption className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
          {diagram.caption} — {diagram.sourceFile}, page/slide {diagram.pageOrSlide}
        </figcaption>
      </figure>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={diagram.caption}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-between gap-4 text-white">
            <p className="text-sm">
              {diagram.caption} — {diagram.sourceFile}, page/slide {diagram.pageOrSlide}
            </p>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setIsOpen(false); }}
              className="rounded-md border border-white/40 px-3 py-1 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            >
              Close
            </button>
          </div>
          <div className="mt-4 flex flex-1 items-center justify-center overflow-auto">
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setIsZoomed((zoomed) => !zoomed); }}
              aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              className={isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}
            >
              <Image
                src={diagram.src}
                alt={diagram.alt}
                width={1400}
                height={788}
                className={isZoomed ? "max-w-none" : "max-h-[80vh] max-w-[90vw] object-contain"}
                priority
              />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
