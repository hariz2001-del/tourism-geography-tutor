"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import CitationCard from "@/components/tutor/citation-card";
import type { ExamQuestion, QuizAnswerFeedback, SubjectiveGrade } from "@/lib/course-brain/types";

type McqResult = QuizAnswerFeedback & { awardedMarks: number; maxMarks: number };
type SubjectiveResult = SubjectiveGrade;
type Results = Record<string, McqResult | SubjectiveResult>;

function isMcqResult(result: McqResult | SubjectiveResult): result is McqResult {
  return "isCorrect" in result;
}

export default function ExamRunner({ title, mcqQuestions, subjectiveQuestions, returnHref, returnLabel, restartHref, mode, scopeValue, isLearner = false }: {
  title: string;
  mcqQuestions: ExamQuestion[];
  subjectiveQuestions: ExamQuestion[];
  returnHref: string;
  returnLabel: string;
  restartHref: string;
  mode: "topic" | "chapter" | "course";
  scopeValue: string | null;
  // Only a signed-in learner has a result worth recording.
  isLearner?: boolean;
}) {
  const questions = useMemo(() => [...mcqQuestions, ...subjectiveQuestions], [mcqQuestions, subjectiveQuestions]);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Results | null>(null);
  const [totals, setTotals] = useState<{ awardedMarks: number; totalMarks: number } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const answered = mcqQuestions.filter((question) => mcqAnswers[question.id]).length
    + subjectiveQuestions.filter((question) => subjectiveAnswers[question.id]?.trim()).length;
  const unanswered = questions.length - answered;

  async function submit() {
    if (unanswered) {
      setError(`Answer all ${questions.length} questions before submitting. ${unanswered} remain unanswered.`);
      return;
    }
    setError(null); setIsSubmitting(true);
    try {
      // One request for the whole paper. Marks are computed and totalled on the
      // server so a recorded score never depends on what the browser claims.
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode,
          scopeValue: mode === "course" ? null : scopeValue,
          scopeLabel: title,
          answers: [
            ...mcqQuestions.map((question) => ({ questionId: question.id, questionType: "mcq" as const, optionId: mcqAnswers[question.id] })),
            ...subjectiveQuestions.map((question) => ({ questionId: question.id, questionType: "subjective" as const, answer: subjectiveAnswers[question.id].trim() })),
          ],
        }),
      });
      const body = await response.json() as { data?: { attemptId: string | null; awardedMarks: number; totalMarks: number; results: Results }; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "Your answers could not be submitted.");
      setResults(body.data.results);
      setTotals({ awardedMarks: body.data.awardedMarks, totalMarks: body.data.totalMarks });
      setAttemptId(body.data.attemptId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your answers could not be submitted.");
    } finally { setIsSubmitting(false); }
  }

  if (results) {
    const awarded = totals?.awardedMarks ?? 0;
    const total = totals?.totalMarks ?? 0;
    return <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-4">
        <Link className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4" href={returnHref}>← {returnLabel}</Link>
        <div className="space-y-2"><p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-meridian">Submitted practice</p><h1 className="font-display text-4xl font-semibold text-ink-strong">{title} results</h1><p className="text-xl text-ink">{awarded} / {total} marks</p>
        {attemptId
          ? <p role="status" className="text-ink-muted">Saved to your results. <Link className="font-medium text-meridian underline underline-offset-4" href={`/dashboard/student/results/${attemptId}`}>Review this attempt</Link> or retake it to improve your best score.</p>
          : isLearner
            ? <p role="status" className="text-ink-muted">This result could not be saved to your record.</p>
            : <p role="status" className="text-ink-muted"><Link className="font-medium text-meridian underline underline-offset-4" href="/login">Sign in</Link> to keep your score history and retake this to improve it.</p>}
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href={restartHref}>Try another set</a>
          <Link className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-5 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href={returnHref}>{returnLabel}</Link>
        </div>
      </header>
      <div className="space-y-6">{questions.map((question, index) => {
        const result = results[question.id];
        return <section key={question.id} className="space-y-4 rounded-card border border-graticule bg-surface p-5">
          <div><p className="font-mono text-xs text-ink-muted">Question {index + 1}</p><h2 className="mt-1 font-medium text-ink-strong">{question.question}</h2></div>
          <p className="font-semibold text-ink-strong">{result.awardedMarks} / {result.maxMarks} marks</p>
          {isMcqResult(result) ? <div className="space-y-2"><p className="text-ink">{result.isCorrect ? "Correct." : "Not quite."} {result.explanation}</p><p className="text-sm text-ink-muted">Answer scheme: {result.answerScheme}</p></div> : <div className="space-y-3"><p className="text-ink">Your written answer has been marked against the answer criteria.</p><div className="rounded-card border border-graticule bg-chart p-3"><p className="font-medium text-ink-strong">Answer scheme</p><p className="mt-1 text-ink">{result.answerScheme}</p></div>{result.criteria.map((criterion, criterionIndex) => <div key={criterionIndex} className="rounded-card border border-graticule p-3"><p className="font-medium text-ink-strong">{criterion.awardedMarks} / {criterion.maxMarks} marks</p><p className="mt-1 text-ink">{criterion.feedback}</p>{criterion.citations.map((citation, citationIndex) => <div className="mt-2" key={citationIndex}><CitationCard citation={citation} actionLabel="Review topic" /></div>)}</div>)}</div>}
          <CitationCard citation={question.citation} actionLabel="Review topic" />
        </section>;
      })}</div>
    </main>;
  }

  return <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-4xl space-y-8 px-6 py-10">
    <header className="space-y-4">
      <Link className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4" href={returnHref}>← {returnLabel}</Link>
      <div className="space-y-2"><p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-meridian">Practice assessment</p><h1 className="font-display text-4xl font-semibold text-ink-strong">{title}</h1><p className="text-ink">{answered} of {questions.length} answered</p></div>
    </header>
    <div className="h-2 overflow-hidden rounded-full bg-graticule" role="progressbar" aria-label="Assessment progress" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={answered}><div className="h-full bg-meridian transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
    <div className="space-y-6">{questions.map((question, index) => <section key={question.id} className="rounded-card border border-graticule bg-surface p-5"><p className="font-mono text-xs text-ink-muted">Question {index + 1} · {question.maxMarks} {question.maxMarks === 1 ? "mark" : "marks"}</p><fieldset className="mt-3"><legend className="font-medium text-ink-strong">{question.question}</legend>{question.questionType === "mcq" ? <div className="mt-3 space-y-2">{question.options.map((option) => <label className="flex cursor-pointer items-start gap-3 rounded-card p-2 hover:bg-meridian/10" key={option.id}><input className="mt-1 accent-meridian" type="radio" name={question.id} checked={mcqAnswers[question.id] === option.id} onChange={() => setMcqAnswers((answers) => ({ ...answers, [question.id]: option.id }))} /><span>{option.text}</span></label>)}</div> : <textarea className="mt-3 min-h-32 w-full rounded-card border border-graticule bg-chart p-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" value={subjectiveAnswers[question.id] ?? ""} onChange={(event) => setSubjectiveAnswers((answers) => ({ ...answers, [question.id]: event.target.value }))} placeholder="Write your answer…" />}</fieldset></section>)}</div>
    {error ? <p role="alert" className="text-danger">{error}</p> : null}
    <button type="button" disabled={isSubmitting} onClick={submit} className="min-h-11 rounded-card bg-meridian px-5 py-3 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian">{isSubmitting ? "Submitting and marking…" : "Submit assessment"}</button>
  </main>;
}
