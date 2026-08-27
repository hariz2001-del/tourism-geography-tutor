"use client";

import RegionMapExplorer, { type MapRegion } from "./region-map-explorer";
import { OCEAN_SOURCE, keyForOceanPixel, type Ocean } from "@/lib/course-brain/oceans";

const INDEX_MAP = "/diagrams/ch2-oceans-index.png";

export default function OceanExplorer({
  oceans,
  bookmarkedUnitIds,
}: {
  oceans: Ocean[];
  bookmarkedUnitIds?: Set<string>;
}) {
  const regions: MapRegion[] = oceans.map((ocean) => ({
    key: ocean.key,
    unitId: ocean.unitId,
    name: ocean.name,
    body: ocean.body,
    citation: `chapter-2.pdf, page/slide ${ocean.pageOrSlide}`,
    figures: [
      { label: "Size", value: ocean.area, added: ocean.addedArea },
      {
        label: "Rank by size",
        value: ocean.rank ? `the ${ocean.rank}` : null,
        added: ocean.addedRank ? `the ${ocean.addedRank}` : null,
      },
      { label: "Deepest point", value: ocean.deepest, added: ocean.addedDeepest },
    ],
  }));

  return (
    <RegionMapExplorer
      bookmarkedUnitIds={bookmarkedUnitIds}
      chooserLabel="Choose an ocean"
      footnote={
        <>
          * The sentence and any untagged figure are the course&apos;s own. Figures marked{" "}
          <span className="whitespace-nowrap rounded-sm bg-relief/12 px-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-relief">
            added
          </span>{" "}
          are not on the slide — the deck names five oceans but sizes only the Indian, so the rest come from{" "}
          {OCEAN_SOURCE}. Unlike the continents, every boundary between oceans is drawn across open water: the
          highlights follow the usual conventions — 60°S for the Southern Ocean, 20°E off Africa, 147°E off
          Tasmania, the Drake Passage and the Bering Strait — none of which the deck defines.
        </>
      }
      indexMap={INDEX_MAP}
      keyForPixel={keyForOceanPixel}
      mapAlt="Blank world map. Each ocean can be selected to read what the course says about it."
      maskFor={(key) => `/diagrams/ch2-ocean-${key}.webp`}
      regions={regions}
    />
  );
}
