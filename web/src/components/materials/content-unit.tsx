"use client";

import { useEffect, useState } from "react";
import type { PublishedContentUnit } from "@/lib/course-brain/types";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  definition: "Definition",
  explanation: "Explanation",
  example: "Example",
  key_takeaway: "Key takeaway",
  case_study: "Case study",
};

export default function ContentUnit({ unit }: { unit: PublishedContentUnit }) {
  const isExample = unit.contentType === "example";
  const label = CONTENT_TYPE_LABELS[unit.contentType];
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

  return (
    <article
      id={anchorId}
      data-highlighted={isHighlighted}
      className={`space-y-3 rounded-lg border p-5 shadow-sm transition-shadow duration-700 ${
        isExample ? "border-amber-300 bg-amber-50" : "border-slate-300 bg-white"
      } ${isHighlighted ? "ring-4 ring-sky-400" : ""}`}
    >
      {label ? (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
            isExample ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-700"
          }`}
        >
          {label}
        </span>
      ) : null}
      <h2 className="text-xl font-bold text-slate-950">{unit.title}</h2>
      <p className="leading-7 text-slate-800">{unit.body}</p>
    </article>
  );
}
