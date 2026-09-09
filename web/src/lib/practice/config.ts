import type { ExamQuestionScope } from "@/lib/course-brain/types";

export const practiceModes = {
  topic: { label: "Topic quiz", mcqCount: 3, subjectiveCount: 2 },
  chapter: { label: "Chapter mini exam", mcqCount: 5, subjectiveCount: 3 },
  // The lecturer asked for a 20-question objective paper: no written answers,
  // and a result a learner can check question by question.
  course: { label: "Full course exam", mcqCount: 20, subjectiveCount: 0 },
} as const;

export type PracticeMode = keyof typeof practiceModes;

export function isPracticeMode(value: string): value is PracticeMode {
  return value in practiceModes;
}

export function scopeForPractice(mode: PracticeMode, scopeValue?: string): ExamQuestionScope | null {
  if (mode === "course") return { type: "course" };
  if (!scopeValue) return null;
  return mode === "topic" ? { type: "topic", id: scopeValue } : { type: "chapter", code: scopeValue };
}
