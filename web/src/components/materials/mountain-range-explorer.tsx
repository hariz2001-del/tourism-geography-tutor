"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageLightbox } from "./image-lightbox";
import RangeCloseUp from "./range-close-up";
import { reliefTexture, worldBaseMap } from "@/lib/course-brain/component-assets";
import { rangePhotos } from "@/lib/course-brain/mountain-range-photos";
import { mountainRanges, projectRange, rangesByRegion, type MountainRange } from "@/lib/course-brain/mountain-ranges";

/**
 * The Chapter 4 mountain-range map, rebuilt.
 *
 * The deck's figure is a raster: twenty-four ranges reduced to coloured squares beside a
 * legend, with no way to tell which square is which without counting swatches. Here each range
 * is a line the map can draw, so choosing one paints the real topography along it — NASA's
 * elevation data, tinted and hillshaded — while the rest of the world stays flat and pale.
 * That is the point of the exercise: a range is a shape on the ground, not a dot.
 *
 * Two canvases, drawn once per selection:
 *  - the pale base map, which never changes;
 *  - the relief, masked to the chosen range with `destination-in` compositing, which is what
 *    lets a stroked line act as a stencil without any polygon arithmetic.
 *
 * Hit-testing uses `isPointInStroke` on the same Path2D the mask is drawn with, so what the
 * pointer finds and what the eye sees cannot drift apart. Where the canvas is unavailable the
 * map still renders as a picture and the buttons below it still work.
 */
const MAP_WIDTH = 1600;
const MAP_HEIGHT = 800;

function pathFor(range: MountainRange, width: number, height: number): Path2D {
  const path = new Path2D();
  range.spine.forEach(([lon, lat], index) => {
    const [x, y] = projectRange(lon, lat, width, height);
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  return path;
}

/** Degrees of latitude are a constant number of pixels, which is what sets the stroke width. */
function strokeWidthFor(range: MountainRange, height: number): number {
  // A range 1° across is four pixels on a world map this size — too thin to show any
  // topography at all. The band is widened to a legible minimum; it is a highlight, not a
  // claim about the range's breadth, and the footnote under the map says the outlines are
  // approximate.
  return Math.max(15, (range.width / 180) * height);
}

export default function MountainRangeExplorer() {
  const [activeKey, setActiveKey] = useState<string>("himalaya");
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [pointerReady, setPointerReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const reliefRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef(0);

  const active = useMemo(
    () => mountainRanges.find((range) => range.key === activeKey) ?? mountainRanges[0],
    [activeKey],
  );
  const shown = hoverKey ? mountainRanges.find((range) => range.key === hoverKey) ?? active : active;
  const photo = rangePhotos[shown.photoKey ?? shown.key];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const base = baseRef.current;
    const relief = reliefRef.current;
    if (!canvas || !base || !relief) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    context.globalAlpha = 0.55;
    context.drawImage(base, 0, 0, MAP_WIDTH, MAP_HEIGHT);
    context.globalAlpha = 1;

    // Every range gets a faint line, so a learner can see there are twenty-four of them
    // before choosing one.
    context.strokeStyle = "rgba(31, 61, 74, 0.28)";
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const range of mountainRanges) {
      context.lineWidth = Math.max(2, strokeWidthFor(range, MAP_HEIGHT) * 0.28);
      context.stroke(pathFor(range, MAP_WIDTH, MAP_HEIGHT));
    }

    const highlighted = hoverKey
      ? mountainRanges.filter((range) => range.key === hoverKey || range.key === activeKey)
      : [active];

    for (const range of highlighted) {
      const path = pathFor(range, MAP_WIDTH, MAP_HEIGHT);
      const lineWidth = strokeWidthFor(range, MAP_HEIGHT);

      // The relief, stencilled to this range: draw it, then keep only what the stroke covers.
      const stencil = document.createElement("canvas");
      stencil.width = MAP_WIDTH;
      stencil.height = MAP_HEIGHT;
      const stencilContext = stencil.getContext("2d");
      if (!stencilContext) continue;
      stencilContext.drawImage(relief, 0, 0, MAP_WIDTH, MAP_HEIGHT);
      stencilContext.globalCompositeOperation = "destination-in";
      stencilContext.lineCap = "round";
      stencilContext.lineJoin = "round";
      stencilContext.lineWidth = lineWidth;
      stencilContext.stroke(path);

      // The ring goes down first: stroked over the relief it would simply cover it.
      context.lineWidth = lineWidth + 5;
      context.strokeStyle = range.key === shown.key ? "rgba(11, 61, 79, 0.95)" : "rgba(11, 61, 79, 0.5)";
      context.stroke(path);
      context.drawImage(stencil, 0, 0);
    }
  }, [active, activeKey, hoverKey, shown.key]);

  useEffect(() => {
    let cancelled = false;
    function load(src: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      });
    }
    Promise.all([load(worldBaseMap.src), load(reliefTexture.src)])
      .then(([base, relief]) => {
        if (cancelled) return;
        baseRef.current = base;
        reliefRef.current = relief;
        setPointerReady(true);
        draw();
      })
      .catch(() => setPointerReady(false));
    return () => {
      cancelled = true;
    };
    // Only ever run once: `draw` is called again by the effect below whenever it changes.
  }, [draw]);

  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  const findRange = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * MAP_WIDTH;
    const y = ((event.clientY - rect.top) / rect.height) * MAP_HEIGHT;
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const range of mountainRanges) {
      context.lineWidth = strokeWidthFor(range, MAP_HEIGHT) + 6;
      if (context.isPointInStroke(pathFor(range, MAP_WIDTH, MAP_HEIGHT), x, y)) return range;
    }
    return null;
  }, []);

  return (
    <div>
      <div className="relative border-y border-graticule bg-chart">
        <canvas
          aria-label="World map of the twenty-four mountain ranges the slide names. The selected range is drawn with its own topography."
          className="block h-auto w-full touch-pan-y"
          height={MAP_HEIGHT}
          onPointerLeave={() => {
            setHoverKey(null);
            setPointer(null);
          }}
          onPointerMove={(event) => {
            if (!pointerReady) return;
            const range = findRange(event);
            setHoverKey(range?.key ?? null);
            setPointer(range ? { x: event.clientX, y: event.clientY } : null);
          }}
          onPointerUp={(event) => {
            const range = findRange(event);
            if (range) setActiveKey(range.key);
          }}
          ref={canvasRef}
          role="img"
          width={MAP_WIDTH}
        />

        {hoverKey && pointer ? (
          <span
            className="pointer-events-none fixed z-40 block w-[232px] overflow-hidden rounded-card border border-graticule bg-surface shadow-lg"
            style={{ left: Math.min(pointer.x + 16, (typeof window === "undefined" ? 0 : window.innerWidth) - 248), top: pointer.y + 16 }}
          >
            {photo ? (
              <Image alt={photo.alt} className="h-auto w-full" height={photo.height} sizes="232px" src={photo.src} width={photo.width} />
            ) : null}
            <span className="block border-t border-graticule bg-chart px-2.5 py-1.5 font-mono text-[0.6875rem]/[1.4] text-ink-muted">
              <span className="block text-ink">{shown.name}</span>
              <span className="block">{shown.deckCountries}</span>
            </span>
          </span>
        ) : null}
      </div>

      <RangeCloseUp range={shown} />

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">
            The slide&apos;s twenty-four ranges
          </p>
          <div className="mt-3 space-y-3">
            {rangesByRegion.map(({ region, ranges }) => (
              <div key={region}>
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-muted">{region}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ranges.map((range) => (
                    <button
                      className={`rounded-card border px-2.5 py-1 text-[0.8125rem] transition-colors ${
                        range.key === activeKey
                          ? "border-meridian bg-meridian/12 font-semibold text-ink-strong"
                          : "border-graticule bg-surface text-ink hover:border-meridian/60"
                      }`}
                      key={range.key}
                      onClick={() => setActiveKey(range.key)}
                      onFocus={() => setHoverKey(range.key)}
                      onBlur={() => setHoverKey(null)}
                      onMouseEnter={() => setHoverKey(range.key)}
                      onMouseLeave={() => setHoverKey(null)}
                      type="button"
                    >
                      {range.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-card border border-graticule bg-chart/60 p-4">
          <h3 className="font-display text-[1.0625rem]/[1.3] font-semibold text-ink-strong">{shown.name}</h3>
          <p className="mt-0.5 font-mono text-[0.75rem] text-ink-muted">{shown.deckCountries}</p>
          {photo ? (
            <button
              aria-label={`Expand: ${photo.caption}`}
              className="mt-3 block w-full cursor-zoom-in overflow-hidden rounded-card border border-graticule focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
              onClick={() => setIsOpen(true)}
              type="button"
            >
              <Image alt={photo.alt} className="h-auto w-full" height={photo.height} sizes="260px" src={photo.src} width={photo.width} />
            </button>
          ) : null}
          {photo ? (
            <p className="mt-1.5 font-mono text-[0.6875rem]/[1.45] text-ink-muted">
              {photo.caption} · {photo.creator} · {photo.license}
            </p>
          ) : null}
          {shown.flag ? (
            <p className="mt-3 border-t border-graticule pt-2 text-[0.8125rem]/[1.5] text-ink">
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-relief">Flagged</span>{" "}
              {shown.flag}
            </p>
          ) : null}
        </aside>
      </div>

      {isOpen && photo ? (
        <ImageLightbox
          image={{ src: photo.src, alt: photo.alt, width: photo.width, height: photo.height }}
          label={`${shown.name} — ${photo.caption}, photo: ${photo.creator}, ${photo.license}`}
          onClose={() => setIsOpen(false)}
          padded={false}
        />
      ) : null}
    </div>
  );
}
