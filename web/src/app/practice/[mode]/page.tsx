import Link from "next/link";
import ExamRunner from "@/components/practice/exam-runner";
import { isPracticeMode, practiceModes, scopeForPractice } from "@/lib/practice/config";
import { createServerCourseBrainRepository } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth/session";
import type { ExamQuestion } from "@/lib/course-brain/types";

export default async function PracticePage({ params, searchParams }: { params: Promise<{ mode: string }>; searchParams: Promise<{ topic?: string; chapter?: string }> }) {
  const [{ mode }, query] = await Promise.all([params, searchParams]);
  if (!isPracticeMode(mode)) return <Unavailable title="Practice mode unavailable" detail="Choose a topic quiz, chapter mini exam, or full course exam." />;
  const scopeValue = mode === "topic" ? query.topic : mode === "chapter" ? query.chapter : undefined;
  const scope = scopeForPractice(mode, scopeValue);
  if (!scope) return <Unavailable title={practiceModes[mode].label} detail={`Open this assessment from a ${mode} learning page so its scope can be selected.`} />;
  const counts = practiceModes[mode];
  let mcqQuestions: ExamQuestion[];
  let subjectiveQuestions: ExamQuestion[];
  try {
    const repository = createServerCourseBrainRepository();
    [mcqQuestions, subjectiveQuestions] = await Promise.all([
      repository.getPublicExamQuestionBatch(scope, "mcq", counts.mcqCount),
      repository.getPublicExamQuestionBatch(scope, "subjective", counts.subjectiveCount),
    ]);
  } catch {
    return <Unavailable title={practiceModes[mode].label} detail="Approved questions are temporarily unavailable. Please try again shortly." />;
  }
  if (mcqQuestions.length !== counts.mcqCount || subjectiveQuestions.length !== counts.subjectiveCount) {
    return <Unavailable title={practiceModes[mode].label} detail={`This assessment needs ${counts.mcqCount} multiple-choice and ${counts.subjectiveCount} written questions. There are not enough generated questions in this scope yet.`} />;
  }
  const firstQuestion = mcqQuestions[0] ?? subjectiveQuestions[0];
  const chapterCode = firstQuestion?.citation.chapterCode;
  const topicId = firstQuestion?.topicId;
  const returnHref = mode === "course" || !chapterCode
    ? "/"
    : mode === "topic" && topicId
      ? `/chapters/${chapterCode}?topic=${encodeURIComponent(topicId)}`
      : `/chapters/${chapterCode}`;
  const returnLabel = mode === "topic" ? "Return to topic" : mode === "chapter" ? `Return to ${chapterCode}` : "Return to course home";
  const restartHref = mode === "course"
    ? "/practice/course"
    : mode === "topic"
      ? `/practice/topic?topic=${encodeURIComponent(scopeValue ?? "")}`
      : `/practice/chapter?chapter=${encodeURIComponent(scopeValue ?? "")}`;
  const profile = await getProfile();
  return <ExamRunner
    title={practiceModes[mode].label}
    mcqQuestions={mcqQuestions}
    subjectiveQuestions={subjectiveQuestions}
    returnHref={returnHref}
    returnLabel={returnLabel}
    restartHref={restartHref}
    mode={mode}
    scopeValue={scopeValue ?? null}
    isLearner={profile?.role === "student"}
  />;
}

function Unavailable({ title, detail }: { title: string; detail: string }) {
  return <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-5 px-6 py-12"><p className="font-mono text-xs uppercase tracking-[0.14em] text-meridian">Practice assessment</p><h1 className="font-display text-4xl font-semibold text-ink-strong">{title}</h1><p role="status" className="text-lg text-ink">{detail}</p><div><Link href="/" className="font-medium text-meridian underline underline-offset-4">Return to course home</Link></div></main>;
}
