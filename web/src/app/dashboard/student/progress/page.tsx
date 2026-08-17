import Link from "next/link";
import DashboardShell, { EmptyPanel, StatTile } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { formatDate, studentTabs, topicHref } from "@/lib/learners/navigation";
import { listStudiedTopics, listTopicIndex } from "@/lib/learners/student";

export const metadata = { title: "Studied · Tourism Geography Tutor" };

export default async function StudentProgress() {
  const profile = await requireProfile("student");
  const [studied, topicIndex] = await Promise.all([listStudiedTopics(profile.id), listTopicIndex()]);

  const studiedById = new Map(studied.map((topic) => [topic.topicId, topic]));
  const notStarted = [...topicIndex.entries()]
    .filter(([topicId]) => !studiedById.has(topicId))
    .map(([topicId, topic]) => ({ topicId, ...topic }));

  return (
    <DashboardShell
      eyebrow="My learning"
      title="What you have studied"
      description="A topic is recorded here the first time you open it, and updated each time you come back."
      tabs={studentTabs}
      activeHref="/dashboard/student/progress"
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Topics studied" value={String(studied.length)} detail={`of ${topicIndex.size} in the course`} />
        <StatTile
          label="Coverage"
          value={`${Math.round((studied.length / Math.max(topicIndex.size, 1)) * 100)}%`}
          detail="of the course opened at least once"
        />
        <StatTile label="Not started" value={String(notStarted.length)} detail="topics still untouched" />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Studied</h2>
        {studied.length ? (
          <ul className="divide-y divide-graticule rounded-card border border-graticule bg-surface">
            {studied.map((topic) => (
              <li key={topic.topicId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link
                    className="font-medium text-ink-strong underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                    href={topicHref(topic.chapterCode, topic.topicId)}
                  >
                    {topic.topicName}
                  </Link>
                  <p className="text-[0.9375rem] text-ink-muted">
                    {topic.chapterCode} · {topic.chapterTitle}
                  </p>
                </div>
                <p className="font-mono text-[0.8125rem] text-ink-muted">
                  Last opened {formatDate(topic.lastViewedAt)} · {topic.viewCount}{" "}
                  {topic.viewCount === 1 ? "visit" : "visits"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyPanel
            title="Nothing recorded yet."
            detail="Open a topic while signed in and it will appear here."
            action={
              <Link className="font-medium text-meridian underline underline-offset-4" href="/chapters/CH1">
                Start Chapter 1
              </Link>
            }
          />
        )}
      </section>

      {notStarted.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Not started</h2>
          <ul className="grid gap-x-6 gap-y-2 rounded-card border border-graticule bg-surface p-4 sm:grid-cols-2">
            {notStarted.map((topic) => (
              <li key={topic.topicId}>
                <Link
                  className="text-ink underline decoration-graticule underline-offset-4 transition-colors hover:text-meridian hover:decoration-meridian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  href={topicHref(topic.chapterCode, topic.topicId)}
                >
                  {topic.name}
                </Link>
                <span className="ml-2 font-mono text-[0.75rem] text-ink-muted">{topic.chapterCode}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </DashboardShell>
  );
}
