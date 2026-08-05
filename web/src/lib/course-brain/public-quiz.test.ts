import { describe, expect, it } from "vitest";
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
        data: name === "check_public_quiz_answer" ? [{ is_correct: true, explanation: "Reviewed explanation." }] : [],
        error: null,
      }),
    } as never);

    await expect((repository as { checkApprovedQuizAnswer: (quizId: string, optionId: string) => Promise<unknown> }).checkApprovedQuizAnswer("quiz-1", "option-a"))
      .resolves.toEqual({ isCorrect: true, explanation: "Reviewed explanation." });
  });
});
