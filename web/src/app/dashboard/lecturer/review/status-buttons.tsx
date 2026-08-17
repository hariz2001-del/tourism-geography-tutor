"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setQuestionStatus } from "../questions/actions";
import { emptyQuestionActionState } from "../questions/action-state";

function Action({ label, value, variant }: { label: string; value: string; variant: "primary" | "quiet" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="status"
      value={value}
      disabled={pending}
      className={
        variant === "primary"
          ? "inline-flex min-h-11 items-center rounded-card bg-meridian px-4 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
          : "inline-flex min-h-11 items-center rounded-card border border-graticule bg-chart px-4 font-medium text-ink-muted transition-colors hover:border-meridian hover:text-meridian disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
      }
    >
      {label}
    </button>
  );
}

export default function StatusButtons({ questionId, status }: { questionId: string; status: string }) {
  const [state, formAction] = useActionState(setQuestionStatus, emptyQuestionActionState);

  return (
    <div className="space-y-2">
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="questionId" value={questionId} />
        {status !== "approved" ? <Action label="Approve" value="approved" variant="primary" /> : null}
        {status !== "archived" ? <Action label="Archive" value="archived" variant="quiet" /> : null}
        {status !== "draft" ? <Action label="Back to draft" value="draft" variant="quiet" /> : null}
      </form>
      {state.error ? (
        <p role="alert" className="text-danger">
          Could not change status: {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="text-lowland">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
