"use client";

import { FormEvent, useState } from "react";
import type { Citation } from "@/lib/course-brain/types";
import CitationCard from "./citation-card";

type TutorResponse = {
  kind: "grounded" | "ai_grounded" | "out_of_scope";
  text: string;
  citations: Citation[];
};

type Props = {
  topicTitle: string;
};

// Thrown only when the API responded but the response itself carries an
// error (non-ok status, or a malformed body). Its `.message` is safe to show
// to a user. Any other thrown error (network failure, JSON parse failure,
// etc.) is not an ApiError and always falls back to a friendly string.
class TutorApiError extends Error {}

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
        throw new TutorApiError(body.error ?? "The tutor could not answer right now.");
      }
      setAnswer(body.data);
    } catch (caught) {
      setError(caught instanceof TutorApiError ? caught.message : "The tutor could not answer right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="tutor" tabIndex={-1} className="scroll-mt-6 rounded-card border border-graticule bg-surface p-5" aria-labelledby="tutor-heading">
      <h2 id="tutor-heading" className="font-display text-[1.375rem] font-semibold text-ink-strong">Tutor</h2>
      <p className="mt-1 text-[0.9375rem]/[1.6] text-ink-muted">Ask any Tourism Geography question, not just about &ldquo;{topicTitle}&rdquo;. Helpful answers include a related reference.</p>
      <form className="mt-4 space-y-3" onSubmit={submit}>
        <label className="block font-medium text-ink-strong" htmlFor="tutor-question">Question</label>
        <textarea id="tutor-question" aria-label="Ask the tutor" value={question} onChange={(event) => setQuestion(event.target.value)} required maxLength={500} className="min-h-24 w-full rounded-card border border-graticule bg-surface p-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" />
        <button type="submit" disabled={isLoading} className="rounded-card bg-meridian px-4 py-2 font-medium text-chart transition-colors duration-150 hover:bg-ink-strong disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian">
          {isLoading ? "Asking…" : "Ask tutor"}
        </button>
      </form>
      {error ? <p className="mt-4 text-danger" role="alert">{error}</p> : null}
      {answer ? (
        <div className="mt-5 space-y-3" role="status" aria-live="polite">
          {answer.kind === "ai_grounded" ? (
            <p className="font-mono text-[0.8125rem]/[1.5] font-medium uppercase tracking-[0.14em] text-relief">AI-assisted explanation — check the reference below</p>
          ) : null}
          {answer.kind === "out_of_scope" ? (
            <p className="font-mono text-[0.6875rem]/[1.2] font-medium uppercase tracking-[0.14em] text-ink-muted">No confident match</p>
          ) : null}
          <p className={`text-[1.0625rem]/[1.7] ${answer.kind === "out_of_scope" ? "text-ink-muted" : "text-ink"}`}>{answer.text}</p>
          {answer.citations.map((citation) => <CitationCard key={`${citation.sourceFile}-${citation.pageOrSlide}`} citation={citation} />)}
        </div>
      ) : null}
    </section>
  );
}
