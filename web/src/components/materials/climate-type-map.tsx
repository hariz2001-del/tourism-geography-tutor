"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CLIMATE_SOURCE,
  CLIMATE_TYPE_COLOURS,
  keyForClimatePixel,
  type ClimateType,
  type ClimateTypeKey,
} from "@/lib/course-brain/climate-types";
import { worldBaseMap } from "@/lib/course-brain/component-assets";

const INDEX_MAP = "/diagrams/ch2-climate-index.png";
const CLASSES_MAP = "/diagrams/ch2-climate-types-map.webp";

/**
 * The deck's five climate types, drawn on a real climate map instead of the slide's raster.
 * Same interaction as the continents and oceans maps — point at a region, or pick a type —
 * but the panel leads somewhere different: each type has its own topic in this chapter, so
 * the map doubles as a way into them.
 */
export default function ClimateTypeMap({ types }: { types: ClimateType[] }) {
  const [activeKey, setActiveKey] = useState<ClimateTypeKey>(types[0]?.key ?? "tropical");
  const [pointerReady, setPointerReady] = useState(false);
  const indexCanvas = useRef<HTMLCanvasElement | null>(null);

  const active = types.find((type) => type.key === activeKey) ?? types[0];

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
    const key = keyForClimatePixel(r, g, b, a);
    if (key) setActiveKey(key);
  }

  if (!active) return null;

  return (
    <>
      <div
        className={`relative mt-3 overflow-hidden rounded-card border border-graticule ${pointerReady ? "cursor-pointer" : ""}`}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
      >
        <Image
          alt=""
          className="block h-auto w-full select-none"
          height={worldBaseMap.height}
          src={worldBaseMap.src}
          width={worldBaseMap.width}
        />
        {/* the five classes, dimmed, so the global pattern still reads behind the selection */}
        <Image
          alt="World map coloured by the five climate types the course names."
          className="pointer-events-none absolute inset-0 h-full w-full select-none opacity-35"
          height={worldBaseMap.height}
          src={CLASSES_MAP}
          width={worldBaseMap.width}
        />
        {/* the same map again at full strength, cut to the selected type. Two layers rather
            than a tint: the classes already carry meaning in their colour, so covering them
            would hide what the map is saying. */}
        <Image
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full select-none"
          height={worldBaseMap.height}
          src={CLASSES_MAP}
          style={{
            WebkitMaskImage: `url(/diagrams/ch2-climate-${active.key}.webp)`,
            maskImage: `url(/diagrams/ch2-climate-${active.key}.webp)`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
          width={worldBaseMap.width}
        />
      </div>

      <div aria-label="Choose a climate type" className="mt-3 flex flex-wrap gap-1.5" role="group">
        {types.map((type) => {
          const isActive = type.key === active.key;
          return (
            <button
              aria-current={isActive}
              className={`flex min-h-11 items-center gap-2 rounded-full border px-3 py-1.5 text-[0.875rem] capitalize transition-colors ${
                isActive
                  ? "border-meridian bg-meridian text-white"
                  : "border-graticule bg-surface text-ink hover:border-meridian hover:text-meridian"
              }`}
              key={type.key}
              onClick={() => setActiveKey(type.key)}
              onFocus={() => setActiveKey(type.key)}
              onMouseEnter={() => setActiveKey(type.key)}
              type="button"
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-inset ring-black/15"
                style={{ backgroundColor: CLIMATE_TYPE_COLOURS[type.key] }}
              />
              {type.name}
            </button>
          );
        })}
      </div>

      <article aria-live="polite" className="mt-3 rounded-card border border-graticule bg-surface p-4">
        <h3 className="font-display text-[1.25rem]/[1.2] font-semibold capitalize text-ink-strong">{active.name} climate</h3>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-card bg-chart px-3 py-2">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Share of land</dt>
            <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[1rem] font-semibold text-ink-strong">
              {active.share}
              <span className="rounded-sm bg-relief/12 px-1 font-mono text-[0.625rem] font-medium uppercase tracking-[0.08em] text-relief">
                added
              </span>
            </dd>
          </div>
          <div className="rounded-card bg-chart px-3 py-2">
            <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">Köppen groups</dt>
            <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[1rem] font-semibold text-ink-strong">
              {active.koppen}
              <span className="rounded-sm bg-relief/12 px-1 font-mono text-[0.625rem] font-medium uppercase tracking-[0.08em] text-relief">
                added
              </span>
            </dd>
          </div>
        </dl>
        <p className="mt-3">
          <Link
            className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4"
            href={`/chapters/CH2?topic=${CLIMATE_TOPIC_IDS[active.key]}`}
          >
            Open the {active.name} climate topic
          </Link>
        </p>
      </article>

      <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">
        * The five names are the course&apos;s own; the regions are not on any of its slides. They come from{" "}
        {CLIMATE_SOURCE}. One judgement is worth knowing: Köppen has no highland class, so the treeless polar
        climates that appear away from the poles — the Andes, Tibet, the Rockies — are counted as highland, which
        is what the course means by ground above the treeline.
      </p>
    </>
  );
}

/** The chapter's own topics, one per climate type. */
const CLIMATE_TOPIC_IDS: Record<ClimateTypeKey, string> = {
  tropical: "fa1546b9-a7b5-4fa7-b117-e4222e4c9093",
  dry: "aa696007-8761-4226-9322-0a5d3a41d0c5",
  "middle-latitude": "343da11d-e89d-485c-9024-c8bba3d5f042",
  "high-latitude": "e467b464-a88c-4ef1-9e40-19903e8cc192",
  highland: "51c17acf-c393-4d5d-8e5a-802d3b4ca68e",
};
