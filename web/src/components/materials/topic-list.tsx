import Link from "next/link";
import type { ChapterTopic } from "@/lib/course-brain/types";

export default function TopicList({ chapterCode, topics, selectedTopicId }: { chapterCode: string; topics: ChapterTopic[]; selectedTopicId?: string }) {
  return (
    <nav aria-label="Chapter topics">
      <h2 className="font-bold text-slate-950">Topics</h2>
      <ul className="mt-3 space-y-2">
        {topics.map((topic) => <li key={topic.id}>
          <Link
            aria-current={topic.id === selectedTopicId ? "page" : undefined}
            className={topic.id === selectedTopicId ? "block rounded bg-slate-200 p-2 font-semibold" : "block rounded p-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-900"}
            href={`/chapters/${chapterCode}?topic=${encodeURIComponent(topic.id)}`}
          >{topic.name}</Link>
        </li>)}
      </ul>
    </nav>
  );
}
