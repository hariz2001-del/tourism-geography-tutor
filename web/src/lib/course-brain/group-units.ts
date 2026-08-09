import type { PublishedContentUnit } from "./types";

export type SectionKind = "intro" | "roster" | "overview" | "example" | "takeaway" | "note";
export type SectionLayout = "lead" | "roster" | "grid" | "stack";
export type ContentSectionModel = {
  id: string;
  kind: SectionKind;
  layout: SectionLayout;
  columns: 2 | 3;
  label: string | null; // null for the lead section
  units: PublishedContentUnit[];
};

const ROSTER_RE = /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+)\b/i;
const GRID_MIN_RUN = 3; // a run needs at least 3 units to become a grid
const GRID_MAX_BODY = 280; // …and no body longer than this
const GRID_WIDE_BODY = 140; // …and if no body exceeds this, allow a 3rd column at xl

type RunKind = "roster" | "overview" | "example" | "takeaway" | "note";

type Run = {
  kind: RunKind;
  units: PublishedContentUnit[];
};

function bucket(contentType: string): "overview" | "example" | "takeaway" | "note" {
  if (contentType === "example" || contentType === "case_study") return "example";
  if (contentType === "key_takeaway") return "takeaway";
  if (contentType === "learning_note") return "note";
  return "overview"; // definition, explanation, unknown
}

function isRoster(unit: PublishedContentUnit): boolean {
  return ROSTER_RE.test(unit.title);
}

function words(s: string): number {
  return s.trim().split(/\s+/).length;
}

function sectionLabel(kind: SectionKind, layout: SectionLayout): string | null {
  if (layout === "lead") return null;
  if (layout === "roster") return "At a glance";
  if (kind === "overview" && layout === "grid") return "Entries";
  if (kind === "overview" && layout === "stack") return "Detail";
  if (kind === "example") return "Examples";
  if (kind === "takeaway") return "Key takeaways";
  if (kind === "note") return "Notes";
  return null;
}

export function buildSections(units: PublishedContentUnit[]): ContentSectionModel[] {
  if (units.length === 0) return [];

  // --- step 1: the intro section (0, 1 or 2 units, taken from the front) ---
  const intro: PublishedContentUnit[] = [];
  const u0 = units[0];
  const u1 = units[1];
  const takeU0 =
    isRoster(u0) ||
    u0.contentType !== "definition" ||
    words(u0.title) >= 3 ||
    (u1 !== undefined && isRoster(u1));
  if (takeU0) {
    intro.push(u0);
    if (u1 !== undefined && isRoster(u1) && !isRoster(u0)) {
      intro.push(u1);
    }
  }

  const rest = units.slice(intro.length);

  // --- step 2: split `rest` into maximal contiguous runs ---
  const runs: Run[] = [];
  for (const unit of rest) {
    if (isRoster(unit)) {
      runs.push({ kind: "roster", units: [unit] });
      continue;
    }
    const last = runs[runs.length - 1];
    const unitBucket = bucket(unit.contentType);
    // last.kind === unitBucket already implies last.kind !== "roster", since
    // bucket() never returns "roster" (roster units always take the branch above).
    if (last !== undefined && last.kind === unitBucket) {
      last.units.push(unit);
    } else {
      runs.push({ kind: unitBucket, units: [unit] });
    }
  }

  // --- step 3: choose a layout per run ---
  const sections: ContentSectionModel[] = [];
  let index = 0;

  if (intro.length > 0) {
    sections.push({
      id: `sec-${index}`,
      kind: "intro",
      layout: "lead",
      columns: 2,
      label: sectionLabel("intro", "lead"),
      units: intro,
    });
    index += 1;
  }

  for (const run of runs) {
    const maxBody = Math.max(...run.units.map((u) => u.body.length));
    const canGrid =
      (run.kind === "overview" || run.kind === "example") &&
      run.units.length >= GRID_MIN_RUN &&
      maxBody <= GRID_MAX_BODY;
    const layout: SectionLayout = run.kind === "roster" ? "roster" : canGrid ? "grid" : "stack";
    const columns: 2 | 3 = layout === "grid" && maxBody <= GRID_WIDE_BODY ? 3 : 2;
    const kind: SectionKind = run.kind;
    sections.push({
      id: `sec-${index}`,
      kind,
      layout,
      columns,
      label: sectionLabel(kind, layout),
      units: run.units,
    });
    index += 1;
  }

  return sections;
}

export function shouldShowLabels(sections: ContentSectionModel[]): boolean {
  return sections.filter((section) => section.label !== null).length >= 2;
}
