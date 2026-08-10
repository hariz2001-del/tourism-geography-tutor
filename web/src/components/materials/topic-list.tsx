import Link from "next/link";
import type { ChapterTopic } from "@/lib/course-brain/types";

export default function TopicList({ chapterCode, topics, selectedTopicId }: { chapterCode: string; topics: ChapterTopic[]; selectedTopicId?: string }) {
  return (
    <nav aria-label="Chapter topics">
      {/*
        Below `lg`, a native <details> keeps the topic list collapsed by
        default so a phone doesn't have to scroll past every topic link
        before reaching the page title. At `lg` and up the disclosure is
        forced open and non-interactive (pointer-events-none on the summary,
        restored on the list) so the sidebar keeps its always-visible
        behaviour. `<summary>` is not a heading, so it no longer precedes the
        page `<h1>` in heading order — the `aria-label` on `<nav>` already
        names the region.
      */}
      <details className="lg:pointer-events-none">
        <summary className="cursor-pointer list-none font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted marker:hidden [&::-webkit-details-marker]:hidden lg:pointer-events-none lg:cursor-default">
          Topics
        </summary>
        <ul className="mt-3 space-y-2 border-l border-graticule lg:!block lg:pointer-events-auto">
          {topics.map((topic) => <li key={topic.id}>
            <Link
              aria-current={topic.id === selectedTopicId ? "page" : undefined}
              className={
                topic.id === selectedTopicId
                  ? "-ml-px block border-l-2 border-l-meridian py-2.5 pl-4 text-[0.9375rem] font-medium text-ink-strong transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  : "-ml-px block border-l-2 border-l-transparent py-2.5 pl-4 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:border-l-graticule hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
              }
              href={`/chapters/${chapterCode}?topic=${encodeURIComponent(topic.id)}`}
            >{topic.name}</Link>
          </li>)}
        </ul>
      </details>
    </nav>
  );
}
