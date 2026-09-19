import Link from "next/link";
import { requireProfile } from "@/lib/auth/session";
import { listPublishedExams } from "@/lib/learners/exams";

export const metadata = { title: "Exams · Tourism Geography Tutor" };

export default async function ExamsPage() {
  await requireProfile();
  const exams = await listPublishedExams();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[52rem] flex-col gap-6 px-6 py-10">
      <div className="space-y-2">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Assessment</p>
        <h1 className="font-display text-[2.5rem]/[1.1] font-semibold tracking-[-0.02em] text-ink-strong">Exams</h1>
        <p className="text-[1.125rem] text-ink">
          Papers set by your lecturer. Each one is marked as soon as you submit it.
        </p>
      </div>

      {exams.length === 0 ? (
        <section className="space-y-3 rounded-card border border-graticule bg-surface p-5">
          <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">No exams are set yet</h2>
          <p className="text-ink">
            When your lecturer publishes one it appears here. In the meantime, every topic has a quiz of
            its own.
          </p>
          <Link className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4" href="/">
            Back to the course
          </Link>
        </section>
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => (
            <li key={exam.id} className="rounded-card border border-graticule bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">{exam.title}</h2>
                  {exam.description ? <p className="text-ink">{exam.description}</p> : null}
                  <p className="text-[0.9375rem] text-ink-muted">
                    {exam.questionCount} {exam.questionCount === 1 ? "question" : "questions"} ·{" "}
                    {exam.totalMarks} {exam.totalMarks === 1 ? "mark" : "marks"}
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  href={`/exams/${exam.id}`}
                >
                  Start
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
