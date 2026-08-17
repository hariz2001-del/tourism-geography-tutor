import Link from "next/link";
import { notFound } from "next/navigation";
import CitationCard from "@/components/tutor/citation-card";
import { requireProfile } from "@/lib/auth/session";
import { attemptPercentage } from "@/lib/learners/metrics";
import { formatDateTime, retakeHref } from "@/lib/learners/navigation";
import { getAttempt } from "@/lib/learners/student";

export const metadata = { title: "Attempt review · Tourism Geography Tutor" };

export default async function AttemptReview({ params }: { params: Promise<{ attemptId: string }> }) {
  await requireProfile("student");
  const { attemptId } = await params;

  // RLS scopes this to the caller, so an id belonging to someone else is a 404.
  const attempt = await getAttempt(attemptId);
  if (!attempt) notFound();

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <Link
          className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4"
          href="/dashboard/student/results"
        >
          ← Back to results
        </Link>
        <div className="space-y-2">
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-meridian">
            {formatDateTime(attempt.submittedAt)}
          </p>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.15] text-ink-strong md:text-[2.5rem]">
            {attempt.scopeLabel}
          </h1>
          <p className="text-xl text-ink">
            {attempt.awardedMarks} / {attempt.totalMarks} marks · {attemptPercentage(attempt)}%
          </p>
        </div>
        <a
          className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          href={retakeHref(attempt.mode, attempt.scopeValue)}
        >
          Retake this assessment
        </a>
      </header>

      <div className="space-y-6">
        {attempt.answers.map((answer) => (
          <section key={answer.id} className="space-y-4 rounded-card border border-graticule bg-surface p-5">
            <div>
              <p className="font-mono text-xs text-ink-muted">
                Question {answer.displayOrder}
                {answer.chapterCode ? ` · ${answer.chapterCode}` : ""}
              </p>
              <h2 className="mt-1 font-medium text-ink-strong">{answer.questionText}</h2>
            </div>

            <p className="font-semibold text-ink-strong">
              {answer.awardedMarks} / {answer.maxMarks} marks
            </p>

            {answer.questionType === "mcq" ? (
              <div className="space-y-2">
                {answer.feedback.selectedOptionText ? (
                  <p className="text-ink">
                    <span className="text-ink-muted">Your answer: </span>
                    {answer.feedback.selectedOptionText}
                  </p>
                ) : null}
                <p className="text-ink">
                  {answer.feedback.isCorrect ? "Correct." : "Not quite."} {answer.feedback.explanation}
                </p>
                {answer.feedback.answerScheme ? (
                  <p className="text-sm text-ink-muted">Answer scheme: {answer.feedback.answerScheme}</p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-card border border-graticule bg-chart p-3">
                  <p className="font-medium text-ink-strong">Your written answer</p>
                  <p className="mt-1 whitespace-pre-wrap text-ink">{answer.answerText}</p>
                </div>
                {answer.feedback.answerScheme ? (
                  <div className="rounded-card border border-graticule bg-chart p-3">
                    <p className="font-medium text-ink-strong">Answer scheme</p>
                    <p className="mt-1 text-ink">{answer.feedback.answerScheme}</p>
                  </div>
                ) : null}
                {(answer.feedback.criteria ?? []).map((criterion, index) => (
                  <div key={index} className="rounded-card border border-graticule p-3">
                    <p className="font-medium text-ink-strong">
                      {criterion.awardedMarks} / {criterion.maxMarks} marks
                    </p>
                    <p className="mt-1 text-ink">{criterion.feedback}</p>
                    {criterion.citations.map((citation, citationIndex) => (
                      <div className="mt-2" key={citationIndex}>
                        <CitationCard citation={citation} actionLabel="Which to refer" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {answer.feedback.citation ? (
              <CitationCard citation={answer.feedback.citation} actionLabel="Which to refer" />
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
