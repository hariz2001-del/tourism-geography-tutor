"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";
import type { ExamActionState } from "./action-state";
import { reordered } from "./exam-order";

type Client = Awaited<ReturnType<typeof createUserScopedClient>>;

function refreshExamViews(examId?: string) {
  updateTag("course-content");
  revalidatePath("/dashboard/lecturer/exams");
  revalidatePath("/exams");
  if (examId) {
    revalidatePath(`/dashboard/lecturer/exams/${examId}`);
    revalidatePath(`/exams/${examId}`);
  }
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/**
 * Rewrites the paper's order from 1.
 *
 * `unique (exam_id, display_order)` means two rows cannot briefly share a number
 * while positions are swapped, so every row is first parked above the range and
 * then brought back down.
 */
async function renumber(client: Client, ids: string[]): Promise<string | null> {
  for (const [index, id] of ids.entries()) {
    const { error } = await client.from("exam_questions").update({ display_order: 1000 + index }).eq("id", id);
    if (error) return error.message;
  }
  for (const [index, id] of ids.entries()) {
    const { error } = await client.from("exam_questions").update({ display_order: index + 1 }).eq("id", id);
    if (error) return error.message;
  }
  return null;
}

async function orderedIds(client: Client, examId: string): Promise<string[]> {
  const { data } = await client
    .from("exam_questions")
    .select("id, display_order")
    .eq("exam_id", examId)
    .order("display_order");
  return (data ?? []).map((row) => String(row.id));
}

export async function createExam(_previous: ExamActionState, formData: FormData): Promise<ExamActionState> {
  const profile = await requireProfile("lecturer");

  const title = text(formData, "title");
  if (!title) return { error: "Give the paper a name, such as “Set 1”.", message: null };

  const targetMcq = Number(formData.get("targetMcq") ?? 0);
  const targetSubjective = Number(formData.get("targetSubjective") ?? 0);
  if (!Number.isInteger(targetMcq) || targetMcq < 0 || !Number.isInteger(targetSubjective) || targetSubjective < 0) {
    return { error: "The number of questions must be a whole number.", message: null };
  }

  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("exams")
    .insert({
      title,
      description: text(formData, "description") || null,
      created_by: profile.id,
      target_mcq: targetMcq,
      target_subjective: targetSubjective,
    })
    .select("id")
    .single();

  if (error) return { error: error.message, message: null };

  refreshExamViews();
  redirect(`/dashboard/lecturer/exams/${String((data as { id: string }).id)}`);
}

export async function updateExam(_previous: ExamActionState, formData: FormData): Promise<ExamActionState> {
  await requireProfile("lecturer");

  const examId = text(formData, "examId");
  const title = text(formData, "title");
  if (!examId) return { error: "That paper could not be found.", message: null };
  if (!title) return { error: "Give the paper a name, such as “Set 1”.", message: null };

  const client = await createUserScopedClient();
  const { error } = await client
    .from("exams")
    .update({
      title,
      description: text(formData, "description") || null,
      show_answers: formData.get("showAnswers") !== null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", examId);

  if (error) return { error: error.message, message: null };

  refreshExamViews(examId);
  return { error: null, message: "Paper saved." };
}

/**
 * Publishing a paper is also the moment its questions are approved.
 *
 * The lecturer choosing a question for her own exam is the review — asking her to
 * approve each one again in a separate queue would be the same judgement twice.
 * The database still refuses anything incomplete, and that refusal is passed back
 * to her verbatim rather than being interpreted here.
 */
export async function setExamStatus(_previous: ExamActionState, formData: FormData): Promise<ExamActionState> {
  await requireProfile("lecturer");

  const examId = text(formData, "examId");
  const status = text(formData, "status");
  if (!examId || !["draft", "published", "archived"].includes(status)) {
    return { error: "That is not a state a paper can be in.", message: null };
  }

  const client = await createUserScopedClient();

  if (status === "published") {
    const { data: paper } = await client.from("exam_questions").select("question_id").eq("exam_id", examId);
    const questionIds = (paper ?? []).map((row) => String(row.question_id));
    if (questionIds.length === 0) {
      return { error: "A paper needs at least one question before students can sit it.", message: null };
    }

    const { error: approveError } = await client
      .from("quiz_questions")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .in("id", questionIds)
      .neq("status", "approved");

    if (approveError) {
      return {
        error: `This paper cannot be published yet. ${approveError.message}`,
        message: null,
      };
    }
  }

  const { error } = await client
    .from("exams")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", examId);

  if (error) return { error: error.message, message: null };

  refreshExamViews(examId);
  const said = {
    published: "Published. Students can sit this paper now.",
    archived: "Archived. Students no longer see this paper.",
    draft: "Moved back to draft. Students no longer see this paper.",
  }[status as "published" | "archived" | "draft"];
  return { error: null, message: said };
}

export async function addExamQuestion(_previous: ExamActionState, formData: FormData): Promise<ExamActionState> {
  await requireProfile("lecturer");

  const examId = text(formData, "examId");
  const questionId = text(formData, "questionId");
  if (!examId || !questionId) return { error: "Choose a question to add.", message: null };

  const client = await createUserScopedClient();
  const existing = await orderedIds(client, examId);

  const { error } = await client
    .from("exam_questions")
    .insert({ exam_id: examId, question_id: questionId, display_order: existing.length + 1 });

  if (error) {
    // The unique (exam_id, question_id) pair is what stops the same question twice.
    const alreadyThere = error.message.includes("exam_questions_exam_id_question_id_key");
    return { error: alreadyThere ? "That question is already in this paper." : error.message, message: null };
  }

  refreshExamViews(examId);
  return { error: null, message: "Question added." };
}

export async function removeExamQuestion(_previous: ExamActionState, formData: FormData): Promise<ExamActionState> {
  await requireProfile("lecturer");

  const examId = text(formData, "examId");
  const examQuestionId = text(formData, "examQuestionId");
  if (!examId || !examQuestionId) return { error: "That question could not be found.", message: null };

  const client = await createUserScopedClient();
  const { error } = await client.from("exam_questions").delete().eq("id", examQuestionId);
  if (error) return { error: error.message, message: null };

  const renumberError = await renumber(client, await orderedIds(client, examId));
  if (renumberError) return { error: renumberError, message: null };

  refreshExamViews(examId);
  return { error: null, message: "Question removed." };
}

export async function moveExamQuestion(_previous: ExamActionState, formData: FormData): Promise<ExamActionState> {
  await requireProfile("lecturer");

  const examId = text(formData, "examId");
  const examQuestionId = text(formData, "examQuestionId");
  const direction = text(formData, "direction");
  if (!examId || !examQuestionId || (direction !== "up" && direction !== "down")) {
    return { error: "That question could not be moved.", message: null };
  }

  const client = await createUserScopedClient();
  const next = reordered(await orderedIds(client, examId), examQuestionId, direction);

  const error = await renumber(client, next);
  if (error) return { error, message: null };

  refreshExamViews(examId);
  return { error: null, message: null };
}

export async function deleteExam(formData: FormData): Promise<void> {
  await requireProfile("lecturer");
  const examId = String(formData.get("examId") ?? "");
  if (!examId) return;

  const client = await createUserScopedClient();
  await client.from("exams").delete().eq("id", examId);

  refreshExamViews();
  redirect("/dashboard/lecturer/exams");
}
