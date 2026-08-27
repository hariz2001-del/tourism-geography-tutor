import type { PublishedContentUnit } from "./types";

/**
 * The Chapter 2 continent units, prepared for the interactive map.
 *
 * Everything a learner reads here is the stored unit body. The size and the ranking are
 * PARSED OUT of that body rather than retyped, so the panel cannot drift from the text —
 * and where the deck does not give a size, the panel says so instead of supplying one
 * from elsewhere. Two continents are in that position, which is a gap in the deck worth
 * seeing rather than papering over.
 */
export type ContinentKey =
  | "asia"
  | "africa"
  | "north-america"
  | "south-america"
  | "europe"
  | "antarctica"
  | "australia";

/** Unit title -> region key. The titles are the deck's own. */
export const CONTINENT_TITLES: Record<string, ContinentKey> = {
  Asia: "asia",
  Africa: "africa",
  "North America": "north-america",
  "South America": "south-america",
  Europe: "europe",
  Antarctica: "antarctica",
  Australia: "australia",
};

/**
 * Flat colours in `ch2-continents-index.png`, used for pixel hit-testing. These MUST stay
 * in step with COLOURS in `scripts/build_continent_regions.py`; a test asserts the set is
 * complete and unambiguous, but only the script and this table together make it true.
 */
export const CONTINENT_INDEX_COLOURS: Record<ContinentKey, [number, number, number]> = {
  asia: [255, 0, 0],
  africa: [0, 255, 0],
  "north-america": [0, 0, 255],
  "south-america": [255, 255, 0],
  europe: [255, 0, 255],
  antarctica: [0, 255, 255],
  australia: [255, 128, 0],
};

/**
 * Figures the deck never gives, added at the owner's request (2026-08-28) so the map is
 * complete. These are NOT course content and the interface says so on every one of them:
 * each is tagged in the panel and the source is named beneath it. The deck's own figures
 * always win — a continent the slides size is never overwritten from here.
 *
 * Source: Encyclopædia Britannica's continental areas, as tabulated in Wikipedia's
 * "Continent" article, retrieved 2026-08-28. One series, so the seven remain comparable;
 * if the lecturer prefers another authority this table is the only thing to change.
 */
export const SUPPLEMENTARY_AREAS: Partial<Record<ContinentKey, { area: string; rank: string }>> = {
  "south-america": { area: "17.81 million km²", rank: "fourth-largest" },
  antarctica: { area: "14.2 million km²", rank: "fifth-largest" },
};

export const SUPPLEMENTARY_SOURCE = "Encyclopædia Britannica, via Wikipedia's Continent article";

export type Continent = {
  key: ContinentKey;
  unitId: string;
  name: string;
  body: string;
  /** As the deck states it, e.g. "44.58 million km²" — absent where the deck gives none. */
  area: string | null;
  /** As the deck states it, e.g. "largest", "second-largest" — absent where the deck gives none. */
  rank: string | null;
  /** Filled in from SUPPLEMENTARY_AREAS only where the deck is silent, and labelled as added. */
  addedArea: string | null;
  addedRank: string | null;
  pageOrSlide: number;
};

const AREA = /(?:land )?area of ([\d.,]+ million km²)/i;
const RANK = /is the (largest|smallest|[a-z]+-largest) continent/i;

export function toContinent(unit: PublishedContentUnit): Continent | null {
  const key = CONTINENT_TITLES[unit.title];
  if (!key) return null;
  const area = AREA.exec(unit.body)?.[1] ?? null;
  const rank = RANK.exec(unit.body)?.[1]?.toLowerCase() ?? null;
  const supplement = SUPPLEMENTARY_AREAS[key];
  return {
    key,
    unitId: unit.id,
    name: unit.title,
    body: unit.body,
    area,
    rank,
    // only ever fills a gap; a figure the deck states is never replaced
    addedArea: area ? null : supplement?.area ?? null,
    addedRank: rank ? null : supplement?.rank ?? null,
    pageOrSlide: unit.citation.pageOrSlide,
  };
}

/** The seven, in the order the deck lists them on its own contents slide. */
const DISPLAY_ORDER: ContinentKey[] = [
  "asia",
  "africa",
  "north-america",
  "south-america",
  "europe",
  "antarctica",
  "australia",
];

export function toContinents(units: PublishedContentUnit[]): Continent[] {
  const found = new Map<ContinentKey, Continent>();
  for (const unit of units) {
    const continent = toContinent(unit);
    if (continent) found.set(continent.key, continent);
  }
  return DISPLAY_ORDER.map((key) => found.get(key)).filter((continent): continent is Continent => Boolean(continent));
}

/** Reads as "Asia is the largest of the seven." Null where the deck ranks nothing. */
export function rankSentence(continent: Continent): string | null {
  const rank = continent.rank ?? continent.addedRank;
  if (!rank) return null;
  return `${continent.name} is the ${rank} of the seven.`;
}

export function continentIndexColour(key: ContinentKey): string {
  const [r, g, b] = CONTINENT_INDEX_COLOURS[key];
  return `rgb(${r} ${g} ${b})`;
}

/** Nearest index colour for a sampled pixel, or null for ocean and off-map pixels. */
export function keyForPixel(r: number, g: number, b: number, a: number): ContinentKey | null {
  if (a < 128) return null;
  for (const [key, colour] of Object.entries(CONTINENT_INDEX_COLOURS) as [ContinentKey, [number, number, number]][]) {
    if (Math.abs(colour[0] - r) < 40 && Math.abs(colour[1] - g) < 40 && Math.abs(colour[2] - b) < 40) {
      return key;
    }
  }
  return null;
}
