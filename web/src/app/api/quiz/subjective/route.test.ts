import { describe, expect, it, vi } from "vitest";
import { createSubjectiveQuizRouteHandler } from "./route";
import type { SubjectiveMarkingContext } from "@/lib/course-brain/types";

const request = (body: unknown) => new Request("http://localhost/api/quiz/subjective", {
  method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" },
});

const context: SubjectiveMarkingContext = {
  id: "00000000-0000-4000-8000-000000000001", question: "Question", maxMarks: 1, answerScheme: "secret scheme",
  criteria: [{ id: "criterion", criterion: "secret criterion", marks: 1, acceptedConcepts: ["place"], acceptedSynonyms: [], sourceUnit: { id: "unit", topicId: "topic", title: "Source", body: "Private excerpt", contentType: "definition", citation: { sourceFile: "chapter.pdf", chapterLabel: "Chapter 1", pageOrSlide: 1 } } }],
};

describe("POST /api/quiz/subjective", () => {
  it("grades server-side and never returns the private marking context", async () => {
    const getSubjectiveQuestionMarkingContext = vi.fn().mockResolvedValue(context);
    const POST = createSubjectiveQuizRouteHandler(() => ({ getSubjectiveQuestionMarkingContext }));
    const response = await POST(request({ quizId: context.id, answer: "A place." }));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.awardedMarks).toBe(1);
    expect(JSON.stringify(body)).not.toContain("secret");
    expect(getSubjectiveQuestionMarkingContext).toHaveBeenCalledWith(context.id);
  });

  it("rejects invalid subjective answer payloads", async () => {
    const POST = createSubjectiveQuizRouteHandler(() => ({ getSubjectiveQuestionMarkingContext: vi.fn() }));
    expect((await POST(request({ quizId: "not-a-uuid", answer: "" }))).status).toBe(400);
  });
});
