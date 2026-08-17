import Link from "next/link";
import DashboardShell, { EmptyPanel, StatTile } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { attemptPercentage, summariseAttempts, topicAccuracy, weakestTopics } from "@/lib/learners/metrics";
import { formatDate, studentTabs, topicHref } from "@/lib/learners/navigation";
import { listAllAnswers, listAttempts, listBookmarks, listStudiedTopics, listTopicIndex } from "@/lib/learners/student";

export const metadata = { title: "My learning · Tourism Geography Tutor" };

export default async function StudentOverview() {
  const profile = await requireProfile("student");

  const [attempts, answers, studied, bookmarks, topicIndex] = await Promise.all([
    listAttempts(profile.id),
    listAllAnswers(profile.id),
    listStudiedTopics(profile.id),
    listBookmarks(profile.id),
    listTopicIndex(),
  ]);

  const summary = summariseAttempts(attempts);
  const weakest = weakestTopics(topicAccuracy(answers, topicIndex));
  const resume = studied[0];

  return (
    <DashboardShell
      eyebrow="My learning"
      title={`Welcome back, ${profile.displayName}`}
      description="Your saved material, reading history, and assessment results are kept to your account."
      tabs={studentTabs}
      activeHref="/dashboard/student"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Best score"
          value={summary.best ? `${attemptPercentage(summary.best)}%` : "—"}
          detail={summary.best ? summary.best.scopeLabel : "No assessment taken yet"}
        />
        <StatTile
          label="Latest score"
          value={summary.latest ? `${attemptPercentage(summary.latest)}%` : "—"}
          detail={summary.latest ? formatDate(summary.latest.submittedAt) : "Take one to start tracking"}
        />
        <StatTile
          label="Topics studied"
          value={`${studied.length} of ${topicIndex.size}`}
          detail={`${Math.round((studied.length / Math.max(topicIndex.size, 1)) * 100)}% of the course visited`}
        />
        <StatTile
          label="Saved material"
          value={String(bookmarks.length)}
          detail={bookmarks.length === 1 ? "item bookmarked" : "items bookmarked"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Worth revisiting</h2>
          {weakest.length ? (
            <ul className="space-y-3">
              {weakest.map((topic) => (
                <li key={topic.topicId} className="rounded-card border border-graticule bg-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <Link
                      className="font-medium text-ink-strong underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                      href={topicHref(topic.chapterCode, topic.topicId)}
                    >
                      {topic.topicName}
                    </Link>
                    <span className="font-mono text-[0.8125rem] text-ink-muted">
                      {topic.chapterCode} · {topic.accuracy}%
                    </span>
                  </div>
                  <p className="mt-1 text-[0.9375rem] text-ink-muted">
                    {topic.awardedMarks} of {topic.totalMarks} marks across your answers so far.
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyPanel
              title={attempts.length ? "Nothing is dragging you down." : "No assessment data yet."}
              detail={
                attempts.length
                  ? "Every topic you have been assessed on is at 80% or better."
                  : "Take a topic quiz or the full exam and your weakest topics will be listed here."
              }
              action={
                <Link className="font-medium text-meridian underline underline-offset-4" href="/practice/course">
                  Take the full course exam
                </Link>
              }
            />
          )}
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Pick up where you left off</h2>
          {resume ? (
            <div className="space-y-2 rounded-card border border-graticule bg-surface p-4">
              <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
                {resume.chapterCode} · last opened {formatDate(resume.lastViewedAt)}
              </p>
              <Link
                className="block font-display text-[1.25rem] font-semibold text-ink-strong underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                href={topicHref(resume.chapterCode, resume.topicId)}
              >
                {resume.topicName}
              </Link>
              <p className="text-ink-muted">{resume.chapterTitle}</p>
            </div>
          ) : (
            <EmptyPanel
              title="You have not opened a topic yet."
              detail="Topics you read are recorded here so you can pick the thread back up."
              action={
                <Link className="font-medium text-meridian underline underline-offset-4" href="/chapters/CH1">
                  Start Chapter 1
                </Link>
              }
            />
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
