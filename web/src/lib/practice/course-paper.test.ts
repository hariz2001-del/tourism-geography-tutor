import { describe, expect, it, vi } from "vitest";
import { chapterShares, drawCoursePaper } from "./course-paper";
import type { CourseBrainRepository } from "@/lib/course-brain/repository";
import type { ExamQuestion } from "@/lib/course-brain/types";

function question(id: string): ExamQuestion {
  return {
    id,
    topicId: "topic-1",
    sourceContentUnitId: "unit-1",
    questionType: "mcq",
    question: `Question ${id}`,
    difficulty: "medium",
    maxMarks: 1,
    options: [],
    citation: { sourceFile: "chapter.pdf", chapterLabel: "CHAPTER 1", pageOrSlide: 1 },
  } as unknown as ExamQuestion;
}

function repositoryWith(pools: Record<string, string[]>) {
  const getPublicExamQuestionBatch = vi.fn(async (scope: { type: string; code?: string }, _type: string, limit: number) => {
    const key = scope.type === "course" ? "course" : scope.code ?? "";
    return (pools[key] ?? []).slice(0, limit).map(question);
  });
  return {
    repository: {
      listChapters: async () => Object.keys(pools).filter((code) => code !== "course").map((code) => ({ code, title: code, displayOrder: 1 })),
      getPublicExamQuestionBatch,
    } as unknown as CourseBrainRepository,
    getPublicExamQuestionBatch,
  };
}

describe("chapterShares", () => {
  it("splits a paper evenly when it divides", () => {
    expect(chapterShares(20, 4)).toEqual([5, 5, 5, 5]);
  });

  it("gives the remainder to the earliest chapters", () => {
    expect(chapterShares(20, 3)).toEqual([7, 7, 6]);
    expect(chapterShares(20, 6)).toEqual([4, 4, 3, 3, 3, 3]);
  });

  it("always totals the requested number of questions", () => {
    for (const chapters of [1, 2, 3, 4, 5, 7]) {
      expect(chapterShares(20, chapters).reduce((sum, share) => sum + share, 0)).toBe(20);
    }
  });

  it("asks for nothing when there is nothing to ask for", () => {
    expect(chapterShares(0, 4)).toEqual([]);
    expect(chapterShares(20, 0)).toEqual([]);
  });
});

describe("drawCoursePaper", () => {
  it("takes an equal share from every chapter", async () => {
    const pools = {
      CH1: Array.from({ length: 30 }, (_, i) => `ch1-${i}`),
      CH2: Array.from({ length: 30 }, (_, i) => `ch2-${i}`),
      CH3: Array.from({ length: 30 }, (_, i) => `ch3-${i}`),
      CH4: Array.from({ length: 30 }, (_, i) => `ch4-${i}`),
    };
    const { repository } = repositoryWith(pools);

    const paper = await drawCoursePaper(repository, 20);

    expect(paper).toHaveLength(20);
    for (const chapter of ["ch1", "ch2", "ch3", "ch4"]) {
      expect(paper.filter((entry) => entry.id.startsWith(chapter))).toHaveLength(5);
    }
  });

  it("tops up from the whole course when one chapter is short, rather than failing the paper", async () => {
    const pools = {
      CH1: Array.from({ length: 30 }, (_, i) => `ch1-${i}`),
      CH2: Array.from({ length: 30 }, (_, i) => `ch2-${i}`),
      CH3: ["ch3-0", "ch3-1"],
      CH4: Array.from({ length: 30 }, (_, i) => `ch4-${i}`),
      course: Array.from({ length: 40 }, (_, i) => `spare-${i}`),
    };
    const { repository } = repositoryWith(pools);

    const paper = await drawCoursePaper(repository, 20);

    expect(paper).toHaveLength(20);
    expect(paper.filter((entry) => entry.id.startsWith("ch3"))).toHaveLength(2);
    expect(paper.filter((entry) => entry.id.startsWith("spare"))).toHaveLength(3);
  });

  it("never repeats a question when topping up", async () => {
    const pools = {
      CH1: ["a", "b"],
      CH2: ["c"],
      course: ["a", "b", "c", "d", "e", "f"],
    };
    const { repository } = repositoryWith(pools);

    const paper = await drawCoursePaper(repository, 6);

    expect(new Set(paper.map((entry) => entry.id)).size).toBe(paper.length);
  });

  it("returns nothing when the course has no chapters", async () => {
    const { repository } = repositoryWith({});
    expect(await drawCoursePaper(repository, 20)).toEqual([]);
  });
});
