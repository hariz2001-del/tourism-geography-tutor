import Link from "next/link";
import { notFound } from "next/navigation";
import ExamRunner from "@/components/practice/exam-runner";
import { requireProfile } from "@/lib/auth/session";
import { getExam } from "@/lib/learners/exams";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";

export const metadata = { title: "Exam · Tourism Geography Tutor" };

function Unavailable({ title, detail }: { title: string; detail: string }) {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col justify-center gap-5 px-6 py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-meridian">Exam</p>
      <h1 className="font-display text-[2.5rem]/[1.1] font-semibold text-ink-strong">{title}</h1>
      <p className="text-[1.125rem] text-ink">{detail}</p>
      <Link className="inline-flex min-h-11 items-center font-medium text-meridian underline underline-offset-4" href="/exams">
        Back to the exams
      </Link>
    </main>
  );
}

export default async function SitExam({ params }: { params: Promise<{ examId: string }> }) {
  const profile = await requireProfile();
  const { examId } = await params;

  const exam = await getExam(examId);
  // RLS hides an unpublished paper from a student, so this is a 404 for them and
  // a real paper for the lecturer previewing her own draft.
  if (!exam) notFound();

  if (exam.status !== "published" && profile.role !== "lecturer") notFound();

  const questions = await createServerCourseBrainRepository().getExamQuestions(examId);
  if (questions.length === 0) {
    return <Unavailable title="This paper is not ready" detail="It has no questions in it yet. Your lecturer is still building it." />;
  }

  // The lecturer's order is kept within each kind; objective questions come first,
  // as they do on the paper she supplied.
  const mcqQuestions = questions.filter((question) => question.questionType === "mcq");
  const subjectiveQuestions = questions.filter((question) => question.questionType === "subjective");

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col gap-6 px-6 py-10">
      {exam.status !== "published" ? (
        <p role="status" className="rounded-card bg-relief/12 px-4 py-3 text-ink">
          You are previewing a paper students cannot see yet.
        </p>
      ) : null}

      <ExamRunner
        title={exam.title}
        mcqQuestions={mcqQuestions}
        subjectiveQuestions={subjectiveQuestions}
        returnHref="/exams"
        returnLabel="Back to the exams"
        restartHref={`/exams/${examId}`}
        mode="exam"
        scopeValue={examId}
        examId={examId}
        isLearner={profile.role === "student"}
      />
    </main>
  );
}
