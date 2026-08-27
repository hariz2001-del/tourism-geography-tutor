import type { PublishedContentUnit } from "./types";

/**
 * The Chapter 2 ocean units, prepared for the interactive map — the mirror of continents.ts.
 *
 * The deck names five oceans and ranks three of them. It gives one area (the Indian, "about
 * 70 million km²") and one deepest point (the Challenger Deep, named without a figure).
 * Everything else here is added at the owner's request (2026-08-28), tagged in the interface
 * and sourced below. The deck's own words always win: a figure the slides state is never
 * overwritten.
 */
export type OceanKey = "pacific" | "atlantic" | "indian" | "southern" | "arctic";

/** Unit title -> region key. The titles are the deck's own. */
export const OCEAN_TITLES: Record<string, OceanKey> = {
  "Pacific Ocean": "pacific",
  "Atlantic Ocean": "atlantic",
  "Indian Ocean": "indian",
  "Southern Ocean": "southern",
  "Arctic Ocean": "arctic",
};

/** Must stay in step with COLOURS in scripts/build_ocean_regions.py. */
export const OCEAN_INDEX_COLOURS: Record<OceanKey, [number, number, number]> = {
  pacific: [255, 0, 0],
  atlantic: [0, 255, 0],
  indian: [0, 0, 255],
  southern: [255, 255, 0],
  arctic: [255, 0, 255],
};

/**
 * Areas: the Encyclopedia of Earth / IHO series tabulated in Wikipedia's "Ocean" article,
 * retrieved 2026-08-28 — one series, so the five stay comparable. Deepest points: each
 * ocean's own Wikipedia article, same date. Ranks follow from the areas and agree with the
 * deck wherever the deck states one.
 */
export const SUPPLEMENTARY_OCEAN_FACTS: Record<OceanKey, { area: string; rank: string; deepest: string }> = {
  pacific: { area: "168.72 million km²", rank: "largest", deepest: "Challenger Deep, 10,911 m" },
  atlantic: { area: "85.13 million km²", rank: "second-largest", deepest: "Puerto Rico Trench, 8,376 m" },
  indian: { area: "70.56 million km²", rank: "third-largest", deepest: "Sunda Trench, 7,290 m" },
  southern: { area: "21.96 million km²", rank: "fourth-largest", deepest: "Factorian Deep, 7,434 m" },
  arctic: { area: "15.56 million km²", rank: "smallest", deepest: "Molloy Hole, 5,550 m" },
};

export const OCEAN_SOURCE = "Wikipedia's Ocean article and the five ocean articles, retrieved 2026-08-28";

export type Ocean = {
  key: OceanKey;
  unitId: string;
  name: string;
  body: string;
  /** As the deck states it — the Indian Ocean is the only one the slides size. */
  area: string | null;
  rank: string | null;
  /** Never stated as a figure by the deck; the Pacific's is named without a depth. */
  deepest: null;
  addedArea: string | null;
  addedRank: string | null;
  addedDeepest: string | null;
  pageOrSlide: number;
};

const AREA = /area of (about [\d.,]+ million km²|[\d.,]+ million km²)/i;
// Deliberately does NOT require the word "ocean" to follow. The deck writes "is the
// third-largest and the warmest of the major oceans" and "is the smallest, least
// accessible" — requiring it mislabelled the deck's own ranking as something added.
const RANK = /\bis the (largest|smallest|[a-z]+-largest)\b/i;

export function toOcean(unit: PublishedContentUnit): Ocean | null {
  const key = OCEAN_TITLES[unit.title];
  if (!key) return null;
  const area = AREA.exec(unit.body)?.[1] ?? null;
  const rank = RANK.exec(unit.body)?.[1]?.toLowerCase() ?? null;
  const supplement = SUPPLEMENTARY_OCEAN_FACTS[key];
  return {
    key,
    unitId: unit.id,
    name: unit.title,
    body: unit.body,
    area,
    rank,
    deepest: null,
    addedArea: area ? null : supplement.area,
    addedRank: rank ? null : supplement.rank,
    addedDeepest: supplement.deepest,
    pageOrSlide: unit.citation.pageOrSlide,
  };
}

/** Largest first, which is also the order the deck introduces them. */
const DISPLAY_ORDER: OceanKey[] = ["pacific", "atlantic", "indian", "southern", "arctic"];

export function toOceans(units: PublishedContentUnit[]): Ocean[] {
  const found = new Map<OceanKey, Ocean>();
  for (const unit of units) {
    const ocean = toOcean(unit);
    if (ocean) found.set(ocean.key, ocean);
  }
  return DISPLAY_ORDER.map((key) => found.get(key)).filter((ocean): ocean is Ocean => Boolean(ocean));
}

/** Nearest index colour for a sampled pixel, or null for land and unclaimed water. */
export function keyForOceanPixel(r: number, g: number, b: number, a: number): OceanKey | null {
  if (a < 128) return null;
  for (const [key, colour] of Object.entries(OCEAN_INDEX_COLOURS) as [OceanKey, [number, number, number]][]) {
    if (Math.abs(colour[0] - r) < 40 && Math.abs(colour[1] - g) < 40 && Math.abs(colour[2] - b) < 40) {
      return key;
    }
  }
  return null;
}
