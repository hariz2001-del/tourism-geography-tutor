import Link from "next/link";
import DashboardShell, { EmptyPanel, StatTile } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { listClassroomStudents, listQuestions, summariseBank } from "@/lib/learners/lecturer";
import { formatDate, lecturerTabs } from "@/lib/learners/navigation";

export const metadata = { title: "Teaching · Tourism Geography Tutor" };

export default async function LecturerOverview() {
  const profile = await requireProfile("lecturer");
  const [students, questions] = await Promise.all([listClassroomStudents(), listQuestions()]);
  const bank = summariseBank(questions);

  const assessed = students.filter((student) => student.attemptCount > 0);
  const classAverage = assessed.length
    ? Math.round(
        assessed.reduce((sum, student) => sum + (student.averagePercentage ?? 0), 0) / assessed.length,
      )
    : null;

  return (
    <DashboardShell
      eyebrow="Teaching"
      title={`Good to see you, ${profile.displayName}`}
      description="Class results and the question bank. Learners' saved material and reading history stay private to them."
      tabs={lecturerTabs}
      activeHref="/dashboard/lecturer"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Students" value={String(students.length)} detail="in your classroom" tone="brand" />
        <StatTile
          label="Class average"
          value={classAverage === null ? "—" : `${classAverage}%`}
          detail={assessed.length ? `across ${assessed.length} assessed` : "nobody assessed yet"}
        />
        <StatTile label="Questions" value={String(bank.total)} detail={`${bank.mcq} MCQ · ${bank.subjective} written`} />
        <StatTile
          tone={bank.draft ? "waiting" : "good"}
          label="Awaiting approval"
          value={String(bank.draft)}
          detail={bank.draft ? "drafts not yet reviewed" : "everything reviewed"}
        />
      </section>

      {bank.draft > 0 ? (
        <section className="space-y-3 rounded-card border border-relief/40 bg-relief/8 p-5">
          <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">
            {bank.draft} questions are still unapproved drafts
          </h2>
          <p className="max-w-[70ch] text-ink">
            These were drafted by AI from the approved course material and are currently serving
            learners as practice. Reviewing and approving them puts your judgement on the record for
            each one.
          </p>
          <Link
            className="inline-flex min-h-11 items-center rounded-card bg-meridian px-5 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
            href="/dashboard/lecturer/review"
          >
            Open the approval queue
          </Link>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Your students</h2>
          <Link className="font-medium text-meridian underline underline-offset-4" href="/dashboard/lecturer/students">
            See the full roster
          </Link>
        </div>
        {students.length ? (
          <ul className="divide-y divide-graticule rounded-card border border-graticule bg-surface">
            {students.slice(0, 5).map((student) => (
              <li key={student.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link
                    className="font-medium text-ink-strong underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                    href={`/dashboard/lecturer/students/${student.id}`}
                  >
                    {student.displayName}
                  </Link>
                  <p className="font-mono text-[0.8125rem] text-ink-muted">{student.username}</p>
                </div>
                <p className="font-mono text-[0.8125rem] text-ink-muted">
                  {student.attemptCount === 0
                    ? "No assessments yet"
                    : `Best ${student.bestPercentage}% · latest ${student.latestPercentage}% · ${student.attemptCount} attempts · ${formatDate(student.lastActiveAt!)}`}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyPanel
            title="Your classroom has no students yet."
            detail="Students appear here once they are added to a classroom you teach."
          />
        )}
      </section>
    </DashboardShell>
  );
}
