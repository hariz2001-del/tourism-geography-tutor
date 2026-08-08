import { afterEach, describe, expect, it, vi } from "vitest";
import { answerWithLlmFallback } from "./llm-fallback";
import type { PublishedContentUnit } from "../course-brain/types";
import type { OutOfScopeTutorAnswer } from "./types";

const units: PublishedContentUnit[] = [
  {
    id: "unit-1", topicId: "topic-1", title: "Desert", body: "A desert is a landscape with extremely low precipitation.",
    contentType: "definition", citation: { sourceFile: "chapter-4.pdf", chapterLabel: "Chapter 4", pageOrSlide: 18 },
  },
];

const outOfScope: OutOfScopeTutorAnswer = { kind: "out_of_scope", text: "I could not find support for that in the approved material for this topic.", citations: [] };

function mockFetchJson(body: unknown, ok = true) {
  return vi.fn(async () => ({ ok, json: async () => body }));
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("answerWithLlmFallback", () => {
  it("falls back to the out-of-scope answer when no API key is configured", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const result = await answerWithLlmFallback("whats a dessert with low precipitaton", units, outOfScope);
    expect(result).toBe(outOfScope);
  });

  it("returns an AI-grounded answer with the real citation looked up by sourceUnitId", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", mockFetchJson({
      choices: [{ message: { content: JSON.stringify({ found: true, answer: "A desert has very low precipitation.", sourceUnitId: "unit-1" }) } }],
    }));

    const result = await answerWithLlmFallback("whats a dessert with low precipitaton", units, outOfScope);

    expect(result).toEqual({
      kind: "ai_grounded",
      text: "A desert has very low precipitation.",
      citations: [{ sourceFile: "chapter-4.pdf", chapterLabel: "Chapter 4", pageOrSlide: 18 }],
    });
  });

  it("falls back to out-of-scope when the model reports found: false", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", mockFetchJson({ choices: [{ message: { content: JSON.stringify({ found: false }) } }] }));

    const result = await answerWithLlmFallback("What is climate change policy?", units, outOfScope);
    expect(result).toBe(outOfScope);
  });

  it("falls back to out-of-scope when the model cites a sourceUnitId that doesn't exist", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", mockFetchJson({
      choices: [{ message: { content: JSON.stringify({ found: true, answer: "Made up.", sourceUnitId: "not-a-real-unit" }) } }],
    }));

    const result = await answerWithLlmFallback("whats a dessert", units, outOfScope);
    expect(result).toBe(outOfScope);
  });

  it("falls back to out-of-scope on a non-JSON or malformed model response", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", mockFetchJson({ choices: [{ message: { content: "not json" } }] }));

    const result = await answerWithLlmFallback("whats a dessert", units, outOfScope);
    expect(result).toBe(outOfScope);
  });

  it("falls back to out-of-scope when the API call fails or errors", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({}) })));

    const result = await answerWithLlmFallback("whats a dessert", units, outOfScope);
    expect(result).toBe(outOfScope);
  });

  it("never calls the API when there is no published content at all", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-key");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await answerWithLlmFallback("anything", [], outOfScope);

    expect(result).toBe(outOfScope);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
