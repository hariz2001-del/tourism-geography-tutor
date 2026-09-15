import { describe, expect, it } from "vitest";
import { PRINCIPAL_LINE_SOURCE, PRINCIPAL_PARALLELS, faceTowards, hemispheresOf, parseCoordinate, project } from "./graticule";

describe("the five principal lines", () => {
  it("each carry a description, and say where the descriptions come from", () => {
    expect(PRINCIPAL_PARALLELS.map((line) => line.name)).toEqual([
      "Arctic Circle",
      "Tropic of Cancer",
      "Equator",
      "Tropic of Capricorn",
      "Antarctic Circle",
    ]);
    for (const line of PRINCIPAL_PARALLELS) {
      expect(line.description.length, `${line.name} has no description`).toBeGreaterThan(40);
    }
    expect(PRINCIPAL_LINE_SOURCE.length).toBeGreaterThan(0);
  });

  it("pair the tropics and the polar circles by the solstice that defines them", () => {
    const byKey = new Map(PRINCIPAL_PARALLELS.map((line) => [line.key, line.description]));
    expect(byKey.get("tropic-of-cancer")).toContain("June solstice");
    expect(byKey.get("tropic-of-capricorn")).toContain("December solstice");
    expect(byKey.get("arctic-circle")).toContain("around the June solstice");
    expect(byKey.get("antarctic-circle")).toContain("around the December solstice");
  });
});

describe("typing a place to pin", () => {
  it("reads plain signed numbers", () => {
    expect(parseCoordinate("3.1", "latitude")).toBe(3.1);
    expect(parseCoordinate("-33.9", "latitude")).toBe(-33.9);
    expect(parseCoordinate(" 101.7 ", "longitude")).toBe(101.7);
    expect(parseCoordinate("+74", "longitude")).toBe(74);
  });

  it("reads a hemisphere letter, with or without a degree sign", () => {
    expect(parseCoordinate("33.9 S", "latitude")).toBe(-33.9);
    expect(parseCoordinate("66.5°N", "latitude")).toBe(66.5);
    expect(parseCoordinate("74.1w", "longitude")).toBe(-74.1);
    expect(parseCoordinate("101.7 E", "longitude")).toBe(101.7);
  });

  it("refuses what it would have to guess at, rather than pinning the wrong place", () => {
    expect(parseCoordinate("", "latitude")).toBeNull();
    expect(parseCoordinate("north", "latitude")).toBeNull();
    expect(parseCoordinate("91", "latitude")).toBeNull();
    expect(parseCoordinate("-180.5", "longitude")).toBeNull();
    // the wrong kind of letter for the axis
    expect(parseCoordinate("10 E", "latitude")).toBeNull();
    expect(parseCoordinate("10 N", "longitude")).toBeNull();
    // south said twice could mean either
    expect(parseCoordinate("-5 S", "latitude")).toBeNull();
  });

  it("accepts the limits themselves", () => {
    expect(parseCoordinate("90", "latitude")).toBe(90);
    expect(parseCoordinate("180 W", "longitude")).toBe(-180);
  });
});

describe("turning the globe to face a pin", () => {
  it("brings the place to the middle of the face", () => {
    for (const [longitude, latitude] of [[101.7, 3.1], [-74.1, 4.6], [0, 0], [151.2, -33.9], [-150, 61]]) {
      const { rotation, tilt } = faceTowards(longitude, latitude);
      const point = project(longitude, latitude, rotation, tilt, 100);
      expect(point.visible).toBe(true);
      expect(Math.abs(point.x)).toBeLessThan(1e-6);
      expect(Math.abs(point.y)).toBeLessThan(1e-6);
    }
  });

  it("leans no further than a drag can, so a pole does not flip the globe over", () => {
    expect(faceTowards(0, 90).tilt).toBe(80);
    expect(faceTowards(0, -90).tilt).toBe(-80);
  });
});

describe("naming the hemispheres a pin is in", () => {
  it("names both halves for an ordinary place", () => {
    expect(hemispheresOf(101.7, 3.1)).toBe("Northern and Eastern hemispheres");
    expect(hemispheresOf(-74.1, -33.9)).toBe("Southern and Western hemispheres");
  });

  it("names the line for a place that sits exactly on one", () => {
    expect(hemispheresOf(101.7, 0)).toBe("Eastern hemisphere, on the Equator");
    expect(hemispheresOf(0, 51.5)).toBe("Northern hemisphere, on the Prime Meridian");
    expect(hemispheresOf(180, -10)).toBe("Southern hemisphere, on the 180° meridian");
    expect(hemispheresOf(0, 0)).toBe("on the Equator and the Prime Meridian");
  });
});
