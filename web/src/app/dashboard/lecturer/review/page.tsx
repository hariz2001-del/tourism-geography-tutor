import Link from "next/link";
import DashboardShell, { EmptyPanel } from "@/components/dashboard/dashboard-shell";
import { requireProfile } from "@/lib/auth/session";
import { listQuestions, summariseBank } from "@/lib/learners/lecturer";
import { lecturerTabs } from "@/lib/learners/navigation";
import { listPendingDrafts } from "@/lib/learners/question-bank";
import StatusButtons from "./status-buttons";

export const metadata = { title: "Approval queue · Tourism Geography Tutor" };

const PAGE_SIZE = 10;

export default async function ApprovalQueue({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireProfile("lecturer");
  const { page } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  const [drafts, allEntries] = await Promise.all([
    listPendingDrafts(pageNumber * PAGE_SIZE),
    listQuestions(),
  ]);
  const bank = summariseBank(allEntries);
  const visible = drafts.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);
  const hasMore = bank.draft > pageNumber * PAGE_SIZE;

  return (
    <DashboardShell
      eyebrow="Teaching"
      title="Approval queue"
      description="Questions drafted from the approved course material, waiting on your review. Approving one records your judgement; the database will refuse any question that is not complete and properly cited."
      tabs={lecturerTabs}
      activeHref="/dashboard/lecturer/review"
    >
      <p role="status" className="text-ink">
        <strong className="text-ink-strong">{bank.draft}</strong> drafts awaiting review ·{" "}
        <strong className="text-ink-strong">{bank.approved}</strong> approved
      </p>

      {visible.length === 0 ? (
        <EmptyPanel
          title="Nothing left to review."
          detail="Every question in the bank has been approved or archived."
          action={
            <Link className="font-medium text-meridian underline underline-offset-4" href="/dashboard/lecturer/questions">
              Back to the question bank
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          {visible.map((draft) => (
            <article key={draft.id} className="space-y-4 rounded-card border border-graticule bg-surface p-5">
              <div className="space-y-1">
                <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-ink-muted">
                  {draft.chapterCode} · {draft.topicName} · {draft.difficulty} ·{" "}
                  {draft.questionType === "mcq" ? "Multiple choice" : "Written"} · {draft.maxMarks}{" "}
                  {draft.maxMarks === 1 ? "mark" : "marks"}
                </p>
                <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">{draft.question}</h2>
              </div>

              {draft.questionType === "mcq" ? (
                <ol className="space-y-1">
                  {draft.options.map((option) => (
                    <li
                      key={option.id}
                      className={
                        option.isCorrect
                          ? "rounded-card bg-lowland/12 px-3 py-2 font-medium text-ink-strong"
                          : "px-3 py-2 text-ink"
                      }
                    >
                      {option.text}
                      {option.isCorrect ? (
                        <span className="ml-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-lowland">
                          correct
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-card border border-graticule bg-chart p-3">
                    <p className="font-medium text-ink-strong">Answer scheme</p>
                    <p className="mt-1 text-ink">{draft.subjectiveAnswerScheme}</p>
                  </div>
                  <ul className="space-y-2">
                    {draft.criteria.map((criterion) => (
                      <li key={criterion.id} className="rounded-card border border-graticule p-3">
                        <p className="font-medium text-ink-strong">
                          {criterion.marks} {criterion.marks === 1 ? "mark" : "marks"}
                        </p>
                        <p className="mt-1 text-ink">{criterion.criterion}</p>
                        <p className="mt-1 font-mono text-[0.75rem] text-ink-muted">from “{criterion.sourceTitle}”</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-card border border-graticule bg-chart p-3">
                <p className="font-medium text-ink-strong">Explanation shown after answering</p>
                <p className="mt-1 text-ink">{draft.explanation}</p>
              </div>

              <p className="font-mono text-[0.8125rem] text-ink-muted">
                Source: {draft.sourceTitle ?? "none"}
                {draft.sourceFile ? ` · ${draft.sourceFile}, page/slide ${draft.sourcePage}` : ""}
                {draft.generatedBy === "deepseek_draft" ? " · AI-drafted" : ""}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusButtons questionId={draft.id} status={draft.status} />
                <Link
                  className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridian"
                  href={`/dashboard/lecturer/questions/${draft.id}`}
                >
                  Edit before approving
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <nav aria-label="Approval queue pages" className="flex items-center justify-between gap-3">
        {pageNumber > 1 ? (
          <Link className="font-medium text-meridian underline underline-offset-4" href={`/dashboard/lecturer/review?page=${pageNumber - 1}`}>
            ← Previous
          </Link>
        ) : <span />}
        {hasMore ? (
          <Link className="font-medium text-meridian underline underline-offset-4" href={`/dashboard/lecturer/review?page=${pageNumber + 1}`}>
            Next →
          </Link>
        ) : <span />}
      </nav>
    </DashboardShell>
  );
}
