"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  addExamQuestion,
  moveExamQuestion,
  removeExamQuestion,
  setExamStatus,
  updateExam,
} from "./actions";
import { emptyExamActionState } from "./action-state";
import type { ExamStatus } from "@/lib/learners/exams";

const fieldClass =
  "min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";
const labelClass = "block font-medium text-ink-strong";
const quietButton =
  "inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-3 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 disabled:cursor-not-allowed disabled:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";
const strongButton =
  "inline-flex min-h-11 items-center rounded-card bg-meridian px-4 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";

function Pending({ children, className }: { children: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Working…" : children}
    </button>
  );
}

export function ExamStatusButtons({ examId, status }: { examId: string; status: ExamStatus }) {
  const [state, formAction] = useActionState(setExamStatus, emptyExamActionState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="examId" value={examId} />
      <div className="flex flex-wrap gap-2">
        {status !== "published" ? (
          <button type="submit" name="status" value="published" className={strongButton}>
            Publish to students
          </button>
        ) : (
          <button type="submit" name="status" value="draft" className={quietButton}>
            Unpublish
          </button>
        )}
        {status !== "archived" ? (
          <button type="submit" name="status" value="archived" className={quietButton}>
            Archive
          </button>
        ) : (
          <button type="submit" name="status" value="draft" className={quietButton}>
            Bring back as a draft
          </button>
        )}
      </div>
      {state.error ? <p role="alert" className="text-danger">{state.error}</p> : null}
      {state.message ? <p role="status" className="text-lowland">{state.message}</p> : null}
    </form>
  );
}

export function ExamSettingsForm({
  examId,
  title,
  description,
  showAnswers,
}: {
  examId: string;
  title: string;
  description: string | null;
  showAnswers: boolean;
}) {
  const [state, formAction] = useActionState(updateExam, emptyExamActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="examId" value={examId} />

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="title">Name</label>
        <input id="title" name="title" required className={fieldClass} defaultValue={title} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="description">What this paper covers</label>
        <input id="description" name="description" className={fieldClass} defaultValue={description ?? ""} />
      </div>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="showAnswers"
          defaultChecked={showAnswers}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-meridian)]"
        />
        <span>
          <span className="block font-medium text-ink-strong">Show students the answers afterwards</span>
          <span className="block text-[0.9375rem] text-ink-muted">
            Each question shows what they answered, whether it was right, and a link to the part of the
            course that explains it.
          </span>
        </span>
      </label>

      {state.error ? <p role="alert" className="text-danger">{state.error}</p> : null}
      {state.message ? <p role="status" className="text-lowland">{state.message}</p> : null}

      <Pending className={strongButton}>Save</Pending>
    </form>
  );
}

export function PaperQuestionControls({
  examId,
  examQuestionId,
  isFirst,
  isLast,
  position,
}: {
  examId: string;
  examQuestionId: string;
  isFirst: boolean;
  isLast: boolean;
  position: number;
}) {
  const [moveState, moveAction] = useActionState(moveExamQuestion, emptyExamActionState);
  const [removeState, removeAction] = useActionState(removeExamQuestion, emptyExamActionState);
  const error = moveState.error ?? removeState.error;

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <form action={moveAction}>
          <input type="hidden" name="examId" value={examId} />
          <input type="hidden" name="examQuestionId" value={examQuestionId} />
          <input type="hidden" name="direction" value="up" />
          <button type="submit" disabled={isFirst} className={quietButton} aria-label={`Move question ${position} up`}>
            ↑
          </button>
        </form>
        <form action={moveAction}>
          <input type="hidden" name="examId" value={examId} />
          <input type="hidden" name="examQuestionId" value={examQuestionId} />
          <input type="hidden" name="direction" value="down" />
          <button type="submit" disabled={isLast} className={quietButton} aria-label={`Move question ${position} down`}>
            ↓
          </button>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="examId" value={examId} />
          <input type="hidden" name="examQuestionId" value={examQuestionId} />
          <button type="submit" className={quietButton} aria-label={`Take question ${position} out of this paper`}>
            Remove
          </button>
        </form>
      </div>
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
    </div>
  );
}

export function AddQuestionButton({ examId, questionId }: { examId: string; questionId: string }) {
  const [state, formAction] = useActionState(addExamQuestion, emptyExamActionState);

  return (
    <form action={formAction} className="shrink-0 text-right">
      <input type="hidden" name="examId" value={examId} />
      <input type="hidden" name="questionId" value={questionId} />
      <Pending className={quietButton}>Add</Pending>
      {state.error ? <p role="alert" className="mt-1 text-[0.9375rem] text-danger">{state.error}</p> : null}
      {state.message ? <p role="status" className="mt-1 text-[0.9375rem] text-lowland">{state.message}</p> : null}
    </form>
  );
}
