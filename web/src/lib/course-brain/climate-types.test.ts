import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  CLIMATE_INDEX_COLOURS,
  CLIMATE_TYPE_FACTS,
  keyForClimatePixel,
  toClimateTypes,
  type ClimateTypeKey,
} from "./climate-types";
import { parseClimateTypes } from "./climate-bands";

const typesBody =
  "The five major climate types listed are tropical, dry, middle latitude, high latitude, and highland climates.";

describe("climate types", () => {
  it("builds all five straight from the deck's own sentence, in its order", () => {
    const types = toClimateTypes(parseClimateTypes(typesBody));

    expect(types.map((type) => type.key)).toEqual([
      "tropical",
      "dry",
      "middle-latitude",
      "high-latitude",
      "highland",
    ]);
    // the names shown are the deck's words, not the internal keys
    expect(types.map((type) => type.name)).toEqual([
      "tropical",
      "dry",
      "middle latitude",
      "high latitude",
      "highland",
    ]);
  });

  it("drops anything it cannot place rather than inventing a region for it", () => {
    expect(toClimateTypes(["tropical", "monsoon", "dry"]).map((type) => type.key)).toEqual(["tropical", "dry"]);
  });

  it("carries a Köppen grouping and a land share for every type", () => {
    for (const type of toClimateTypes(parseClimateTypes(typesBody))) {
      expect(type.koppen).toMatch(/Köppen|D|E/);
      expect(type.share).toMatch(/^\d+% of land$/);
    }
  });

  /**
   * The shares come from the build script, which weights by the cosine of latitude so the
   * projection's stretched poles do not inflate the polar figure. If the regrouping rule
   * changes, the script reprints them and this test is what catches the table going stale.
   */
  it("has shares that account for all the classified land", () => {
    const total = Object.values(CLIMATE_TYPE_FACTS).reduce(
      (sum, fact) => sum + Number(fact.share.replace(/[^\d]/g, "")),
      0,
    );
    expect(total).toBeGreaterThanOrEqual(99);
    expect(total).toBeLessThanOrEqual(101);
  });
});

describe("hit-test colours", () => {
  it("maps each index colour to exactly one type", () => {
    const seen = new Set<ClimateTypeKey>();
    for (const [key, [r, g, b]] of Object.entries(CLIMATE_INDEX_COLOURS) as [ClimateTypeKey, [number, number, number]][]) {
      const resolved = keyForClimatePixel(r, g, b, 255);
      expect(resolved).toBe(key);
      seen.add(resolved!);
    }
    expect(seen.size).toBe(5);
  });

  it("returns nothing for ocean and for transparent pixels", () => {
    expect(keyForClimatePixel(255, 0, 0, 0)).toBeNull();
    expect(keyForClimatePixel(166, 206, 227, 255)).toBeNull();
  });
});

describe("generated assets", () => {
  const diagrams = path.join(process.cwd(), "public", "diagrams");

  it("ships the classified map, the index and a mask per type", () => {
    expect(existsSync(path.join(diagrams, "ch2-climate-types-map.webp"))).toBe(true);
    expect(existsSync(path.join(diagrams, "ch2-climate-index.png"))).toBe(true);
    for (const key of Object.keys(CLIMATE_INDEX_COLOURS)) {
      expect(existsSync(path.join(diagrams, `ch2-climate-${key}.webp`))).toBe(true);
    }
  });
});
