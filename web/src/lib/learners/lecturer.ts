import "server-only";
import { createUserScopedClient } from "@/lib/supabase/server";
import { attemptPercentage, summariseAttempts } from "./metrics";
import type { AttemptSummary, ClassroomStudent } from "./types";

type Row = Record<string, unknown>;

function first(value: unknown): Row | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? (candidate as Row) : null;
}

/**
 * The roster comes from classroom membership, and the profile/attempt rows are
 * filtered by RLS to this lecturer's own students. Deliberately reads no
 * bookmarks or reading history — those tables carry no lecturer policy at all.
 */
export async function listClassroomStudents(): Promise<ClassroomStudent[]> {
  const client = await createUserScopedClient();

  const { data: memberRows, error: memberError } = await client
    .from("classroom_members")
    .select("student_id, profiles!inner(id, username, display_name, role)");

  if (memberError) throw new Error(`The class roster could not be loaded: ${memberError.message}`);

  const students = (memberRows ?? []).flatMap((row: Row) => {
    const profile = first(row.profiles);
    if (!profile || profile.role !== "student") return [];
    return [{
      id: String(profile.id),
      username: String(profile.username),
      displayName: String(profile.display_name),
    }];
  });

  if (students.length === 0) return [];

  const { data: attemptRows, error: attemptError } = await client
    .from("assessment_attempts")
    .select("id, student_id, mode, scope_value, scope_label, awarded_marks, total_marks, question_count, submitted_at")
    .in("student_id", students.map((student) => student.id));

  if (attemptError) throw new Error(`Assessment results could not be loaded: ${attemptError.message}`);

  const byStudent = new Map<string, AttemptSummary[]>();
  for (const row of (attemptRows ?? []) as Row[]) {
    const studentId = String(row.student_id);
    byStudent.set(studentId, [...(byStudent.get(studentId) ?? []), {
      id: String(row.id),
      mode: row.mode as AttemptSummary["mode"],
      scopeValue: row.scope_value === null ? null : String(row.scope_value),
      scopeLabel: String(row.scope_label),
      awardedMarks: Number(row.awarded_marks),
      totalMarks: Number(row.total_marks),
      questionCount: Number(row.question_count),
      submittedAt: String(row.submitted_at),
    }]);
  }

  return students
    .map((student) => {
      const attempts = byStudent.get(student.id) ?? [];
      const summary = summariseAttempts(attempts);
      return {
        ...student,
        attemptCount: summary.attemptCount,
        bestPercentage: summary.best ? attemptPercentage(summary.best) : null,
        latestPercentage: summary.latest ? attemptPercentage(summary.latest) : null,
        averagePercentage: summary.averagePercentage,
        lastActiveAt: summary.latest?.submittedAt ?? null,
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getClassroomStudent(studentId: string): Promise<ClassroomStudent | null> {
  const roster = await listClassroomStudents();
  return roster.find((student) => student.id === studentId) ?? null;
}

export type QuestionBankEntry = {
  id: string;
  question: string;
  questionType: "mcq" | "subjective";
  status: "draft" | "approved" | "archived";
  difficulty: string;
  maxMarks: number;
  generatedBy: string;
  topicId: string;
  topicName: string;
  chapterCode: string;
  optionCount: number;
  criterionCount: number;
  createdAt: string;
};

const QUESTION_SELECT = `
  id, question, question_type, status, difficulty, max_marks, generated_by, topic_id, created_at,
  topics!inner(id, name, chapters!inner(code)),
  quiz_question_options(id),
  quiz_marking_criteria(id)
`;

export type QuestionFilters = {
  chapterCode?: string;
  topicId?: string;
  questionType?: "mcq" | "subjective";
  status?: "draft" | "approved" | "archived";
};

export async function listQuestions(filters: QuestionFilters = {}): Promise<QuestionBankEntry[]> {
  const client = await createUserScopedClient();

  let query = client.from("quiz_questions").select(QUESTION_SELECT);
  if (filters.chapterCode) query = query.eq("topics.chapters.code", filters.chapterCode);
  if (filters.topicId) query = query.eq("topic_id", filters.topicId);
  if (filters.questionType) query = query.eq("question_type", filters.questionType);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("created_at");
  if (error) throw new Error(`The question bank could not be loaded: ${error.message}`);

  return (data ?? []).flatMap((row: Row) => {
    const topic = first(row.topics);
    const chapter = topic ? first(topic.chapters) : null;
    if (!topic || !chapter) return [];

    return [{
      id: String(row.id),
      question: String(row.question),
      questionType: row.question_type as "mcq" | "subjective",
      status: row.status as QuestionBankEntry["status"],
      difficulty: String(row.difficulty),
      maxMarks: Number(row.max_marks),
      generatedBy: String(row.generated_by),
      topicId: String(row.topic_id),
      topicName: String(topic.name),
      chapterCode: String(chapter.code),
      optionCount: Array.isArray(row.quiz_question_options) ? row.quiz_question_options.length : 0,
      criterionCount: Array.isArray(row.quiz_marking_criteria) ? row.quiz_marking_criteria.length : 0,
      createdAt: String(row.created_at),
    }];
  });
}

export type QuestionBankStats = {
  total: number;
  draft: number;
  approved: number;
  archived: number;
  mcq: number;
  subjective: number;
};

export function summariseBank(entries: QuestionBankEntry[]): QuestionBankStats {
  return {
    total: entries.length,
    draft: entries.filter((entry) => entry.status === "draft").length,
    approved: entries.filter((entry) => entry.status === "approved").length,
    archived: entries.filter((entry) => entry.status === "archived").length,
    mcq: entries.filter((entry) => entry.questionType === "mcq").length,
    subjective: entries.filter((entry) => entry.questionType === "subjective").length,
  };
}
