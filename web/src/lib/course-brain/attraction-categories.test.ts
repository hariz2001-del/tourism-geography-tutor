import { describe, expect, it } from "vitest";
import { ATTRACTION_CATEGORY_UNIT_IDS, attractionCategories, categoryKey, unitsForCategory } from "./attraction-categories";
import type { PublishedContentUnit } from "./types";

// Verbatim from the published row the wheel is built from.
const BODY =
  "Physical tourist attractions around the world are grouped into categories: natural landscape, hills and mountains, rivers and lakes, seas and oceans, islands and beaches, deserts and valleys, and plateaus.";

function unit(id: string, title: string): PublishedContentUnit {
  return {
    id,
    topicId: "topic",
    title,
    body: "…",
    contentType: "definition",
    citation: { sourceFile: "chapter-4.pdf", chapterLabel: "Chapter 4", pageOrSlide: 8 },
  };
}

describe("the wheel of physical attraction categories", () => {
  it("reads the seven categories out of the unit body", () => {
    const categories = attractionCategories(BODY);
    expect(categories?.map((category) => category.name)).toEqual([
      "natural landscape",
      "hills and mountains",
      "rivers and lakes",
      "seas and oceans",
      "islands and beaches",
      "deserts and valleys",
      "plateaus",
    ]);
  });

  it("fails closed rather than drawing half a wheel", () => {
    expect(attractionCategories("A tourist attraction is a physical or cultural feature.")).toBeNull();
    expect(attractionCategories("… grouped into categories: hills, lakes, and oceans.")).toBeNull();
  });

  it("has cards filed under every one of the seven", () => {
    const categories = attractionCategories(BODY)!;
    for (const category of categories) {
      expect(category.unitIds.length, `nothing filed under ${category.name}`).toBeGreaterThan(0);
    }
  });

  it("files each card under exactly one category", () => {
    const all = Object.values(ATTRACTION_CATEGORY_UNIT_IDS).flat();
    expect(new Set(all).size).toBe(all.length);
  });

  it("keys every category the body can produce", () => {
    // The lookup is by slug, so a reworded body would silently produce empty categories.
    const keys = attractionCategories(BODY)!.map((category) => category.key);
    expect(keys).toEqual(Object.keys(ATTRACTION_CATEGORY_UNIT_IDS));
    expect(categoryKey("Hills And Mountains")).toBe("hills-and-mountains");
  });

  it("flags what the slide's headings promise and the chapter never teaches", () => {
    const byKey = new Map(attractionCategories(BODY)!.map((category) => [category.key, category]));
    expect(byKey.get("deserts-and-valleys")?.gap).toContain("valleys");
    expect(byKey.get("islands-and-beaches")?.gap).toContain("beaches");
    expect(byKey.get("plateaus")?.gap).toBeUndefined();
  });

  it("lists a category's cards in the order they are filed, and skips any unpublished", () => {
    const categories = attractionCategories(BODY)!;
    const plateaus = categories.find((category) => category.key === "plateaus")!;
    const [first, second] = plateaus.unitIds;
    const chapterUnits = [unit(second, "Tibetan Plateau"), unit(first, "Plateau as a high plain")];

    expect(unitsForCategory(plateaus, chapterUnits).map((card) => card.title)).toEqual([
      "Plateau as a high plain",
      "Tibetan Plateau",
    ]);
    expect(unitsForCategory(plateaus, [])).toEqual([]);
  });
});
