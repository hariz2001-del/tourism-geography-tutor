import { describe, expect, it } from "vitest";
import { answerQuestion } from "./grounding";
import type { PublishedContentUnit } from "../course-brain/types";

const units: PublishedContentUnit[] = [
  {
    id: "unit-1",
    topicId: "topic-1",
    title: "Tourism geography and place",
    body: "Tourism geography examines the relationship between tourism, place, and movement.",
    contentType: "explanation",
    citation: { sourceFile: "chapter-1-reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 },
  },
  {
    id: "unit-2",
    topicId: "topic-1",
    title: "A different note",
    body: "A destination can be described through its attractions and services.",
    contentType: "learning_note",
    citation: { sourceFile: "chapter-1-reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 7 },
  },
  {
    id: "other-topic-unit",
    topicId: "topic-2",
    title: "Tourism geography",
    body: "This content belongs to a different topic.",
    contentType: "explanation",
    citation: { sourceFile: "chapter-1-reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 10 },
  },
];

describe("answerQuestion", () => {
  it("ranks overlapping published evidence and preserves its citation", () => {
    const answer = answerQuestion({ question: "How does tourism geography relate to place?", topicId: "topic-1" }, units);

    expect(answer.kind).toBe("grounded");
    expect(answer.text).toContain("Tourism geography examines");
    expect(answer.citations[0]).toMatchObject({ pageOrSlide: 4, sourceFile: "chapter-1-reviewed.pdf" });
  });

  it("does not use units outside the selected topic", () => {
    const answer = answerQuestion({ question: "What is tourism geography?", topicId: "topic-1" }, units);

    expect(answer.citations.every((citation) => citation.pageOrSlide !== 10)).toBe(true);
  });

  it("returns a transparent out-of-scope answer when evidence is weak", () => {
    const answer = answerQuestion({ question: "What is climate change policy?", topicId: "topic-1" }, units);

    expect(answer.kind).toBe("out_of_scope");
    expect(answer.citations).toHaveLength(0);
    expect(answer.text).toMatch(/approved chapter 1 material/i);
  });
});
