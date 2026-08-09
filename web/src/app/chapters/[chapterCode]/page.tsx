import ChapterNav from "@/components/materials/chapter-nav";
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
  if (!chapter) return <EmptyState chapterCode={chapterCode} />;
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
          {chapter.topic.summary ? <p className="max-w-[62ch] text-[1.0625rem]/[1.7] text-ink-muted">{chapter.topic.summary}</p> : null}
        </div>
        {diagram ? <TopicDiagramFigure diagram={diagram} /> : null}
        {sections.length
          ? sections.map((section, i) => (
              <ContentSection key={section.id} section={section} showLabel={showLabels} isFirst={i === 0} />
            ))
          : <p role="status" className="rounded-card border border-graticule bg-surface p-4 text-ink">No approved material is available for this topic yet.</p>}
        {chapter.quiz ? <QuizCard question={chapter.quiz} /> : null}
      </section>
      <aside className="lg:sticky lg:top-6 lg:self-start"><TutorPanel topicTitle={chapter.topic.name} /></aside>
    </div>
  </main>;
}

function EmptyState({ chapterCode }: { chapterCode: string }) {
  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 p-6">
    <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]">{chapterCode} materials</h1>
    <p className="text-lg text-ink">No approved Course Brain records are available for this chapter yet.</p>
    <p className="text-ink-muted">Reviewed material will appear here after it has been imported and published with source citations.</p>
  </main>;
}
