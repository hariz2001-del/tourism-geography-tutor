import type { ContentSectionModel, SectionKind } from "@/lib/course-brain/group-units";
import type { PublishedContentUnit } from "@/lib/course-brain/types";
import BookmarkToggle from "./bookmark-toggle";
import ContentUnit from "./content-unit";

const HEADER_ACCENT: Record<SectionKind, string> = {
  intro: "text-ink-muted",
  roster: "text-deep",
  overview: "text-ink-muted",
  example: "text-relief",
  takeaway: "text-lowland",
  note: "text-ink-muted",
};

const HEADER_RULE: Record<SectionKind, string> = {
  intro: "bg-ink-muted",
  roster: "bg-deep",
  overview: "bg-ink-muted",
  example: "bg-relief",
  takeaway: "bg-lowland",
  note: "bg-ink-muted",
};

export default function ContentSection({
  section,
  showLabel,
  isFirst,
  bookmarkedUnitIds,
}: {
  section: ContentSectionModel;
  showLabel: boolean;
  isFirst: boolean;
  // Undefined for anonymous visitors and lecturers: saving is a learner feature,
  // so the control is absent rather than present-but-inert.
  bookmarkedUnitIds?: Set<string>;
}) {
  const hasHeader = showLabel && section.label !== null;
  const dividerClass = isFirst ? "" : "border-t border-graticule pt-8";

  function bookmarkFor(unit: PublishedContentUnit) {
    if (!bookmarkedUnitIds) return null;
    return (
      <BookmarkToggle
        contentUnitId={unit.id}
        title={unit.title}
        initiallySaved={bookmarkedUnitIds.has(unit.id)}
      />
    );
  }

  return (
    <section className={dividerClass}>
      {hasHeader ? (
        <div className="mb-3 flex items-center gap-2.5">
          <span aria-hidden="true" className={`h-px w-6 ${HEADER_RULE[section.kind]}`} />
          <h2 className={`font-mono text-[0.6875rem]/[1.2] font-medium uppercase tracking-[0.14em] ${HEADER_ACCENT[section.kind]}`}>
            {section.label}
          </h2>
        </div>
      ) : section.layout !== "lead" ? <h2 className="sr-only">{section.label ?? "Topic overview"}</h2> : null}
      {renderBody(section, bookmarkFor)}
    </section>
  );
}

type BookmarkFor = (unit: PublishedContentUnit) => React.ReactNode;

function renderBody(section: ContentSectionModel, bookmarkFor: BookmarkFor) {
  if (section.layout === "lead") {
    const [lead, roster] = section.units;
    return (
      <div className="space-y-2">
        <ContentUnit unit={lead} variant="lead" bookmark={bookmarkFor(lead)} />
        {roster ? (
          <div className="mt-4 border-t border-graticule pt-4">
            <ContentUnit unit={roster} variant="roster" bookmark={bookmarkFor(roster)} />
          </div>
        ) : null}
      </div>
    );
  }

  if (section.layout === "roster") {
    return <ContentUnit unit={section.units[0]} variant="roster" bookmark={bookmarkFor(section.units[0])} />;
  }

  if (section.layout === "grid") {
    return (
      <div className={`grid gap-3 sm:grid-cols-2 ${section.columns === 3 ? "xl:grid-cols-3" : ""}`}>
        {section.units.map((unit, i) => (
          <ContentUnit key={unit.id} unit={unit} variant="entry" index={i + 1} kind={section.kind} bookmark={bookmarkFor(unit)} />
        ))}
      </div>
    );
  }

  // layout === "stack"
  // bucket() groups a run by kind, so "takeaway" and "note" stacks are always
  // internally uniform — the badge would repeat the section label and is
  // suppressed. An "overview" stack can legitimately mix content_types
  // (definition + explanation), so keep the badge there when they differ.
  const allSameType = section.units.every((u) => u.contentType === section.units[0].contentType);
  const showBadge = section.kind === "overview" && !allSameType;
  return (
    <div className="space-y-3">
      {section.units.map((unit) => (
        <ContentUnit
          key={unit.id}
          unit={unit}
          variant={section.kind === "takeaway" ? "takeaway" : section.kind === "note" ? "note" : "stack"}
          showBadge={showBadge}
          bookmark={bookmarkFor(unit)}
        />
      ))}
    </div>
  );
}
