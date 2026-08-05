import type { PublishedContentUnit } from "@/lib/course-brain/types";
import CitationCard from "../tutor/citation-card";

export default function ContentUnit({ unit }: { unit: PublishedContentUnit }) {
  return (
    <article className="space-y-3 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">{unit.title}</h2>
      <p className="leading-7 text-slate-800">{unit.body}</p>
      <CitationCard citation={unit.citation} />
    </article>
  );
}
