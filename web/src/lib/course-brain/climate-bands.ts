/**
 * The Chapter 2 "climate zones by latitude" slide, prepared for the interactive band map.
 *
 * The unit body names three kinds of zone and what each one's seasons are. Those sentences
 * are PARSED OUT of the body rather than retyped, so the bands cannot drift from the text —
 * and if the wording ever changes the parse fails closed and the prose renders instead.
 *
 * The latitude boundaries are not in the deck. It draws bands on a map without numbering
 * them, so the Tropics of Cancer and Capricorn (23.5°) and the polar circles (66.5°) are
 * supplied here as the standard values, and the interface says so.
 */
export type ClimateBandKey = "arctic" | "north-mid" | "tropics" | "south-mid" | "antarctic";

export type ClimateBand = {
  key: ClimateBandKey;
  name: string;
  /** Northern and southern edge in degrees, north positive. */
  from: number;
  to: number;
  /** Which of the three descriptions in the body applies to this band. */
  zone: "tropics" | "mid" | "polar";
};

/** North to south, the order they appear down the map. */
export const CLIMATE_BANDS: ClimateBand[] = [
  { key: "arctic", name: "Arctic zone", from: 90, to: 66.5, zone: "polar" },
  { key: "north-mid", name: "Northern mid-latitudes", from: 66.5, to: 23.5, zone: "mid" },
  { key: "tropics", name: "The tropics", from: 23.5, to: -23.5, zone: "tropics" },
  { key: "south-mid", name: "Southern mid-latitudes", from: -23.5, to: -66.5, zone: "mid" },
  { key: "antarctic", name: "Antarctic zone", from: -66.5, to: -90, zone: "polar" },
];

export type ClimateBandText = {
  introduction: string;
  tropics: string;
  mid: string;
  polar: string;
};

/**
 * Splits the body into its three zone sentences. Each is kept whole and verbatim; the map
 * only decides which one to show beside which band.
 */
export function parseClimateBands(body: string): ClimateBandText | null {
  const tropics = /(The tropics[^.]*\.)/.exec(body)?.[1];
  const mid = /(The mid-latitudes[^.]*\.)/.exec(body)?.[1];
  const polar = /(The arctic and antarctic zones[\s\S]*?\.)$/.exec(body.trim())?.[1];
  const introduction = /^([\s\S]*?)\s*The tropics/.exec(body)?.[1]?.trim();
  if (!tropics || !mid || !polar || !introduction) return null;
  return { introduction, tropics, mid, polar };
}

/** Percentage of the map's height where a band starts, on a -90..90 equirectangular base. */
export function bandTop(band: ClimateBand): number {
  return ((90 - band.from) / 180) * 100;
}

export function bandHeight(band: ClimateBand): number {
  return ((band.from - band.to) / 180) * 100;
}

export function formatLatitude(latitude: number): string {
  if (latitude === 0) return "the equator";
  if (latitude === 90) return "the North Pole";
  if (latitude === -90) return "the South Pole";
  return `${Math.abs(latitude)}°${latitude > 0 ? "N" : "S"}`;
}

/** "The five major climate types listed are tropical, dry, ... and highland climates." */
export function parseClimateTypes(body: string): string[] {
  const list = /are ([^.]+)\./.exec(body)?.[1];
  if (!list) return [];
  return list
    .replace(/\s+and\s+/, ", ")
    .split(/,\s*/)
    .map((item) => item.replace(/\s*climates?$/, "").trim())
    .filter(Boolean);
}
