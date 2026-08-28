import { describe, expect, it } from "vitest";
import { TABLE_UNIT_IDS, toNumber, unitTableFor } from "./unit-tables";
import type { PublishedContentUnit } from "./types";

function unit(id: string, title: string, body: string): PublishedContentUnit {
  return {
    id,
    topicId: "topic",
    title,
    body,
    contentType: "explanation",
    citation: { sourceFile: "chapter-4.pdf", chapterLabel: "Chapter 4", pageOrSlide: 15 },
  };
}

// All five verbatim from their published rows.
const mountains = unit(
  "10376fc0-3ac2-4747-9972-c64ab1e089d4",
  "World's highest mountains",
  "The world's six highest mountains are Mount Everest, also known as Sagarmatha or Chomolungma (8,848 m / 29,029 ft, Mahalangur Himalaya range), K2, also known as Qogir or Godwin Austen (8,611 m / 28,251 ft, Baltoro Karakoram), Kangchenjunga (8,586 m / 28,169 ft, Kangchenjunga Himalaya), Lhotse (8,516 m / 27,940 ft, Mahalangur Himalaya), Makalu (8,485 m / 27,838 ft, Mahalangur Himalaya), and Cho Oyu (8,201 m / 26,864 ft, Mahalangur Himalaya).",
);
const islands = unit(
  "647e35d5-2d4c-4a48-a26c-ae943eb83085",
  "Highest island peaks",
  "The world's five highest island peaks are Puncak Jaya on New Guinea (4,884 m / 16,024 ft, Indonesia, also Papua New Guinea), Mauna Kea on Hawaii (4,205 m / 13,796 ft, United States), Mount Kinabalu on Borneo (4,095 m / 13,435 ft, Malaysia, also Brunei/Indonesia), Jade Mountain (Yu Shan) on Taiwan (3,952 m / 12,966 ft, Republic of China), and Mount Kerinci on Sumatra (3,805 m / 12,484 ft, Indonesia).",
);
const landmasses = unit(
  "dbdbc094-1f0b-4804-a65a-7f118991f5f1",
  "Continental landmasses",
  "Each continental landmass has its own highest point: Afro-Eurasia's highest point is Mount Everest (8,848 m, Nepal/China); the Americas' highest point is Aconcagua (6,962 m, Argentina); Antarctica's highest point is Vinson Massif (4,892 m, no country); and Australia's highest point is Mount Kosciuszko (2,228 m, Australia).",
);
const deserts = unit(
  "0e758a6f-0982-4546-a408-12056d168c5b",
  "Largest deserts",
  "The nine largest deserts in the world by area are the Antarctic (13,829,430 km²), Sahara (9,100,000+ km²), Arabian (2,330,000 km²), Gobi (1,300,000 km²), Kalahari (900,000 km²), Patagonian (670,000 km²), Great Victoria (647,000 km²), Syrian (520,000 km²), and Great Basin (492,000 km²).",
);
const water = unit(
  "0b0aa4a1-67fa-484f-9dce-f385fdf71e91",
  "Largest bodies of water by area",
  "Ranked by area, the ten largest bodies of water in the world are the Pacific Ocean, Atlantic Ocean, Indian Ocean, Arctic Ocean, Arabian Sea, South China Sea, Caribbean Sea, Mediterranean Sea, Bering Sea, and Bay of Bengal — ranging from the Pacific's 64,196,000 sq mi (166,266,877 km²) down to the Bay of Bengal's 838,612 sq mi (2,171,995 km²).",
);

describe("tables rebuilt from their unit bodies", () => {
  it("covers every unit whose figure is a screenshot", () => {
    expect(TABLE_UNIT_IDS).toHaveLength(5);
    for (const source of [mountains, islands, landmasses, deserts, water]) {
      expect(unitTableFor(source)).not.toBeNull();
    }
  });

  it("builds the mountains table, folding the alternative names into one cell", () => {
    const table = unitTableFor(mountains)!;
    expect(table.rows).toHaveLength(6);
    expect(table.rows[0]).toMatchObject({
      rank: "1",
      mountain: "Mount Everest / Sagarmatha / Chomolungma",
      metres: "8,848",
      feet: "29,029",
      range: "Mahalangur Himalaya range",
    });
    expect(table.rows[5]).toMatchObject({ rank: "6", mountain: "Cho Oyu", metres: "8,201" });
    expect(table.source?.url).toContain("List_of_highest_mountains");
  });

  it("splits the island peaks into peak, island and country", () => {
    const table = unitTableFor(islands)!;
    expect(table.rows).toHaveLength(5);
    expect(table.rows[0]).toMatchObject({
      island: "New Guinea",
      peak: "Puncak Jaya",
      metres: "4,884",
      country: "Indonesia",
      others: "Papua New Guinea",
    });
    expect(table.rows[2]).toMatchObject({ peak: "Mount Kinabalu", island: "Borneo" });
  });

  it("builds the landmasses table, keeping 'no country' as the deck writes it", () => {
    const table = unitTableFor(landmasses)!;
    expect(table.rows).toHaveLength(4);
    expect(table.rows[0]).toMatchObject({ landmass: "Afro-Eurasia", point: "Mount Everest", country: "Nepal/China", feet: "29,029" });
    expect(table.rows[2]).toMatchObject({ landmass: "Antarctica", country: "no country" });
  });

  it("keeps the deserts' own figures, including the Sahara's open-ended one", () => {
    const table = unitTableFor(deserts)!;
    expect(table.rows).toHaveLength(9);
    expect(table.rows[0]).toMatchObject({ desert: "Antarctic", region: "Antarctica", area: "13,829,430 km²", squareMiles: "5,339,573 mi²" });
    expect(table.rows[1].area).toBe("9,100,000+ km²");
  });

  /**
   * This unit names all ten bodies of water but transcribes only the first and last areas.
   * The other eight are read off the slide's own table, and the table says so.
   */
  it("fills the bodies of water the note left out, and admits where they came from", () => {
    const table = unitTableFor(water)!;
    expect(table.rows).toHaveLength(10);
    expect(table.rows[0]).toMatchObject({ water: "Pacific Ocean", area: "64,196,000 sq mi (166,266,877 km²)" });
    expect(table.rows[5]).toMatchObject({ water: "South China Sea" });
    expect(table.rows[9]).toMatchObject({ water: "Bay of Bengal", area: "838,612 sq mi (2,171,995 km²)" });
    expect(table.note).toMatch(/slide's own table/);
  });

  it("keeps every ranked table in descending order", () => {
    for (const [source, key] of [[mountains, "metres"], [islands, "metres"], [deserts, "area"], [water, "area"]] as const) {
      const values = unitTableFor(source)!.rows.map((row) => toNumber(row[key]));
      expect(values).toEqual([...values].sort((a, b) => b - a));
    }
  });


  /**
   * Four of the five figures are Wikipedia screenshots and say so. The bodies-of-water one is
   * not — no links, no Wikipedia furniture, and figures that match no current article — so it
   * claims no source at all rather than a plausible-looking wrong one.
   */
  it("links only the tables that really came from an article", () => {
    for (const source of [mountains, islands, landmasses, deserts]) {
      expect(unitTableFor(source)!.source?.url).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
    }
    expect(unitTableFor(water)!.source).toBeUndefined();
  });

  it("says where a column came from when the learning note does not carry it", () => {
    expect(unitTableFor(deserts)!.note).toMatch(/slide's own table/);
    expect(unitTableFor(landmasses)!.note).toMatch(/feet/);
  });
  it("fails closed on a reworded body, so the prose and the slide's figure stay", () => {
    expect(unitTableFor(unit(mountains.id, mountains.title, "The six highest mountains are all in Asia."))).toBeNull();
    expect(unitTableFor(unit(water.id, water.title, "The ten largest bodies of water are listed on the slide."))).toBeNull();
    expect(unitTableFor(unit("not-a-table-unit", "Something else", "Any text at all."))).toBeNull();
  });
});
