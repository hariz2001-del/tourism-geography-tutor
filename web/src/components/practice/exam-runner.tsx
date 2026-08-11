"use client";

import { useMemo, useState } from "react";
import CitationCard from "@/components/tutor/citation-card";
import type { ExamQuestion, QuizAnswerFeedback, SubjectiveGrade } from "@/lib/course-brain/types";

type McqResult = QuizAnswerFeedback & { awardedMarks: number; maxMarks: number };
type SubjectiveResult = SubjectiveGrade;
type Results = Record<string, McqResult | SubjectiveResult>;

function isMcqResult(result: McqResult | SubjectiveResult): result is McqResult {
  return "isCorrect" in result;
}

export default function ExamRunner({ title, mcqQuestions, subjectiveQuestions }: {
  title: string;
  mcqQuestions: ExamQuestion[];
  subjectiveQuestions: ExamQuestion[];
}) {
  const questions = useMemo(() => [...mcqQuestions, ...subjectiveQuestions], [mcqQuestions, subjectiveQuestions]);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Results | null>(null);
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
      const checked = await Promise.all([
        ...mcqQuestions.map(async (question) => {
          const response = await fetch("/api/quiz/answer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quizId: question.id, optionId: mcqAnswers[question.id] }) });
          const body = await response.json() as { data?: QuizAnswerFeedback; error?: string };
          if (!response.ok || !body.data) throw new Error(body.error ?? "An MCQ answer could not be checked.");
          return [question.id, { ...body.data, awardedMarks: body.data.isCorrect ? question.maxMarks : 0, maxMarks: question.maxMarks }] as const;
        }),
        ...subjectiveQuestions.map(async (question) => {
          const response = await fetch("/api/quiz/subjective", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quizId: question.id, answer: subjectiveAnswers[question.id].trim() }) });
          const body = await response.json() as { data?: SubjectiveGrade; error?: string };
          if (!response.ok || !body.data) throw new Error(body.error ?? "A written answer could not be marked.");
          return [question.id, body.data] as const;
        }),
      ]);
      setResults(Object.fromEntries(checked));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your answers could not be submitted.");
    } finally { setIsSubmitting(false); }
  }

  if (results) {
    const awarded = questions.reduce((sum, question) => sum + results[question.id].awardedMarks, 0);
    const total = questions.reduce((sum, question) => sum + question.maxMarks, 0);
    return <main className="mx-auto min-h-screen max-w-4xl space-y-8 px-6 py-10">
      <header className="space-y-2"><p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-meridian">Submitted practice</p><h1 className="font-display text-4xl font-semibold text-ink-strong">{title} results</h1><p className="text-xl text-ink">{awarded} / {total} marks</p></header>
      <div className="space-y-6">{questions.map((question, index) => {
        const result = results[question.id];
        return <section key={question.id} className="space-y-4 rounded-card border border-graticule bg-surface p-5">
          <div><p className="font-mono text-xs text-ink-muted">Question {index + 1}</p><h2 className="mt-1 font-medium text-ink-strong">{question.question}</h2></div>
          <p className="font-semibold text-ink-strong">{result.awardedMarks} / {result.maxMarks} marks</p>
          {isMcqResult(result) ? <div className="space-y-2"><p className="text-ink">{result.isCorrect ? "Correct." : "Not quite."} {result.explanation}</p><p className="text-sm text-ink-muted">Answer scheme: {result.answerScheme}</p></div> : <div className="space-y-3"><p className="text-ink">Your written answer has been marked against the approved criteria.</p><div className="rounded-card border border-graticule bg-chart p-3"><p className="font-medium text-ink-strong">Answer scheme</p><p className="mt-1 text-ink">{result.answerScheme}</p></div>{result.criteria.map((criterion, criterionIndex) => <div key={criterionIndex} className="rounded-card border border-graticule p-3"><p className="font-medium text-ink-strong">{criterion.awardedMarks} / {criterion.maxMarks} marks</p><p className="mt-1 text-ink">{criterion.feedback}</p>{criterion.citations.map((citation, citationIndex) => <div className="mt-2" key={citationIndex}><CitationCard citation={citation} actionLabel="Which to refer" /></div>)}</div>)}</div>}
          <CitationCard citation={question.citation} actionLabel="Which to refer" />
        </section>;
      })}</div>
    </main>;
  }

  return <main className="mx-auto min-h-screen max-w-4xl space-y-8 px-6 py-10">
    <header className="space-y-2"><p className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-meridian">Practice assessment</p><h1 className="font-display text-4xl font-semibold text-ink-strong">{title}</h1><p className="text-ink">{answered} of {questions.length} answered</p></header>
    <div className="h-2 overflow-hidden rounded-full bg-graticule" aria-label={`${answered} of ${questions.length} questions answered`}><div className="h-full bg-meridian transition-all" style={{ width: `${(answered / questions.length) * 100}%` }} /></div>
    <div className="space-y-6">{questions.map((question, index) => <section key={question.id} className="rounded-card border border-graticule bg-surface p-5"><p className="font-mono text-xs text-ink-muted">Question {index + 1} · {question.maxMarks} {question.maxMarks === 1 ? "mark" : "marks"}</p><fieldset className="mt-3"><legend className="font-medium text-ink-strong">{question.question}</legend>{question.questionType === "mcq" ? <div className="mt-3 space-y-2">{question.options.map((option) => <label className="flex cursor-pointer items-start gap-3 rounded-card p-2 hover:bg-meridian/10" key={option.id}><input className="mt-1 accent-meridian" type="radio" name={question.id} checked={mcqAnswers[question.id] === option.id} onChange={() => setMcqAnswers((answers) => ({ ...answers, [question.id]: option.id }))} /><span>{option.text}</span></label>)}</div> : <textarea className="mt-3 min-h-32 w-full rounded-card border border-graticule bg-chart p-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" value={subjectiveAnswers[question.id] ?? ""} onChange={(event) => setSubjectiveAnswers((answers) => ({ ...answers, [question.id]: event.target.value }))} placeholder="Write your answer…" />}</fieldset></section>)}</div>
    {error ? <p role="alert" className="text-danger">{error}</p> : null}
    <button type="button" disabled={isSubmitting} onClick={submit} className="rounded-card bg-meridian px-5 py-3 font-medium text-chart hover:bg-ink-strong disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian">{isSubmitting ? "Submitting and marking…" : "Submit assessment"}</button>
  </main>;
}
