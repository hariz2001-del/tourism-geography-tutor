import { describe, expect, it } from "vitest";
import {
  CLIMATE_BANDS,
  bandHeight,
  bandTop,
  formatLatitude,
  parseClimateBands,
  parseClimateTypes,
} from "./climate-bands";

// Verbatim from the published rows.
const bandsBody =
  "The world's climate zones run in bands by latitude. The tropics, nearest the equator, have two seasons: wet and dry. The mid-latitudes, on either side of the tropics, have four seasons: spring, summer, autumn, and winter. The arctic and antarctic zones, furthest from the equator, also have two seasons, but of a different kind: polar day and polar night.";
const typesBody =
  "The five major climate types listed are tropical, dry, middle latitude, high latitude, and highland climates.";

describe("climate bands", () => {
  it("tiles the globe from pole to pole with no gap", () => {
    expect(CLIMATE_BANDS[0].from).toBe(90);
    expect(CLIMATE_BANDS.at(-1)!.to).toBe(-90);
    for (let i = 1; i < CLIMATE_BANDS.length; i += 1) {
      expect(CLIMATE_BANDS[i].from).toBe(CLIMATE_BANDS[i - 1].to);
    }
    expect(CLIMATE_BANDS.reduce((sum, band) => sum + bandHeight(band), 0)).toBeCloseTo(100, 10);
    expect(bandTop(CLIMATE_BANDS[0])).toBe(0);
  });

  it("puts the tropics symmetrically about the equator", () => {
    const tropics = CLIMATE_BANDS.find((band) => band.key === "tropics")!;
    expect(tropics.from).toBe(23.5);
    expect(tropics.to).toBe(-23.5);
    expect(bandTop(tropics) + bandHeight(tropics) / 2).toBeCloseTo(50, 10);
  });

  it("splits the body into the three descriptions the deck actually gives", () => {
    const text = parseClimateBands(bandsBody)!;

    expect(text.introduction).toBe("The world's climate zones run in bands by latitude.");
    expect(text.tropics).toBe("The tropics, nearest the equator, have two seasons: wet and dry.");
    expect(text.mid).toContain("four seasons: spring, summer, autumn, and winter.");
    expect(text.polar).toContain("polar day and polar night.");
  });

  it("gives every band one of those three, north and south alike", () => {
    const text = parseClimateBands(bandsBody)!;
    for (const band of CLIMATE_BANDS) {
      expect(text[band.zone].length).toBeGreaterThan(0);
    }
    const northMid = CLIMATE_BANDS.find((band) => band.key === "north-mid")!;
    const southMid = CLIMATE_BANDS.find((band) => band.key === "south-mid")!;
    expect(text[northMid.zone]).toBe(text[southMid.zone]);
  });

  it("fails closed when the wording changes, so prose renders instead of a broken map", () => {
    expect(parseClimateBands("Climate zones are arranged in latitude bands around the world.")).toBeNull();
  });

  it("reads the five climate types out of their own unit", () => {
    expect(parseClimateTypes(typesBody)).toEqual([
      "tropical",
      "dry",
      "middle latitude",
      "high latitude",
      "highland",
    ]);
  });

  it("names the poles and the equator rather than printing 90°N", () => {
    expect(formatLatitude(90)).toBe("the North Pole");
    expect(formatLatitude(-90)).toBe("the South Pole");
    expect(formatLatitude(0)).toBe("the equator");
    expect(formatLatitude(23.5)).toBe("23.5°N");
    expect(formatLatitude(-66.5)).toBe("66.5°S");
  });
});
