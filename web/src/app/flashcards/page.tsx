import type { Metadata } from "next";
import Link from "next/link";
import FlashcardDeck from "@/components/flashcards/flashcard-deck";
import type { Chapter, Flashcard } from "@/lib/course-brain/types";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Flashcards | Tourism Geography Tutor",
  description: "Review Tourism Geography definitions and key ideas with focused flashcards.",
};

type FlashcardData = { cards: Flashcard[]; chapters: Chapter[] };

async function loadFlashcards(): Promise<FlashcardData | null> {
  try {
    const repository = createServerCourseBrainRepository();
    const chapters = await repository.listChapters();
    const [units, topicsByChapter] = await Promise.all([
      repository.getAllPublishedContent(),
      Promise.all(chapters.map(async (chapter) => ({
        chapter,
        topics: await repository.listChapterTopics(chapter.code),
      }))),
    ]);
    const topicDetails = new Map(
      topicsByChapter.flatMap(({ chapter, topics }) => topics.map((topic) => [topic.id, {
        chapterCode: chapter.code,
        chapterTitle: chapter.title,
        topicName: topic.name,
      }] as const)),
    );
    const cards = units.flatMap((unit): Flashcard[] => {
      if (unit.contentType !== "definition" && unit.contentType !== "key_takeaway") return [];
      const topic = topicDetails.get(unit.topicId);
      if (!topic) return [];
      return [{
        id: unit.id,
        title: unit.title,
        answer: unit.body,
        contentType: unit.contentType,
        chapterCode: topic.chapterCode,
        chapterTitle: topic.chapterTitle,
        topicId: unit.topicId,
        topicName: topic.topicName,
        citation: unit.citation,
      }];
    });
    return { cards, chapters };
  } catch {
    return null;
  }
}

export default async function FlashcardsPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; topic?: string }>;
}) {
  const [{ chapter, topic }, data] = await Promise.all([searchParams, loadFlashcards()]);

  if (!data || !data.cards.length) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col justify-center gap-5 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-meridian">Flashcards</p>
        <h1 className="font-display text-[2.5rem]/[1.1] font-semibold text-ink-strong">Flashcards are temporarily unavailable.</h1>
        <p className="text-lg text-ink">Continue with a chapter or try again shortly.</p>
        <Link className="font-medium text-meridian underline underline-offset-4" href="/">Browse chapters</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-6 py-10 md:py-14">
      <header className="mb-8 max-w-3xl space-y-4">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-meridian">Flashcards</p>
        <h1 className="text-balance font-display text-[2.5rem]/[1.08] font-semibold tracking-[-0.02em] text-ink-strong md:text-[3.5rem]">Recall the idea before you reveal it.</h1>
        <p className="max-w-[62ch] text-[1.125rem]/[1.65] text-ink">Choose a chapter or topic, explain each term in your own words, then check the answer and mark what needs another look.</p>
      </header>
      <FlashcardDeck cards={data.cards} chapters={data.chapters} initialChapterCode={chapter} initialTopicId={topic} />
    </main>
  );
}
