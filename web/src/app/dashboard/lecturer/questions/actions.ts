"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";
import type { QuestionActionState } from "./action-state";

function refreshQuestionViews(questionId?: string) {
  // Chapter pages serve their questions from a cross-request cache, so approving one has to
  // clear that too — otherwise a lecturer's change is invisible to learners for five minutes.
  updateTag("course-content");
  revalidatePath("/dashboard/lecturer");
  revalidatePath("/dashboard/lecturer/questions");
  revalidatePath("/dashboard/lecturer/review");
  if (questionId) revalidatePath(`/dashboard/lecturer/questions/${questionId}`);
}

/**
 * The database enforces what a complete approved question is (options, exactly one
 * correct answer, criteria summing to max_marks, a published and cited source).
 * Rather than duplicate those rules here, we surface the trigger's message so the
 * lecturer sees exactly which requirement a draft fails.
 */
export async function setQuestionStatus(
  _previous: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  await requireProfile("lecturer");

  const questionId = String(formData.get("questionId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!questionId || !["draft", "approved", "archived"].includes(status)) {
    return { error: "That is not a status a question can be set to.", message: null };
  }

  const client = await createUserScopedClient();
  const { error } = await client
    .from("quiz_questions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) return { error: error.message, message: null };

  refreshQuestionViews(questionId);
  return { error: null, message: status === "approved" ? "Question approved." : `Question moved to ${status}.` };
}

export async function saveQuestion(
  _previous: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  await requireProfile("lecturer");

  const questionId = String(formData.get("questionId") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "");
  const topicId = String(formData.get("topicId") ?? "");
  const sourceContentUnitId = String(formData.get("sourceContentUnitId") ?? "");
  const questionType = String(formData.get("questionType") ?? "mcq");
  const maxMarks = Number(formData.get("maxMarks") ?? 1);
  const answerScheme = String(formData.get("subjectiveAnswerScheme") ?? "").trim();

  if (!question) return { error: "A question needs some text.", message: null };
  if (!explanation) return { error: "An explanation is required — learners see it after answering.", message: null };
  if (!topicId) return { error: "Choose the topic this question belongs to.", message: null };
  // Every question must trace back to approved course material; this is the
  // project's source-fidelity rule, not an incidental form check.
  if (!sourceContentUnitId) return { error: "Choose the published unit this question comes from.", message: null };
  if (!["introductory", "intermediate", "application"].includes(difficulty)) {
    return { error: "Choose a difficulty.", message: null };
  }
  if (!Number.isInteger(maxMarks) || maxMarks < 1) return { error: "Marks must be a whole number of at least 1.", message: null };
  if (questionType === "subjective" && !answerScheme) {
    return { error: "A written question needs an answer scheme.", message: null };
  }

  const client = await createUserScopedClient();
  const payload = {
    question,
    explanation,
    difficulty,
    topic_id: topicId,
    source_content_unit_id: sourceContentUnitId,
    question_type: questionType,
    max_marks: maxMarks,
    subjective_answer_scheme: questionType === "subjective" ? answerScheme : null,
    updated_at: new Date().toISOString(),
  };

  if (questionId) {
    const { error } = await client.from("quiz_questions").update(payload).eq("id", questionId);
    if (error) return { error: error.message, message: null };
    refreshQuestionViews(questionId);
    return { error: null, message: "Question saved." };
  }

  const { data, error } = await client
    .from("quiz_questions")
    .insert({ ...payload, status: "draft", generated_by: "human" })
    .select("id")
    .single();

  if (error) return { error: error.message, message: null };

  refreshQuestionViews();
  redirect(`/dashboard/lecturer/questions/${String((data as { id: string }).id)}`);
}

export async function deleteQuestion(formData: FormData): Promise<void> {
  await requireProfile("lecturer");
  const questionId = String(formData.get("questionId") ?? "");
  if (!questionId) return;

  const client = await createUserScopedClient();
  await client.from("quiz_questions").delete().eq("id", questionId);

  refreshQuestionViews();
  redirect("/dashboard/lecturer/questions");
}
