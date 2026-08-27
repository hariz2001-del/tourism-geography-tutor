"use client";

import RegionMapExplorer, { type MapRegion } from "./region-map-explorer";
import { SUPPLEMENTARY_SOURCE, keyForPixel, type Continent } from "@/lib/course-brain/continents";

const INDEX_MAP = "/diagrams/ch2-continents-index.png";

export default function ContinentExplorer({
  continents,
  bookmarkedUnitIds,
}: {
  continents: Continent[];
  bookmarkedUnitIds?: Set<string>;
}) {
  const regions: MapRegion[] = continents.map((continent) => ({
    key: continent.key,
    unitId: continent.unitId,
    name: continent.name,
    body: continent.body,
    citation: `chapter-2.pdf, page/slide ${continent.pageOrSlide}`,
    figures: [
      { label: "Size", value: continent.area, added: continent.addedArea },
      {
        label: "Rank by size",
        value: continent.rank ? `the ${continent.rank}` : null,
        added: continent.addedRank ? `the ${continent.addedRank}` : null,
      },
    ],
  }));

  return (
    <RegionMapExplorer
      bookmarkedUnitIds={bookmarkedUnitIds}
      chooserLabel="Choose a continent"
      footnote={
        <>
          * The sentence and any untagged figure are the course&apos;s own. Figures marked{" "}
          <span className="whitespace-nowrap rounded-sm bg-relief/12 px-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-relief">
            added
          </span>{" "}
          are not on the slide — the deck sizes five of its seven continents, so South America and Antarctica are
          filled in from {SUPPLEMENTARY_SOURCE}. The shapes are traced from the map itself, so the divides between
          Europe and Asia, at Suez and at Panama follow the usual conventions rather than anything the deck defines.
        </>
      }
      indexMap={INDEX_MAP}
      keyForPixel={keyForPixel}
      mapAlt="Blank world map. Each continent can be selected to read what the course says about it."
      maskFor={(key) => `/diagrams/ch2-continent-${key}.webp`}
      regions={regions}
    />
  );
}
