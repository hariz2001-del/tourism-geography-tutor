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
  const firstChapterCode = chaptersWithTopics?.[0]?.chapter.code ?? "CH1";

  if (!chaptersWithTopics) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-[52rem] flex-col justify-center gap-6 px-6 py-16">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          Tourism Geography Tutor
        </p>
        <h1 className="font-display text-[2.5rem]/[1.1] font-semibold tracking-[-0.02em] text-ink-strong md:text-[3.25rem]">
          Build your Tourism Geography knowledge.
        </h1>
        <p className="max-w-[62ch] text-[1.25rem]/[1.55] text-ink">
          Explore topics, practise with focused questions, and ask the tutor for
          clear explanations.
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
            href="/flashcards"
          >
            Review flashcards
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
          Build your Tourism Geography knowledge.
        </h1>
        <p className="max-w-[62ch] text-[1.25rem]/[1.55] text-ink">
          Explore topics, practise with focused questions, and ask the tutor for
          clear explanations.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            href={`/chapters/${firstChapterCode}`}
          >
            Start learning
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-5 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            href={`/chapters/${firstChapterCode}#tutor`}
          >
            Ask the tutor
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-5 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            href="/flashcards"
          >
            Review flashcards
          </Link>
        </div>
      </div>

      <section aria-labelledby="study-flow-heading" className="border-y border-graticule py-5">
        <h2 id="study-flow-heading" className="sr-only">How to study</h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {[
            ["01", "Read", "Choose a chapter and study one topic at a time."],
            ["02", "Ask", "Use the tutor when a definition or example is unclear."],
            ["03", "Review", "Recall key ideas with flashcards, then practise with focused questions."],
          ].map(([number, title, detail]) => (
            <li key={number} className="grid grid-cols-[2rem_1fr] gap-2">
              <span className="font-mono text-xs text-meridian" aria-hidden="true">{number}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-strong">{title}</h3>
                <p className="mt-1 text-[0.9375rem]/[1.55] text-ink-muted">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

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
              <p className="text-ink-muted">This chapter does not have any topics yet.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link className="font-medium text-meridian underline underline-offset-4" href={`/flashcards?chapter=${encodeURIComponent(chapter.code)}`}>Chapter flashcards</Link>
              <Link className="font-medium text-meridian underline underline-offset-4" href={`/practice/chapter?chapter=${encodeURIComponent(chapter.code)}`}>Chapter mini exam</Link>
              <Link className="font-medium text-meridian underline underline-offset-4" href="/practice/course">Full course exam</Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
