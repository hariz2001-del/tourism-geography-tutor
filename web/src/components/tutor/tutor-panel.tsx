"use client";

import { FormEvent, KeyboardEvent, RefObject, useEffect, useRef, useState } from "react";
import type { Citation } from "@/lib/course-brain/types";
import CitationCard from "./citation-card";

type TutorResponse = {
  kind: "grounded" | "ai_grounded" | "out_of_scope";
  text: string;
  citations: Citation[];
};

type ThreadEntryDraft =
  | { role: "learner"; text: string }
  | { role: "tutor"; response: TutorResponse }
  | { role: "error"; text: string };

type ThreadEntry = ThreadEntryDraft & { id: number };

type Props = {
  topicTitle?: string;
  // The floating widget owns focus, so it needs a handle on the composer.
  inputRef?: RefObject<HTMLTextAreaElement | null>;
};

// Thrown only when the API responded but the response itself carries an
// error (non-ok status, or a malformed body). Its `.message` is safe to show
// to a user. Any other thrown error (network failure, JSON parse failure,
// etc.) is not an ApiError and always falls back to a friendly string.
class TutorApiError extends Error {}

export default function TutorPanel({ topicTitle, inputRef }: Props) {
  const [question, setQuestion] = useState("");
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Keep the newest exchange in view; the thread is the only scrolling region.
  useEffect(() => {
    const element = threadRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [thread, isLoading]);

  function append(entry: ThreadEntryDraft) {
    nextId.current += 1;
    const id = nextId.current;
    setThread((entries) => [...entries, { ...entry, id }]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const asked = question.trim();
    if (!asked || isLoading) return;

    append({ role: "learner", text: asked });
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: asked }),
      });
      const body = await response.json() as { data?: TutorResponse; error?: string };
      if (!response.ok || !body.data) {
        throw new TutorApiError(body.error ?? "The tutor could not answer right now.");
      }
      append({ role: "tutor", response: body.data });
    } catch (caught) {
      append({
        role: "error",
        text: caught instanceof TutorApiError ? caught.message : "The tutor could not answer right now.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Enter sends, Shift+Enter starts a new line — the convention learners expect
  // from a chat box. IME composition must never be interrupted.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }

  const lastTutorId = [...thread].reverse().find((entry) => entry.role === "tutor")?.id;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={threadRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {thread.length === 0 ? (
          <div className="space-y-2 rounded-card border border-graticule bg-chart p-3">
            <p className="text-[0.9375rem]/[1.6] text-ink">
              Ask any Tourism Geography question{topicTitle ? `, not just about “${topicTitle}”` : ""}. Helpful answers
              include a course reference you can open.
            </p>
            <p className="text-[0.875rem]/[1.5] text-ink-muted">
              Try “What is the difference between weather and climate?”
            </p>
          </div>
        ) : null}

        {thread.map((entry) => {
          if (entry.role === "learner") {
            return (
              <p
                key={entry.id}
                className="ml-auto w-fit max-w-[85%] rounded-card bg-meridian/12 px-3 py-2 text-[0.9375rem]/[1.6] text-ink-strong"
              >
                {entry.text}
              </p>
            );
          }

          if (entry.role === "error") {
            return (
              <p key={entry.id} role="alert" className="rounded-card border border-danger/40 bg-danger/8 px-3 py-2 text-[0.9375rem]/[1.6] text-danger">
                {entry.text}
              </p>
            );
          }

          const { response } = entry;
          return (
            <div
              key={entry.id}
              // Only the newest answer announces itself, so older replies are
              // not re-read when the conversation grows.
              role={entry.id === lastTutorId ? "status" : undefined}
              className="mr-auto w-fit max-w-[92%] space-y-2 rounded-card border border-graticule bg-surface px-3 py-2"
            >
              {response.kind === "ai_grounded" ? (
                <p className="font-mono text-[0.6875rem]/[1.3] font-medium uppercase tracking-[0.14em] text-relief">
                  AI-assisted explanation — check the reference below
                </p>
              ) : null}
              {response.kind === "out_of_scope" ? (
                <p className="font-mono text-[0.6875rem]/[1.2] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  No confident match
                </p>
              ) : null}
              <p className={`text-[0.9375rem]/[1.65] ${response.kind === "out_of_scope" ? "text-ink-muted" : "text-ink"}`}>
                {response.text}
              </p>
              {response.citations.map((citation) => (
                <CitationCard key={`${citation.sourceFile}-${citation.pageOrSlide}`} citation={citation} />
              ))}
            </div>
          );
        })}

        {isLoading ? (
          <p className="mr-auto w-fit rounded-card border border-graticule bg-surface px-3 py-2 text-[0.9375rem] text-ink-muted">
            Thinking…
          </p>
        ) : null}
      </div>

      <form className="flex items-end gap-2 border-t border-graticule bg-surface px-4 py-3" onSubmit={submit}>
        <label className="sr-only" htmlFor="tutor-question">Ask the tutor</label>
        <textarea
          id="tutor-question"
          ref={inputRef}
          aria-label="Ask the tutor"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          required
          maxLength={500}
          placeholder="Ask a question…"
          className="max-h-32 min-h-11 w-full flex-1 resize-y rounded-card border border-graticule bg-chart px-3 py-2 text-[0.9375rem] text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-11 shrink-0 items-center rounded-card bg-meridian px-4 font-medium text-chart transition-colors duration-150 hover:bg-ink-strong disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
        >
          {isLoading ? "Asking…" : "Ask tutor"}
        </button>
      </form>
    </div>
  );
}
