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

export type Continent = {
  key: ContinentKey;
  unitId: string;
  name: string;
  body: string;
  /** As the deck states it, e.g. "44.58 million km²" — absent where the deck gives none. */
  area: string | null;
  /** As the deck states it, e.g. "largest", "second-largest" — absent where the deck gives none. */
  rank: string | null;
  pageOrSlide: number;
};

const AREA = /(?:land )?area of ([\d.,]+ million km²)/i;
const RANK = /is the (largest|smallest|[a-z]+-largest) continent/i;

export function toContinent(unit: PublishedContentUnit): Continent | null {
  const key = CONTINENT_TITLES[unit.title];
  if (!key) return null;
  return {
    key,
    unitId: unit.id,
    name: unit.title,
    body: unit.body,
    area: AREA.exec(unit.body)?.[1] ?? null,
    rank: RANK.exec(unit.body)?.[1]?.toLowerCase() ?? null,
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
  if (!continent.rank) return null;
  return `${continent.name} is the ${continent.rank} of the seven.`;
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
