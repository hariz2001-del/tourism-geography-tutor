import Link from "next/link";
import DashboardShell, { EmptyPanel } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { attemptPercentage, groupAttemptsByScope } from "@/lib/learners/metrics";
import { formatDateTime, retakeHref, studentTabs } from "@/lib/learners/navigation";
import { listAttempts } from "@/lib/learners/student";

export const metadata = { title: "Results · Tourism Geography Tutor" };

export default async function StudentResults() {
  const profile = await requireProfile("student");
  const attempts = await listAttempts(profile.id);
  const groups = groupAttemptsByScope(attempts);

  return (
    <DashboardShell
      eyebrow="My learning"
      title="Results"
      description="Every attempt is kept. Retaking an assessment adds a new result — it never overwrites your best."
      tabs={studentTabs}
      activeHref="/dashboard/student/results"
    >
      {groups.length === 0 ? (
        <EmptyPanel
          title="You have not submitted an assessment yet."
          detail="Topic quizzes, chapter mini exams, and the full course exam all record a result here."
          action={
            <Link className="font-medium text-meridian underline underline-offset-4" href="/practice/course">
              Take the full course exam
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.key} className="space-y-4 rounded-card border border-graticule bg-surface p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">{group.scopeLabel}</h2>
                <a
                  className="inline-flex min-h-11 items-center rounded-card bg-meridian px-4 font-medium text-chart transition-colors hover:bg-ink-strong active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  href={retakeHref(group.mode, group.scopeValue)}
                >
                  Retake
                </a>
              </div>

              <dl className="flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <dt className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Best</dt>
                  <dd className="font-display text-[1.5rem] font-semibold text-ink-strong">
                    {attemptPercentage(group.best)}%
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Latest</dt>
                  <dd className="font-display text-[1.5rem] font-semibold text-ink-strong">
                    {attemptPercentage(group.latest)}%
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">Attempts</dt>
                  <dd className="font-display text-[1.5rem] font-semibold text-ink-strong">{group.attempts.length}</dd>
                </div>
              </dl>

              <ul className="divide-y divide-graticule border-t border-graticule">
                {group.attempts.map((attempt) => (
                  <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-ink-strong">
                        {attempt.awardedMarks} / {attempt.totalMarks} marks
                        <span className="ml-2 font-mono text-[0.8125rem] text-ink-muted">
                          {attemptPercentage(attempt)}%
                        </span>
                        {attempt.id === group.best.id && group.attempts.length > 1 ? (
                          <span className="ml-2 rounded-card bg-meridian/12 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-meridian">
                            Best
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[0.9375rem] text-ink-muted">{formatDateTime(attempt.submittedAt)}</p>
                    </div>
                    <Link
                      className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                      href={`/dashboard/student/results/${attempt.id}`}
                    >
                      Review answers
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
