import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { rangePhotos } from "./mountain-range-photos";
import { mountainRanges, projectRange, RANGE_REGIONS, rangesByRegion } from "./mountain-ranges";

/**
 * The map has to carry every range the slide's legend names — that is the whole reason it
 * exists, since the unit's learning note names only six of them.
 */
describe("the ranges the Chapter 4 map names", () => {
  it("carries all twenty-four legend entries, in the slide's own six groups", () => {
    expect(mountainRanges).toHaveLength(24);
    expect(rangesByRegion.map((group) => group.region)).toEqual(RANGE_REGIONS);
    expect(rangesByRegion.map((group) => group.ranges.length)).toEqual([6, 1, 7, 4, 4, 2]);
    expect(rangesByRegion.reduce((total, group) => total + group.ranges.length, 0)).toBe(24);
  });

  it("keeps the slide's own spellings rather than tidying them", () => {
    const byKey = new Map(mountainRanges.map((range) => [range.key, range]));
    expect(byKey.get("crystal-mountains")?.name).toBe("Crystal Mountians");
    expect(byKey.get("andes")?.deckCountries).toContain("Columbia");
    expect(byKey.get("himalaya")?.deckCountries).toContain("Tibet");
    expect(byKey.get("caucasus")?.deckCountries).toBe("Ukraine");
  });

  it("flags every entry whose stated location is wrong, and only those", () => {
    const flagged = mountainRanges.filter((range) => range.flag).map((range) => range.key).sort();
    expect(flagged).toEqual([
      "andes",
      "caucasus",
      "crystal-mountains",
      "himalaya",
      "mitumba",
      "taurus",
      "thian",
      "tian-shan",
    ]);
  });

  it("draws the two entries for one range in the same place", () => {
    const thian = mountainRanges.find((range) => range.key === "thian");
    const tianShan = mountainRanges.find((range) => range.key === "tian-shan");
    expect(thian?.spine).toEqual(tianShan?.spine);
    expect(thian?.photoKey).toBe("tian-shan");
  });

  it("has unique keys and a usable spine for each range", () => {
    expect(new Set(mountainRanges.map((range) => range.key)).size).toBe(mountainRanges.length);
    for (const range of mountainRanges) {
      expect(range.spine.length, `${range.key} needs at least two points`).toBeGreaterThan(1);
      expect(range.width).toBeGreaterThan(0);
      for (const [lon, lat] of range.spine) {
        expect(Math.abs(lon), `${range.key} longitude`).toBeLessThanOrEqual(180);
        expect(Math.abs(lat), `${range.key} latitude`).toBeLessThanOrEqual(90);
      }
    }
  });

  it("shows a picture for every range, and ships the file", () => {
    for (const range of mountainRanges) {
      const photo = rangePhotos[range.photoKey ?? range.key];
      expect(photo, `no photograph for ${range.name}`).toBeTruthy();
      expect(existsSync(path.join(process.cwd(), "public", photo.src))).toBe(true);
      expect(photo.creator.length).toBeGreaterThan(0);
      expect(photo.sourceUrl).toContain("commons.wikimedia.org");
      if (photo.license.startsWith("CC ")) expect(photo.licenseUrl).toBeTruthy();
    }
  });

  it("says so where the picture is not a photograph", () => {
    // No openly licensed photograph of the Mitumba exists; an 1881 engraving stands in, and
    // must never pass itself off as a modern photograph.
    expect(rangePhotos.mitumba.caption).toContain("engraved");
    expect(rangePhotos.mitumba.caption).toContain("No openly licensed photograph");
  });

  it("projects onto the same equirectangular map as every other figure", () => {
    expect(projectRange(-180, 90, 1600, 800)).toEqual([0, 0]);
    expect(projectRange(180, -90, 1600, 800)).toEqual([1600, 800]);
    expect(projectRange(0, 0, 1600, 800)).toEqual([800, 400]);
  });

  it("puts each range on the right part of the world", () => {
    // A spine typed with a sign error would otherwise land silently in the wrong hemisphere.
    const middleOf = (key: string) => {
      const spine = mountainRanges.find((range) => range.key === key)!.spine;
      return spine[Math.floor(spine.length / 2)];
    };
    const [andesLon, andesLat] = middleOf("andes");
    expect(andesLon).toBeLessThan(-60);
    expect(andesLat).toBeLessThan(0);

    const [himalayaLon, himalayaLat] = middleOf("himalaya");
    expect(himalayaLon).toBeGreaterThan(70);
    expect(himalayaLat).toBeGreaterThan(25);

    const [dividingLon, dividingLat] = middleOf("great-dividing");
    expect(dividingLon).toBeGreaterThan(140);
    expect(dividingLat).toBeLessThan(-20);
  });
});
