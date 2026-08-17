import Link from "next/link";
import { requireProfile } from "@/lib/auth/session";
import { listSourceUnits } from "@/lib/learners/question-bank";
import { listTopicIndex } from "@/lib/learners/student";
import QuestionForm from "../question-form";

export const metadata = { title: "New question · Tourism Geography Tutor" };

export default async function NewQuestion() {
  await requireProfile("lecturer");
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
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-meridian">Teaching</p>
        <h1 className="font-display text-[2rem] font-semibold leading-[1.15] text-ink-strong">Add a question</h1>
        <p className="max-w-[62ch] text-ink">
          New questions are saved as drafts. Add the options or marking criteria next, then approve it
          from the approval queue.
        </p>
      </div>
      <QuestionForm question={null} topics={topics} sourceUnits={sourceUnits} />
    </main>
  );
}
