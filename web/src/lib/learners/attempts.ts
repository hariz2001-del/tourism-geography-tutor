import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Citation } from "@/lib/course-brain/types";
import type { AttemptAnswerFeedback, AssessmentMode } from "./types";

type Row = Record<string, unknown>;

function first(value: unknown): Row | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? (candidate as Row) : null;
}

/**
 * Everything about a submitted question that the score depends on, read from the
 * database rather than taken from the request. The browser is told the marks a
 * question is worth, but it is never trusted to report them back.
 */
export type QuestionRecord = {
  id: string;
  question: string;
  questionType: "mcq" | "subjective";
  maxMarks: number;
  topicId: string;
  chapterCode: string;
  citation: Citation;
};

export async function loadQuestionRecords(questionIds: string[]): Promise<Map<string, QuestionRecord>> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("quiz_questions")
    .select(`
      id, question, question_type, max_marks, topic_id, source_content_unit_id,
      topics!inner(id, chapters!inner(code)),
      content_units!inner(id, source_references!inner(source_file, chapter_label, page_or_slide))
    `)
    .in("id", questionIds);

  if (error) throw new Error(`Questions could not be loaded: ${error.message}`);

  const records = new Map<string, QuestionRecord>();
  for (const row of (data ?? []) as Row[]) {
    const topic = first(row.topics);
    const chapter = topic ? first(topic.chapters) : null;
    const unit = first(row.content_units);
    const reference = unit ? first(unit.source_references) : null;
    if (!topic || !chapter || !unit || !reference) continue;

    records.set(String(row.id), {
      id: String(row.id),
      question: String(row.question),
      questionType: row.question_type as "mcq" | "subjective",
      maxMarks: Number(row.max_marks),
      topicId: String(row.topic_id),
      chapterCode: String(chapter.code),
      citation: {
        sourceFile: String(reference.source_file),
        chapterLabel: String(reference.chapter_label),
        pageOrSlide: Number(reference.page_or_slide),
        chapterCode: String(chapter.code),
        topicId: String(row.topic_id),
        contentUnitId: String(unit.id),
      },
    });
  }
  return records;
}

export async function loadOptionTexts(optionIds: string[]): Promise<Map<string, string>> {
  if (optionIds.length === 0) return new Map();
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from("quiz_question_options")
    .select("id, option_text")
    .in("id", optionIds);

  if (error) return new Map();
  return new Map((data ?? []).map((row) => [String((row as Row).id), String((row as Row).option_text)]));
}

export type RecordedAnswer = {
  questionId: string;
  topicId: string;
  chapterCode: string;
  questionText: string;
  questionType: "mcq" | "subjective";
  displayOrder: number;
  selectedOptionId: string | null;
  answerText: string | null;
  awardedMarks: number;
  maxMarks: number;
  feedback: AttemptAnswerFeedback;
};

/**
 * Writes the attempt and its answers. Uses the service role because a learner
 * deliberately has no insert policy on their own results.
 */
/**
 * The questions a built paper actually contains.
 *
 * Read with the service role, like the rest of the marking path: a student may not
 * read quiz_questions directly, and the browser's list of what it answered is not
 * evidence of what the paper asked.
 */
export async function loadExamQuestionIds(examId: string): Promise<Set<string>> {
  const client = createServiceRoleClient();
  const { data, error } = await client.from("exam_questions").select("question_id").eq("exam_id", examId);
  if (error || !data) return new Set();
  return new Set(data.map((row) => String(row.question_id)));
}

export async function recordAttempt(input: {
  studentId: string;
  mode: AssessmentMode;
  scopeValue: string | null;
  scopeLabel: string;
  /** Set only for a lecturer-built paper; the table's check constraint insists on the pairing. */
  examId?: string | null;
  awardedMarks: number;
  totalMarks: number;
  answers: RecordedAnswer[];
}): Promise<string | null> {
  const client = createServiceRoleClient();

  const { data, error } = await client
    .from("assessment_attempts")
    .insert({
      student_id: input.studentId,
      mode: input.mode,
      scope_value: input.scopeValue,
      scope_label: input.scopeLabel,
      exam_id: input.examId ?? null,
      awarded_marks: input.awardedMarks,
      total_marks: input.totalMarks,
      question_count: input.answers.length,
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) return null;
  const attemptId = String((data as { id: string }).id);

  const { error: answerError } = await client.from("attempt_answers").insert(
    input.answers.map((answer) => ({
      attempt_id: attemptId,
      question_id: answer.questionId,
      topic_id: answer.topicId,
      chapter_code: answer.chapterCode,
      question_text: answer.questionText,
      question_type: answer.questionType,
      display_order: answer.displayOrder,
      selected_option_id: answer.selectedOptionId,
      answer_text: answer.answerText,
      awarded_marks: answer.awardedMarks,
      max_marks: answer.maxMarks,
      feedback: answer.feedback,
    })),
  );

  // A half-written attempt would show a wrong score forever, so roll it back.
  if (answerError) {
    await client.from("assessment_attempts").delete().eq("id", attemptId);
    return null;
  }

  return attemptId;
}
