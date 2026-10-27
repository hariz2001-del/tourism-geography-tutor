"use client";

import { useFormStatus } from "react-dom";
import { enterAs } from "./actions";
import type { AppRole } from "@/lib/auth/types";

const roles: { role: AppRole; title: string; detail: string }[] = [
  {
    role: "student",
    title: "Continue as Student",
    detail: "Study the chapters, flip through flashcards, sit exams and see your results.",
  },
  {
    role: "lecturer",
    title: "Continue as Lecturer",
    detail: "See the teaching dashboard: class results, the question bank and the exam builder.",
  },
];

function ChooseButton({ title, detail }: { title: string; detail: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex w-full flex-col items-start gap-1 rounded-card border border-graticule bg-surface p-5 text-left transition-colors hover:border-meridian hover:bg-meridian/6 disabled:cursor-wait disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
    >
      <span className="font-display text-[1.25rem] font-semibold text-ink-strong group-hover:text-meridian">
        {pending ? "Opening…" : title}
        <span aria-hidden="true" className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
      </span>
      <span className="text-ink-muted">{detail}</span>
    </button>
  );
}

export default function RoleChooser({ next }: { next: string }) {
  return (
    <div className="grid gap-3">
      {roles.map(({ role, title, detail }) => (
        <form key={role} action={enterAs}>
          <input type="hidden" name="role" value={role} />
          <input type="hidden" name="next" value={next} />
          <ChooseButton title={title} detail={detail} />
        </form>
      ))}
    </div>
  );
}
