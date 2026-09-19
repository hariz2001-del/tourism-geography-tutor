import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuestionForm from "./question-form";
import type { QuestionDetail } from "@/lib/learners/question-bank";

vi.mock("./actions", () => ({ saveQuestion: vi.fn() }));

const topics = [{ id: "topic-1", name: "Major oceans", chapterCode: "CH2" }];
const sourceUnits = [
  { id: "unit-1", title: "The Pacific Ocean", topicId: "topic-1", topicName: "Major oceans", chapterCode: "CH2" },
];

const written: QuestionDetail = {
  id: "q1",
  question: "State two facts about the Equator.",
  explanation: "Both appear in the chapter.",
  questionType: "subjective",
  status: "draft",
  difficulty: "intermediate",
  maxMarks: 2,
  generatedBy: "deepseek_draft",
  subjectiveAnswerScheme: "One mark per fact.",
  topicId: "topic-1",
  topicName: "Major oceans",
  chapterCode: "CH2",
  sourceContentUnitId: "unit-1",
  sourceTitle: "The Pacific Ocean",
  sourceFile: "chapter-2.pdf",
  sourcePage: 4,
  options: [],
  criteria: [
    {
      id: "c1",
      criterion: "Names it as zero degrees latitude",
      marks: 2,
      displayOrder: 1,
      sourceContentUnitId: "unit-1",
      sourceTitle: "The Pacific Ocean",
      acceptedConcepts: ["zero degrees", "0°"],
    },
  ],
};

describe("writing a multiple-choice question", () => {
  it("starts with two answers, because one answer is not a choice", () => {
    render(<QuestionForm question={null} topics={topics} sourceUnits={sourceUnits} />);

    expect(screen.getByLabelText("Answer 1")).toBeVisible();
    expect(screen.getByLabelText("Answer 2")).toBeVisible();
    expect(screen.queryByLabelText("Answer 3")).not.toBeInTheDocument();
  });

  it("adds and removes answers, keeping at least two", () => {
    render(<QuestionForm question={null} topics={topics} sourceUnits={sourceUnits} />);

    fireEvent.click(screen.getByRole("button", { name: /add an answer/i }));
    expect(screen.getByLabelText("Answer 3")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /remove answer 3/i }));
    expect(screen.queryByLabelText("Answer 3")).not.toBeInTheDocument();
    // The last two rows cannot be removed, so there is nothing left to click.
    expect(screen.queryByRole("button", { name: /remove answer/i })).not.toBeInTheDocument();
  });

  it("moves the correct mark to whichever answer the lecturer chooses", () => {
    render(<QuestionForm question={null} topics={topics} sourceUnits={sourceUnits} />);

    const second = screen.getByLabelText("Answer 2 is correct");
    fireEvent.click(second);

    expect(second).toBeChecked();
    expect(screen.getByLabelText("Answer 1 is correct")).not.toBeChecked();
  });
});

describe("writing a written question", () => {
  it("shows marking points instead of answers, and keeps the wording the grader already accepts", () => {
    render(<QuestionForm question={written} topics={topics} sourceUnits={sourceUnits} />);

    expect(screen.getByLabelText("Marking point 1")).toHaveValue("Names it as zero degrees latitude");
    expect(screen.getByLabelText("Accepted wording for point 1")).toHaveValue("zero degrees, 0°");
    expect(screen.queryByLabelText("Answer 1")).not.toBeInTheDocument();
  });

  it("keeps a running total of the marks, so they can be made to add up", () => {
    render(<QuestionForm question={written} topics={topics} sourceUnits={sourceUnits} />);

    expect(screen.getByText(/currently 2 of 2/i)).toBeVisible();

    fireEvent.change(screen.getByLabelText("Marks for point 1"), { target: { value: "1" } });

    expect(screen.getByText(/currently 1 of 2/i)).toBeVisible();
  });
});
