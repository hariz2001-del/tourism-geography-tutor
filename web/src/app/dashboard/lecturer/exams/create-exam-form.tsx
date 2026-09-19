"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createExam } from "./actions";
import { emptyExamActionState } from "./action-state";

/**
 * The shapes she is likely to want, and a way out when none of them fit.
 *
 * The first is the format of the paper she supplied: sixty objective questions,
 * no written ones, which she sits students on twenty at a time.
 */
const PRESETS = [
  { id: "objective-20", label: "20 objective", detail: "Her usual format", mcq: 20, subjective: 0 },
  { id: "mixed-20-4", label: "20 objective + 4 written", detail: "A longer paper", mcq: 20, subjective: 4 },
  { id: "short-10-2", label: "10 objective + 2 written", detail: "A short test", mcq: 10, subjective: 2 },
] as const;

const fieldClass =
  "min-h-11 w-full rounded-card border border-graticule bg-chart px-3 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian";
const labelClass = "block font-medium text-ink-strong";

function CreateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-11 rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
    >
      {pending ? "Creating…" : "Create the paper"}
    </button>
  );
}

export default function CreateExamForm() {
  const [state, formAction] = useActionState(createExam, emptyExamActionState);
  const [preset, setPreset] = useState<string>(PRESETS[0].id);
  // Typed as plain numbers: `as const` above would otherwise pin these to the
  // first preset's exact values.
  const [mcq, setMcq] = useState<number>(PRESETS[0].mcq);
  const [subjective, setSubjective] = useState<number>(PRESETS[0].subjective);

  function choose(id: string) {
    setPreset(id);
    const chosen = PRESETS.find((option) => option.id === id);
    if (chosen) {
      setMcq(chosen.mcq);
      setSubjective(chosen.subjective);
    }
  }

  return (
    <form action={formAction} className="space-y-5 rounded-card border border-graticule bg-surface p-5">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="title">Name</label>
        <input id="title" name="title" required className={fieldClass} placeholder="Set 1" />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="description">What this paper covers <span className="font-normal text-ink-muted">(optional)</span></label>
        <input id="description" name="description" className={fieldClass} placeholder="Chapters 1 and 2" />
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Format</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PRESETS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-card border p-3 transition-colors ${
                preset === option.id ? "border-meridian bg-meridian/6" : "border-graticule hover:border-meridian"
              }`}
            >
              <input
                type="radio"
                name="preset"
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-meridian)]"
                checked={preset === option.id}
                onChange={() => choose(option.id)}
              />
              <span>
                <span className="block font-medium text-ink-strong">{option.label}</span>
                <span className="block text-[0.9375rem] text-ink-muted">{option.detail}</span>
              </span>
            </label>
          ))}

          <label
            className={`flex cursor-pointer items-start gap-3 rounded-card border p-3 transition-colors ${
              preset === "custom" ? "border-meridian bg-meridian/6" : "border-graticule hover:border-meridian"
            }`}
          >
            <input
              type="radio"
              name="preset"
              className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-meridian)]"
              checked={preset === "custom"}
              onChange={() => setPreset("custom")}
            />
            <span>
              <span className="block font-medium text-ink-strong">Something else</span>
              <span className="block text-[0.9375rem] text-ink-muted">Choose the numbers yourself</span>
            </span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="targetMcq">Objective questions</label>
            <input
              id="targetMcq" name="targetMcq" type="number" min={0} max={50} className={fieldClass}
              value={mcq}
              onChange={(event) => {
                setPreset("custom");
                setMcq(Number(event.target.value));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="targetSubjective">Written questions</label>
            <input
              id="targetSubjective" name="targetSubjective" type="number" min={0} max={50} className={fieldClass}
              value={subjective}
              onChange={(event) => {
                setPreset("custom");
                setSubjective(Number(event.target.value));
              }}
            />
          </div>
        </div>
        <p className="text-[0.9375rem] text-ink-muted">
          This is the target the builder counts towards. The paper is whatever questions you put in it.
        </p>
      </fieldset>

      {state.error ? <p role="alert" className="text-danger">{state.error}</p> : null}

      <CreateButton />
    </form>
  );
}
