import Link from "next/link";
import DashboardShell, { EmptyPanel, StatTile } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { listQuestions, summariseBank, type QuestionFilters } from "@/lib/learners/lecturer";
import { lecturerTabs } from "@/lib/learners/navigation";
import { listTopicIndex } from "@/lib/learners/student";
import QuestionFilterBar from "./question-filter-bar";

export const metadata = { title: "Question bank · Tourism Geography Tutor" };

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-relief/15 text-relief",
  approved: "bg-lowland/15 text-lowland",
  archived: "bg-ink-muted/15 text-ink-muted",
};

function parseFilters(query: Record<string, string | undefined>): QuestionFilters {
  const filters: QuestionFilters = {};
  if (query.chapter) filters.chapterCode = query.chapter;
  if (query.topic) filters.topicId = query.topic;
  if (query.type === "mcq" || query.type === "subjective") filters.questionType = query.type;
  if (query.status === "draft" || query.status === "approved" || query.status === "archived") {
    filters.status = query.status;
  }
  return filters;
}

export default async function QuestionBank({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string; topic?: string; type?: string; status?: string }>;
}) {
  await requireProfile("lecturer");
  const query = await searchParams;
  const filters = parseFilters(query);

  const [entries, allEntries, topicIndex] = await Promise.all([
    listQuestions(filters),
    listQuestions(),
    listTopicIndex(),
  ]);
  const bank = summariseBank(allEntries);

  const chapters = [...new Set([...topicIndex.values()].map((topic) => topic.chapterCode))].sort();
  const topics = [...topicIndex.entries()]
    .map(([id, topic]) => ({ id, ...topic }))
    .filter((topic) => !filters.chapterCode || topic.chapterCode === filters.chapterCode)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DashboardShell
      eyebrow="Teaching"
      title="Question bank"
      description="Every question learners can be assessed on. Each one is tied to a published, cited unit of course material."
      tabs={lecturerTabs}
      activeHref="/dashboard/lecturer/questions"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total" value={String(bank.total)} detail={`${bank.mcq} MCQ · ${bank.subjective} written`} />
        <StatTile label="Approved" value={String(bank.approved)} tone="good" />
        <StatTile label="Draft" value={String(bank.draft)} detail="not yet reviewed" />
        <StatTile label="Archived" value={String(bank.archived)} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <QuestionFilterBar chapters={chapters} topics={topics} current={query} />
        <Link
          className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          href="/dashboard/lecturer/questions/new"
        >
          Add a question
        </Link>
      </div>

      <p role="status" className="text-ink-muted">
        Showing {entries.length} of {bank.total} questions.
      </p>

      {entries.length === 0 ? (
        <EmptyPanel title="No questions match these filters." detail="Clear a filter to widen the search." />
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-card border border-graticule bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
                    {entry.chapterCode} · {entry.topicName} · {entry.difficulty} · {entry.maxMarks}{" "}
                    {entry.maxMarks === 1 ? "mark" : "marks"}
                  </p>
                  <p className="text-ink-strong">{entry.question}</p>
                  <p className="font-mono text-[0.75rem] text-ink-muted">
                    {entry.questionType === "mcq"
                      ? `${entry.optionCount} options`
                      : `${entry.criterionCount} marking criteria`}
                    {entry.generatedBy === "deepseek_draft" ? " · AI-drafted" : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-card px-2 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] ${STATUS_STYLES[entry.status]}`}
                  >
                    {entry.status}
                  </span>
                  <Link
                    className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                    href={`/dashboard/lecturer/questions/${entry.id}`}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
