"use client";

import { FormEvent, useState } from "react";
import type { Citation } from "@/lib/course-brain/types";
import CitationCard from "./citation-card";

type TutorResponse = {
  kind: "grounded" | "out_of_scope";
  text: string;
  citations: Citation[];
};

type Props = {
  topicTitle: string;
};

export default function TutorPanel({ topicTitle }: Props) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<TutorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAnswer(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const body = await response.json() as { data?: TutorResponse; error?: string };
      if (!response.ok || !body.data) {
        throw new Error(body.error ?? "The tutor could not answer right now.");
      }
      setAnswer(body.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The tutor could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm" aria-labelledby="tutor-heading">
      <h2 id="tutor-heading" className="text-xl font-bold text-slate-950">Tutor</h2>
      <p className="mt-1 text-sm text-slate-700">Ask about any topic in the course, not just &ldquo;{topicTitle}&rdquo; — matching answers link back to where they come from.</p>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block font-medium text-slate-900" htmlFor="tutor-question">Question</label>
        <textarea id="tutor-question" aria-label="Ask the tutor" value={question} onChange={(event) => setQuestion(event.target.value)} required maxLength={500} className="min-h-24 w-full rounded-md border border-slate-400 p-3 text-slate-950 outline-offset-2 focus-visible:outline-2 focus-visible:outline-slate-900" />
        <button type="submit" disabled={isLoading} className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white outline-offset-4 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 focus-visible:outline-2 focus-visible:outline-slate-900">
          {isLoading ? "Asking…" : "Ask tutor"}
        </button>
      </form>
      {error ? <p className="mt-4 text-red-800" role="alert">{error}</p> : null}
      {answer ? (
        <div className="mt-5 space-y-3" role="status" aria-live="polite">
          <p>{answer.text}</p>
          {answer.citations.map((citation) => <CitationCard key={`${citation.sourceFile}-${citation.pageOrSlide}`} citation={citation} />)}
        </div>
      ) : null}
    </section>
  );
}
