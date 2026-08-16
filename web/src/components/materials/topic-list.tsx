import Link from "next/link";
import type { ChapterTopic } from "@/lib/course-brain/types";

export default function TopicList({ chapterCode, topics, selectedTopicId }: { chapterCode: string; topics: ChapterTopic[]; selectedTopicId?: string }) {
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId);
  const topicLinks = topics.map((topic) => <li key={topic.id}>
    <Link
      aria-current={topic.id === selectedTopicId ? "page" : undefined}
      className={
        topic.id === selectedTopicId
          ? "-ml-px flex min-h-11 items-center border-l-2 border-l-meridian bg-meridian/12 px-4 py-2 text-[0.9375rem] font-semibold text-ink-strong transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          : "-ml-px flex min-h-11 items-center border-l-2 border-l-transparent px-4 py-2 text-[0.9375rem] text-ink-muted transition-colors duration-150 hover:border-l-graticule hover:text-ink active:bg-meridian/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
      }
      href={`/chapters/${chapterCode}?topic=${encodeURIComponent(topic.id)}`}
    >{topic.name}</Link>
  </li>);

  return (
    <nav aria-label="Chapter topics">
      <details open={topics.length <= 4} className="rounded-card border border-graticule bg-surface lg:hidden">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-4 py-2 marker:hidden [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Topics</span>
            <span className="mt-0.5 block font-medium text-ink-strong">{selectedTopic?.name ?? `${topics.length} topics`}</span>
          </span>
          <span aria-hidden="true" className="font-mono text-lg text-meridian">⌄</span>
        </summary>
        <ul className="border-t border-graticule">{topicLinks}</ul>
      </details>
      <div className="hidden lg:block">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-muted">Topics</p>
        <ul className="mt-3 border-l border-graticule">{topicLinks}</ul>
      </div>
    </nav>
  );
}
