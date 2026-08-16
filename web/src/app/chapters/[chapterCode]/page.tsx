import ChapterNav from "@/components/materials/chapter-nav";
import Link from "next/link";
import ContentSection from "@/components/materials/content-section";
import TopicDiagramFigure from "@/components/materials/topic-diagram";
import TopicList from "@/components/materials/topic-list";
import QuizCard from "@/components/quiz/quiz-card";
import TutorPanel from "@/components/tutor/tutor-panel";
import { buildSections, shouldShowLabels } from "@/lib/course-brain/group-units";
import { topicDiagrams } from "@/lib/course-brain/diagrams";
import type { Chapter, ChapterTopic, PublishedContentUnit, QuizQuestion } from "@/lib/course-brain/types";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";

type ChapterData = { chapters: Chapter[]; topics: ChapterTopic[]; topic: ChapterTopic; units: PublishedContentUnit[]; quiz: QuizQuestion | null } | null;

async function loadChapter(chapterCode: string, selectedTopicId?: string): Promise<ChapterData> {
  const repository = createServerCourseBrainRepository();
  const [chapters, topics] = await Promise.all([repository.listChapters(), repository.listChapterTopics(chapterCode)]);
  const topic = topics.find((candidate) => candidate.id === selectedTopicId) ?? topics[0];
  if (!topic) return null;
  const [units, quiz] = await Promise.all([repository.getPublishedTopicContent(topic.id), repository.getApprovedTopicQuiz(topic.id)]);
  return { chapters, topics, topic, units, quiz };
}

export default async function ChapterPage({ params, searchParams }: { params: Promise<{ chapterCode: string }>; searchParams: Promise<{ topic?: string }> }) {
  const [{ chapterCode }, { topic: selectedTopicId }] = await Promise.all([params, searchParams]);
  const chapter = await loadChapter(chapterCode, selectedTopicId);
  if (!chapter) {
    const chapters = await createServerCourseBrainRepository().listChapters();
    return <EmptyState chapterCode={chapterCode} chapters={chapters} />;
  }
  const diagram = topicDiagrams[chapter.topic.id];
  const sections = buildSections(chapter.units);
  const showLabels = shouldShowLabels(sections);
  return <main className="mx-auto flex min-h-screen max-w-[86rem] flex-col gap-8 px-6 py-8">
    <ChapterNav chapters={chapter.chapters} activeChapterCode={chapterCode} />
    <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)_21rem]">
      <aside className="lg:sticky lg:top-8 lg:self-start"><TopicList chapterCode={chapterCode} topics={chapter.topics} selectedTopicId={chapter.topic.id} /></aside>
      <section className="space-y-10">
        <div className="space-y-3">
          <p className="font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-ink-muted">{chapterCode}</p>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]">{chapter.topic.name}</h1>
          <div className="flex flex-wrap gap-x-4 text-sm font-medium">
            <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4" href={`/practice/topic?topic=${encodeURIComponent(chapter.topic.id)}`}>Topic quiz</Link>
            <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4" href={`/flashcards?chapter=${encodeURIComponent(chapterCode)}&topic=${encodeURIComponent(chapter.topic.id)}`}>Topic flashcards</Link>
            <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4" href={`/practice/chapter?chapter=${encodeURIComponent(chapterCode)}`}>Chapter mini exam</Link>
            <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4 lg:hidden" href="#tutor">Ask tutor</Link>
          </div>
        </div>
        {diagram ? <TopicDiagramFigure diagram={diagram} /> : null}
        {sections.length
          ? sections.map((section, i) => (
              <ContentSection key={section.id} section={section} showLabel={showLabels} isFirst={i === 0} />
            ))
          : <p role="status" className="rounded-card border border-graticule bg-surface p-4 text-ink">This topic does not have any learning notes yet.</p>}
        {chapter.quiz ? <QuizCard question={chapter.quiz} /> : null}
      </section>
      <aside className="lg:sticky lg:top-6 lg:self-start"><TutorPanel topicTitle={chapter.topic.name} /></aside>
    </div>
  </main>;
}

function EmptyState({ chapterCode, chapters }: { chapterCode: string; chapters: Chapter[] }) {
  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-6">
    <ChapterNav chapters={chapters} />
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]">{chapterCode} materials</h1>
      <p className="text-lg text-ink">This chapter does not have any topics yet.</p>
      <p className="text-ink-muted">Choose another chapter to continue learning.</p>
    </div>
  </main>;
}
