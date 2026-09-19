import "server-only";
import { createUserScopedClient } from "@/lib/supabase/server";

type Row = Record<string, unknown>;

function first(value: unknown): Row | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && typeof candidate === "object" ? (candidate as Row) : null;
}

export type QuestionOption = { id: string; text: string; displayOrder: number; isCorrect: boolean };

export type MarkingCriterion = {
  id: string;
  criterion: string;
  marks: number;
  displayOrder: number;
  sourceContentUnitId: string;
  sourceTitle: string;
  /** Wording the grader accepts without asking the model. Carried so editing a question does not erase it. */
  acceptedConcepts: string[];
};

export type QuestionDetail = {
  id: string;
  question: string;
  explanation: string;
  questionType: "mcq" | "subjective";
  status: "draft" | "approved" | "archived";
  difficulty: string;
  maxMarks: number;
  generatedBy: string;
  subjectiveAnswerScheme: string | null;
  topicId: string;
  topicName: string;
  chapterCode: string;
  sourceContentUnitId: string | null;
  sourceTitle: string | null;
  sourceFile: string | null;
  sourcePage: number | null;
  options: QuestionOption[];
  criteria: MarkingCriterion[];
};

const DETAIL_SELECT = `
  id, question, explanation, question_type, status, difficulty, max_marks, generated_by,
  subjective_answer_scheme, topic_id, source_content_unit_id,
  topics!inner(id, name, chapters!inner(code)),
  content_units(id, title, source_references(source_file, page_or_slide)),
  quiz_question_options(id, option_text, display_order, is_correct),
  quiz_marking_criteria(id, criterion, marks, display_order, source_content_unit_id, accepted_concepts, content_units(title))
`;

export async function getQuestion(questionId: string): Promise<QuestionDetail | null> {
  const client = await createUserScopedClient();
  const { data, error } = await client.from("quiz_questions").select(DETAIL_SELECT).eq("id", questionId).maybeSingle();
  if (error || !data) return null;

  const row = data as Row;
  const topic = first(row.topics);
  const chapter = topic ? first(topic.chapters) : null;
  if (!topic || !chapter) return null;

  const sourceUnit = first(row.content_units);
  const sourceRef = sourceUnit ? first(sourceUnit.source_references) : null;

  const options = (Array.isArray(row.quiz_question_options) ? row.quiz_question_options : [])
    .map((option: Row) => ({
      id: String(option.id),
      text: String(option.option_text),
      displayOrder: Number(option.display_order),
      isCorrect: Boolean(option.is_correct),
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const criteria = (Array.isArray(row.quiz_marking_criteria) ? row.quiz_marking_criteria : [])
    .map((criterion: Row) => {
      const unit = first(criterion.content_units);
      return {
        id: String(criterion.id),
        criterion: String(criterion.criterion),
        marks: Number(criterion.marks),
        displayOrder: Number(criterion.display_order),
        sourceContentUnitId: String(criterion.source_content_unit_id),
        sourceTitle: unit ? String(unit.title) : "Unknown source",
        acceptedConcepts: Array.isArray(criterion.accepted_concepts) ? criterion.accepted_concepts.map(String) : [],
      };
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return {
    id: String(row.id),
    question: String(row.question),
    explanation: String(row.explanation),
    questionType: row.question_type as "mcq" | "subjective",
    status: row.status as QuestionDetail["status"],
    difficulty: String(row.difficulty),
    maxMarks: Number(row.max_marks),
    generatedBy: String(row.generated_by),
    subjectiveAnswerScheme: row.subjective_answer_scheme === null ? null : String(row.subjective_answer_scheme),
    topicId: String(row.topic_id),
    topicName: String(topic.name),
    chapterCode: String(chapter.code),
    sourceContentUnitId: row.source_content_unit_id === null ? null : String(row.source_content_unit_id),
    sourceTitle: sourceUnit ? String(sourceUnit.title) : null,
    sourceFile: sourceRef ? String(sourceRef.source_file) : null,
    sourcePage: sourceRef ? Number(sourceRef.page_or_slide) : null,
    options,
    criteria,
  };
}

/** Drafts awaiting the lecturer's judgement, oldest first. */
export async function listPendingDrafts(limit = 20): Promise<QuestionDetail[]> {
  const client = await createUserScopedClient();
  const { data, error } = await client
    .from("quiz_questions")
    .select("id")
    .eq("status", "draft")
    .order("created_at")
    .limit(limit);

  if (error) throw new Error(`The approval queue could not be loaded: ${error.message}`);

  const details = await Promise.all((data ?? []).map((row: Row) => getQuestion(String(row.id))));
  return details.filter((detail): detail is QuestionDetail => detail !== null);
}

/** Published, cited units a question can be attributed to, for the source picker. */
export async function listSourceUnits(topicId?: string): Promise<Array<{
  id: string; title: string; topicId: string; topicName: string; chapterCode: string;
}>> {
  const client = await createUserScopedClient();
  let query = client
    .from("content_units")
    .select("id, title, topic_id, topics!inner(id, name, chapters!inner(code))")
    .eq("status", "published");

  if (topicId) query = query.eq("topic_id", topicId);

  const { data, error } = await query.order("created_at");
  if (error) throw new Error(`Course material could not be loaded: ${error.message}`);

  return (data ?? []).flatMap((row: Row) => {
    const topic = first(row.topics);
    const chapter = topic ? first(topic.chapters) : null;
    if (!topic || !chapter) return [];
    return [{
      id: String(row.id),
      title: String(row.title),
      topicId: String(row.topic_id),
      topicName: String(topic.name),
      chapterCode: String(chapter.code),
    }];
  });
}
