import Link from "next/link";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";
import type { Chapter, ChapterTopic } from "@/lib/course-brain/types";

type ChapterWithTopics = { chapter: Chapter; topics: ChapterTopic[] };

async function loadChaptersWithTopics(): Promise<ChapterWithTopics[] | null> {
  try {
    const repository = createServerCourseBrainRepository();
    const chapters = await repository.listChapters();
    return await Promise.all(
      chapters.map(async (chapter) => ({
        chapter,
        topics: await repository.listChapterTopics(chapter.code),
      })),
    );
  } catch {
    return null;
  }
}

export default async function Home() {
  const chaptersWithTopics = await loadChaptersWithTopics();

  if (!chaptersWithTopics) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[52rem] flex-col justify-center gap-6 px-6 py-16">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          Tourism Geography Tutor
        </p>
        <h1 className="font-display text-[2.5rem]/[1.1] font-semibold tracking-[-0.02em] text-ink-strong md:text-[3.25rem]">
          Learn from approved course materials.
        </h1>
        <p className="max-w-[62ch] text-[1.25rem]/[1.55] text-ink">
          Explore reviewed material, practise with source-linked questions, and ask
          for explanations grounded in your course content.
        </p>
        <div>
          <Link
            className="inline-flex rounded-card bg-meridian px-5 py-3 font-medium text-chart transition-colors duration-150 hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            href="/chapters/CH1"
          >
            Start Chapter 1
          </Link>
          <Link
            className="ml-4 inline-flex rounded-card border border-meridian px-5 py-3 font-medium text-meridian transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            href="/practice/course"
          >
            Full course exam
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[52rem] flex-col gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          Tourism Geography Tutor
        </p>
        <h1 className="font-display text-[2.5rem]/[1.1] font-semibold tracking-[-0.02em] text-ink-strong md:text-[3.25rem]">
          Learn from approved course materials.
        </h1>
        <p className="max-w-[62ch] text-[1.25rem]/[1.55] text-ink">
          Explore reviewed material by topic, practise with source-linked questions, and ask
          for explanations grounded in your course content.
        </p>
      </div>

      <div className="space-y-8">
        {chaptersWithTopics.map(({ chapter, topics }) => (
          <section key={chapter.code} className="space-y-3 rounded-card border border-graticule bg-surface p-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">
                <Link className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href={`/chapters/${chapter.code}`}>
                  {chapter.code}
                  {chapter.title && chapter.title !== chapter.code ? `: ${chapter.title}` : ""}
                </Link>
              </h2>
              <span className="whitespace-nowrap font-mono text-[0.8125rem] text-ink-muted">
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>
            </div>
            {topics.length ? (
              <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      className="text-ink underline decoration-graticule underline-offset-4 transition-colors duration-150 hover:decoration-meridian hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                      href={`/chapters/${chapter.code}?topic=${encodeURIComponent(topic.id)}`}
                    >
                      {topic.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink-muted">No approved material is available for this chapter yet.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="font-medium text-meridian underline underline-offset-4" href={`/practice/chapter?chapter=${encodeURIComponent(chapter.code)}`}>Chapter mini exam</Link>
              <Link className="font-medium text-meridian underline underline-offset-4" href="/practice/course">Full course exam</Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
