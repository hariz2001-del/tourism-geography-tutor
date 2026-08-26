/**
 * Reference data for the Chapter 3 time-zone explorer.
 *
 * IMPORTANT — this is NOT course content. The course deck teaches the *model*: 24 hourly
 * zones radiating from the Greenwich Meridian in 15-degree steps, up to +12 and -12, with
 * the International Date Line near 180 degrees (chapter-3.pdf p4, p10, p11). The city and
 * country names below are ordinary geographic reference data added to make that model
 * usable, and they are labelled as such in the interface. No unit body was written from
 * them, and nothing here may be promoted into a `content_units` row.
 *
 * Offsets are STANDARD time only. Daylight saving is deliberately excluded — it is
 * seasonal, differs by country and hemisphere, and would make every answer a moving
 * target; the component says so beneath the map.
 *
 * Zones whose legal offset does not match their longitude are the point rather than a
 * defect: a country sets its own clock. The clearest examples in this data are Reykjavik
 * at about 22 degrees west keeping GMT, and Petropavlovsk-Kamchatsky at about 159 degrees
 * east keeping GMT+12 - each roughly one and a half bands from its own meridian. Kuala
 * Lumpur and Singapore are the locally relevant pair, both sitting in the GMT+7 band on
 * GMT+8 clocks. The idealised bands are what the deck teaches; the mismatch is worth seeing.
 *
 * Verified against IANA tzdata 2026c on 2026-08-26 by an independent checking pass. It found
 * two real errors, both from provinces that abolished standard time outright: British
 * Columbia moved to permanent UTC-7 (last clock change 2026-03-08) and Alberta to permanent
 * UTC-6 from November 2026, so Vancouver and Calgary were replaced rather than re-filed.
 * Re-check this file whenever a country changes its offset - it will not fail a test.
 */
export type TimeZoneCity = {
  city: string;
  country: string;
};

export type TimeZoneBand = {
  /** Whole-hour offset from GMT. */
  offset: number;
  /** GMT+8, GMT-5, GMT (for zero). */
  label: string;
  /** Longitude range of the idealised band, degrees east-positive. */
  from: number;
  to: number;
  cities: TimeZoneCity[];
  /** Shown instead of a city list where the band has essentially no permanent population. */
  note?: string;
};

/**
 * The idealised bands: zone n spans 15n - 7.5 to 15n + 7.5 degrees. The two extreme
 * zones are half-width because the Date Line, not a meridian, ends them — which is why
 * the deck can say "up to +12 and -12" and still describe 24 hours of clock time.
 */
export const timeZoneBands: TimeZoneBand[] = [
  { offset: -12, label: "GMT-12", from: -180, to: -172.5, note: "No permanent population — Baker and Howland Islands (United States).", cities: [] },
  { offset: -11, label: "GMT-11", from: -172.5, to: -157.5, cities: [
    { city: "Pago Pago", country: "American Samoa (United States)" },
    { city: "Alofi", country: "Niue" },
  ] },
  { offset: -10, label: "GMT-10", from: -157.5, to: -142.5, cities: [
    { city: "Honolulu", country: "United States" },
    { city: "Papeete", country: "French Polynesia (France)" },
    { city: "Avarua", country: "Cook Islands" },
  ] },
  { offset: -9, label: "GMT-9", from: -142.5, to: -127.5, cities: [
    { city: "Anchorage", country: "United States" },
    { city: "Fairbanks", country: "United States" },
    { city: "Juneau", country: "United States" },
  ] },
  { offset: -8, label: "GMT-8", from: -127.5, to: -112.5, cities: [
    { city: "Los Angeles", country: "United States" },
    { city: "Seattle", country: "United States" },
    { city: "Tijuana", country: "Mexico" },
  ] },
  { offset: -7, label: "GMT-7", from: -112.5, to: -97.5, cities: [
    { city: "Phoenix", country: "United States" },
    { city: "Denver", country: "United States" },
    { city: "Hermosillo", country: "Mexico" },
  ] },
  { offset: -6, label: "GMT-6", from: -97.5, to: -82.5, cities: [
    { city: "Mexico City", country: "Mexico" },
    { city: "Chicago", country: "United States" },
    { city: "Guatemala City", country: "Guatemala" },
  ] },
  { offset: -5, label: "GMT-5", from: -82.5, to: -67.5, cities: [
    { city: "New York", country: "United States" },
    { city: "Toronto", country: "Canada" },
    { city: "Bogotá", country: "Colombia" },
  ] },
  { offset: -4, label: "GMT-4", from: -67.5, to: -52.5, cities: [
    { city: "Santo Domingo", country: "Dominican Republic" },
    { city: "Caracas", country: "Venezuela" },
    { city: "La Paz", country: "Bolivia" },
  ] },
  { offset: -3, label: "GMT-3", from: -52.5, to: -37.5, cities: [
    { city: "São Paulo", country: "Brazil" },
    { city: "Buenos Aires", country: "Argentina" },
    { city: "Montevideo", country: "Uruguay" },
  ] },
  { offset: -2, label: "GMT-2", from: -37.5, to: -22.5, cities: [
    { city: "Vila dos Remédios", country: "Fernando de Noronha, Brazil" },
    { city: "King Edward Point", country: "South Georgia and the South Sandwich Islands" },
  ] },
  { offset: -1, label: "GMT-1", from: -22.5, to: -7.5, cities: [
    { city: "Praia", country: "Cabo Verde" },
    { city: "Ponta Delgada", country: "Portugal" },
    { city: "Mindelo", country: "Cabo Verde" },
  ] },
  { offset: 0, label: "GMT", from: -7.5, to: 7.5, cities: [
    { city: "London", country: "United Kingdom" },
    { city: "Accra", country: "Ghana" },
    { city: "Reykjavík", country: "Iceland" },
  ] },
  { offset: 1, label: "GMT+1", from: 7.5, to: 22.5, cities: [
    { city: "Paris", country: "France" },
    { city: "Berlin", country: "Germany" },
    { city: "Lagos", country: "Nigeria" },
  ] },
  { offset: 2, label: "GMT+2", from: 22.5, to: 37.5, cities: [
    { city: "Cairo", country: "Egypt" },
    { city: "Athens", country: "Greece" },
    { city: "Johannesburg", country: "South Africa" },
  ] },
  { offset: 3, label: "GMT+3", from: 37.5, to: 52.5, cities: [
    { city: "Moscow", country: "Russia" },
    { city: "Nairobi", country: "Kenya" },
    { city: "Riyadh", country: "Saudi Arabia" },
  ] },
  { offset: 4, label: "GMT+4", from: 52.5, to: 67.5, cities: [
    { city: "Dubai", country: "United Arab Emirates" },
    { city: "Baku", country: "Azerbaijan" },
    { city: "Tbilisi", country: "Georgia" },
  ] },
  { offset: 5, label: "GMT+5", from: 67.5, to: 82.5, cities: [
    { city: "Karachi", country: "Pakistan" },
    { city: "Tashkent", country: "Uzbekistan" },
    { city: "Yekaterinburg", country: "Russia" },
  ] },
  { offset: 6, label: "GMT+6", from: 82.5, to: 97.5, cities: [
    { city: "Dhaka", country: "Bangladesh" },
    { city: "Omsk", country: "Russia" },
    { city: "Thimphu", country: "Bhutan" },
  ] },
  { offset: 7, label: "GMT+7", from: 97.5, to: 112.5, cities: [
    { city: "Bangkok", country: "Thailand" },
    { city: "Jakarta", country: "Indonesia" },
    { city: "Hanoi", country: "Vietnam" },
  ] },
  { offset: 8, label: "GMT+8", from: 112.5, to: 127.5, cities: [
    { city: "Kuala Lumpur", country: "Malaysia" },
    { city: "Singapore", country: "Singapore" },
    { city: "Beijing", country: "China" },
  ] },
  { offset: 9, label: "GMT+9", from: 127.5, to: 142.5, cities: [
    { city: "Tokyo", country: "Japan" },
    { city: "Seoul", country: "South Korea" },
    { city: "Yakutsk", country: "Russia" },
  ] },
  { offset: 10, label: "GMT+10", from: 142.5, to: 157.5, cities: [
    { city: "Sydney", country: "Australia" },
    { city: "Brisbane", country: "Australia" },
    { city: "Port Moresby", country: "Papua New Guinea" },
  ] },
  { offset: 11, label: "GMT+11", from: 157.5, to: 172.5, cities: [
    { city: "Nouméa", country: "New Caledonia (France)" },
    { city: "Honiara", country: "Solomon Islands" },
    { city: "Magadan", country: "Russia" },
  ] },
  { offset: 12, label: "GMT+12", from: 172.5, to: 180, cities: [
    { city: "Auckland", country: "New Zealand" },
    { city: "Suva", country: "Fiji" },
    { city: "Petropavlovsk-Kamchatsky", country: "Russia" },
  ] },
];

/** Percentage of the map's width where a band starts, on a -180..180 equirectangular base. */
export function bandLeft(band: TimeZoneBand): number {
  return ((band.from + 180) / 360) * 100;
}

/** Percentage of the map's width a band occupies. */
export function bandWidth(band: TimeZoneBand): number {
  return ((band.to - band.from) / 360) * 100;
}

export type ConverterCity = TimeZoneCity & { offset: number; label: string };

/** Every city on the map, flattened, for the converter's two pickers. */
export const converterCities: ConverterCity[] = timeZoneBands
  .flatMap((band) => band.cities.map((city) => ({ ...city, offset: band.offset, label: band.label })))
  .sort((a, b) => a.city.localeCompare(b.city));

/**
 * Minutes since midnight, shifted by the difference between two whole-hour offsets and
 * wrapped into the next or previous day. Returns the wrapped clock time and which day it
 * lands on relative to the reference city, which is the part learners get wrong.
 */
export function shiftClock(minutesSinceMidnight: number, fromOffset: number, toOffset: number): {
  minutes: number;
  dayShift: -1 | 0 | 1;
} {
  const shifted = minutesSinceMidnight + (toOffset - fromOffset) * 60;
  const dayShift = shifted < 0 ? -1 : shifted >= 24 * 60 ? 1 : 0;
  const minutes = ((shifted % (24 * 60)) + 24 * 60) % (24 * 60);
  return { minutes, dayShift };
}

export function formatClock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Reads as the middle of "London is ___ Kuala Lumpur", so it carries its own preposition. */
export function formatOffsetDifference(fromOffset: number, toOffset: number): string {
  const difference = toOffset - fromOffset;
  if (difference === 0) return "on the same clock as";
  const hours = Math.abs(difference);
  return `${hours} hour${hours === 1 ? "" : "s"} ${difference > 0 ? "ahead of" : "behind"}`;
}
