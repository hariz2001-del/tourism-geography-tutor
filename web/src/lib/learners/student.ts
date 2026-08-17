import "server-only";
import { createUserScopedClient } from "@/lib/supabase/server";
import type {
  AttemptAnswerFeedback,
  AttemptAnswerRecord,
  AttemptDetail,
  AttemptSummary,
  SavedBookmark,
  StudiedTopic,
} from "./types";

type Row = Record<string, unknown>;

function first(value: unknown): Row | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? (candidate as Row) : null;
}

function attemptFrom(row: Row): AttemptSummary {
  return {
    id: String(row.id),
    mode: row.mode as AttemptSummary["mode"],
    scopeValue: row.scope_value === null ? null : String(row.scope_value),
    scopeLabel: String(row.scope_label),
    awardedMarks: Number(row.awarded_marks),
    totalMarks: Number(row.total_marks),
    questionCount: Number(row.question_count),
    submittedAt: String(row.submitted_at),
  };
}

function answerFrom(row: Row): AttemptAnswerRecord {
  return {
    id: String(row.id),
    displayOrder: Number(row.display_order),
    questionText: String(row.question_text),
    questionType: row.question_type as "mcq" | "subjective",
    topicId: row.topic_id === null ? null : String(row.topic_id),
    chapterCode: row.chapter_code === null ? null : String(row.chapter_code),
    answerText: row.answer_text === null ? null : String(row.answer_text),
    selectedOptionId: row.selected_option_id === null ? null : String(row.selected_option_id),
    awardedMarks: Number(row.awarded_marks),
    maxMarks: Number(row.max_marks),
    feedback: (row.feedback ?? {}) as AttemptAnswerFeedback,
  };
}

const BOOKMARK_SELECT = `
  id, source, created_at, content_unit_id,
  content_units!inner(
    id, title, body, content_type,
    source_references(source_file, chapter_label, page_or_slide),
    topics!inner(id, name, display_order, chapters!inner(code, title))
  )
`;

export async function listBookmarks(studentId: string): Promise<SavedBookmark[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("bookmarks")
    .select(BOOKMARK_SELECT)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Saved material could not be loaded: ${error.message}`);

  return (data ?? []).flatMap((row: Row) => {
    const unit = first(row.content_units);
    const topic = unit ? first(unit.topics) : null;
    const chapter = topic ? first(topic.chapters) : null;
    const reference = unit ? first(unit.source_references) : null;
    if (!unit || !topic || !chapter || !reference) return [];

    return [{
      id: String(row.id),
      contentUnitId: String(row.content_unit_id),
      source: row.source as "content" | "flashcard",
      createdAt: String(row.created_at),
      title: String(unit.title),
      body: String(unit.body),
      contentType: String(unit.content_type),
      topicId: String(topic.id),
      topicName: String(topic.name),
      chapterCode: String(chapter.code),
      chapterTitle: String(chapter.title),
      citation: {
        sourceFile: String(reference.source_file),
        chapterLabel: String(reference.chapter_label),
        pageOrSlide: Number(reference.page_or_slide),
        chapterCode: String(chapter.code),
        topicId: String(topic.id),
        contentUnitId: String(unit.id),
      },
    }];
  });
}

export async function listStudiedTopics(studentId: string): Promise<StudiedTopic[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("topic_progress")
    .select("topic_id, first_viewed_at, last_viewed_at, view_count, topics!inner(id, name, chapters!inner(code, title))")
    .eq("student_id", studentId)
    .order("last_viewed_at", { ascending: false });

  if (error) throw new Error(`Reading history could not be loaded: ${error.message}`);

  return (data ?? []).flatMap((row: Row) => {
    const topic = first(row.topics);
    const chapter = topic ? first(topic.chapters) : null;
    if (!topic || !chapter) return [];

    return [{
      topicId: String(row.topic_id),
      topicName: String(topic.name),
      chapterCode: String(chapter.code),
      chapterTitle: String(chapter.title),
      firstViewedAt: String(row.first_viewed_at),
      lastViewedAt: String(row.last_viewed_at),
      viewCount: Number(row.view_count),
    }];
  });
}

export async function listAttempts(studentId: string): Promise<AttemptSummary[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("assessment_attempts")
    .select("id, mode, scope_value, scope_label, awarded_marks, total_marks, question_count, submitted_at")
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false });

  if (error) throw new Error(`Assessment results could not be loaded: ${error.message}`);
  return (data ?? []).map((row: Row) => attemptFrom(row));
}

/** Every recorded answer a learner has given, for per-topic accuracy. */
export async function listAllAnswers(studentId: string): Promise<AttemptAnswerRecord[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("attempt_answers")
    .select("id, display_order, question_text, question_type, topic_id, chapter_code, answer_text, selected_option_id, awarded_marks, max_marks, feedback, assessment_attempts!inner(student_id)")
    .eq("assessment_attempts.student_id", studentId);

  if (error) throw new Error(`Assessment history could not be loaded: ${error.message}`);
  return (data ?? []).map((row: Row) => answerFrom(row));
}

/**
 * RLS decides visibility here, not the caller: a learner reaches their own
 * attempt and a lecturer reaches one belonging to a student in her classroom.
 * An id that resolves to neither simply returns null.
 */
export async function getAttempt(attemptId: string): Promise<AttemptDetail | null> {
  const client = await createUserScopedClient();

  const { data: attemptRow, error: attemptError } = await client
    .from("assessment_attempts")
    .select("id, mode, scope_value, scope_label, awarded_marks, total_marks, question_count, submitted_at")
    .eq("id", attemptId)
    .maybeSingle();

  if (attemptError || !attemptRow) return null;

  const { data: answerRows, error: answerError } = await client
    .from("attempt_answers")
    .select("id, display_order, question_text, question_type, topic_id, chapter_code, answer_text, selected_option_id, awarded_marks, max_marks, feedback")
    .eq("attempt_id", attemptId)
    .order("display_order");

  if (answerError) throw new Error(`Attempt answers could not be loaded: ${answerError.message}`);

  return {
    ...attemptFrom(attemptRow as Row),
    answers: (answerRows ?? []).map((row: Row) => answerFrom(row)),
  };
}

export async function listTopicIndex(): Promise<Map<string, { name: string; chapterCode: string }>> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("topics")
    .select("id, name, display_order, chapters!inner(code)")
    .order("display_order");

  if (error) throw new Error(`Topics could not be loaded: ${error.message}`);

  const index = new Map<string, { name: string; chapterCode: string }>();
  for (const row of (data ?? []) as Row[]) {
    const chapter = first(row.chapters);
    if (!chapter) continue;
    index.set(String(row.id), { name: String(row.name), chapterCode: String(chapter.code) });
  }
  return index;
}
