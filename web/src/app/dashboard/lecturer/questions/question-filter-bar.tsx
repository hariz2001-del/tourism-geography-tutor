"use client";

import { useRouter, useSearchParams } from "next/navigation";

const selectClass =
  "min-h-11 rounded-card border border-graticule bg-surface px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";

export default function QuestionFilterBar({
  chapters,
  topics,
  current,
}: {
  chapters: string[];
  topics: Array<{ id: string; name: string; chapterCode: string }>;
  current: { chapter?: string; topic?: string; type?: string; status?: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // A chapter change can orphan the selected topic, so drop it.
    if (key === "chapter") next.delete("topic");
    router.push(`/dashboard/lecturer/questions?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label htmlFor="filter-chapter" className="block font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
          Chapter
        </label>
        <select id="filter-chapter" className={selectClass} value={current.chapter ?? ""} onChange={(event) => apply("chapter", event.target.value)}>
          <option value="">All</option>
          {chapters.map((chapter) => <option key={chapter} value={chapter}>{chapter}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-topic" className="block font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
          Topic
        </label>
        <select id="filter-topic" className={`${selectClass} max-w-[16rem]`} value={current.topic ?? ""} onChange={(event) => apply("topic", event.target.value)}>
          <option value="">All</option>
          {topics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-type" className="block font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
          Type
        </label>
        <select id="filter-type" className={selectClass} value={current.type ?? ""} onChange={(event) => apply("type", event.target.value)}>
          <option value="">All</option>
          <option value="mcq">Multiple choice</option>
          <option value="subjective">Written</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="filter-status" className="block font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
          Status
        </label>
        <select id="filter-status" className={selectClass} value={current.status ?? ""} onChange={(event) => apply("status", event.target.value)}>
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}
