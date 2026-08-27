"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState } from "react";
import {
  CLIMATE_BANDS,
  bandHeight,
  bandTop,
  formatLatitude,
  parseClimateBands,
  parseClimateTypes,
  type ClimateBandKey,
} from "@/lib/course-brain/climate-bands";
import { worldBaseMap } from "@/lib/course-brain/component-assets";

/** The chapter's own climate topics, so the second map's list can lead somewhere. */
const CLIMATE_TOPIC_IDS: Record<string, string> = {
  tropical: "fa1546b9-a7b5-4fa7-b117-e4222e4c9093",
  dry: "aa696007-8761-4226-9322-0a5d3a41d0c5",
  "middle latitude": "343da11d-e89d-485c-9024-c8bba3d5f042",
  "high latitude": "e467b464-a88c-4ef1-9e40-19903e8cc192",
  highland: "51c17acf-c393-4d5d-8e5a-802d3b4ca68e",
};

type Tab = "bands" | "zones";

export default function ClimateMapTabs({
  bandsUnit,
  typesUnit,
  sourceMap,
}: {
  bandsUnit: { id: string; body: string; pageOrSlide: number };
  typesUnit: { id: string; body: string; pageOrSlide: number };
  sourceMap: { src: string; alt: string; caption?: string; pageOrSlide: number };
}) {
  const [tab, setTab] = useState<Tab>("bands");
  const [activeBand, setActiveBand] = useState<ClimateBandKey>("tropics");
  const tabsId = useId();

  const text = parseClimateBands(bandsUnit.body);
  const types = parseClimateTypes(typesUnit.body);
  const band = CLIMATE_BANDS.find((candidate) => candidate.key === activeBand) ?? CLIMATE_BANDS[2];

  return (
    <div className="border-t border-graticule">
      {/* one window, two maps — the tabs swap what is inside it */}
      <div aria-label="Choose a map" className="flex gap-1 border-b border-graticule px-5 pt-3 sm:px-6" role="tablist">
        <TabButton controls={`${tabsId}-bands`} id={`${tabsId}-bands-tab`} isActive={tab === "bands"} onSelect={() => setTab("bands")}>
          Zones by latitude
        </TabButton>
        <TabButton controls={`${tabsId}-zones`} id={`${tabsId}-zones-tab`} isActive={tab === "zones"} onSelect={() => setTab("zones")}>
          Climate and vegetation
        </TabButton>
      </div>

      {tab === "bands" ? (
        <div aria-labelledby={`${tabsId}-bands-tab`} className="px-5 py-4 sm:px-6" id={`${tabsId}-bands`} role="tabpanel">
          <p className="max-w-[68ch] text-[1rem]/[1.65] text-ink">{text ? text.introduction : bandsUnit.body}</p>

          {text ? (
            <>
              <div className="relative mt-3 overflow-hidden rounded-card border border-graticule">
                <Image
                  alt="Blank world map. Each latitude band can be selected to read the seasons the course gives it."
                  className="block h-auto w-full select-none"
                  height={worldBaseMap.height}
                  src={worldBaseMap.src}
                  width={worldBaseMap.width}
                />
                <div className="absolute inset-0">
                  {CLIMATE_BANDS.map((candidate) => {
                    const isActive = candidate.key === band.key;
                    return (
                      <button
                        aria-current={isActive}
                        className={`absolute inset-x-0 border-y border-white/30 text-left transition-colors ${
                          isActive ? "bg-meridian/45" : "bg-transparent hover:bg-meridian/20 focus-visible:bg-meridian/25"
                        }`}
                        key={candidate.key}
                        onClick={() => setActiveBand(candidate.key)}
                        onFocus={() => setActiveBand(candidate.key)}
                        onMouseEnter={() => setActiveBand(candidate.key)}
                        style={{ top: `${bandTop(candidate)}%`, height: `${bandHeight(candidate)}%` }}
                        type="button"
                      >
                        <span className="sr-only">{candidate.name}</span>
                        <span
                          aria-hidden="true"
                          className={`ml-2 hidden rounded-sm bg-ink-strong/70 px-1 font-mono text-[0.625rem] text-white sm:inline ${
                            isActive ? "bg-meridian opacity-100" : "opacity-0"
                          }`}
                        >
                          {candidate.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <article aria-live="polite" className="mt-3 rounded-card border border-graticule bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-display text-[1.25rem]/[1.2] font-semibold text-ink-strong">{band.name}</h3>
                  <p className="font-mono text-[0.75rem] text-ink-muted">
                    {formatLatitude(band.from)} to {formatLatitude(band.to)}
                  </p>
                </div>
                <p className="mt-2 max-w-[68ch] text-[1rem]/[1.65] text-ink">{text[band.zone]}</p>
              </article>

              <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">
                * The sentences are the course&apos;s own. The slide draws its bands without numbering them, so the
                boundaries used here are the standard ones — the tropics at 23.5° and the polar circles at 66.5°.
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <div aria-labelledby={`${tabsId}-zones-tab`} className="px-5 py-4 sm:px-6" id={`${tabsId}-zones`} role="tabpanel">
          <p className="max-w-[68ch] text-[1rem]/[1.65] text-ink">{typesUnit.body}</p>

          <figure className="mt-3 overflow-hidden rounded-card border border-graticule bg-white">
            <Image alt={sourceMap.alt} className="h-auto w-full" height={520} src={sourceMap.src} width={900} />
            <figcaption className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">
              {sourceMap.caption ?? "World climate and vegetation zones"} — chapter-2.pdf, p{sourceMap.pageOrSlide}
            </figcaption>
          </figure>

          {types.length > 0 ? (
            <>
              <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink-muted">
                Each type has its own topic
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {types.map((type) => {
                  const topicId = CLIMATE_TOPIC_IDS[type.toLowerCase()];
                  const label = `${type.charAt(0).toUpperCase()}${type.slice(1)} climate`;
                  return topicId ? (
                    <Link
                      className="min-h-11 rounded-full border border-graticule bg-surface px-3 py-1.5 text-[0.875rem] text-ink transition-colors hover:border-meridian hover:text-meridian"
                      href={`/chapters/CH2?topic=${topicId}`}
                      key={type}
                    >
                      {label}
                    </Link>
                  ) : (
                    <span className="min-h-11 rounded-full border border-graticule bg-chart px-3 py-1.5 text-[0.875rem] text-ink-muted" key={type}>
                      {label}
                    </span>
                  );
                })}
              </div>
            </>
          ) : null}

          <p className="mt-3 text-[0.8125rem]/[1.55] text-ink-muted">
            * This is the slide&apos;s own map, shown as it is. Its legend mixes two systems — the five climate types
            the course teaches and a nine-part vegetation key — which is why it is presented rather than made
            clickable: the deck never says which coloured area belongs to which of its five types.
          </p>
        </div>
      )}
    </div>
  );
}

function TabButton({
  children,
  controls,
  id,
  isActive,
  onSelect,
}: {
  children: React.ReactNode;
  controls: string;
  id: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      aria-controls={controls}
      aria-selected={isActive}
      className={`-mb-px min-h-11 rounded-t-card border-b-2 px-3 py-2 text-[0.9375rem] transition-colors ${
        isActive ? "border-meridian font-semibold text-meridian" : "border-transparent text-ink-muted hover:text-ink"
      }`}
      id={id}
      onClick={onSelect}
      role="tab"
      type="button"
    >
      {children}
    </button>
  );
}
