import { unstable_cache } from "next/cache";
import ChapterNav from "@/components/materials/chapter-nav";
import Link from "next/link";
import ContentSection from "@/components/materials/content-section";
import TopicDiagramFigure from "@/components/materials/topic-diagram";
import TopicLearningModel, { integratedTopicUnitIds, modelClaimsTopicDiagram, topicModelUnitIds } from "@/components/materials/topic-learning-model";
import TopicList from "@/components/materials/topic-list";
import QuizCard from "@/components/quiz/quiz-card";
import OpenTutorButton from "@/components/tutor/open-tutor-button";
import { formatChapterLabel } from "@/lib/course-brain/chapter-label";
import { buildSections, shouldShowLabels } from "@/lib/course-brain/group-units";
import { topicDiagrams } from "@/lib/course-brain/diagrams";
import type { Chapter, ChapterTopic, PublishedContentUnit, QuizQuestion } from "@/lib/course-brain/types";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/session";
import { listBookmarkedUnitIds } from "@/lib/learners/bookmarks";
import { ActiveTopicRecorder, ChapterTopicsProvider, TopicPanel } from "./chapter-topics";

type ChapterData = {
  chapters: Chapter[];
  topics: ChapterTopic[];
  topic: ChapterTopic;
  unitsByTopic: Map<string, PublishedContentUnit[]>;
  quizByTopic: Map<string, QuizQuestion | null>;
} | null;

/**
 * Everything in a chapter that is the same for every reader, in one cached call.
 *
 * The queries behind this run as the anonymous role and depend on nothing about who is
 * asking, so the answer is identical for every visitor and there is no reason to ask the
 * database again on each page view. Published course content changes when a lecturer
 * publishes something, which is what the `course-content` tag is for — those actions
 * revalidate it, so an edit still appears at once.
 *
 * Quiz options are deliberately re-shuffled below rather than here: a cached shuffle would
 * hand every learner the same running order for the life of the cache entry.
 */
const loadChapterContent = unstable_cache(
  async (chapterCode: string) => {
    const repository = createServerCourseBrainRepository();
    const [chapters, topics] = await Promise.all([
      repository.listChapters(),
      repository.listChapterTopics(chapterCode),
    ]);
    if (topics.length === 0) return { chapters, topics, units: [], quizzes: [] };

    const [units, quizzes] = await Promise.all([
      repository.getPublishedChapterContent(chapterCode),
      Promise.all(topics.map((topic) => repository.getApprovedTopicQuiz(topic.id))),
    ]);
    return { chapters, topics, units, quizzes };
  },
  ["chapter-content"],
  { revalidate: 300, tags: ["course-content"] },
);

/** A fresh order for every reader, so answer positions cannot be memorised. */
function reshuffled(quiz: QuizQuestion | null): QuizQuestion | null {
  if (!quiz) return null;
  const options = [...quiz.options];
  for (let index = options.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [options[index], options[swap]] = [options[swap], options[index]];
  }
  return { ...quiz, options };
}

/**
 * Loads the whole chapter rather than the one topic being viewed: all of its units in a
 * single query, and its quizzes in parallel. The page then renders every topic and hides all
 * but one, so moving between them is a state change instead of another five round trips to
 * the database.
 */
async function loadChapter(chapterCode: string, selectedTopicId?: string): Promise<ChapterData> {
  const { chapters, topics, units, quizzes } = await loadChapterContent(chapterCode);
  const topic = topics.find((candidate) => candidate.id === selectedTopicId) ?? topics[0];
  if (!topic) return null;

  const unitsByTopic = new Map<string, PublishedContentUnit[]>(topics.map((candidate) => [candidate.id, []]));
  for (const unit of units) unitsByTopic.get(unit.topicId)?.push(unit);
  const quizByTopic = new Map(topics.map((candidate, index) => [candidate.id, reshuffled(quizzes[index])]));

  return { chapters, topics, topic, unitsByTopic, quizByTopic };
}

export default async function ChapterPage({ params, searchParams }: { params: Promise<{ chapterCode: string }>; searchParams: Promise<{ topic?: string }> }) {
  const [{ chapterCode }, { topic: selectedTopicId }] = await Promise.all([params, searchParams]);
  const chapter = await loadChapter(chapterCode, selectedTopicId);
  if (!chapter) {
    const chapters = await createServerCourseBrainRepository().listChapters();
    return <EmptyState chapterCode={chapterCode} chapters={chapters} />;
  }

  const profile = await getProfile();
  const isStudent = profile?.role === "student";
  const bookmarkedUnitIds = isStudent ? await listBookmarkedUnitIds(profile.id) : new Set<string>();
  const topicNames = Object.fromEntries(chapter.topics.map((topic) => [topic.id, topic.name]));

  const chapterUnits = chapter.topics.flatMap((topic) => chapter.unitsByTopic.get(topic.id) ?? []);

  return (
    <ChapterTopicsProvider
      chapterCode={chapterCode}
      initialTopicId={chapter.topic.id}
      topicIds={chapter.topics.map((topic) => topic.id)}
    >
      <main className="tutor-dock-space mx-auto flex min-h-screen max-w-[86rem] flex-col gap-8 px-6 py-8">
        {isStudent ? <ActiveTopicRecorder /> : null}
        <ChapterNav chapters={chapter.chapters} activeChapterCode={chapterCode} />
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <TopicList chapterCode={chapterCode} topics={chapter.topics} />
          </aside>
          <section>
            {chapter.topics.map((topic) => (
              <TopicPanel key={topic.id} topicId={topic.id}>
                <TopicContent
                  bookmarkedUnitIds={isStudent ? bookmarkedUnitIds : undefined}
                  chapterCode={chapterCode}
                  quiz={chapter.quizByTopic.get(topic.id) ?? null}
                  topic={topic}
                  units={chapter.unitsByTopic.get(topic.id) ?? []}
                  chapterUnits={chapterUnits}
                  topicNames={topicNames}
                />
              </TopicPanel>
            ))}
          </section>
        </div>
      </main>
    </ChapterTopicsProvider>
  );
}

function TopicContent({
  bookmarkedUnitIds,
  chapterCode,
  quiz,
  topic,
  units,
  chapterUnits,
  topicNames,
}: {
  bookmarkedUnitIds?: Set<string>;
  chapterCode: string;
  quiz: QuizQuestion | null;
  topic: ChapterTopic;
  units: PublishedContentUnit[];
  /** Every unit in the chapter, for the model that indexes cards in other topics. */
  chapterUnits: PublishedContentUnit[];
  topicNames: Record<string, string>;
}) {
  const diagram = topicDiagrams[topic.id];
  const integratedUnitIds = integratedTopicUnitIds(topic.id, units);
  const hasLeadingModel = topicModelUnitIds("leading", topic.id, units).size > 0;
  const hasTrailingModel = topicModelUnitIds("trailing", topic.id, units).size > 0;
  const sections = buildSections(units.filter((unit) => !integratedUnitIds.has(unit.id)));
  const showLabels = shouldShowLabels(sections);

  return (
    <>
      <div className="space-y-3">
        <p className="font-mono text-[0.8125rem] uppercase tracking-[0.14em] text-ink-muted">{formatChapterLabel(chapterCode)}</p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]">{topic.name}</h1>
        <div className="flex flex-wrap gap-x-4 text-sm font-medium">
          <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4" href={`/practice/topic?topic=${encodeURIComponent(topic.id)}`}>Topic quiz</Link>
          <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4" href={`/flashcards?chapter=${encodeURIComponent(chapterCode)}&topic=${encodeURIComponent(topic.id)}`}>Topic flashcards</Link>
          <Link className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4" href={`/practice/chapter?chapter=${encodeURIComponent(chapterCode)}`}>Chapter mini exam</Link>
          <OpenTutorButton className="inline-flex min-h-11 items-center text-meridian underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian">Ask tutor</OpenTutorButton>
        </div>
      </div>
      {hasLeadingModel ? (
        <TopicLearningModel placement="leading" topicId={topic.id} units={units} bookmarkedUnitIds={bookmarkedUnitIds} chapterUnits={chapterUnits} topicNames={topicNames} />
      ) : diagram && !modelClaimsTopicDiagram(topic.id) ? <TopicDiagramFigure diagram={diagram} /> : null}
      {sections.length
        ? sections.map((section, i) => (
            <ContentSection
              key={section.id}
              section={section}
              showLabel={showLabels}
              isFirst={i === 0}
              bookmarkedUnitIds={bookmarkedUnitIds}
            />
          ))
        : integratedUnitIds.size === 0 ? <p role="status" className="rounded-card border border-graticule bg-surface p-4 text-ink">This topic does not have any learning notes yet.</p> : null}
      {hasTrailingModel ? (
        <TopicLearningModel placement="trailing" topicId={topic.id} units={units} bookmarkedUnitIds={bookmarkedUnitIds} chapterUnits={chapterUnits} topicNames={topicNames} />
      ) : null}
      {quiz ? <QuizCard question={quiz} /> : null}
    </>
  );
}

function EmptyState({ chapterCode, chapters }: { chapterCode: string; chapters: Chapter[] }) {
  return <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-6">
    <ChapterNav chapters={chapters} />
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-[2rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink-strong md:text-[2.5rem]">{formatChapterLabel(chapterCode)} materials</h1>
      <p className="text-lg text-ink">This chapter does not have any topics yet.</p>
      <p className="text-ink-muted">Choose another chapter to continue learning.</p>
    </div>
  </main>;
}
