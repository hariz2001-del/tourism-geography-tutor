"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";
import type { QuestionActionState } from "./action-state";
import { parseQuestionForm, type ParsedCriterion, type ParsedOption } from "./question-payload";

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

type Client = Awaited<ReturnType<typeof createUserScopedClient>>;

/**
 * Writes the answers of a multiple-choice question.
 *
 * Rows are matched by display order and updated in place rather than deleted and
 * rewritten, because `attempt_answers.selected_option_id` points at them: replacing
 * the rows would blank out which answer a student chose in every past attempt.
 */
async function syncOptions(client: Client, questionId: string, options: ParsedOption[]): Promise<string | null> {
  const { data, error } = await client
    .from("quiz_question_options")
    .select("id, display_order")
    .eq("question_id", questionId);
  if (error) return error.message;

  const existing = new Map((data ?? []).map((row) => [Number(row.display_order), String(row.id)]));

  for (const [index, option] of options.entries()) {
    const displayOrder = index + 1;
    const id = existing.get(displayOrder);
    const values = { option_text: option.text, is_correct: option.isCorrect };
    const result = id
      ? await client.from("quiz_question_options").update(values).eq("id", id)
      : await client.from("quiz_question_options").insert({ ...values, question_id: questionId, display_order: displayOrder });
    if (result.error) return result.error.message;
  }

  const surplus = [...existing.entries()].filter(([order]) => order > options.length).map(([, id]) => id);
  if (surplus.length > 0) {
    const { error: deleteError } = await client.from("quiz_question_options").delete().in("id", surplus);
    if (deleteError) return deleteError.message;
  }

  return null;
}

/** The same in-place approach for the marking points of a written question. */
async function syncCriteria(client: Client, questionId: string, criteria: ParsedCriterion[]): Promise<string | null> {
  const { data, error } = await client
    .from("quiz_marking_criteria")
    .select("id, display_order")
    .eq("question_id", questionId);
  if (error) return error.message;

  const existing = new Map((data ?? []).map((row) => [Number(row.display_order), String(row.id)]));

  for (const [index, criterion] of criteria.entries()) {
    const displayOrder = index + 1;
    const id = existing.get(displayOrder);
    const values = {
      criterion: criterion.criterion,
      marks: criterion.marks,
      source_content_unit_id: criterion.sourceContentUnitId,
      accepted_concepts: criterion.acceptedConcepts,
      updated_at: new Date().toISOString(),
    };
    const result = id
      ? await client.from("quiz_marking_criteria").update(values).eq("id", id)
      : await client.from("quiz_marking_criteria").insert({ ...values, question_id: questionId, display_order: displayOrder });
    if (result.error) return result.error.message;
  }

  const surplus = [...existing.entries()].filter(([order]) => order > criteria.length).map(([, id]) => id);
  if (surplus.length > 0) {
    const { error: deleteError } = await client.from("quiz_marking_criteria").delete().in("id", surplus);
    if (deleteError) return deleteError.message;
  }

  return null;
}

/** A question is one kind or the other: the approval rule refuses leftovers of the other kind. */
async function clearUnusedChildren(client: Client, questionId: string, questionType: "mcq" | "subjective"): Promise<void> {
  const table = questionType === "mcq" ? "quiz_marking_criteria" : "quiz_question_options";
  await client.from(table).delete().eq("question_id", questionId);
}

export async function saveQuestion(
  _previous: QuestionActionState,
  formData: FormData,
): Promise<QuestionActionState> {
  await requireProfile("lecturer");

  const parsed = parseQuestionForm(formData);
  if (parsed.error !== null) return { error: parsed.error, message: null };
  const form = parsed.value;

  const client = await createUserScopedClient();
  const payload = {
    question: form.question,
    explanation: form.explanation,
    difficulty: form.difficulty,
    topic_id: form.topicId,
    source_content_unit_id: form.sourceContentUnitId,
    question_type: form.questionType,
    max_marks: form.maxMarks,
    subjective_answer_scheme: form.answerScheme,
    updated_at: new Date().toISOString(),
  };

  let questionId = form.questionId;
  let created = false;

  if (questionId) {
    const { error } = await client.from("quiz_questions").update(payload).eq("id", questionId);
    if (error) return { error: error.message, message: null };
  } else {
    const { data, error } = await client
      .from("quiz_questions")
      .insert({ ...payload, status: "draft", generated_by: "human" })
      .select("id")
      .single();
    if (error) return { error: error.message, message: null };
    questionId = String((data as { id: string }).id);
    created = true;
  }

  const childError =
    form.questionType === "mcq"
      ? await syncOptions(client, questionId, form.options)
      : await syncCriteria(client, questionId, form.criteria);
  if (childError) return { error: childError, message: null };

  await clearUnusedChildren(client, questionId, form.questionType);

  refreshQuestionViews(questionId);
  if (created) redirect(`/dashboard/lecturer/questions/${questionId}`);
  return { error: null, message: "Question saved." };
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
