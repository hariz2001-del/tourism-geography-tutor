"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import BookmarkToggle from "./bookmark-toggle";
import { worldBaseMap } from "@/lib/course-brain/component-assets";

/**
 * One world map, one set of regions, one panel — shared by the continents map and the
 * oceans map, which differ only in their data.
 *
 * Hit-testing reads the pixel under the cursor from an index image drawn once to an
 * offscreen canvas: one flat colour per region. That is how a highlight follows a real
 * coastline without shipping any polygon data. If the canvas is unavailable the map simply
 * stops responding to the pointer and the buttons below it still work — which is also what
 * makes this usable by keyboard and on touch, where hover does not exist.
 */
export type RegionFigure = {
  label: string;
  /** Stated by the course deck. Shown plainly. */
  value: string | null;
  /**
   * Filled in from outside the deck. Shown with an "added" tag, because a learner has to be
   * able to tell which is which; that distinction is the whole reason this project survived
   * a content-fidelity incident.
   */
  added?: string | null;
};

export type MapRegion = {
  key: string;
  unitId: string;
  name: string;
  body: string;
  figures: RegionFigure[];
  citation: string;
};

export default function RegionMapExplorer({
  regions,
  indexMap,
  maskFor,
  keyForPixel,
  chooserLabel,
  mapAlt,
  footnote,
  bookmarkedUnitIds,
}: {
  regions: MapRegion[];
  indexMap: string;
  maskFor: (key: string) => string;
  /** Colour lookup for this map's index image, so each map keeps its own palette. */
  keyForPixel: (r: number, g: number, b: number, a: number) => string | null;
  chooserLabel: string;
  mapAlt: string;
  footnote: React.ReactNode;
  bookmarkedUnitIds?: Set<string>;
}) {
  const [activeKey, setActiveKey] = useState<string>(regions[0]?.key ?? "");
  const [pointerReady, setPointerReady] = useState(false);
  const indexCanvas = useRef<HTMLCanvasElement | null>(null);

  const active = regions.find((region) => region.key === activeKey) ?? regions[0];

  useEffect(() => {
    let cancelled = false;
    const image = new window.Image();
    image.src = indexMap;
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
  }, [indexMap]);

  function handlePointer(event: React.PointerEvent<HTMLDivElement>) {
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
  }

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
            alt={mapAlt}
            className="block h-auto w-full select-none"
            height={worldBaseMap.height}
            priority
            src={worldBaseMap.src}
            width={worldBaseMap.width}
          />
          {/* the highlight is the region's own shape, masked out of a flat colour */}
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

        <div aria-label={chooserLabel} className="mt-3 flex flex-wrap gap-1.5" role="group">
          {regions.map((region) => {
            const isActive = region.key === active.key;
            return (
              <button
                aria-current={isActive}
                className={`min-h-11 rounded-full border px-3 py-1.5 text-[0.875rem] transition-colors ${
                  isActive
                    ? "border-meridian bg-meridian text-white"
                    : "border-graticule bg-surface text-ink hover:border-meridian hover:text-meridian"
                }`}
                id={`unit-${region.unitId}`}
                key={region.key}
                onClick={() => setActiveKey(region.key)}
                onFocus={() => setActiveKey(region.key)}
                onMouseEnter={() => setActiveKey(region.key)}
                type="button"
              >
                {region.name}
              </button>
            );
          })}
        </div>

        <article aria-live="polite" className="mt-3 rounded-card border border-graticule bg-surface p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-[1.375rem]/[1.2] font-semibold text-ink-strong">{active.name}</h3>
                <p className="font-mono text-[0.75rem] text-ink-muted">{active.citation}</p>
              </div>

              <dl className={`mt-3 grid gap-2 ${active.figures.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                {active.figures.map((figure) => (
                  <Figure added={figure.added ?? null} key={figure.label} label={figure.label} value={figure.value} />
                ))}
              </dl>

              <p className="mt-3 max-w-[68ch] whitespace-pre-wrap text-[1rem]/[1.65] text-ink">{active.body}</p>
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

        <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">{footnote}</p>
      </div>
    </div>
  );
}

/** A value the deck states is shown plainly; one added from outside it carries a tag. */
function Figure({ label, value, added }: { label: string; value: string | null; added: string | null }) {
  const shown = value ?? added;
  return (
    <div className="rounded-card bg-chart px-3 py-2">
      <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">{label}</dt>
      <dd
        className={`mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[1rem] ${
          shown ? "font-semibold text-ink-strong" : "text-ink-muted"
        }`}
      >
        {shown ?? "not given on this slide"}
        {!value && added ? (
          <span className="rounded-sm bg-relief/12 px-1 font-mono text-[0.625rem] font-medium uppercase tracking-[0.08em] text-relief">
            added
          </span>
        ) : null}
      </dd>
    </div>
  );
}
