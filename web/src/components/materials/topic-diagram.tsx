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
      <figure className="overflow-hidden rounded-card border border-graticule bg-surface">
        <button
          type="button"
          onClick={() => { setIsZoomed(false); setIsOpen(true); }}
          className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          aria-label={`Expand diagram: ${diagram.caption}`}
        >
          <div className="bg-white p-2 dark:p-3">
            <Image src={diagram.src} alt={diagram.alt} width={1400} height={788} className="h-auto w-full" priority={false} />
          </div>
        </button>
        <figcaption className="border-t border-graticule bg-chart px-4 py-2.5 font-mono text-[0.8125rem] text-ink-muted">
          {diagram.caption} — {diagram.sourceFile}, page/slide {diagram.pageOrSlide}
        </figcaption>
      </figure>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={diagram.caption}
          className="fixed inset-0 z-50 flex flex-col bg-[#050C0F]/96 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="flex items-center justify-between gap-4 text-chart">
            <p className="text-sm">
              {diagram.caption} — {diagram.sourceFile}, page/slide {diagram.pageOrSlide}
            </p>
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); setIsOpen(false); }}
              className="rounded-card border border-graticule/60 px-3 py-1 text-sm font-semibold text-chart hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
              <div className={`bg-white p-2 dark:p-3 ${isZoomed ? "" : "max-h-[80vh] max-w-[90vw]"}`}>
                <Image
                  src={diagram.src}
                  alt={diagram.alt}
                  width={1400}
                  height={788}
                  className={isZoomed ? "max-w-none" : "h-full max-h-[calc(80vh-1.5rem)] w-full object-contain"}
                  priority
                />
              </div>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
