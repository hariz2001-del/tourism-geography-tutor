import { describe, expect, it } from "vitest";
import { buildSections, shouldShowLabels } from "./group-units";
import type { PublishedContentUnit } from "./types";

let counter = 0;
function unit(overrides: Partial<PublishedContentUnit> & Pick<PublishedContentUnit, "title" | "body" | "contentType">): PublishedContentUnit {
  counter += 1;
  return {
    id: `unit-${counter}`,
    topicId: "topic-1",
    citation: { sourceFile: "course.pdf", chapterLabel: "Chapter", pageOrSlide: 1 },
    ...overrides,
  };
}

describe("buildSections", () => {
  it("returns [] for an empty topic", () => {
    expect(buildSections([])).toEqual([]);
  });

  it("shapes 'The seven continents': lead(2) then a single 7-unit entries grid", () => {
    const units = [
      unit({ title: "Define a continent", body: "A continent is a large, continuous landmass.", contentType: "definition" }),
      unit({ title: "The seven continents", body: "There are seven continents on Earth.", contentType: "definition" }),
      unit({ title: "Asia", body: "The largest and most populous continent.", contentType: "definition" }),
      // deliberately long (146 chars, matching the spec's acceptance table) to force 2 columns, not 3
      unit({ title: "Africa", body: "x".repeat(146), contentType: "definition" }),
      unit({ title: "North America", body: "Third-largest continent, spanning Canada to Panama.", contentType: "definition" }),
      unit({ title: "South America", body: "Home to the Amazon rainforest and the Andes.", contentType: "definition" }),
      unit({ title: "Europe", body: "A continent of many small, densely populated nations.", contentType: "definition" }),
      unit({ title: "Antarctica", body: "The coldest, driest continent, covered in ice.", contentType: "definition" }),
      unit({ title: "Australia", body: "The smallest continent, also called Oceania.", contentType: "definition" }),
    ];

    const sections = buildSections(units);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ kind: "intro", layout: "lead", label: null });
    expect(sections[0].units).toHaveLength(2);
    expect(sections[0].units.map((u) => u.title)).toEqual(["Define a continent", "The seven continents"]);

    expect(sections[1]).toMatchObject({ kind: "overview", layout: "grid", label: "Entries" });
    expect(sections[1].units).toHaveLength(7);
  });

  it("shapes 'Water environments': no lead, entries grid -> example -> entries grid", () => {
    const glossaryBody = "A short glossary-style definition of a water body."; // 52 chars: <= GRID_WIDE_BODY (140) -> 3 columns
    const wideBody = "x".repeat(150); // > GRID_WIDE_BODY (140), <= GRID_MAX_BODY (280) -> stays a grid, but only 2 columns

    const units = [
      // no lead: short-title, non-roster definition, followed by a non-roster unit
      unit({ title: "Ocean", body: wideBody, contentType: "definition" }),
      unit({ title: "Sea", body: wideBody, contentType: "definition" }),
      unit({ title: "Bay", body: wideBody, contentType: "definition" }),
      unit({ title: "Gulf", body: wideBody, contentType: "definition" }),
      unit({ title: "Strait", body: wideBody, contentType: "definition" }),
      // a single example run -> stays a stack (run length 1 < GRID_MIN_RUN), labelled "Examples"
      unit({ title: "The Persian Gulf", body: "An example of a gulf used heavily for tourism.", contentType: "example" }),
      // eleven short glossary definitions -> grid, 3 columns (max body <= GRID_WIDE_BODY)
      // (letters, not digits/number-words, in the titles -- ROSTER_RE also matches bare digits)
      ...["Estuary", "Lagoon", "Fjord", "Delta", "Wetland", "Marsh", "Reservoir", "Aquifer", "Tributary", "Watershed", "Floodplain"].map((title) =>
        unit({ title, body: glossaryBody, contentType: "definition" }),
      ),
    ];

    const sections = buildSections(units);

    expect(sections.map((s) => s.layout)).toEqual(["grid", "stack", "grid"]);
    expect(sections.map((s) => s.kind)).toEqual(["overview", "example", "overview"]);
    expect(sections.map((s) => s.label)).toEqual(["Entries", "Examples", "Entries"]);
    expect(sections[0].units).toHaveLength(5);
    expect(sections[0].columns).toBe(2); // wideBody > GRID_WIDE_BODY
    expect(sections[1].units).toHaveLength(1);
    expect(sections[2].units).toHaveLength(11);
    expect(sections[2].columns).toBe(3); // glossaryBody <= GRID_WIDE_BODY
  });

  it("keeps 'Push and pull factors' as a stack when bodies are long, even with a run of 4", () => {
    const longBody = "x".repeat(460);
    const units = [
      unit({ title: "Push and pull factors", body: "An overview of what drives and attracts tourists.", contentType: "explanation" }),
      unit({ title: "Escape and self-discovery", body: longBody, contentType: "definition" }),
      unit({ title: "Rest and relaxation", body: longBody, contentType: "definition" }),
      unit({ title: "Scenic beauty", body: longBody, contentType: "definition" }),
      unit({ title: "Historical areas", body: longBody, contentType: "definition" }),
    ];

    const sections = buildSections(units);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ kind: "intro", layout: "lead" });
    expect(sections[1]).toMatchObject({ kind: "overview", layout: "stack", label: "Detail" });
    expect(sections[1].units).toHaveLength(4);
  });

  it("grids all four units of 'Forms of tourism' as one entries grid", () => {
    const units = [
      unit({ title: "Domestic", body: "Tourism within one's own country.", contentType: "definition" }),
      unit({ title: "International", body: "Tourism that crosses a national border.", contentType: "definition" }),
      unit({ title: "Inbound", body: "Visitors arriving from abroad.", contentType: "definition" }),
      unit({ title: "Outbound", body: "Residents travelling abroad.", contentType: "definition" }),
    ];

    const sections = buildSections(units);

    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({ kind: "overview", layout: "grid", label: "Entries" });
    expect(sections[0].units).toHaveLength(4);
  });

  it("suppresses labels for a 2-unit stub topic (Highland-climate shape)", () => {
    const units = [
      unit({ title: "Highland climates", body: "Climate that varies sharply with elevation.", contentType: "explanation" }),
      unit({ title: "The Andes example", body: "Highland climate zones found in the Andes.", contentType: "example" }),
    ];

    const sections = buildSections(units);

    expect(sections).toHaveLength(2);
    expect(sections[0]).toMatchObject({ kind: "intro", layout: "lead", label: null });
    expect(sections[1]).toMatchObject({ kind: "example", label: "Examples" });
    expect(shouldShowLabels(sections)).toBe(false);
  });
});

describe("shouldShowLabels", () => {
  it("requires at least two labelled sections", () => {
    expect(shouldShowLabels([
      { id: "sec-0", kind: "intro", layout: "lead", columns: 2, label: null, units: [] },
      { id: "sec-1", kind: "overview", layout: "grid", columns: 2, label: "Entries", units: [] },
    ])).toBe(false);

    expect(shouldShowLabels([
      { id: "sec-0", kind: "overview", layout: "grid", columns: 2, label: "Entries", units: [] },
      { id: "sec-1", kind: "example", layout: "stack", columns: 2, label: "Examples", units: [] },
    ])).toBe(true);
  });
});
