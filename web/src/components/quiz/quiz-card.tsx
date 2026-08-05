"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/course-brain/types";
import CitationCard from "../tutor/citation-card";

type Feedback = { isCorrect: boolean; explanation: string };

export default function QuizCard({ question }: { question: QuizQuestion }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function checkAnswer() {
    if (!selectedOptionId) return;
    setIsChecking(true); setError(null); setFeedback(null);
    try {
      const response = await fetch("/api/quiz/answer", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ quizId: question.id, optionId: selectedOptionId }) });
      const body = await response.json() as { data?: Feedback; error?: string };
      if (!response.ok || !body.data) throw new Error(body.error ?? "The answer could not be checked.");
      setFeedback(body.data);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The answer could not be checked."); }
    finally { setIsChecking(false); }
  }

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm" aria-labelledby={`quiz-${question.id}`}>
      <h2 id={`quiz-${question.id}`} className="text-xl font-bold text-slate-950">Self-check</h2>
      <fieldset className="mt-4">
        <legend className="font-medium text-slate-950">{question.question}</legend>
        <div className="mt-3 space-y-2">{question.options.map((option) => <label key={option.id} className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-slate-50"><input type="radio" name={question.id} value={option.id} checked={selectedOptionId === option.id} onChange={() => { setSelectedOptionId(option.id); setFeedback(null); }} /><span>{option.text}</span></label>)}</div>
      </fieldset>
      <button type="button" className="mt-4 rounded-md bg-slate-900 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500" disabled={!selectedOptionId || isChecking} onClick={checkAnswer}>{isChecking ? "Checking…" : "Check answer"}</button>
      {error ? <p role="alert" className="mt-4 text-red-800">{error}</p> : null}
      {feedback ? <div className="mt-4 space-y-2" role="status"><p className="font-semibold">{feedback.isCorrect ? "Correct." : "Not quite."}</p><p>{feedback.explanation}</p><CitationCard citation={question.citation} /></div> : null}
    </section>
  );
}
