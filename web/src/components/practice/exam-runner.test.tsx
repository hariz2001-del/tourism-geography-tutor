import { render, screen } from "@testing-library/react";
import ExamRunner from "./exam-runner";
import type { ExamQuestion } from "@/lib/course-brain/types";

const question: ExamQuestion = {
  id: "question-1",
  topicId: "topic-1",
  sourceContentUnitId: "unit-1",
  questionType: "mcq",
  question: "Which term matches the course definition?",
  difficulty: "introductory",
  maxMarks: 1,
  options: [{ id: "option-1", text: "Tourism" }],
  citation: { sourceFile: "chapter-1.pdf", chapterLabel: "Chapter 1", pageOrSlide: 2 },
};

describe("ExamRunner", () => {
  it("provides contextual navigation and valid progress semantics", () => {
    render(
      <ExamRunner
        title="Topic quiz"
        mcqQuestions={[question]}
        subjectiveQuestions={[]}
        returnHref="/chapters/CH1?topic=topic-1"
        returnLabel="Return to topic"
        restartHref="/practice/topic?topic=topic-1"
      />,
    );

    expect(screen.getByRole("link", { name: /return to topic/i })).toHaveAttribute("href", "/chapters/CH1?topic=topic-1");
    expect(screen.getByRole("progressbar", { name: /assessment progress/i })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("progressbar", { name: /assessment progress/i })).toHaveAttribute("aria-valuemax", "1");
  });
});
