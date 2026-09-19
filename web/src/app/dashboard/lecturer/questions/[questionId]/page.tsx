import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { getQuestion, listSourceUnits } from "@/lib/learners/question-bank";
import { listTopicIndex } from "@/lib/learners/student";
import StatusButtons from "../../review/status-buttons";
import QuestionForm from "../question-form";
import { deleteQuestion } from "../actions";

export const metadata = { title: "Edit question · Tourism Geography Tutor" };

export default async function EditQuestion({ params }: { params: Promise<{ questionId: string }> }) {
  await requireProfile("lecturer");
  const { questionId } = await params;

  const question = await getQuestion(questionId);
  if (!question) notFound();

  const [topicIndex, sourceUnits] = await Promise.all([listTopicIndex(), listSourceUnits()]);
  const topics = [...topicIndex.entries()].map(([id, topic]) => ({ id, ...topic }));

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[56rem] flex-col gap-6 px-6 py-10">
      <Link
        className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4"
        href="/dashboard/lecturer/questions"
      >
        ← Back to the question bank
      </Link>

      <div className="space-y-2">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">
          {question.chapterCode} · {question.topicName} · {question.status}
        </p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.15] text-ink-strong">Edit question</h1>
      </div>

      <section className="space-y-3 rounded-card border border-graticule bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">Status</h2>
        <StatusButtons questionId={question.id} status={question.status} />
      </section>

      <QuestionForm question={question} topics={topics} sourceUnits={sourceUnits} />

      <section className="space-y-3 rounded-card border border-danger/30 bg-surface p-5">
        <h2 className="font-display text-[1.25rem] font-semibold text-ink-strong">Delete</h2>
        <p className="text-ink">
          Deleting removes the question from the bank. Past attempts keep their own record of what was
          asked, so learner history is not rewritten.
        </p>
        <form action={deleteQuestion}>
          <input type="hidden" name="questionId" value={question.id} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center rounded-card border border-danger/50 bg-chart px-4 font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          >
            Delete this question
          </button>
        </form>
      </section>
    </main>
  );
}
