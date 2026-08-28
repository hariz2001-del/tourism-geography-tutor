/**
 * The lines the Chapter 3 globe draws, and the maths that puts them on it.
 *
 * The deck shows two flat pictures of a globe — one ruled with parallels, one with
 * meridians — and asserts the thing they cannot show: that parallels stay parallel and
 * shrink toward the poles while meridians all meet there. A globe that turns shows it.
 *
 * The five principal parallels and their order are the deck's own (p3). Their latitudes are
 * not: the slide names them without numbering them, so the degrees are added reference and
 * the interface tags them.
 */
export type PrincipalLine = {
  key: string;
  /** As the deck names it. */
  name: string;
  latitude: number;
  /** True where the latitude is added rather than stated by the deck. */
  latitudeIsAdded: boolean;
};

export const PRINCIPAL_PARALLELS: PrincipalLine[] = [
  { key: "arctic-circle", name: "Arctic Circle", latitude: 66.5, latitudeIsAdded: true },
  { key: "tropic-of-cancer", name: "Tropic of Cancer", latitude: 23.5, latitudeIsAdded: true },
  { key: "equator", name: "Equator", latitude: 0, latitudeIsAdded: true },
  { key: "tropic-of-capricorn", name: "Tropic of Capricorn", latitude: -23.5, latitudeIsAdded: true },
  { key: "antarctic-circle", name: "Antarctic Circle", latitude: -66.5, latitudeIsAdded: true },
];

/** The order the deck lists them in, north to south, so a parse can be checked against it. */
export function principalNamesFrom(body: string): string[] {
  const list = /listed are ([^.]+)\./.exec(body)?.[1];
  if (!list) return [];
  return list
    .replace(/,?\s+and\s+/, ", ")
    .split(/,\s*/)
    .map((name) => name.trim().replace(/^the\s+/i, ""))
    .filter(Boolean);
}

export type Point = { x: number; y: number; visible: boolean };

/**
 * Orthographic projection: the view you get looking at a globe from far away, which is what
 * the deck's own pictures are. `rotation` turns it about the poles, `tilt` leans the pole
 * toward or away from the viewer. Points on the far side come back `visible: false` so the
 * caller can drop them rather than drawing a flat disc of overlapping lines.
 */
export function project(
  longitude: number,
  latitude: number,
  rotation: number,
  tilt: number,
  radius: number,
): Point {
  const lambda = ((longitude + rotation) * Math.PI) / 180;
  const phi = (latitude * Math.PI) / 180;
  const tiltRadians = (tilt * Math.PI) / 180;

  const x = Math.cos(phi) * Math.sin(lambda);
  const y = Math.sin(phi);
  const z = Math.cos(phi) * Math.cos(lambda);

  // lean the globe: rotate about the horizontal axis
  const y2 = y * Math.cos(tiltRadians) - z * Math.sin(tiltRadians);
  const z2 = y * Math.sin(tiltRadians) + z * Math.cos(tiltRadians);

  return { x: x * radius, y: -y2 * radius, visible: z2 >= 0 };
}

/** Screen point back to a position on the globe, or null when the pointer is off the sphere. */
export function unproject(
  x: number,
  y: number,
  rotation: number,
  tilt: number,
  radius: number,
): { longitude: number; latitude: number } | null {
  const nx = x / radius;
  const ny = -y / radius;
  const squared = nx * nx + ny * ny;
  if (squared > 1) return null;

  const nz = Math.sqrt(1 - squared);
  const tiltRadians = (-tilt * Math.PI) / 180;
  const y2 = ny * Math.cos(tiltRadians) - nz * Math.sin(tiltRadians);
  const z2 = ny * Math.sin(tiltRadians) + nz * Math.cos(tiltRadians);

  const latitude = (Math.asin(Math.max(-1, Math.min(1, y2))) * 180) / Math.PI;
  const longitude = (Math.atan2(nx, z2) * 180) / Math.PI - rotation;
  return { latitude, longitude: normaliseLongitude(longitude) };
}

export function normaliseLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

/** "20°E", "66.5°N", "the equator" — the labels the globe writes on itself. */
export function formatLatitude(latitude: number, withName = false): string {
  const rounded = Math.round(latitude * 10) / 10;
  if (rounded === 0) return withName ? "0° (the equator)" : "0°";
  return `${Math.abs(rounded)}°${rounded > 0 ? "N" : "S"}`;
}

export function formatLongitude(longitude: number): string {
  const rounded = Math.round(normaliseLongitude(longitude) * 10) / 10;
  if (rounded === 0) return "0° (the Prime Meridian)";
  if (Math.abs(rounded) === 180) return "180°";
  return `${Math.abs(rounded)}°${rounded > 0 ? "E" : "W"}`;
}

/**
 * The deck's own arithmetic: 360 degrees in 24 hours is 15 degrees an hour, so a meridian's
 * distance from Greenwich is also a number of hours. Returns "GMT+3", "GMT" and so on.
 */
export function hoursFromGreenwich(longitude: number): string {
  const hours = Math.round(normaliseLongitude(longitude) / 15);
  if (hours === 0) return "GMT";
  return `GMT${hours > 0 ? "+" : ""}${hours}`;
}
