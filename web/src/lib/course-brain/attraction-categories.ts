import type { PublishedContentUnit } from "./types";

/**
 * The seven categories of physical tourist attraction, and the cards in Chapter 4 that cover
 * each one.
 *
 * The deck draws these as a wheel: a hub reading "PHYSICAL TOURIST ATTRACTION" with seven
 * bubbles around it, on a slide half filled with decorative leaves. As a picture it says only
 * that seven things exist. But every one of those seven is taught in this chapter, in cards
 * scattered across five other topics — so the wheel is really the chapter's own index, drawn
 * as a diagram that cannot be clicked.
 *
 * The categories are PARSED OUT of the unit body rather than retyped, so the wheel and the
 * sentence beneath it cannot disagree; if the body is ever reworded past recognition the
 * parser fails closed and the page falls back to the deck's own figure.
 *
 * The unit lists are the editorial part: which card belongs under which heading is a judgement,
 * and it is made here in one place rather than scattered through a component. A test checks
 * every id against the published rows, so a re-imported unit cannot silently vanish from a
 * category.
 */
export type AttractionCategory = {
  key: string;
  /** The category name as the unit body gives it. */
  name: string;
  unitIds: string[];
  /** Something the deck's heading promises that the chapter never teaches. */
  gap?: string;
};

/**
 * Where a category names something no card in the chapter covers.
 *
 * Both of these are the deck's own gaps, not oversights in the filing below: the slide groups
 * "deserts and valleys" and "islands and beaches", and Chapter 4 defines deserts and islands
 * but never a valley or a beach. Flagged rather than filled in.
 */
const CATEGORY_GAPS: Record<string, string> = {
  "deserts-and-valleys": "The slide's heading names valleys, but Chapter 4 has no card that teaches one.",
  "islands-and-beaches": "The slide's heading names beaches, but Chapter 4 has no card that teaches one.",
};

/**
 * Chapter 4's cards, filed under the deck's seven headings.
 *
 * Two judgement calls worth knowing about: a fiord is filed under seas and oceans because the
 * deck defines it as an inlet of the sea, and a glacier under rivers and lakes because the
 * deck calls it "a mass or river of ice". Neither is the only defensible answer.
 */
const CATEGORY_UNIT_IDS: Record<string, string[]> = {
  "natural-landscape": [
    "2d67b8a0-9232-4918-9b10-9570fa80f03e", // Natural landscape
    "15c93c2f-a904-4d1b-bec5-6275c231cf68", // Nature-based tourism and natural resources
  ],
  "hills-and-mountains": [
    "1e70ba18-cb53-40d3-a29e-4ec49ceb26d9", // Mountain compared with hill
    "10376fc0-3ac2-4747-9972-c64ab1e089d4", // World's highest mountains
    "647e35d5-2d4c-4a48-a26c-ae943eb83085", // Highest island peaks
    "c91a07a5-dd5b-4db2-9f5d-3d4e8b56d8ad", // Mountain ranges of the world
    "c53e4367-7dec-4941-91c3-c6917f3961bf", // Tourism and mountains
    "d0887588-5176-4ed4-bc95-b7658bc61ac1", // Mount Kinabalu mountain tourism
  ],
  "rivers-and-lakes": [
    "974cab55-ca48-456d-8048-44d23cb932f1", // River
    "d73748a8-24d7-4c3c-832e-cbc546eea9ae", // Lake
    "a46327c7-105d-4034-b217-620132142f42", // Waterfall
    "6dd27876-4919-40bb-8f15-21a2468c8029", // Springs
    "2b2a285e-1dec-482e-abb0-805e54fb6d97", // Glacier
  ],
  "seas-and-oceans": [
    "7edee181-e0ff-4b2e-b2e5-6824ec89752b", // Ocean
    "f71a055b-9482-405c-b693-83cb2a9dbbb0", // Sea
    "f2488806-2439-45a2-bfff-e6966b6f1623", // Gulf
    "ce182424-77f5-44e9-ba6a-c9a07932cc80", // Bay
    "014b51e6-3595-4f81-823b-16f091870b56", // Fiord
  ],
  "islands-and-beaches": [
    "971fd72e-38c8-473b-96ef-b1c7c8204d53", // Island
    "ae492e89-3265-45c4-8d4d-838761569a4d", // Cays
    "53ea1015-3e72-4d7f-867e-77f2ca172e82", // Atoll
    "8bb2eaca-0afd-45c8-8ecb-d9a3d0209a99", // Peninsula
    "d3433b55-cb3b-4529-8498-4f8cf6f1ac77", // Coral reef
    "14c2ee87-9d53-4daa-ae84-97463e30d7e8", // Lagoon
  ],
  "deserts-and-valleys": [
    "145feea9-9cbf-4aef-a558-55b5cfbf79ea", // Desert
    "0e758a6f-0982-4546-a408-12056d168c5b", // Largest deserts
  ],
  plateaus: [
    "e55a19ac-f045-454e-9a37-786b141b5ddd", // Plateau as a high plain
    "878c9c02-45dc-4f6c-8129-4d380170ed87", // Tibetan Plateau
    "1138811c-18d8-4258-ba5f-159420bf9563", // Andean Plateau
    "d1a1ea5b-5513-4f8c-b4aa-db472c36543e", // Antarctic Plateau
  ],
};

export function categoryKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

/**
 * The seven categories, read out of the unit that lists them.
 *
 * Fails closed: anything other than the deck's seven returns null, and the page shows the
 * slide's own wheel instead of a half-built one.
 */
export function attractionCategories(body: string): AttractionCategory[] | null {
  const listed = /grouped into categories:\s*(.+?)\.\s*$/.exec(body.trim());
  if (!listed) return null;

  const names = listed[1]
    .split(/,\s*(?:and\s+)?/)
    .map((name) => name.trim())
    .filter(Boolean);
  if (names.length !== 7) return null;

  return names.map((name) => {
    const key = categoryKey(name);
    return { key, name, unitIds: CATEGORY_UNIT_IDS[key] ?? [], gap: CATEGORY_GAPS[key] };
  });
}

/** The category's cards, in the order the chapter teaches them, skipping any not published. */
export function unitsForCategory(category: AttractionCategory, chapterUnits: PublishedContentUnit[]): PublishedContentUnit[] {
  const byId = new Map(chapterUnits.map((unit) => [unit.id, unit]));
  return category.unitIds.map((id) => byId.get(id)).filter((unit): unit is PublishedContentUnit => Boolean(unit));
}

export const ATTRACTION_CATEGORY_UNIT_IDS = CATEGORY_UNIT_IDS;
