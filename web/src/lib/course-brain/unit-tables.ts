import type { PublishedContentUnit } from "./types";

/**
 * The Chapter 4 tables, rebuilt as tables.
 *
 * Five of this chapter's figures are screenshots of Wikipedia — blue links, footnote markers
 * and all — pasted into the deck at whatever resolution they happened to be. As pictures they
 * cannot be read on a phone, searched, or read aloud. Each one is rebuilt here from the unit
 * body that already transcribes it, so the table and the sentence cannot disagree, and each
 * carries a link to the article it came from.
 *
 * The link is labelled as the source *as the slide captured it*, deliberately. Wikipedia has
 * moved on — it now gives Everest as 8,849 m where the slide says 8,848, and its desert list
 * has gained entries the slide does not have. The deck's figures stay the deck's.
 *
 * Every parser fails closed: an unparseable body renders the prose and the original figure
 * instead of a half-built table.
 */
export type TableColumn = {
  key: string;
  label: string;
  numeric?: boolean;
  /** Cells hold country names, which the table prints with the country's flag. */
  country?: boolean;
  /** Cells name a place that has a photograph to preview. */
  place?: boolean;
};
export type TableRow = Record<string, string>;

export type UnitTable = {
  columns: TableColumn[];
  rows: TableRow[];
  /** The Wikipedia article the slide screenshotted, where the figure shows it came from one. */
  source?: { label: string; url: string };
  /** Anything a reader needs to know about where a column's values came from. */
  note?: string;
};

const RANK = { key: "rank", label: "#", numeric: true };

/** "8,848" -> comparable number, for the assertion that a ranked table really is ranked. */
export function toNumber(value: string): number {
  return Number(value.replace(/[^\d.]/g, ""));
}

function splitList(body: string, after: string): string[] {
  const index = body.indexOf(after);
  if (index < 0) return [];
  return body
    .slice(index + after.length)
    .replace(/\.\s*$/, "")
    .split(/\),\s*(?:and\s+)?/)
    .map((part) => (part.endsWith(")") ? part : `${part})`))
    .map((part) => part.trim())
    .filter(Boolean);
}

function highestMountains(body: string): UnitTable | null {
  const rows: TableRow[] = [];
  for (const [index, item] of splitList(body, "highest mountains are ").entries()) {
    const match = /^(.+?)\s*\(([\d,]+) m \/ ([\d,]+) ft,\s*(.+)\)$/.exec(item);
    if (!match) return null;
    rows.push({
      rank: String(index + 1),
      mountain: match[1].replace(/,\s*also known as\s*/i, " / ").replace(/\s+or\s+/g, " / "),
      metres: match[2],
      feet: match[3],
      range: match[4],
    });
  }
  if (rows.length < 2) return null;
  return {
    columns: [RANK, { key: "mountain", label: "Mountain", place: true }, { key: "metres", label: "Height (m)", numeric: true }, { key: "feet", label: "Height (ft)", numeric: true }, { key: "range", label: "Range" }],
    rows,
    source: { label: "List of highest mountains on Earth", url: "https://en.wikipedia.org/wiki/List_of_highest_mountains_on_Earth" },
  };
}

function islandPeaks(body: string): UnitTable | null {
  const rows: TableRow[] = [];
  for (const [index, item] of splitList(body, "highest island peaks are ").entries()) {
    const match = /^(.+?) on (.+?)\s*\(([\d,]+) m \/ ([\d,]+) ft,\s*(.+)\)$/.exec(item);
    if (!match) return null;
    // "Indonesia, also Papua New Guinea" is two of the slide's columns in one phrase
    const [country, ...others] = match[5].split(/,\s*also\s*/);
    rows.push({
      rank: String(index + 1),
      island: match[2],
      peak: match[1],
      metres: match[3],
      feet: match[4],
      country,
      others: others.join(", "),
    });
  }
  if (rows.length < 2) return null;
  return {
    columns: [
      RANK,
      { key: "island", label: "Island" },
      { key: "peak", label: "Highest point", place: true },
      { key: "metres", label: "Height (m)", numeric: true },
      { key: "feet", label: "Height (ft)", numeric: true },
      { key: "country", label: "Country holding the peak", country: true },
      { key: "others", label: "Others on the island", country: true },
    ],
    rows,
    source: { label: "List of islands by highest point", url: "https://en.wikipedia.org/wiki/List_of_islands_by_highest_point" },
  };
}

/** Heights in feet, and the ranking, are on the slide's table but not in its learning note. */
const LANDMASS_FEET: Record<string, string> = {
  "Afro-Eurasia": "29,029",
  Americas: "22,841",
  Antarctica: "16,050",
  Australia: "7,310",
};

function continentalLandmasses(body: string): UnitTable | null {
  const rows: TableRow[] = [];
  for (const part of body.split(";")) {
    // "Antarctica's" but "the Americas'" — the possessive may or may not carry its own s
    const match = /(?:^|\s)(?:the\s+)?([A-Z][\w-]*(?:\s[A-Z][\w-]*)*)['’]s? highest point is (.+?)\s*\(([\d,]+) m,\s*(.+?)\)/.exec(part);
    if (!match) continue;
    rows.push({
      rank: String(rows.length + 1),
      landmass: match[1],
      point: match[2],
      metres: match[3],
      feet: LANDMASS_FEET[match[1]] ?? "",
      country: match[4],
    });
  }
  if (rows.length < 2) return null;
  return {
    columns: [
      RANK,
      { key: "landmass", label: "Continental land mass" },
      { key: "point", label: "Highest point", place: true },
      { key: "metres", label: "Height (m)", numeric: true },
      { key: "feet", label: "Height (ft)", numeric: true },
      { key: "country", label: "Country", country: true },
    ],
    rows,
    note: "Heights in feet come from the slide's own table; the learning note gives only metres.",
    // Same article as the island peaks above it, which is why both tables share the deck's p19:
    // the continental landmasses sit at the end of that list, for comparison.
    source: { label: "List of land masses by highest point", url: "https://en.wikipedia.org/wiki/List_of_land_masses_by_highest_point" },
  };
}

/** The region and the square-mile column are on the slide's table, not in its learning note. */
const DESERT_EXTRAS: Record<string, { region: string; squareMiles: string }> = {
  Antarctic: { region: "Antarctica", squareMiles: "5,339,573" },
  Sahara: { region: "Africa", squareMiles: "3,320,000+" },
  Arabian: { region: "Middle East", squareMiles: "900,000" },
  Gobi: { region: "Asia", squareMiles: "500,000" },
  Kalahari: { region: "Africa", squareMiles: "360,000" },
  Patagonian: { region: "South America", squareMiles: "260,000" },
  "Great Victoria": { region: "Australia", squareMiles: "250,000" },
  Syrian: { region: "Middle East", squareMiles: "200,000" },
  "Great Basin": { region: "North America", squareMiles: "190,000" },
};

function largestDeserts(body: string): UnitTable | null {
  const rows: TableRow[] = [];
  for (const item of splitList(body, "by area are ")) {
    const match = /^(?:the\s+)?(.+?)\s*\(([\d,+]+) km²\)$/.exec(item);
    if (!match) return null;
    const name = match[1].trim();
    const extra = DESERT_EXTRAS[name];
    rows.push({
      rank: String(rows.length + 1),
      desert: name,
      region: extra?.region ?? "",
      area: `${match[2]} km²`,
      squareMiles: extra ? `${extra.squareMiles} mi²` : "",
    });
  }
  if (rows.length < 2) return null;
  return {
    columns: [
      RANK,
      { key: "desert", label: "Desert", place: true },
      { key: "region", label: "Region" },
      { key: "area", label: "Area (km²)", numeric: true },
      { key: "squareMiles", label: "Area (mi²)", numeric: true },
    ],
    rows,
    note: "Regions and square miles come from the slide's own table; the learning note gives only names and square kilometres.",
    source: { label: "List of deserts by area", url: "https://en.wikipedia.org/wiki/List_of_deserts_by_area" },
  };
}

/**
 * The one table whose learning note is thinner than the slide: it names all ten bodies of water
 * but gives only the first and last areas. The other eight are read off the slide's own table
 * rather than fetched from anywhere — same source, simply never transcribed — and the note under
 * the table says so.
 */
const BODIES_OF_WATER_AREAS: Record<string, string> = {
  "Pacific Ocean": "64,196,000 sq mi (166,266,877 km²)",
  "Atlantic Ocean": "33,400,000 sq mi (86,505,603 km²)",
  "Indian Ocean": "28,400,000 sq mi (73,555,662 km²)",
  "Arctic Ocean": "5,100,000 sq mi (13,208,939 km²)",
  "Arabian Sea": "1,491,000 sq mi (3,861,672 km²)",
  "South China Sea": "1,148,000 sq mi (2,973,306 km²)",
  "Caribbean Sea": "971,000 sq mi (2,514,878 km²)",
  "Mediterranean Sea": "969,000 sq mi (2,509,698 km²)",
  "Bering Sea": "873,000 sq mi (2,261,060 km²)",
  "Bay of Bengal": "838,612 sq mi (2,171,995 km²)",
};

function largestBodiesOfWater(body: string): UnitTable | null {
  const list = /largest bodies of water in the world are (.+?)\s*—/.exec(body)?.[1];
  if (!list) return null;
  const names = list
    .replace(/,?\s+and\s+/, ", ")
    .split(/,\s*/)
    .map((name) => name.replace(/^the\s+/i, "").trim())
    .filter(Boolean);
  if (names.length < 2 || names.some((name) => !BODIES_OF_WATER_AREAS[name])) return null;
  return {
    columns: [RANK, { key: "water", label: "Body of water" }, { key: "area", label: "Square miles (square kilometres)", numeric: true }],
    rows: names.map((name, index) => ({ rank: String(index + 1), water: name, area: BODIES_OF_WATER_AREAS[name] })),
    // No hover previews on this column either: a photograph of open water tells a reader
    // nothing about *which* water it is, and the location maps that would are drawn in five
    // different styles. A mountain or a desert looks like itself; a sea does not.
    // No source link here on purpose: unlike the other four, this figure carries no links or
    // Wikipedia furniture, and its numbers match no current article, so nothing can be claimed.
    note: "The learning note gives the first and last areas; the eight between them are read from the slide's own table.",
  };
}

/** unit id -> the table that replaces its screenshot. */
const BUILDERS: Record<string, (body: string) => UnitTable | null> = {
  "10376fc0-3ac2-4747-9972-c64ab1e089d4": highestMountains,
  "647e35d5-2d4c-4a48-a26c-ae943eb83085": islandPeaks,
  "dbdbc094-1f0b-4804-a65a-7f118991f5f1": continentalLandmasses,
  "0e758a6f-0982-4546-a408-12056d168c5b": largestDeserts,
  "0b0aa4a1-67fa-484f-9dce-f385fdf71e91": largestBodiesOfWater,
};

export function unitTableFor(unit: PublishedContentUnit): UnitTable | null {
  const build = BUILDERS[unit.id];
  return build ? build(unit.body) : null;
}

export const TABLE_UNIT_IDS = Object.keys(BUILDERS);
