import ContentUnit from "@/components/materials/content-unit";
import TopicList from "@/components/materials/topic-list";
import QuizCard from "@/components/quiz/quiz-card";
import TutorPanel from "@/components/tutor/tutor-panel";
import type { ChapterTopic, PublishedContentUnit, QuizQuestion } from "@/lib/course-brain/types";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";

type ChapterData = { topics: ChapterTopic[]; topic: ChapterTopic; units: PublishedContentUnit[]; quiz: QuizQuestion | null } | null;

async function loadChapter(chapterCode: string, selectedTopicId?: string): Promise<ChapterData> {
  const repository = createServerCourseBrainRepository();
  const topics = await repository.listChapterTopics(chapterCode);
  const topic = topics.find((candidate) => candidate.id === selectedTopicId) ?? topics[0];
  if (!topic) return null;
  const [units, quiz] = await Promise.all([repository.getPublishedTopicContent(topic.id), repository.getApprovedTopicQuiz(topic.id)]);
  return { topics, topic, units, quiz };
}

export default async function ChapterPage({ params, searchParams }: { params: Promise<{ chapterCode: string }>; searchParams: Promise<{ topic?: string }> }) {
  const [{ chapterCode }, { topic: selectedTopicId }] = await Promise.all([params, searchParams]);
  const chapter = await loadChapter(chapterCode, selectedTopicId);
  if (!chapter) return <EmptyState chapterCode={chapterCode} />;
  return <main className="mx-auto grid min-h-screen max-w-7xl gap-6 p-6 lg:grid-cols-[15rem_minmax(0,1fr)_22rem]">
    <aside><TopicList chapterCode={chapterCode} topics={chapter.topics} selectedTopicId={chapter.topic.id} /></aside>
    <section className="space-y-4"><p className="font-semibold text-slate-700">{chapterCode}</p><h1 className="text-3xl font-bold">{chapter.topic.name}</h1>{chapter.units.length ? chapter.units.map((unit) => <ContentUnit key={unit.id} unit={unit} />) : <p role="status" className="rounded-md border border-slate-300 bg-white p-4">No approved material is available for this topic yet.</p>}{chapter.quiz ? <QuizCard question={chapter.quiz} /> : null}</section>
    <aside className="lg:sticky lg:top-6 lg:self-start"><TutorPanel chapterCode={chapterCode} topicId={chapter.topic.id} topicTitle={chapter.topic.name} /></aside>
  </main>;
}

function EmptyState({ chapterCode }: { chapterCode: string }) {
  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 p-6"><h1 className="text-3xl font-bold">{chapterCode} materials</h1><p className="text-lg text-slate-800">No approved Course Brain records are available for this chapter yet.</p><p className="text-slate-700">Reviewed material will appear here after it has been imported and published with source citations.</p></main>;
}
