import { describe, expect, it, vi } from "vitest";
import { createCourseBrainRepository } from "./repository";

function queryBuilder(rows: unknown[]) {
  const builder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    returns: async () => ({ data: rows, error: null }),
  };
  return builder;
}

describe("public quiz repository boundary", () => {
  it("retrieves an exam batch without answer schemes, marking criteria, or answer keys", async () => {
    let rpcName = "";
    let parameters: Record<string, unknown> | undefined;
    const repository = createCourseBrainRepository({
      from: () => queryBuilder([]),
      rpc: async (name: string, args?: Record<string, unknown>) => {
        rpcName = name;
        parameters = args;
        return {
          data: [{
            id: "quiz-1", topic_id: "topic-1", source_content_unit_id: "unit-1",
            question_type: "subjective", question: "Explain place.", difficulty: "application", max_marks: 5,
            source_file: "reviewed.pdf", chapter_label: "Chapter 1", page_or_slide: 4, options: [],
          }],
          error: null,
        };
      },
    } as never);

    const questions = await repository.getPublicExamQuestionBatch({ type: "course" }, "subjective", 12);

    expect(rpcName).toBe("get_public_exam_question_batch");
    expect(parameters).toEqual({ p_scope_type: "course", p_scope_value: null, p_question_type: "subjective", p_limit: 12 });
    expect(questions).toMatchObject([{ questionType: "subjective", maxMarks: 5, options: [] }]);
    expect(JSON.stringify(questions)).not.toMatch(/isCorrect|answerScheme|criteria|explanation/);
  });

  it("uses a chapter code and an explicit type for independently sized batches", async () => {
    let parameters: Record<string, unknown> | undefined;
    const repository = createCourseBrainRepository({
      from: () => queryBuilder([]),
      rpc: async (_name: string, args?: Record<string, unknown>) => {
        parameters = args;
        return { data: [], error: null };
      },
    } as never);

    await repository.getPublicExamQuestionBatch({ type: "chapter", code: "CH3" }, "mcq", 8);

    expect(parameters).toEqual({ p_scope_type: "chapter", p_scope_value: "CH3", p_question_type: "mcq", p_limit: 8 });
  });

  it("shuffles MCQ options before returning an exam batch", async () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0);
    const repository = createCourseBrainRepository({
      from: () => queryBuilder([]),
      rpc: async () => ({
        data: [{
          id: "quiz-1", topic_id: "topic-1", source_content_unit_id: "unit-1",
          question_type: "mcq", question: "Which answer?", difficulty: "introductory", max_marks: 1,
          source_file: "reviewed.pdf", chapter_label: "Chapter 1", page_or_slide: 4, chapter_code: "CH1",
          options: [
            { id: "option-a", text: "A" },
            { id: "option-b", text: "B" },
            { id: "option-c", text: "C" },
            { id: "option-d", text: "D" },
          ],
        }],
        error: null,
      }),
    } as never);

    try {
      const [question] = await repository.getPublicExamQuestionBatch({ type: "chapter", code: "CH1" }, "mcq", 1);
      expect(question.options.map((option) => option.id)).toEqual(["option-b", "option-c", "option-d", "option-a"]);
    } finally {
      random.mockRestore();
    }
  });

  it("returns the safe RPC quiz shape without an answer key", async () => {
    const repository = createCourseBrainRepository({
      from: () => queryBuilder([]),
      rpc: async () => ({
        data: [{
          id: "quiz-1",
          question: "Which idea?",
          explanation: "Reviewed explanation.",
          source_file: "reviewed.pdf",
          chapter_label: "Chapter 1",
          page_or_slide: 4,
          options: [{ id: "option-a", text: "Place" }],
        }],
        error: null,
      }),
    } as never);

    const quiz = await repository.getApprovedTopicQuiz("topic-1");

    expect(quiz).toMatchObject({ id: "quiz-1", options: [{ id: "option-a", text: "Place" }] });
    expect(JSON.stringify(quiz)).not.toContain("isCorrect");
  });

  it("checks a selected option through the server-only repository seam", async () => {
    const repository = createCourseBrainRepository({
      from: () => queryBuilder([]),
      rpc: async (name: string) => ({
        data: name === "get_quiz_answer_review" ? [{ is_correct: true, explanation: "Reviewed explanation.", answer_scheme: "Correct answer: Place" }] : [],
        error: null,
      }),
    } as never);

    await expect((repository as { checkApprovedQuizAnswer: (quizId: string, optionId: string) => Promise<unknown> }).checkApprovedQuizAnswer("quiz-1", "option-a"))
      .resolves.toEqual({ isCorrect: true, explanation: "Reviewed explanation.", answerScheme: "Correct answer: Place" });
  });
});
