"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import BookmarkToggle from "./bookmark-toggle";
import { keyForPixel, rankSentence, type Continent, type ContinentKey } from "@/lib/course-brain/continents";
import { worldBaseMap } from "@/lib/course-brain/component-assets";

const INDEX_MAP = "/diagrams/ch2-continents-index.png";
const maskFor = (key: ContinentKey) => `/diagrams/ch2-continent-${key}.webp`;

export default function ContinentExplorer({
  continents,
  bookmarkedUnitIds,
}: {
  continents: Continent[];
  bookmarkedUnitIds?: Set<string>;
}) {
  const [activeKey, setActiveKey] = useState<ContinentKey>(continents[0]?.key ?? "asia");
  const [pointerReady, setPointerReady] = useState(false);
  const indexCanvas = useRef<HTMLCanvasElement | null>(null);

  const active = continents.find((continent) => continent.key === activeKey) ?? continents[0];

  /**
   * Hit-testing reads the pixel under the cursor from an index image drawn once to an
   * offscreen canvas — one flat colour per continent. That is how the highlight can follow
   * a coastline exactly without shipping any polygon data. If the canvas is unavailable the
   * map simply stops responding to the pointer; the buttons below it still work, which is
   * also what makes this usable by keyboard and on touch.
   */
  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.src = INDEX_MAP;
    image.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0);
      indexCanvas.current = canvas;
      setPointerReady(true);
    };
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePointer = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const canvas = indexCanvas.current;
    if (!canvas) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.floor(((event.clientX - bounds.left) / bounds.width) * canvas.width);
    const y = Math.floor(((event.clientY - bounds.top) / bounds.height) * canvas.height);
    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
    const key = keyForPixel(r, g, b, a);
    if (key) setActiveKey(key);
  }, []);

  if (!active) return null;

  return (
    <div className="border-t border-graticule">
      <div className="px-5 py-4 sm:px-6">
        <div
          className={`relative overflow-hidden rounded-card border border-graticule ${pointerReady ? "cursor-pointer" : ""}`}
          onPointerDown={handlePointer}
          onPointerMove={handlePointer}
        >
          <Image
            alt="Blank world map. Each continent can be selected to read what the course says about it."
            className="block h-auto w-full select-none"
            height={worldBaseMap.height}
            priority
            src={worldBaseMap.src}
            width={worldBaseMap.width}
          />
          {/* the highlight is the continent's own shape, masked out of a flat colour */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-meridian/55"
            style={{
              WebkitMaskImage: `url(${maskFor(active.key)})`,
              maskImage: `url(${maskFor(active.key)})`,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Choose a continent">
          {continents.map((continent) => {
            const isActive = continent.key === active.key;
            return (
              <button
                aria-current={isActive}
                id={`unit-${continent.unitId}`}
                className={`min-h-11 rounded-full border px-3 py-1.5 text-[0.875rem] transition-colors ${
                  isActive
                    ? "border-meridian bg-meridian text-white"
                    : "border-graticule bg-surface text-ink hover:border-meridian hover:text-meridian"
                }`}
                key={continent.key}
                onClick={() => setActiveKey(continent.key)}
                onFocus={() => setActiveKey(continent.key)}
                onMouseEnter={() => setActiveKey(continent.key)}
                type="button"
              >
                {continent.name}
              </button>
            );
          })}
        </div>

        <article aria-live="polite" className="mt-3 rounded-card border border-graticule bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-[1.375rem]/[1.2] font-semibold text-ink-strong">{active.name}</h3>
                <p className="font-mono text-[0.75rem] text-ink-muted">chapter-2.pdf, page/slide {active.pageOrSlide}</p>
              </div>

              <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-card bg-chart px-3 py-2">
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Size</dt>
                  <dd className={`mt-0.5 text-[1rem] ${active.area ? "font-semibold text-ink-strong" : "text-ink-muted"}`}>
                    {active.area ?? "not given on this slide"}
                  </dd>
                </div>
                <div className="rounded-card bg-chart px-3 py-2">
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Rank by size</dt>
                  <dd className={`mt-0.5 text-[1rem] ${active.rank ? "font-semibold text-ink-strong" : "text-ink-muted"}`}>
                    {active.rank ? `the ${active.rank}` : "not given on this slide"}
                  </dd>
                </div>
              </dl>

              <p className="mt-3 max-w-[68ch] whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{active.body}</p>
              {rankSentence(active) ? <p className="sr-only">{rankSentence(active)}</p> : null}
            </div>
            {bookmarkedUnitIds ? (
              <BookmarkToggle
                contentUnitId={active.unitId}
                initiallySaved={bookmarkedUnitIds.has(active.unitId)}
                key={active.unitId}
                title={active.name}
              />
            ) : null}
          </div>
        </article>

        <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">
          * Every word above is the course&apos;s own; where a slide gives no figure, this says so rather than
          supplying one. The shapes are traced from the map itself, so the divides between Europe and Asia, at
          Suez and at Panama follow the usual conventions rather than anything the deck defines.
        </p>
      </div>
    </div>
  );
}
