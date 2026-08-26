import { describe, expect, it } from "vitest";
import {
  bandLeft,
  bandWidth,
  converterCities,
  formatClock,
  formatOffsetDifference,
  shiftClock,
  timeZoneBands,
} from "./time-zones";

describe("time zone bands", () => {
  it("covers the whole globe once, with no gap and no overlap", () => {
    expect(timeZoneBands[0].from).toBe(-180);
    expect(timeZoneBands.at(-1)!.to).toBe(180);
    for (let i = 1; i < timeZoneBands.length; i += 1) {
      expect(timeZoneBands[i].from).toBe(timeZoneBands[i - 1].to);
    }
    const total = timeZoneBands.reduce((sum, band) => sum + bandWidth(band), 0);
    expect(total).toBeCloseTo(100, 10);
  });

  it("runs from GMT-12 to GMT+12 in single hours, each labelled to match its offset", () => {
    expect(timeZoneBands.map((band) => band.offset)).toEqual(
      Array.from({ length: 25 }, (_, i) => i - 12),
    );
    for (const band of timeZoneBands) {
      const expected = band.offset === 0 ? "GMT" : `GMT${band.offset > 0 ? "+" : ""}${band.offset}`;
      expect(band.label).toBe(expected);
    }
  });

  it("places each band where its own longitudes are, 15 degrees per hour", () => {
    for (const band of timeZoneBands) {
      // the two Date Line zones are half-width by construction; the other 23 are full hours
      const expectedWidth = Math.abs(band.offset) === 12 ? 7.5 : 15;
      expect(band.to - band.from).toBeCloseTo(expectedWidth, 10);
      const centre = band.offset === -12 ? -176.25 : band.offset === 12 ? 176.25 : band.offset * 15;
      expect((band.from + band.to) / 2).toBeCloseTo(centre, 10);
    }
    // Greenwich sits at the middle of the map, the Date Line at its edges
    expect(bandLeft(timeZoneBands.find((band) => band.offset === 0)!)).toBeCloseTo(47.9166, 3);
    expect(bandLeft(timeZoneBands[0])).toBe(0);
  });

  it("gives every populated zone example cities, and says so where there are none", () => {
    for (const band of timeZoneBands) {
      if (band.offset === -12) {
        expect(band.cities).toHaveLength(0);
        expect(band.note).toMatch(/no permanent population/i);
        continue;
      }
      expect(band.cities.length).toBeGreaterThanOrEqual(2);
      for (const city of band.cities) {
        expect(city.city.trim()).not.toBe("");
        expect(city.country.trim()).not.toBe("");
      }
    }
  });

  it("offers every mapped city in the converter, each carrying its own zone", () => {
    const mapped = timeZoneBands.flatMap((band) => band.cities.map((city) => city.city));
    expect(converterCities.map((city) => city.city).sort()).toEqual(mapped.sort());
    for (const city of converterCities) {
      const band = timeZoneBands.find((candidate) => candidate.offset === city.offset)!;
      expect(band.cities.some((candidate) => candidate.city === city.city)).toBe(true);
      expect(city.label).toBe(band.label);
    }
  });
});

describe("shiftClock", () => {
  it("converts eastward and westward against Greenwich", () => {
    // 09:00 in Kuala Lumpur (GMT+8) is 01:00 the same day at Greenwich
    expect(shiftClock(9 * 60, 8, 0)).toEqual({ minutes: 60, dayShift: 0 });
    // ...and 20:00 the previous day in New York (GMT-5)
    expect(shiftClock(9 * 60, 8, -5)).toEqual({ minutes: 20 * 60, dayShift: -1 });
  });

  it("rolls into the next day when the destination is far enough ahead", () => {
    // 23:00 in London is 11:00 the next day in Auckland (GMT+12)
    expect(shiftClock(23 * 60, 0, 12)).toEqual({ minutes: 11 * 60, dayShift: 1 });
  });

  it("leaves the clock alone inside one zone", () => {
    expect(shiftClock(7 * 60 + 30, 8, 8)).toEqual({ minutes: 7 * 60 + 30, dayShift: 0 });
  });

  it("survives the widest crossing on the map", () => {
    // GMT-12 to GMT+12 is a full day apart
    expect(shiftClock(12 * 60, -12, 12)).toEqual({ minutes: 12 * 60, dayShift: 1 });
  });
});

describe("formatting", () => {
  it("pads the clock to HH:MM", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(9 * 60 + 5)).toBe("09:05");
    expect(formatClock(23 * 60 + 59)).toBe("23:59");
  });

  it("describes the difference in the learner's direction of travel", () => {
    // each phrase has to read as the middle of "London is ___ Kuala Lumpur"
    expect(formatOffsetDifference(8, 0)).toBe("8 hours behind");
    expect(formatOffsetDifference(0, 1)).toBe("1 hour ahead of");
    expect(formatOffsetDifference(8, 8)).toBe("on the same clock as");
  });
});
