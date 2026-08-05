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
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Tourism Geography Tutor
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Learn from approved course materials.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Explore reviewed material, practise with source-linked questions, and ask
          for explanations grounded in your course content.
        </p>
        <div>
          <Link
            className="inline-flex rounded-md bg-slate-900 px-5 py-3 font-semibold text-white outline-offset-4 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-slate-900"
            href="/chapters/CH1"
          >
            Start Chapter 1
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Tourism Geography Tutor
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Learn from approved course materials.
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Explore reviewed material by topic, practise with source-linked questions, and ask
          for explanations grounded in your course content.
        </p>
      </div>

      <div className="space-y-8">
        {chaptersWithTopics.map(({ chapter, topics }) => (
          <section key={chapter.code} className="space-y-3 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-950">
                <Link className="hover:underline focus-visible:outline-2 focus-visible:outline-slate-900" href={`/chapters/${chapter.code}`}>
                  {chapter.code}
                  {chapter.title && chapter.title !== chapter.code ? `: ${chapter.title}` : ""}
                </Link>
              </h2>
              <span className="whitespace-nowrap text-sm text-slate-600">
                {topics.length} {topics.length === 1 ? "topic" : "topics"}
              </span>
            </div>
            {topics.length ? (
              <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <Link
                      className="text-slate-800 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-800 focus-visible:outline-2 focus-visible:outline-slate-900"
                      href={`/chapters/${chapter.code}?topic=${encodeURIComponent(topic.id)}`}
                    >
                      {topic.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-700">No approved material is available for this chapter yet.</p>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
