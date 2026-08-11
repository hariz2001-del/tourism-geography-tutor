import { afterEach, describe, expect, it, vi } from "vitest";
import { gradeSubjectiveAnswer, normalizeAnswer } from "./subjective-grader";
import type { SubjectiveMarkingContext } from "../course-brain/types";

const context: SubjectiveMarkingContext = {
  id: "00000000-0000-4000-8000-000000000001", question: "Explain the term.", maxMarks: 3, answerScheme: "private",
  criteria: [{
    id: "criterion-1", criterion: "private rubric", marks: 3,
    acceptedConcepts: ["tourist destination"], acceptedSynonyms: ["visitor destination"],
    sourceUnit: { id: "unit-1", topicId: "topic-1", title: "Source", body: "Reviewed source excerpt.", contentType: "definition", citation: { sourceFile: "chapter-1.pdf", chapterLabel: "Chapter 1", pageOrSlide: 2 } },
  }],
};

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("subjective grader", () => {
  it("normalizes case, punctuation, and whitespace", () => {
    expect(normalizeAnswer("  TOURIST—destination!\n")).toBe("tourist destination");
  });

  it("awards configured concepts locally without calling the model and returns no private scheme", async () => {
    const fetchSpy = vi.fn();
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key"); vi.stubGlobal("fetch", fetchSpy);

    const result = await gradeSubjectiveAnswer("A tourist destination attracts visitors.", context);

    expect(result).toEqual({ awardedMarks: 3, maxMarks: 3, criteria: [{ awardedMarks: 3, maxMarks: 3, feedback: "This part is supported by your answer.", citations: [context.criteria[0].sourceUnit.citation] }] });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("private");
  });

  it("allows only a conservative typo match for configured one-word terms", async () => {
    const oneWordContext = { ...context, criteria: [{ ...context.criteria[0], acceptedConcepts: ["destination"], acceptedSynonyms: [] }] };
    const result = await gradeSubjectiveAnswer("A destnation can attract visitors.", oneWordContext);
    expect(result.awardedMarks).toBe(3);
  });

  it("rejects malformed model output and safely awards no unproven marks", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: "not json" } }] }) })));
    const result = await gradeSubjectiveAnswer("unrelated", context);
    expect(result.awardedMarks).toBe(0);
    expect(result.criteria[0].citations).toEqual([context.criteria[0].sourceUnit.citation]);
  });
});
