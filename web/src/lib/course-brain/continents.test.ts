import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CONTINENT_INDEX_COLOURS,
  keyForPixel,
  rankSentence,
  toContinents,
  type ContinentKey,
} from "./continents";
import type { PublishedContentUnit } from "./types";

function unit(id: string, title: string, body: string, pageOrSlide: number): PublishedContentUnit {
  return {
    id,
    topicId: "68393419-9a3c-4502-b0c9-96ca3977b86e",
    title,
    body,
    contentType: "definition",
    citation: { sourceFile: "chapter-2.pdf", chapterLabel: "Chapter 2", pageOrSlide },
  };
}

// Verbatim from the published rows — the parse is only meaningful against the exact
// strings the database serves.
const units = [
  unit("u-asia", "Asia", "Asia is the largest continent, with an area of 44.58 million km², and is home to Mount Everest, the world's highest peak.", 4),
  unit("u-africa", "Africa", "Africa is the second-largest continent, with an area of 30.37 million km², and is home to the Sahara, the world's largest hot desert, and the Nile, one of the world's longest rivers.", 4),
  unit("u-na", "North America", "North America is the third-largest continent, with an area of 24.71 million km². Some of the Earth's youngest mountains are found in the Cascade Range in the US, which spans over 500 miles.", 5),
  unit("u-sa", "South America", "South America is connected to North America by the Isthmus of Panama and contains the Andes, the world's longest continental mountain range.", 5),
  unit("u-europe", "Europe", "Europe is the sixth-largest continent, with an area of 10.18 million km², and is surrounded by water on three sides.", 6),
  unit("u-antarctica", "Antarctica", "Antarctica is considered the windiest and driest place on Earth. It does not have any countries, but it contains several research laboratories.", 6),
  unit("u-australia", "Australia", "Australia is the smallest continent, with a land area of 7.692 million km². It is the lowest, the flattest, and one of the driest continents.", 6),
  unit("u-other", "Define a continent", "A continent is a large, continuous land mass that also includes surrounding discrete islands.", 3),
];

describe("continent facts", () => {
  it("takes only the seven continent units, in the deck's own order", () => {
    expect(toContinents(units).map((continent) => continent.key)).toEqual([
      "asia",
      "africa",
      "north-america",
      "south-america",
      "europe",
      "antarctica",
      "australia",
    ]);
  });

  it("reads the size and the ranking out of the stored body rather than restating them", () => {
    const byKey = Object.fromEntries(toContinents(units).map((continent) => [continent.key, continent]));

    expect(byKey.asia.area).toBe("44.58 million km²");
    expect(byKey.asia.rank).toBe("largest");
    expect(byKey.africa.area).toBe("30.37 million km²");
    expect(byKey.africa.rank).toBe("second-largest");
    expect(byKey["north-america"].rank).toBe("third-largest");
    expect(byKey.europe.rank).toBe("sixth-largest");
    // "with a land area of 7.692 million km²" — a different phrasing on the same slide
    expect(byKey.australia.area).toBe("7.692 million km²");
    expect(byKey.australia.rank).toBe("smallest");
  });

  /**
   * The deck gives no area for South America or Antarctica. That gap is reported to the
   * learner as a gap; inventing a figure from general knowledge is what this project spent
   * a four-chapter remediation undoing.
   */
  it("keeps the deck's silence separate from the figures added to fill it", () => {
    const byKey = Object.fromEntries(toContinents(units).map((continent) => [continent.key, continent]));

    // the deck states nothing for these two, and that stays true of `area`/`rank`...
    expect(byKey["south-america"].area).toBeNull();
    expect(byKey["south-america"].rank).toBeNull();
    expect(byKey.antarctica.area).toBeNull();
    expect(byKey.antarctica.rank).toBeNull();
    // ...while the added figures live in their own fields, so the interface can tag them
    expect(byKey["south-america"].addedArea).toBe("17.81 million km²");
    expect(byKey["south-america"].addedRank).toBe("fourth-largest");
    expect(byKey.antarctica.addedArea).toBe("14.2 million km²");
    expect(byKey.antarctica.addedRank).toBe("fifth-largest");
    expect(rankSentence(byKey.antarctica)).toBe("Antarctica is the fifth-largest of the seven.");
  });

  it("never overwrites a figure the deck does give", () => {
    for (const continent of toContinents(units)) {
      if (continent.area) expect(continent.addedArea).toBeNull();
      if (continent.rank) expect(continent.addedRank).toBeNull();
    }
    const asia = toContinents(units).find((continent) => continent.key === "asia")!;
    expect(asia.area).toBe("44.58 million km²");
    expect(asia.addedArea).toBeNull();
    expect(rankSentence(asia)).toBe("Asia is the largest of the seven.");
  });

  it("completes the ranking of all seven once the added figures are counted", () => {
    const ranks = toContinents(units).map((continent) => continent.rank ?? continent.addedRank);
    expect(ranks).toEqual([
      "largest",
      "second-largest",
      "third-largest",
      "fourth-largest",
      "sixth-largest",
      "fifth-largest",
      "smallest",
    ]);
  });

  it("returns nothing at all when a unit is missing, so the model can fall back", () => {
    expect(toContinents(units.filter((candidate) => candidate.title !== "Europe"))).toHaveLength(6);
  });
});

describe("hit-test colours", () => {
  it("maps each index colour to exactly one continent", () => {
    const seen = new Set<ContinentKey>();
    for (const [key, [r, g, b]] of Object.entries(CONTINENT_INDEX_COLOURS) as [ContinentKey, [number, number, number]][]) {
      const resolved = keyForPixel(r, g, b, 255);
      expect(resolved).toBe(key);
      expect(seen.has(resolved!)).toBe(false);
      seen.add(resolved!);
    }
    expect(seen.size).toBe(7);
  });

  it("returns nothing for ocean, for transparent pixels and for unknown colours", () => {
    expect(keyForPixel(255, 0, 0, 0)).toBeNull(); // transparent
    expect(keyForPixel(166, 206, 227, 255)).toBeNull(); // the base map's ocean
    expect(keyForPixel(120, 120, 120, 255)).toBeNull();
  });
});

/**
 * The masks and the index image are generated by scripts/build_continent_regions.py and are
 * referenced by string, so nothing but this test notices if one goes missing — and a missing
 * mask means a continent that highlights nothing.
 */
describe("generated region assets", () => {
  const diagrams = path.join(process.cwd(), "public", "diagrams");

  it("ships an index image and a mask for every continent", () => {
    expect(existsSync(path.join(diagrams, "ch2-continents-index.png"))).toBe(true);
    for (const key of Object.keys(CONTINENT_INDEX_COLOURS)) {
      expect(existsSync(path.join(diagrams, `ch2-continent-${key}.webp`))).toBe(true);
    }
  });
});
