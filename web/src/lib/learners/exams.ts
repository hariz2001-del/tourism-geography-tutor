import "server-only";
import { createUserScopedClient } from "@/lib/supabase/server";

type Row = Record<string, unknown>;

function first(value: unknown): Row | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? (candidate as Row) : null;
}

export type ExamStatus = "draft" | "published" | "archived";

export type ExamSummary = {
  id: string;
  title: string;
  description: string | null;
  status: ExamStatus;
  showAnswers: boolean;
  targetMcq: number;
  targetSubjective: number;
  questionCount: number;
  totalMarks: number;
  updatedAt: string;
};

export type ExamPaperQuestion = {
  id: string;
  questionId: string;
  displayOrder: number;
  question: string;
  questionType: "mcq" | "subjective";
  status: "draft" | "approved" | "archived";
  maxMarks: number;
  topicName: string;
  chapterCode: string;
  optionCount: number;
  criterionCount: number;
};

export type ExamPaper = ExamSummary & { questions: ExamPaperQuestion[] };

const EXAM_SELECT = `
  id, title, description, status, show_answers, target_mcq, target_subjective, updated_at,
  exam_questions(id, display_order, question_id,
    quiz_questions(id, question, question_type, status, max_marks,
      topics!inner(name, chapters!inner(code)),
      quiz_question_options(id), quiz_marking_criteria(id)))
`;

function paperQuestions(row: Row): ExamPaperQuestion[] {
  const entries = Array.isArray(row.exam_questions) ? (row.exam_questions as Row[]) : [];
  return entries
    .flatMap((entry) => {
      const question = first(entry.quiz_questions);
      if (!question) return [];
      const topic = first(question.topics);
      const chapter = topic ? first(topic.chapters) : null;
      return [{
        id: String(entry.id),
        questionId: String(entry.question_id),
        displayOrder: Number(entry.display_order),
        question: String(question.question),
        questionType: question.question_type as "mcq" | "subjective",
        status: question.status as ExamPaperQuestion["status"],
        maxMarks: Number(question.max_marks),
        topicName: topic ? String(topic.name) : "Unknown topic",
        chapterCode: chapter ? String(chapter.code) : "",
        optionCount: Array.isArray(question.quiz_question_options) ? question.quiz_question_options.length : 0,
        criterionCount: Array.isArray(question.quiz_marking_criteria) ? question.quiz_marking_criteria.length : 0,
      }];
    })
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

function summaryFrom(row: Row, questions: ExamPaperQuestion[]): ExamSummary {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description === null ? null : String(row.description),
    status: row.status as ExamStatus,
    showAnswers: Boolean(row.show_answers),
    targetMcq: Number(row.target_mcq),
    targetSubjective: Number(row.target_subjective),
    questionCount: questions.length,
    totalMarks: questions.reduce((total, question) => total + question.maxMarks, 0),
    updatedAt: String(row.updated_at),
  };
}

/** Every paper, for the lecturer. RLS keeps this to her. */
export async function listExams(): Promise<ExamSummary[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client.from("exams").select(EXAM_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(`Exams could not be loaded: ${error.message}`);
  return (data ?? []).map((row: Row) => summaryFrom(row, paperQuestions(row)));
}

/**
 * The papers a student may sit.
 *
 * The same RLS policy that hides a draft or archived paper is what makes this safe;
 * the filter here is so the lecturer's own listing does not include her drafts when
 * she looks at the student view.
 */
export async function listPublishedExams(): Promise<ExamSummary[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("exams")
    .select(EXAM_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Exams could not be loaded: ${error.message}`);
  return (data ?? []).map((row: Row) => summaryFrom(row, paperQuestions(row)));
}

export async function getExam(examId: string): Promise<ExamPaper | null> {
  const client = await createUserScopedClient();
  const { data, error } = await client.from("exams").select(EXAM_SELECT).eq("id", examId).maybeSingle();
  if (error || !data) return null;
  const row = data as Row;
  const questions = paperQuestions(row);
  return { ...summaryFrom(row, questions), questions };
}

/** A question is ready to be sat once it carries what the approval rule requires. */
export function questionIsComplete(question: ExamPaperQuestion): boolean {
  return question.questionType === "mcq" ? question.optionCount >= 2 : question.criterionCount >= 1;
}
