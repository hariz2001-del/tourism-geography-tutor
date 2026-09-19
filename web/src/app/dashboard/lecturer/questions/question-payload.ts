/**
 * Reads a question out of the lecturer's form, and says no to anything the
 * database would refuse to approve later.
 *
 * The rules here deliberately mirror `require_complete_approved_exam_question`
 * in 202608120001_exam_question_bank.sql. The trigger only fires on approval,
 * which is far too late to be useful feedback — a lecturer would write a whole
 * question, save it, and only discover at the approval queue that it could never
 * be approved. So the same rules are checked while she is still editing, and the
 * trigger stays as the real guarantee.
 *
 * Kept out of actions.ts because a "use server" file may only export async
 * functions, which would make this untestable.
 */

export type ParsedOption = { text: string; isCorrect: boolean };

export type ParsedCriterion = {
  criterion: string;
  marks: number;
  sourceContentUnitId: string;
  acceptedConcepts: string[];
};

export type ParsedQuestion = {
  questionId: string | null;
  question: string;
  explanation: string;
  difficulty: string;
  topicId: string;
  sourceContentUnitId: string;
  questionType: "mcq" | "subjective";
  maxMarks: number;
  answerScheme: string | null;
  options: ParsedOption[];
  criteria: ParsedCriterion[];
};

export type ParseResult = { error: string; value: null } | { error: null; value: ParsedQuestion };

const DIFFICULTIES = ["introductory", "intermediate", "application"];

/** The database allows display_order 1..6, so the form cannot offer more. */
export const MAX_OPTIONS = 6;

function fail(error: string): ParseResult {
  return { error, value: null };
}

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

/** Indexed rows arrive as `optionText.0`, `optionText.1`, … with gaps once a row is removed. */
function indexedValues(formData: FormData, prefix: string): Array<{ index: number; value: string }> {
  const rows: Array<{ index: number; value: string }> = [];
  for (const [key, raw] of formData.entries()) {
    if (!key.startsWith(`${prefix}.`)) continue;
    const index = Number(key.slice(prefix.length + 1));
    if (!Number.isInteger(index)) continue;
    rows.push({ index, value: String(raw).trim() });
  }
  return rows.sort((left, right) => left.index - right.index);
}

function splitKeywords(value: string): string[] {
  return value
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

export function parseQuestionForm(formData: FormData): ParseResult {
  const questionId = text(formData, "questionId");
  const question = text(formData, "question");
  const explanation = text(formData, "explanation");
  const difficulty = text(formData, "difficulty");
  const topicId = text(formData, "topicId");
  const sourceContentUnitId = text(formData, "sourceContentUnitId");
  const questionType = text(formData, "questionType") === "subjective" ? "subjective" : "mcq";
  const maxMarks = Number(formData.get("maxMarks") ?? 1);
  const answerScheme = text(formData, "subjectiveAnswerScheme");

  if (!question) return fail("A question needs some text.");
  if (!explanation) return fail("An explanation is required — learners see it after answering.");
  if (!topicId) return fail("Choose the topic this question belongs to.");
  // Every question must trace back to published course material; this is the
  // project's source-fidelity rule, not an incidental form check.
  if (!sourceContentUnitId) return fail("Choose the published unit this question comes from.");
  if (!DIFFICULTIES.includes(difficulty)) return fail("Choose a difficulty.");
  if (!Number.isInteger(maxMarks) || maxMarks < 1) return fail("Marks must be a whole number of at least 1.");

  if (questionType === "mcq") {
    const options = indexedValues(formData, "optionText")
      .map(({ index, value }) => ({ index, text: value }))
      .filter((option) => option.text.length > 0);

    if (options.length < 2) return fail("A multiple-choice question needs at least two answers.");
    if (options.length > MAX_OPTIONS) return fail(`A question can have at most ${MAX_OPTIONS} answers.`);

    // Number("") is 0, which would quietly mark the first answer correct when the
    // lecturer marked none at all.
    const correctRaw = text(formData, "correctOption");
    const correctIndex = correctRaw === "" ? Number.NaN : Number(correctRaw);
    const correct = options.filter((option) => option.index === correctIndex);
    if (correct.length !== 1) return fail("Mark exactly one answer as the correct one.");

    return {
      error: null,
      value: {
        questionId: questionId || null,
        question,
        explanation,
        difficulty,
        topicId,
        sourceContentUnitId,
        questionType,
        maxMarks,
        answerScheme: null,
        options: options.map((option) => ({ text: option.text, isCorrect: option.index === correctIndex })),
        criteria: [],
      },
    };
  }

  if (!answerScheme) return fail("A written question needs an answer scheme.");

  const marks = new Map(indexedValues(formData, "criterionMarks").map(({ index, value }) => [index, Number(value)]));
  const sources = new Map(indexedValues(formData, "criterionSource").map(({ index, value }) => [index, value]));
  const keywords = new Map(indexedValues(formData, "criterionKeywords").map(({ index, value }) => [index, value]));

  const criteria: ParsedCriterion[] = [];
  for (const { index, value } of indexedValues(formData, "criterionText")) {
    if (!value) continue;
    const criterionMarks = marks.get(index) ?? Number.NaN;
    if (!Number.isInteger(criterionMarks) || criterionMarks < 1) {
      return fail("Each marking point needs a whole number of marks, at least 1.");
    }
    const source = sources.get(index) ?? "";
    if (!source) return fail("Each marking point needs the unit of course material it comes from.");
    criteria.push({
      criterion: value,
      marks: criterionMarks,
      sourceContentUnitId: source,
      acceptedConcepts: splitKeywords(keywords.get(index) ?? ""),
    });
  }

  if (criteria.length === 0) return fail("A written question needs at least one marking point.");

  const awarded = criteria.reduce((total, criterion) => total + criterion.marks, 0);
  if (awarded !== maxMarks) {
    return fail(`The marking points add up to ${awarded}, but the question is worth ${maxMarks}.`);
  }

  return {
    error: null,
    value: {
      questionId: questionId || null,
      question,
      explanation,
      difficulty,
      topicId,
      sourceContentUnitId,
      questionType,
      maxMarks,
      answerScheme,
      options: [],
      criteria,
    },
  };
}
