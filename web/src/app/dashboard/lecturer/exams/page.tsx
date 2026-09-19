import Link from "next/link";
import DashboardShell, { EmptyPanel, StatTile } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { listExams } from "@/lib/learners/exams";
import { formatDate, lecturerTabs } from "@/lib/learners/navigation";
import CreateExamForm from "./create-exam-form";

export const metadata = { title: "Exams · Tourism Geography Tutor" };

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-relief/15 text-relief",
  published: "bg-lowland/15 text-lowland",
  archived: "bg-ink-muted/15 text-ink-muted",
};

const STATUS_WORDS: Record<string, string> = {
  draft: "Not yet visible to students",
  published: "Students can sit this",
  archived: "Hidden from students",
};

export default async function Exams() {
  await requireProfile("lecturer");
  const exams = await listExams();

  const published = exams.filter((exam) => exam.status === "published").length;
  const drafts = exams.filter((exam) => exam.status === "draft").length;

  return (
    <DashboardShell
      eyebrow="Teaching"
      title="Exams"
      description="Papers you build yourself: choose the questions, put them in order, and publish the ones students should sit."
      tabs={lecturerTabs}
      activeHref="/dashboard/lecturer/exams"
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Papers" value={String(exams.length)} />
        <StatTile label="Students can sit" value={String(published)} />
        <StatTile label="Still drafts" value={String(drafts)} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Your papers</h2>

        {exams.length === 0 ? (
          <EmptyPanel
            title="No papers yet"
            detail="Create one below, then fill it from the question bank."
          />
        ) : (
          <ul className="space-y-3">
            {exams.map((exam) => (
              <li key={exam.id} className="rounded-card border border-graticule bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Link
                      className="font-display text-[1.25rem] font-semibold text-ink-strong underline-offset-4 hover:text-meridian hover:underline"
                      href={`/dashboard/lecturer/exams/${exam.id}`}
                    >
                      {exam.title}
                    </Link>
                    {exam.description ? <p className="text-ink">{exam.description}</p> : null}
                    <p className="text-[0.9375rem] text-ink-muted">
                      {exam.questionCount} {exam.questionCount === 1 ? "question" : "questions"} ·{" "}
                      {exam.totalMarks} {exam.totalMarks === 1 ? "mark" : "marks"} · edited {formatDate(exam.updatedAt)}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] ${STATUS_STYLES[exam.status]}`}
                    title={STATUS_WORDS[exam.status]}
                  >
                    {exam.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[1.375rem] font-semibold text-ink-strong">Create a paper</h2>
        <CreateExamForm />
      </section>
    </DashboardShell>
  );
}
