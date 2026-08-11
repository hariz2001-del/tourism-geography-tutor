import { describe, expect, it, vi } from "vitest";
import { createQuizAnswerRouteHandler } from "./route";

const request = (body: unknown) => new Request("http://localhost/api/quiz/answer", {
  method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" },
});

describe("POST /api/quiz/answer", () => {
  it("returns only feedback after server-side answer checking", async () => {
    const POST = createQuizAnswerRouteHandler(() => ({
      checkApprovedQuizAnswer: vi.fn().mockResolvedValue({ isCorrect: true, explanation: "Reviewed explanation.", answerScheme: "Correct answer: A" }),
    }));

    const response = await POST(request({ quizId: "00000000-0000-4000-8000-000000000001", optionId: "00000000-0000-4000-8000-000000000002" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { isCorrect: true, explanation: "Reviewed explanation.", answerScheme: "Correct answer: A" } });
  });

  it("rejects malformed answer-check requests", async () => {
    const POST = createQuizAnswerRouteHandler(() => ({ checkApprovedQuizAnswer: vi.fn() }));
    expect((await POST(request({ quizId: "quiz-1" }))).status).toBe(400);
  });
});
