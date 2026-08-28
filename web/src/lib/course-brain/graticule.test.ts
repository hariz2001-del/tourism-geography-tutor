import { describe, expect, it } from "vitest";
import {
  PRINCIPAL_PARALLELS,
  formatLatitude,
  formatLongitude,
  hoursFromGreenwich,
  normaliseLongitude,
  principalNamesFrom,
  project,
  unproject,
} from "./graticule";
import { LAND_DOTS } from "./land-dots";

// Verbatim from the published row.
const latitudeBody =
  "Latitude lines are parallels. The five principal lines listed are the Arctic Circle, Tropic of Cancer, Equator, Tropic of Capricorn, and Antarctic Circle.";

describe("the principal lines", () => {
  it("takes its five names from the deck, without the sentence's article", () => {
    expect(principalNamesFrom(latitudeBody)).toEqual([
      "Arctic Circle",
      "Tropic of Cancer",
      "Equator",
      "Tropic of Capricorn",
      "Antarctic Circle",
    ]);
  });

  it("keeps the drawn lines in step with the names, north to south", () => {
    const names = principalNamesFrom(latitudeBody);
    expect(PRINCIPAL_PARALLELS).toHaveLength(names.length);
    const latitudes = PRINCIPAL_PARALLELS.map((line) => line.latitude);
    expect(latitudes).toEqual([...latitudes].sort((a, b) => b - a));
    // the tropics and the polar circles are symmetric about the equator
    expect(latitudes[0]).toBe(-latitudes[4]);
    expect(latitudes[1]).toBe(-latitudes[3]);
    expect(latitudes[2]).toBe(0);
  });

  it("marks every latitude as added, because the slide names them without numbering them", () => {
    expect(PRINCIPAL_PARALLELS.every((line) => line.latitudeIsAdded)).toBe(true);
  });

  it("returns nothing when the wording changes, so the globe falls back rather than guessing", () => {
    expect(principalNamesFrom("Latitude lines are parallels drawn around the Earth.")).toEqual([]);
  });
});

describe("orthographic projection", () => {
  const R = 100;

  it("puts the point facing the viewer at the centre, and hides the far side", () => {
    const front = project(0, 0, 0, 0, R);
    expect(front.x).toBeCloseTo(0, 6);
    expect(front.y).toBeCloseTo(0, 6);
    expect(front.visible).toBe(true);

    expect(project(180, 0, 0, 0, R).visible).toBe(false);
    expect(project(90, 0, 0, 0, R).x).toBeCloseTo(R, 6); // a quarter turn east is the right edge
  });

  it("shrinks the parallels toward the poles — the thing the flat pictures cannot show", () => {
    const widthAt = (latitude: number) => Math.abs(project(90, latitude, 0, 0, R).x);
    expect(widthAt(0)).toBeCloseTo(R, 6);
    expect(widthAt(60)).toBeLessThan(widthAt(0));
    expect(widthAt(80)).toBeLessThan(widthAt(60));
  });

  it("brings every meridian to the same two points, the poles", () => {
    const north = project(0, 90, 0, 0, R);
    const alsoNorth = project(137, 90, 0, 0, R);
    expect(alsoNorth.x).toBeCloseTo(north.x, 6);
    expect(alsoNorth.y).toBeCloseTo(north.y, 6);
  });

  it("round-trips a point back to where it started", () => {
    for (const [longitude, latitude, rotation, tilt] of [
      [0, 0, 0, 0],
      [45, 20, -10, 18],
      [-120, -35, 200, -25],
    ]) {
      const point = project(longitude, latitude, rotation, tilt, R);
      const back = unproject(point.x, point.y, rotation, tilt, R);
      expect(back).not.toBeNull();
      expect(back!.latitude).toBeCloseTo(latitude, 4);
      expect(normaliseLongitude(back!.longitude - longitude)).toBeCloseTo(0, 4);
    }
  });

  it("reports nothing for a pointer outside the sphere", () => {
    expect(unproject(R * 1.2, 0, 0, 0, R)).toBeNull();
  });
});

describe("labels", () => {
  it("names the hemispheres, and the equator only when asked", () => {
    expect(formatLatitude(23.5)).toBe("23.5°N");
    expect(formatLatitude(-66.5)).toBe("66.5°S");
    expect(formatLatitude(0)).toBe("0°");
    expect(formatLatitude(0, true)).toBe("0° (the equator)");
    expect(formatLongitude(0)).toBe("0° (the Prime Meridian)");
    expect(formatLongitude(-75)).toBe("75°W");
  });

  it("turns a meridian into the hour the deck's arithmetic gives it", () => {
    expect(hoursFromGreenwich(0)).toBe("GMT");
    expect(hoursFromGreenwich(15)).toBe("GMT+1");
    expect(hoursFromGreenwich(-75)).toBe("GMT-5");
    expect(hoursFromGreenwich(120)).toBe("GMT+8");
  });
});

describe("land dots", () => {
  it("are longitude/latitude pairs inside the world", () => {
    expect(LAND_DOTS.length % 2).toBe(0);
    expect(LAND_DOTS.length / 2).toBeGreaterThan(1000);
    for (let i = 0; i < LAND_DOTS.length; i += 2) {
      expect(Math.abs(LAND_DOTS[i])).toBeLessThanOrEqual(180);
      expect(Math.abs(LAND_DOTS[i + 1])).toBeLessThanOrEqual(90);
    }
  });

  it("land where land is: the Sahara yes, the middle of the Pacific no", () => {
    const near = (lon: number, lat: number) => {
      for (let i = 0; i < LAND_DOTS.length; i += 2) {
        if (Math.abs(LAND_DOTS[i] - lon) < 4 && Math.abs(LAND_DOTS[i + 1] - lat) < 4) return true;
      }
      return false;
    };
    expect(near(15, 22)).toBe(true); // Sahara
    expect(near(-60, -10)).toBe(true); // Amazon
    expect(near(-150, 0)).toBe(false); // open Pacific
  });
});
