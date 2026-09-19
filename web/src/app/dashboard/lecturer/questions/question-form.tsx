"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveQuestion } from "./actions";
import { emptyQuestionActionState } from "./action-state";
import { MAX_OPTIONS } from "./question-payload";
import type { QuestionDetail } from "@/lib/learners/question-bank";

type SourceUnit = { id: string; title: string; topicId: string; topicName: string; chapterCode: string };

type OptionRow = { key: string; text: string; isCorrect: boolean };
type CriterionRow = { key: string; criterion: string; marks: number; sourceContentUnitId: string; keywords: string };

const fieldClass =
  "min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";
const labelClass = "block font-medium text-ink-strong";
const smallButtonClass =
  "inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-3 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";

let rowCounter = 0;
function newKey(): string {
  rowCounter += 1;
  return `row-${rowCounter}`;
}

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
  const [maxMarks, setMaxMarks] = useState(question?.maxMarks ?? 1);
  const correctName = useId();

  const [options, setOptions] = useState<OptionRow[]>(() =>
    question?.options.length
      ? question.options.map((option) => ({ key: newKey(), text: option.text, isCorrect: option.isCorrect }))
      : [
          { key: newKey(), text: "", isCorrect: true },
          { key: newKey(), text: "", isCorrect: false },
        ],
  );

  const [criteria, setCriteria] = useState<CriterionRow[]>(() =>
    question?.criteria.length
      ? question.criteria.map((criterion) => ({
          key: newKey(),
          criterion: criterion.criterion,
          marks: criterion.marks,
          sourceContentUnitId: criterion.sourceContentUnitId ?? "",
          keywords: criterion.acceptedConcepts.join(", "),
        }))
      : [{ key: newKey(), criterion: "", marks: 1, sourceContentUnitId: "", keywords: "" }],
  );

  // The source must come from the chosen topic, so the picker narrows with it.
  const availableSources = topicId ? sourceUnits.filter((unit) => unit.topicId === topicId) : sourceUnits;
  const awarded = criteria.reduce((total, criterion) => total + (Number.isFinite(criterion.marks) ? criterion.marks : 0), 0);

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
          <input
            id="maxMarks" name="maxMarks" type="number" min={1} max={20} className={fieldClass}
            value={maxMarks}
            onChange={(event) => setMaxMarks(Number(event.target.value))}
          />
        </div>
      </div>

      {questionType === "mcq" ? (
        <fieldset className="space-y-3">
          <legend className={labelClass}>Answers</legend>
          <p className="text-[0.9375rem] text-ink-muted">
            Choose the radio beside the correct one. Learners see these in this order.
          </p>

          {options.map((option, index) => (
            <div className="flex items-start gap-3" key={option.key}>
              <input
                type="radio"
                name={correctName}
                className="mt-4 h-5 w-5 shrink-0 accent-[var(--color-meridian)]"
                checked={option.isCorrect}
                onChange={() =>
                  setOptions((rows) => rows.map((row) => ({ ...row, isCorrect: row.key === option.key })))
                }
                aria-label={`Answer ${index + 1} is correct`}
              />
              {/* The parser reads rows by this index, so a removed row simply leaves a gap. */}
              {option.isCorrect ? <input type="hidden" name="correctOption" value={index} /> : null}
              <input
                type="text"
                name={`optionText.${index}`}
                className={fieldClass}
                value={option.text}
                onChange={(event) =>
                  setOptions((rows) => rows.map((row) => (row.key === option.key ? { ...row, text: event.target.value } : row)))
                }
                aria-label={`Answer ${index + 1}`}
                placeholder={`Answer ${index + 1}`}
              />
              {options.length > 2 ? (
                <button
                  type="button"
                  className={smallButtonClass}
                  onClick={() => setOptions((rows) => rows.filter((row) => row.key !== option.key))}
                  aria-label={`Remove answer ${index + 1}`}
                >
                  Remove
                </button>
              ) : null}
            </div>
          ))}

          {options.length < MAX_OPTIONS ? (
            <button
              type="button"
              className={smallButtonClass}
              onClick={() => setOptions((rows) => [...rows, { key: newKey(), text: "", isCorrect: false }])}
            >
              Add an answer
            </button>
          ) : null}
        </fieldset>
      ) : (
        <fieldset className="space-y-3">
          <legend className={labelClass}>Marking points</legend>
          <p className="text-[0.9375rem] text-ink-muted">
            One point per thing the learner must say. The marks must add up to the marks on offer —
            currently {awarded} of {maxMarks}.
          </p>

          {criteria.map((criterion, index) => (
            <div className="space-y-2 rounded-card border border-graticule p-3" key={criterion.key}>
              <div className="flex items-start gap-3">
                <input
                  type="text"
                  name={`criterionText.${index}`}
                  className={fieldClass}
                  value={criterion.criterion}
                  onChange={(event) =>
                    setCriteria((rows) =>
                      rows.map((row) => (row.key === criterion.key ? { ...row, criterion: event.target.value } : row)),
                    )
                  }
                  aria-label={`Marking point ${index + 1}`}
                  placeholder="What the learner has to say"
                />
                <input
                  type="number"
                  min={1}
                  name={`criterionMarks.${index}`}
                  className="min-h-11 w-20 shrink-0 rounded-card border border-graticule bg-chart px-3 text-ink"
                  value={criterion.marks}
                  onChange={(event) =>
                    setCriteria((rows) =>
                      rows.map((row) => (row.key === criterion.key ? { ...row, marks: Number(event.target.value) } : row)),
                    )
                  }
                  aria-label={`Marks for point ${index + 1}`}
                />
                {criteria.length > 1 ? (
                  <button
                    type="button"
                    className={smallButtonClass}
                    onClick={() => setCriteria((rows) => rows.filter((row) => row.key !== criterion.key))}
                    aria-label={`Remove marking point ${index + 1}`}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  name={`criterionSource.${index}`}
                  className={fieldClass}
                  value={criterion.sourceContentUnitId}
                  onChange={(event) =>
                    setCriteria((rows) =>
                      rows.map((row) =>
                        row.key === criterion.key ? { ...row, sourceContentUnitId: event.target.value } : row,
                      ),
                    )
                  }
                  aria-label={`Course material behind point ${index + 1}`}
                >
                  <option value="">Where this comes from…</option>
                  {availableSources.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.title}</option>
                  ))}
                </select>
                <input
                  type="text"
                  name={`criterionKeywords.${index}`}
                  className={fieldClass}
                  value={criterion.keywords}
                  onChange={(event) =>
                    setCriteria((rows) =>
                      rows.map((row) => (row.key === criterion.key ? { ...row, keywords: event.target.value } : row)),
                    )
                  }
                  aria-label={`Accepted wording for point ${index + 1}`}
                  placeholder="Accepted wording, comma separated"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            className={smallButtonClass}
            onClick={() =>
              setCriteria((rows) => [
                ...rows,
                { key: newKey(), criterion: "", marks: 1, sourceContentUnitId: "", keywords: "" },
              ])
            }
          >
            Add a marking point
          </button>
        </fieldset>
      )}

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
