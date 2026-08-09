import Link from "next/link";
import type { ChapterTopic } from "@/lib/course-brain/types";

export default function TopicList({ chapterCode, topics, selectedTopicId }: { chapterCode: string; topics: ChapterTopic[]; selectedTopicId?: string }) {
  return (
    <nav aria-label="Chapter topics">
      <h2 className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Topics</h2>
      <ul className="mt-3 space-y-2 border-l border-graticule">
        {topics.map((topic) => <li key={topic.id}>
          <Link
            aria-current={topic.id === selectedTopicId ? "page" : undefined}
            className={
              topic.id === selectedTopicId
                ? "-ml-px block border-l-2 border-l-meridian py-1.5 pl-4 text-[0.9375rem] font-medium text-ink-strong transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                : "-ml-px block border-l-2 border-l-transparent py-1.5 pl-4 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:border-l-graticule hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            }
            href={`/chapters/${chapterCode}?topic=${encodeURIComponent(topic.id)}`}
          >{topic.name}</Link>
        </li>)}
      </ul>
    </nav>
  );
}
