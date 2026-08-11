import "server-only";

import type { SubjectiveGrade, SubjectiveMarkingContext } from "../course-brain/types";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

type LlmCriterionGrade = { criterionId: string; awardedMarks: number; sourceUnitIds: string[] };

export function normalizeAnswer(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

function editDistance(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0]; previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const saved = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = saved;
    }
  }
  return previous[right.length];
}

function hasConfiguredMatch(answer: string, values: string[]): boolean {
  const padded = ` ${answer} `;
  for (const value of values) {
    const term = normalizeAnswer(value);
    if (!term) continue;
    if (padded.includes(` ${term} `)) return true;
    // Typo tolerance is intentionally token-only and narrow: no fuzzy matches
    // for short words or multi-word phrases, which would over-award marks.
    if (!term.includes(" ") && term.length >= 5) {
      const allowedDistance = term.length >= 8 ? 2 : 1;
      if (answer.split(" ").some((token) => token.length >= 5 && editDistance(token, term) <= allowedDistance)) return true;
    }
  }
  return false;
}

function feedback(marks: number, maxMarks: number): string {
  if (marks === maxMarks) return "This part is supported by your answer.";
  if (marks === 0) return "This part needs more support from the course material.";
  return "This part is partly supported by your answer.";
}

function parseLlmGrades(content: string, pending: SubjectiveMarkingContext["criteria"]): Map<string, LlmCriterionGrade> | null {
  try {
    const parsed = JSON.parse(content) as { criteria?: unknown };
    if (!Array.isArray(parsed.criteria)) return null;
    const allowed = new Map(pending.map((criterion) => [criterion.id, criterion]));
    const output = new Map<string, LlmCriterionGrade>();
    for (const item of parsed.criteria) {
      if (!item || typeof item !== "object") return null;
      const value = item as Record<string, unknown>;
      const criterion = allowed.get(String(value.criterionId));
      if (!criterion || !Number.isInteger(value.awardedMarks) || typeof value.awardedMarks !== "number" || value.awardedMarks < 0 || value.awardedMarks > criterion.marks || !Array.isArray(value.sourceUnitIds)) return null;
      const sourceUnitIds = value.sourceUnitIds.map(String);
      if (sourceUnitIds.some((id) => id !== criterion.sourceUnit.id)) return null;
      output.set(criterion.id, { criterionId: criterion.id, awardedMarks: value.awardedMarks, sourceUnitIds });
    }
    return output.size === pending.length ? output : null;
  } catch { return null; }
}

async function gradeWithLlm(answer: string, context: SubjectiveMarkingContext, pending: SubjectiveMarkingContext["criteria"]): Promise<Map<string, LlmCriterionGrade> | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || !pending.length) return null;
  const privateContext = pending.map((criterion) => ({
    criterionId: criterion.id, maximumMarks: criterion.marks, rubric: criterion.criterion,
    sourceUnitId: criterion.sourceUnit.id, excerpt: criterion.sourceUnit.body,
  }));
  try {
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-v4-flash", response_format: { type: "json_object" }, stream: false,
        messages: [
          { role: "system", content: "Grade only from the private rubric and excerpts. Do not use outside knowledge. Return strict JSON only: {\"criteria\":[{\"criterionId\":\"...\",\"awardedMarks\":0,\"sourceUnitIds\":[\"...\"]}]}. Include every supplied criterion exactly once. Award an integer from zero to its maximum. A sourceUnitId may only be the source supplied for that criterion." },
          { role: "user", content: JSON.stringify({ question: context.question, answer, privateAnswerScheme: context.answerScheme, privateRubricAndExcerpts: privateContext }) },
        ],
      }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = body.choices?.[0]?.message?.content;
    return content ? parseLlmGrades(content, pending) : null;
  } catch { return null; }
}

export async function gradeSubjectiveAnswer(answer: string, context: SubjectiveMarkingContext): Promise<SubjectiveGrade> {
  const normalized = normalizeAnswer(answer);
  const local = new Map<string, number>();
  const pending = context.criteria.filter((criterion) => {
    if (hasConfiguredMatch(normalized, [...criterion.acceptedConcepts, ...criterion.acceptedSynonyms])) {
      local.set(criterion.id, criterion.marks); return false;
    }
    return true;
  });
  const ai = await gradeWithLlm(answer, context, pending);
  const criteria = context.criteria.map((criterion) => {
    const awardedMarks = local.get(criterion.id) ?? ai?.get(criterion.id)?.awardedMarks ?? 0;
    return { awardedMarks, maxMarks: criterion.marks, feedback: feedback(awardedMarks, criterion.marks), citations: [criterion.sourceUnit.citation] };
  });
  const awardedMarks = Math.min(context.maxMarks, Math.max(0, criteria.reduce((sum, criterion) => sum + criterion.awardedMarks, 0)));
  return { awardedMarks, maxMarks: context.maxMarks, criteria };
}
