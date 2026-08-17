"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveQuestion } from "./actions";
import { emptyQuestionActionState } from "./action-state";
import type { QuestionDetail } from "@/lib/learners/question-bank";

type SourceUnit = { id: string; title: string; topicId: string; topicName: string; chapterCode: string };

const fieldClass =
  "min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";
const labelClass = "block font-medium text-ink-strong";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
    >
      {pending ? "Saving…" : "Save question"}
    </button>
  );
}

export default function QuestionForm({
  question,
  topics,
  sourceUnits,
}: {
  question: QuestionDetail | null;
  topics: Array<{ id: string; name: string; chapterCode: string }>;
  sourceUnits: SourceUnit[];
}) {
  const [state, formAction] = useActionState(saveQuestion, emptyQuestionActionState);
  const [topicId, setTopicId] = useState(question?.topicId ?? "");
  const [questionType, setQuestionType] = useState(question?.questionType ?? "mcq");

  // The source must come from the chosen topic, so the picker narrows with it.
  const availableSources = topicId ? sourceUnits.filter((unit) => unit.topicId === topicId) : sourceUnits;

  return (
    <form action={formAction} className="space-y-5 rounded-card border border-graticule bg-surface p-5">
      {question ? <input type="hidden" name="questionId" value={question.id} /> : null}

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="question">Question</label>
        <textarea
          id="question" name="question" required rows={3}
          defaultValue={question?.question ?? ""}
          className={`${fieldClass} py-2`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="topicId">Topic</label>
          <select
            id="topicId" name="topicId" required className={fieldClass}
            value={topicId}
            onChange={(event) => setTopicId(event.target.value)}
          >
            <option value="">Choose a topic…</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>{topic.chapterCode} · {topic.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="sourceContentUnitId">Source material</label>
          <select
            id="sourceContentUnitId" name="sourceContentUnitId" required className={fieldClass}
            defaultValue={question?.sourceContentUnitId ?? ""}
            key={topicId}
          >
            <option value="">Choose the unit this comes from…</option>
            {availableSources.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.title}</option>
            ))}
          </select>
          <p className="text-[0.9375rem] text-ink-muted">
            Every question must trace back to a published, cited unit of course material.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="questionType">Type</label>
          <select
            id="questionType" name="questionType" className={fieldClass}
            value={questionType}
            onChange={(event) => setQuestionType(event.target.value as "mcq" | "subjective")}
          >
            <option value="mcq">Multiple choice</option>
            <option value="subjective">Written</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" name="difficulty" className={fieldClass} defaultValue={question?.difficulty ?? "introductory"}>
            <option value="introductory">Introductory</option>
            <option value="intermediate">Intermediate</option>
            <option value="application">Application</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="maxMarks">Marks</label>
          <input id="maxMarks" name="maxMarks" type="number" min={1} max={20} className={fieldClass} defaultValue={question?.maxMarks ?? 1} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="explanation">Explanation</label>
        <textarea
          id="explanation" name="explanation" required rows={3}
          defaultValue={question?.explanation ?? ""}
          className={`${fieldClass} py-2`}
        />
        <p className="text-[0.9375rem] text-ink-muted">Shown to the learner after they answer.</p>
      </div>

      {questionType === "subjective" ? (
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="subjectiveAnswerScheme">Answer scheme</label>
          <textarea
            id="subjectiveAnswerScheme" name="subjectiveAnswerScheme" rows={3}
            defaultValue={question?.subjectiveAnswerScheme ?? ""}
            className={`${fieldClass} py-2`}
          />
        </div>
      ) : null}

      {state.error ? <p role="alert" className="text-danger">{state.error}</p> : null}
      {state.message ? <p role="status" className="text-lowland">{state.message}</p> : null}

      <SaveButton />
    </form>
  );
}
