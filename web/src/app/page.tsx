import Link from "next/link";
import OpenTutorButton from "@/components/tutor/open-tutor-button";
import { formatChapterLabel } from "@/lib/course-brain/chapter-label";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
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
  // The course is for signed-in learners only; the proxy turns anonymous traffic
  // away first, but a page may never rely on that alone.
  await requireProfile();
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
    <main className="mx-auto flex min-h-screen w-full max-w-[76rem] flex-col gap-10 px-5 py-8 sm:px-6 sm:py-12">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-meridian/20 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-meridian)_12%,var(--color-surface)),var(--color-surface)_52%,color-mix(in_oklab,var(--color-relief)_12%,var(--color-surface)))] px-6 py-8 shadow-[0_18px_46px_rgb(28_63_91_/_9%)] sm:px-9 sm:py-11">
        <div aria-hidden="true" className="absolute -right-10 -top-14 h-48 w-48 rounded-full border-[18px] border-meridian/10" />
        <div aria-hidden="true" className="absolute -bottom-20 right-28 h-40 w-40 rounded-full border-[14px] border-relief/10" />
        <div className="relative max-w-3xl space-y-5">
          <p className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-meridian">Your study space</p>
          <h1 className="font-display text-[2.75rem]/[1.04] font-semibold tracking-[-0.03em] text-ink-strong md:text-[4rem]">Learn the world,<br className="hidden sm:block" /> one place at a time.</h1>
          <p className="max-w-[58ch] text-[1.125rem]/[1.65] text-ink">Build confidence with short, clear study notes, visual examples, flashcards, and practice questions based on your Tourism Geography course.</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link className="inline-flex min-h-12 items-center rounded-full bg-meridian px-6 font-semibold text-chart shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href={`/chapters/${firstChapterCode}`}>Start learning <span aria-hidden="true" className="ml-2">→</span></Link>
            <OpenTutorButton className="inline-flex min-h-12 items-center rounded-full border border-meridian/25 bg-surface/80 px-6 font-semibold text-meridian transition-colors hover:border-meridian hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian">Ask the tutor</OpenTutorButton>
            <Link className="inline-flex min-h-12 items-center rounded-full px-4 font-semibold text-deep underline decoration-deep/30 underline-offset-4 hover:text-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href="/flashcards">Try flashcards</Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="study-flow-heading" className="rounded-card border border-graticule bg-surface/80 p-5 shadow-[0_8px_24px_rgb(28_63_91_/_5%)] sm:p-6">
        <h2 id="study-flow-heading" className="font-display text-xl font-semibold text-ink-strong">A calm study rhythm</h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {[
            ["01", "Read", "Choose a chapter and study one topic at a time."],
            ["02", "Ask", "Use the tutor when a definition or example is unclear."],
            ["03", "Review", "Recall key ideas with flashcards, then practise with focused questions."],
          ].map(([number, title, detail], index) => (
            <li key={number} className="mt-5 grid grid-cols-[2.25rem_1fr] gap-3">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full font-mono text-xs font-semibold ${index === 0 ? "bg-meridian/12 text-meridian" : index === 1 ? "bg-deep/10 text-deep" : "bg-relief/12 text-relief"}`} aria-hidden="true">{number}</span>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-strong">{title}</h3>
                <p className="mt-1 text-[0.9375rem]/[1.55] text-ink-muted">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="space-y-8">
        {chaptersWithTopics.map(({ chapter, topics }, index) => (
          <section key={chapter.code} className={`chapter-card chapter-card-${index % 4} space-y-4 rounded-card border bg-surface/95 p-5 sm:p-6`}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-[1.5rem] font-semibold text-ink-strong">
                <Link className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href={`/chapters/${chapter.code}`}>
                  {formatChapterLabel(chapter.code)}
                  {chapter.title && chapter.title !== chapter.code ? `: ${chapter.title}` : ""}
                </Link>
              </h2>
              <span className="whitespace-nowrap rounded-full bg-chart px-3 py-1 font-mono text-[0.75rem] text-ink-muted">
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
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {/* Every card repeats these three labels, so each link names its own chapter for screen readers. */}
              <Link aria-label={`Explore ${formatChapterLabel(chapter.code)}`} className="font-semibold text-meridian underline decoration-meridian/30 underline-offset-4 hover:decoration-meridian" href={`/chapters/${chapter.code}`}>Explore chapter</Link>
              <Link aria-label={`${formatChapterLabel(chapter.code)} flashcards`} className="font-medium text-deep underline decoration-deep/30 underline-offset-4 hover:decoration-deep" href={`/flashcards?chapter=${encodeURIComponent(chapter.code)}`}>Flashcards</Link>
              <Link aria-label={`${formatChapterLabel(chapter.code)} mini exam`} className="font-medium text-relief underline decoration-relief/30 underline-offset-4 hover:decoration-relief" href={`/practice/chapter?chapter=${encodeURIComponent(chapter.code)}`}>Mini exam</Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
