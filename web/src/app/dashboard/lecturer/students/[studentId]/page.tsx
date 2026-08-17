import Link from "next/link";
import { notFound } from "next/navigation";
import { StatTile } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { getClassroomStudent } from "@/lib/learners/lecturer";
import { attemptPercentage, topicAccuracy } from "@/lib/learners/metrics";
import { formatDateTime, topicHref } from "@/lib/learners/navigation";
import { listAllAnswers, listAttempts, listTopicIndex } from "@/lib/learners/student";

export const metadata = { title: "Student · Tourism Geography Tutor" };

export default async function LecturerStudentDetail({ params }: { params: Promise<{ studentId: string }> }) {
  await requireProfile("lecturer");
  const { studentId } = await params;

  // Resolved through the classroom roster, so a student this lecturer does not
  // teach is a 404 rather than a partially-rendered page.
  const student = await getClassroomStudent(studentId);
  if (!student) notFound();

  const [attempts, answers, topicIndex] = await Promise.all([
    listAttempts(studentId),
    listAllAnswers(studentId),
    listTopicIndex(),
  ]);
  const accuracy = topicAccuracy(answers, topicIndex);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[72rem] flex-col gap-8 px-6 py-10">
      <header className="space-y-4">
        <Link
          className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4"
          href="/dashboard/lecturer/students"
        >
          ← Back to students
        </Link>
        <div className="space-y-2">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Student</p>
          <h1 className="font-display text-[2rem] font-semibold leading-[1.15] text-ink-strong md:text-[2.5rem]">
            {student.displayName}
          </h1>
          <p className="font-mono text-ink-muted">{student.username}</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Attempts" value={String(student.attemptCount)} />
        <StatTile label="Best" value={student.bestPercentage === null ? "—" : `${student.bestPercentage}%`} />
        <StatTile label="Latest" value={student.latestPercentage === null ? "—" : `${student.latestPercentage}%`} />
        <StatTile label="Average" value={student.averagePercentage === null ? "—" : `${student.averagePercentage}%`} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Accuracy by topic</h2>
        {accuracy.length ? (
          <ul className="divide-y divide-graticule rounded-card border border-graticule bg-surface">
            {accuracy.map((topic) => (
              <li key={topic.topicId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <Link
                  className="text-ink-strong underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  href={topicHref(topic.chapterCode, topic.topicId)}
                >
                  {topic.topicName}
                </Link>
                <span className="font-mono text-[0.8125rem] text-ink-muted">
                  {topic.chapterCode} · {topic.awardedMarks}/{topic.totalMarks} · {topic.accuracy}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="rounded-card border border-graticule bg-surface p-4 text-ink">
            This student has not been assessed yet.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Attempt history</h2>
        {attempts.length ? (
          <ul className="divide-y divide-graticule rounded-card border border-graticule bg-surface">
            {attempts.map((attempt) => (
              <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-ink-strong">{attempt.scopeLabel}</p>
                  <p className="text-[0.9375rem] text-ink-muted">{formatDateTime(attempt.submittedAt)}</p>
                </div>
                <p className="font-mono text-[0.8125rem] text-ink-muted">
                  {attempt.awardedMarks}/{attempt.totalMarks} · {attemptPercentage(attempt)}%
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="rounded-card border border-graticule bg-surface p-4 text-ink">
            No attempts recorded.
          </p>
        )}
      </section>
    </main>
  );
}
