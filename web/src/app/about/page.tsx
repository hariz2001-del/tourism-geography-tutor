import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Study guide | Tourism Geography Tutor",
  description: "How to study Tourism Geography, ask the tutor, and use practice assessments.",
};

const steps = [
  {
    number: "01",
    title: "Choose one topic",
    detail: "Open a chapter, then choose a topic from its menu. Definitions, examples, diagrams, and photos are grouped to make each lesson easier to scan.",
  },
  {
    number: "02",
    title: "Ask the tutor",
    detail: "Ask for a definition, comparison, or explanation. Helpful answers include a reference so you can revisit the related topic.",
  },
  {
    number: "03",
    title: "Practise and review",
    detail: "Take a five-question topic quiz, a chapter mini exam, or the full exam. After submission, review the marking scheme and revisit any topic that needs more work.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-4xl px-6 py-12 md:py-16">
      <header className="max-w-3xl space-y-4">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-meridian">Study guide</p>
        <h1 className="text-balance font-display text-[2.5rem]/[1.08] font-semibold tracking-[-0.02em] text-ink-strong md:text-[3.5rem]">
          Study Tourism Geography with a clear routine.
        </h1>
        <p className="max-w-[62ch] text-[1.1875rem]/[1.6] text-ink">
          Read one topic at a time, ask questions when something is unclear, and practise until the ideas feel familiar.
        </p>
      </header>

      <ol className="mt-12 divide-y divide-graticule border-y border-graticule">
        {steps.map((step) => (
          <li key={step.number} className="grid gap-3 py-7 sm:grid-cols-[3rem_13rem_1fr] sm:gap-5">
            <span className="font-mono text-sm text-meridian" aria-hidden="true">{step.number}</span>
            <h2 className="font-display text-xl font-semibold text-ink-strong">{step.title}</h2>
            <p className="max-w-[62ch] text-[1.0625rem]/[1.7] text-ink">{step.detail}</p>
          </li>
        ))}
      </ol>

      <aside className="mt-10 border-l-2 border-l-relief bg-relief/5 p-5" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="font-display text-xl font-semibold text-ink-strong">How references help</h2>
        <p className="mt-2 max-w-[65ch] text-[1.0625rem]/[1.7] text-ink">
          Helpful answers include a chapter and page or slide reference so you can review the idea in context. If the tutor is not confident, it will ask you to rephrase instead of guessing.
        </p>
      </aside>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href="/chapters/CH1">
          Start Chapter 1
        </Link>
        <Link className="inline-flex min-h-11 items-center rounded-card border border-graticule bg-surface px-5 font-medium text-meridian transition-colors hover:border-meridian hover:bg-meridian/6 active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian" href="/practice/course">
          Take the full exam
        </Link>
      </div>
    </main>
  );
}
