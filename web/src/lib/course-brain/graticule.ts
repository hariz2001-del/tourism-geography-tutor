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
  /**
   * What the line marks. Added reference, not the deck's: the slide names the five lines
   * without explaining any of them, and the only one the course describes elsewhere is the
   * Equator (its own card in "Earth systems and global divisions"), which the globe quotes
   * alongside this. Source: `PRINCIPAL_LINE_SOURCE`.
   */
  description: string;
};

export const PRINCIPAL_LINE_SOURCE = "Encyclopædia Britannica";

export const PRINCIPAL_PARALLELS: PrincipalLine[] = [
  {
    key: "arctic-circle",
    name: "Arctic Circle",
    latitude: 66.5,
    latitudeIsAdded: true,
    description:
      "The southern edge of the Arctic. North of it the Sun stays up for a full 24 hours at least once a year, around the June solstice, and stays down for 24 hours around the December solstice.",
  },
  {
    key: "tropic-of-cancer",
    name: "Tropic of Cancer",
    latitude: 23.5,
    latitudeIsAdded: true,
    description:
      "The furthest north the Sun is ever directly overhead at noon, which happens once a year at the June solstice. It marks the northern edge of the tropics.",
  },
  {
    key: "equator",
    name: "Equator",
    latitude: 0,
    latitudeIsAdded: true,
    description:
      "The 0° line, halfway between the poles. It divides the Earth into the Northern and Southern Hemispheres, and latitude is measured north and south from it.",
  },
  {
    key: "tropic-of-capricorn",
    name: "Tropic of Capricorn",
    latitude: -23.5,
    latitudeIsAdded: true,
    description:
      "The furthest south the Sun is ever directly overhead at noon, which happens once a year at the December solstice. It marks the southern edge of the tropics.",
  },
  {
    key: "antarctic-circle",
    name: "Antarctic Circle",
    latitude: -66.5,
    latitudeIsAdded: true,
    description:
      "The northern edge of the Antarctic. South of it the Sun stays up for a full 24 hours at least once a year, around the December solstice, and stays down for 24 hours around the June solstice.",
  },
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

/**
 * The rotation and tilt that bring a point to the middle of the globe's face.
 *
 * `project` puts a point dead centre when its longitude plus the rotation is zero, and when the
 * tilt equals its latitude — so those are the settings. Tilt is held to ±80°, the same limit a
 * drag has, so a pin at a pole leans the globe right over without flipping it.
 */
export function faceTowards(longitude: number, latitude: number): { rotation: number; tilt: number } {
  return { rotation: -normaliseLongitude(longitude), tilt: Math.max(-80, Math.min(80, latitude)) };
}

/**
 * What a learner types into the pin box: "3.1", "-101.7", "3.1 N", "101.7E" or "66.5°S".
 *
 * A letter sets the hemisphere, so it must be the right kind for the axis (N or S for latitude,
 * E or W for longitude) and the number in front of it must not also carry a minus sign — "5 S"
 * or "-5" is fine, "-5 S" says south twice and could mean either. Anything out of range comes
 * back null rather than being wrapped or clamped into a place the learner did not ask for.
 */
export function parseCoordinate(text: string, axis: "latitude" | "longitude"): number | null {
  const match = /^\s*([+-]?\d+(?:\.\d+)?)\s*°?\s*([NSEWnsew])?\s*$/.exec(text);
  if (!match) return null;
  let value = Number(match[1]);
  const hemisphere = match[2]?.toUpperCase();
  if (hemisphere) {
    const allowed = axis === "latitude" ? "NS" : "EW";
    if (!allowed.includes(hemisphere) || match[1].startsWith("-")) return null;
    if (hemisphere === "S" || hemisphere === "W") value = -value;
  }
  const limit = axis === "latitude" ? 90 : 180;
  return Math.abs(value) <= limit ? value : null;
}

/**
 * The hemispheres a place is in: "Northern and Eastern hemispheres". A place exactly on a
 * dividing line is in neither half of that pair, so the line is named instead — "Northern
 * hemisphere, on the Prime Meridian", or "on the Equator and the 180° meridian".
 */
export function hemispheresOf(longitude: number, latitude: number): string {
  const lat = Math.round(latitude * 10) / 10;
  const lon = Math.round(normaliseLongitude(longitude) * 10) / 10;
  const meridianLine = lon === 0 ? "the Prime Meridian" : Math.abs(lon) === 180 ? "the 180° meridian" : null;
  const northSouth = lat > 0 ? "Northern" : "Southern";
  const eastWest = lon > 0 ? "Eastern" : "Western";

  if (lat === 0 && meridianLine) return `on the Equator and ${meridianLine}`;
  if (lat === 0) return `${eastWest} hemisphere, on the Equator`;
  if (meridianLine) return `${northSouth} hemisphere, on ${meridianLine}`;
  return `${northSouth} and ${eastWest} hemispheres`;
}
