/**
 * The five climate types the deck names, mapped onto regions of a real climate map.
 *
 * The deck's own p12 map cannot do this: its legend mixes the five types with a nine-part
 * vegetation key it never reconciles, so no colour on it can be attributed to a type without
 * guessing. These regions are regrouped instead from a published Köppen-Geiger map — see
 * `scripts/build_climate_regions.py`, which holds the mapping and its one heuristic.
 *
 * Everything here except the type names is added reference material, and the interface says
 * so. The names, and their order, are parsed from the deck's own sentence.
 */
export type ClimateTypeKey = "tropical" | "dry" | "middle-latitude" | "high-latitude" | "highland";

/** The deck's wording -> region key. Its sentence lists them in this order. */
export const CLIMATE_TYPE_KEYS: Record<string, ClimateTypeKey> = {
  tropical: "tropical",
  dry: "dry",
  "middle latitude": "middle-latitude",
  "high latitude": "high-latitude",
  highland: "highland",
};

/** Must stay in step with INDEX in scripts/build_climate_regions.py. */
export const CLIMATE_INDEX_COLOURS: Record<ClimateTypeKey, [number, number, number]> = {
  tropical: [255, 0, 0],
  dry: [0, 255, 0],
  "middle-latitude": [0, 0, 255],
  "high-latitude": [255, 255, 0],
  highland: [255, 0, 255],
};

/** The colour each type is drawn in on the map, for the legend swatches. */
export const CLIMATE_TYPE_COLOURS: Record<ClimateTypeKey, string> = {
  tropical: "rgb(34 139 84)",
  dry: "rgb(222 158 54)",
  "middle-latitude": "rgb(86 148 196)",
  "high-latitude": "rgb(148 163 184)",
  highland: "rgb(140 106 168)",
};

/**
 * Which Köppen groups each type gathers, and how much of the world's land it covers —
 * both printed by the build script, which weights by the cosine of latitude so the
 * projection's stretched poles do not inflate the polar share. A test keeps these in step
 * with the regrouping rule.
 */
export const CLIMATE_TYPE_FACTS: Record<ClimateTypeKey, { koppen: string; share: string }> = {
  tropical: { koppen: "Köppen A", share: "19% of land" },
  dry: { koppen: "Köppen B", share: "29% of land" },
  "middle-latitude": { koppen: "Köppen C, and warm-summer D", share: "21% of land" },
  "high-latitude": { koppen: "cold-summer D, and E near the poles", share: "29% of land" },
  highland: { koppen: "E away from the poles", share: "3% of land" },
};

export const CLIMATE_SOURCE =
  "Beck et al. (2023), High-resolution Köppen-Geiger maps, CC BY 4.0, regrouped into the course's five types";

export type ClimateType = {
  key: ClimateTypeKey;
  /** As the deck writes it, e.g. "middle latitude". */
  name: string;
  koppen: string;
  share: string;
};

/** Builds the five from the deck's own list, so the names and order stay the deck's. */
export function toClimateTypes(names: string[]): ClimateType[] {
  return names
    .map((name) => {
      const key = CLIMATE_TYPE_KEYS[name.toLowerCase()];
      if (!key) return null;
      return { key, name, koppen: CLIMATE_TYPE_FACTS[key].koppen, share: CLIMATE_TYPE_FACTS[key].share };
    })
    .filter((type): type is ClimateType => Boolean(type));
}

export function keyForClimatePixel(r: number, g: number, b: number, a: number): ClimateTypeKey | null {
  if (a < 128) return null;
  for (const [key, colour] of Object.entries(CLIMATE_INDEX_COLOURS) as [ClimateTypeKey, [number, number, number]][]) {
    if (Math.abs(colour[0] - r) < 40 && Math.abs(colour[1] - g) < 40 && Math.abs(colour[2] - b) < 40) {
      return key;
    }
  }
  return null;
}
