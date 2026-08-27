import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { OCEAN_INDEX_COLOURS, keyForOceanPixel, toOceans, type OceanKey } from "./oceans";
import type { PublishedContentUnit } from "./types";

function unit(id: string, title: string, body: string, pageOrSlide: number): PublishedContentUnit {
  return {
    id,
    topicId: "f066f2b3-0b04-4b25-b361-a6778088b21b",
    title,
    body,
    contentType: "definition",
    citation: { sourceFile: "chapter-2.pdf", chapterLabel: "Chapter 2", pageOrSlide },
  };
}

// Verbatim from the published rows.
const units = [
  unit("u-pac", "Pacific Ocean", "The Pacific is the largest ocean in the world. It also has the deepest known point on Earth, the Challenger Deep.", 8),
  unit("u-atl", "Atlantic Ocean", "The Atlantic is the second-largest ocean, covering about 25% of the Earth's surface, and is rich in aquatic life, oil, and gas deposits.", 8),
  unit("u-ind", "Indian Ocean", "The Indian Ocean is the third-largest and the warmest of the major oceans, with an area of about 70 million km².", 9),
  unit("u-sou", "Southern Ocean", "The Southern Ocean surrounds Antarctica and is recognized as a distinct ocean due to the presence of the Antarctic Circumpolar Current (ACC).", 9),
  unit("u-arc", "Arctic Ocean", "The Arctic Ocean is the smallest, least accessible, and least studied of the major oceans.", 9),
  unit("u-def", "Define an ocean", "An ocean is a large body of salt water surrounding continental land masses.", 3),
];

describe("ocean facts", () => {
  it("takes only the five ocean units, largest first", () => {
    expect(toOceans(units).map((ocean) => ocean.key)).toEqual(["pacific", "atlantic", "indian", "southern", "arctic"]);
  });

  /**
   * The deck ranks four of the five, but never in the same sentence shape: "the largest
   * ocean in the world", "the second-largest ocean, covering...", "the third-largest and the
   * warmest of the major oceans", "the smallest, least accessible". An earlier regex required
   * the word "ocean" to follow the ranking and so credited the deck's own words to an outside
   * source on two of them — the exact failure this project must not make.
   */
  it("reads every ranking the deck states, whatever follows it", () => {
    const byKey = Object.fromEntries(toOceans(units).map((ocean) => [ocean.key, ocean]));

    expect(byKey.pacific.rank).toBe("largest");
    expect(byKey.atlantic.rank).toBe("second-largest");
    expect(byKey.indian.rank).toBe("third-largest");
    expect(byKey.arctic.rank).toBe("smallest");
    // the Southern Ocean is the one the deck never ranks
    expect(byKey.southern.rank).toBeNull();
    expect(byKey.southern.addedRank).toBe("fourth-largest");
  });

  it("keeps the one area the deck gives, and adds the other four", () => {
    const byKey = Object.fromEntries(toOceans(units).map((ocean) => [ocean.key, ocean]));

    expect(byKey.indian.area).toBe("about 70 million km²");
    expect(byKey.indian.addedArea).toBeNull();
    for (const key of ["pacific", "atlantic", "southern", "arctic"] as OceanKey[]) {
      expect(byKey[key].area).toBeNull();
      expect(byKey[key].addedArea).toMatch(/million km²$/);
    }
  });

  it("never states a depth as the deck's own, because the deck gives none", () => {
    for (const ocean of toOceans(units)) {
      expect(ocean.deepest).toBeNull();
      expect(ocean.addedDeepest).toMatch(/\d/);
    }
  });

  it("adds figures that stay in rank order, so the five remain comparable", () => {
    const sizes = toOceans(units).map((ocean) => Number((ocean.area ?? ocean.addedArea)!.replace(/[^\d.]/g, "")));
    expect(sizes).toEqual([...sizes].sort((a, b) => b - a));
  });
});

describe("hit-test colours", () => {
  it("maps each index colour to exactly one ocean", () => {
    const seen = new Set<OceanKey>();
    for (const [key, [r, g, b]] of Object.entries(OCEAN_INDEX_COLOURS) as [OceanKey, [number, number, number]][]) {
      const resolved = keyForOceanPixel(r, g, b, 255);
      expect(resolved).toBe(key);
      seen.add(resolved!);
    }
    expect(seen.size).toBe(5);
  });

  it("returns nothing for land and for water no ocean claims", () => {
    expect(keyForOceanPixel(255, 0, 0, 0)).toBeNull();
    expect(keyForOceanPixel(250, 243, 227, 255)).toBeNull();
  });
});

describe("generated region assets", () => {
  const diagrams = path.join(process.cwd(), "public", "diagrams");

  it("ships an index image and a mask for every ocean", () => {
    expect(existsSync(path.join(diagrams, "ch2-oceans-index.png"))).toBe(true);
    for (const key of Object.keys(OCEAN_INDEX_COLOURS)) {
      expect(existsSync(path.join(diagrams, `ch2-ocean-${key}.webp`))).toBe(true);
    }
  });
});
