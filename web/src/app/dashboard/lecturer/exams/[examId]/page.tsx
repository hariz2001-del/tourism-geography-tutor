import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { getExam, questionIsComplete } from "@/lib/learners/exams";
import { listQuestions } from "@/lib/learners/lecturer";
import { listTopicIndex } from "@/lib/learners/student";
import { deleteExam } from "../actions";
import { AddQuestionButton, ExamSettingsForm, ExamStatusButtons, PaperQuestionControls } from "../exam-controls";

export const metadata = { title: "Build a paper · Tourism Geography Tutor" };

const PAGE_SIZE = 15;

export default async function BuildExam({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ chapter?: string; type?: string; find?: string; page?: string }>;
}) {
  await requireProfile("lecturer");
  const [{ examId }, query] = await Promise.all([params, searchParams]);

  const exam = await getExam(examId);
  if (!exam) notFound();

  const [bank, topicIndex] = await Promise.all([listQuestions(), listTopicIndex()]);
  const chapters = [...new Set([...topicIndex.values()].map((topic) => topic.chapterCode))].sort();

  const inPaper = new Set(exam.questions.map((question) => question.questionId));
  const find = (query.find ?? "").trim().toLowerCase();
  const matching = bank.filter((entry) => {
    if (inPaper.has(entry.id)) return false;
    if (entry.status === "archived") return false;
    if (query.chapter && entry.chapterCode !== query.chapter) return false;
    if ((query.type === "mcq" || query.type === "subjective") && entry.questionType !== query.type) return false;
    if (find && !entry.question.toLowerCase().includes(find)) return false;
    return true;
  });

  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const shown = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const mcqInPaper = exam.questions.filter((question) => question.questionType === "mcq").length;
  const writtenInPaper = exam.questions.length - mcqInPaper;
  const incomplete = exam.questions.filter((question) => !questionIsComplete(question));

  const pageHref = (next: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    const merged = { chapter: query.chapter, type: query.type, find: query.find, page: query.page, ...next };
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "") search.set(key, String(value));
    }
    const suffix = search.toString();
    return `/dashboard/lecturer/exams/${examId}${suffix ? `?${suffix}` : ""}`;
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[64rem] flex-col gap-6 px-6 py-10">
      <Link
        className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4"
        href="/dashboard/lecturer/exams"
      >
        ← Back to your papers
      </Link>

      <div className="space-y-2">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          {exam.status === "published" ? "Students can sit this" : exam.status === "archived" ? "Hidden from students" : "Draft"}
        </p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.15] text-ink-strong">{exam.title}</h1>
        <p className="text-ink">
          {exam.questions.length} of {exam.targetMcq + exam.targetSubjective} questions ·{" "}
          {mcqInPaper} objective{exam.targetMcq ? ` of ${exam.targetMcq}` : ""} ·{" "}
          {writtenInPaper} written{exam.targetSubjective ? ` of ${exam.targetSubjective}` : ""} ·{" "}
          {exam.totalMarks} {exam.totalMarks === 1 ? "mark" : "marks"} in total
        </p>
      </div>

      <section className="space-y-3 rounded-card border border-graticule bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">Publishing</h2>
        {incomplete.length > 0 ? (
          <p role="status" className="rounded-card bg-relief/12 px-3 py-2 text-ink">
            {incomplete.length} {incomplete.length === 1 ? "question has" : "questions have"} no answers written yet.
            Publishing will fail until {incomplete.length === 1 ? "it is" : "they are"} finished.
          </p>
        ) : null}
        <ExamStatusButtons examId={exam.id} status={exam.status} />
        <p className="text-[0.9375rem] text-ink-muted">
          Publishing also approves every question in this paper, so choosing them here is the review.
        </p>
      </section>

      <section className="space-y-3 rounded-card border border-graticule bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">The paper</h2>

        {exam.questions.length === 0 ? (
          <p className="text-ink">Nothing in it yet. Add questions from the bank below.</p>
        ) : (
          <ol className="space-y-3">
            {exam.questions.map((question, index) => (
              <li key={question.id} className="rounded-card border border-graticule p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">
                      {index + 1} · {question.chapterCode} · {question.topicName} ·{" "}
                      {question.questionType === "mcq" ? "objective" : "written"} · {question.maxMarks}{" "}
                      {question.maxMarks === 1 ? "mark" : "marks"}
                    </p>
                    <p className="text-ink">{question.question}</p>
                    {questionIsComplete(question) ? null : (
                      <p className="font-medium text-relief">
                        {question.questionType === "mcq"
                          ? "No answers written yet."
                          : "No marking points written yet."}{" "}
                        <Link className="underline underline-offset-4" href={`/dashboard/lecturer/questions/${question.questionId}`}>
                          Finish it
                        </Link>
                      </p>
                    )}
                  </div>

                  <PaperQuestionControls
                    examId={exam.id}
                    examQuestionId={question.id}
                    isFirst={index === 0}
                    isLast={index === exam.questions.length - 1}
                    position={index + 1}
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-4 rounded-card border border-graticule bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">Add from the question bank</h2>

        <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]" method="get">
          <input
            type="search"
            name="find"
            defaultValue={query.find ?? ""}
            placeholder="Search the wording…"
            aria-label="Search the question bank"
            className="min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink"
          />
          <select name="chapter" defaultValue={query.chapter ?? ""} aria-label="Chapter" className="min-h-11 rounded-card border border-graticule bg-chart px-3 text-ink">
            <option value="">Every chapter</option>
            {chapters.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
          <select name="type" defaultValue={query.type ?? ""} aria-label="Type" className="min-h-11 rounded-card border border-graticule bg-chart px-3 text-ink">
            <option value="">Both kinds</option>
            <option value="mcq">Objective</option>
            <option value="subjective">Written</option>
          </select>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-card border border-graticule bg-surface px-4 font-medium text-meridian hover:border-meridian"
          >
            Filter
          </button>
        </form>

        <p className="text-[0.9375rem] text-ink-muted">
          {matching.length} {matching.length === 1 ? "question" : "questions"} to choose from.
        </p>

        <ul className="space-y-2">
          {shown.map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-start justify-between gap-3 rounded-card border border-graticule p-3">
              <div className="min-w-0 space-y-1">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted">
                  {entry.chapterCode} · {entry.topicName} · {entry.questionType === "mcq" ? "objective" : "written"} ·{" "}
                  {entry.maxMarks} {entry.maxMarks === 1 ? "mark" : "marks"}
                  {entry.generatedBy === "deepseek_draft" ? " · AI-drafted" : ""}
                </p>
                <p className="text-ink">{entry.question}</p>
              </div>
              <AddQuestionButton examId={exam.id} questionId={entry.id} />
            </li>
          ))}
          {shown.length === 0 ? <li className="text-ink">Nothing matches that. Try a wider filter.</li> : null}
        </ul>

        {pageCount > 1 ? (
          <nav aria-label="More questions" className="flex items-center justify-between gap-3">
            {page > 1 ? (
              <Link className="min-h-11 text-meridian underline underline-offset-4" href={pageHref({ page: page - 1 })}>← Previous</Link>
            ) : <span />}
            <span className="text-[0.9375rem] text-ink-muted">Page {page} of {pageCount}</span>
            {page < pageCount ? (
              <Link className="min-h-11 text-meridian underline underline-offset-4" href={pageHref({ page: page + 1 })}>Next →</Link>
            ) : <span />}
          </nav>
        ) : null}
      </section>

      <section className="space-y-3 rounded-card border border-graticule bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">Details</h2>
        <ExamSettingsForm
          examId={exam.id}
          title={exam.title}
          description={exam.description}
          showAnswers={exam.showAnswers}
        />
      </section>

      <section className="space-y-3 rounded-card border border-danger/30 bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">Delete</h2>
        <p className="text-ink">
          Deleting removes the paper. Results students already have keep their own record of what was asked.
        </p>
        <form action={deleteExam}>
          <input type="hidden" name="examId" value={exam.id} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-card border border-danger/50 bg-chart px-4 font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            Delete this paper
          </button>
        </form>
      </section>
    </main>
  );
}
