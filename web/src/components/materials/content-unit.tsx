"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { contentImages } from "@/lib/course-brain/content-images";
import type { SectionKind } from "@/lib/course-brain/group-units";
import type { PublishedContentUnit } from "@/lib/course-brain/types";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  definition: "Definition",
  explanation: "Explanation",
  example: "Example",
  key_takeaway: "Key takeaway",
  case_study: "Case study",
  learning_note: "Note",
};

const BADGE_ACCENT: Record<string, string> = {
  example: "text-relief",
  case_study: "text-relief",
  key_takeaway: "text-lowland",
  learning_note: "text-ink-muted",
};

const STACK_ACCENT_BORDER: Record<"overview" | "example" | "note", string> = {
  overview: "border-l-graticule",
  example: "border-l-relief",
  note: "border-l-ink-muted",
};

type Variant = "lead" | "roster" | "entry" | "stack" | "takeaway" | "note";

function stackKindOf(variant: Variant, contentType: string): "overview" | "example" | "note" {
  if (variant === "note") return "note";
  if (contentType === "example" || contentType === "case_study") return "example";
  if (contentType === "learning_note") return "note";
  return "overview";
}

function UnitImage({ unitId }: { unitId: string }) {
  const image = contentImages[unitId];
  if (!image) return null;
  return (
    <div className="mb-3 overflow-hidden rounded-card border border-graticule bg-white">
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className="h-auto w-full" />
      {image.caption ? (
        <p className="border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem] text-ink-muted">{image.caption}</p>
      ) : null}
    </div>
  );
}

export default function ContentUnit({
  unit,
  variant,
  index,
  showBadge,
  kind,
}: {
  unit: PublishedContentUnit;
  variant: Variant;
  index?: number;
  showBadge?: boolean;
  kind?: SectionKind;
}) {
  const label = CONTENT_TYPE_LABELS[unit.contentType];
  const badgeAccent = BADGE_ACCENT[unit.contentType] ?? "text-ink-muted";
  const anchorId = `unit-${unit.id}`;
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;
    function checkHash() {
      if (window.location.hash !== `#${anchorId}`) return;
      setIsHighlighted(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setIsHighlighted(false), 1800);
    }
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => {
      window.removeEventListener("hashchange", checkHash);
      window.clearTimeout(timeoutId);
    };
  }, [anchorId]);

  const highlightRing = isHighlighted ? "ring-2 ring-meridian" : "";

  if (variant === "lead") {
    return (
      <article
        id={anchorId}
        data-highlighted={isHighlighted}
        className={`scroll-mt-8 space-y-2 border-l-2 border-l-meridian pb-2 pl-5 ${highlightRing}`}
      >
        <UnitImage unitId={unit.id} />
        <h2 className="font-display text-[1.1875rem]/[1.35] font-semibold text-ink-strong">{unit.title}</h2>
        <p className="max-w-[62ch] text-[1.25rem]/[1.55] text-ink">{unit.body}</p>
      </article>
    );
  }

  if (variant === "roster") {
    return (
      <article
        id={anchorId}
        data-highlighted={isHighlighted}
        className={`scroll-mt-8 rounded-card border border-graticule border-l-2 border-l-deep bg-deep/6 p-5 ${highlightRing}`}
      >
        <UnitImage unitId={unit.id} />
        <h3 className="font-display text-[1.1875rem]/[1.35] font-semibold text-deep">{unit.title}</h3>
        <p className="text-[1.0625rem]/[1.7] text-ink">{unit.body}</p>
      </article>
    );
  }

  if (variant === "entry") {
    const exampleAccent = kind === "example" ? "border-l-2 border-l-relief" : "";
    return (
      <article
        id={anchorId}
        data-highlighted={isHighlighted}
        className={`relative flex h-full flex-col scroll-mt-8 rounded-card border border-graticule ${exampleAccent} bg-surface px-4 pt-4 pb-3.5 transition-colors duration-150 hover:border-meridian/50 ${highlightRing}`}
      >
        {index !== undefined ? (
          <span aria-hidden="true" className="absolute right-3 top-3 font-mono text-[0.8125rem]/[1.5] tabular-nums text-ink-muted">
            {String(index).padStart(2, "0")}
          </span>
        ) : null}
        <UnitImage unitId={unit.id} />
        <h3 className="pr-8 font-display text-[1.0625rem]/[1.35] font-semibold text-ink-strong">{unit.title}</h3>
        <p className="mt-1.5 text-[0.9375rem]/[1.6] text-ink">{unit.body}</p>
      </article>
    );
  }

  if (variant === "takeaway") {
    return (
      <article
        id={anchorId}
        data-highlighted={isHighlighted}
        className={`scroll-mt-8 space-y-2 rounded-card border border-lowland/30 bg-lowland/8 p-5 ${highlightRing}`}
      >
        <UnitImage unitId={unit.id} />
        {showBadge ? (
          <span className="block font-mono text-[0.6875rem]/[1.2] font-medium uppercase tracking-[0.14em] text-lowland">KEY TAKEAWAY</span>
        ) : null}
        <h3 className="font-display text-[1.1875rem]/[1.35] font-semibold text-ink-strong">{unit.title}</h3>
        <p className="text-[1.0625rem]/[1.7] text-ink">{unit.body}</p>
      </article>
    );
  }

  // variant === "stack" or "note"
  const stackKind = stackKindOf(variant, unit.contentType);
  const accentBorder = STACK_ACCENT_BORDER[stackKind];
  const surfaceFill = stackKind === "example" ? "bg-relief/5" : "bg-surface";
  return (
    <article
      id={anchorId}
      data-highlighted={isHighlighted}
      className={`scroll-mt-8 space-y-3 rounded-card border border-graticule border-l-2 p-5 transition-colors duration-150 ${accentBorder} ${surfaceFill} ${highlightRing}`}
    >
      <UnitImage unitId={unit.id} />
      {showBadge && label ? (
        <span className={`font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] ${badgeAccent}`}>{label}</span>
      ) : null}
      <h3 className="font-display text-[1.1875rem]/[1.35] font-semibold text-ink-strong">{unit.title}</h3>
      <p className="max-w-[68ch] text-[1.0625rem]/[1.7] text-ink">{unit.body}</p>
    </article>
  );
}
