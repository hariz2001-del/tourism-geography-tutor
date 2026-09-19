import { describe, expect, it } from "vitest";
import { parseQuestionForm } from "./question-payload";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const mcqFields = {
  question: "Which ocean is the largest?",
  explanation: "The Pacific covers the greatest area.",
  difficulty: "introductory",
  topicId: "topic-1",
  sourceContentUnitId: "unit-1",
  questionType: "mcq",
  maxMarks: "1",
  "optionText.0": "Pacific Ocean",
  "optionText.1": "Atlantic Ocean",
  correctOption: "0",
};

const writtenFields = {
  question: "State two facts about the Equator.",
  explanation: "Both facts appear in the chapter.",
  difficulty: "intermediate",
  topicId: "topic-1",
  sourceContentUnitId: "unit-1",
  questionType: "subjective",
  maxMarks: "2",
  subjectiveAnswerScheme: "One mark for each accurate fact.",
  "criterionText.0": "Names it as zero degrees latitude",
  "criterionMarks.0": "1",
  "criterionSource.0": "unit-1",
  "criterionKeywords.0": "zero degrees, 0°",
  "criterionText.1": "Says it circles the widest part of Earth",
  "criterionMarks.1": "1",
  "criterionSource.1": "unit-2",
};

describe("reading a multiple-choice question from the form", () => {
  it("keeps the answers in order and marks the chosen one correct", () => {
    const result = parseQuestionForm(form(mcqFields));

    expect(result.error).toBeNull();
    expect(result.value?.options).toEqual([
      { text: "Pacific Ocean", isCorrect: true },
      { text: "Atlantic Ocean", isCorrect: false },
    ]);
  });

  it("refuses a question with only one answer", () => {
    const fields = { ...mcqFields };
    delete (fields as Record<string, string>)["optionText.1"];

    expect(parseQuestionForm(form(fields)).error).toMatch(/at least two answers/i);
  });

  it("refuses a question where no answer is marked correct", () => {
    expect(parseQuestionForm(form({ ...mcqFields, correctOption: "" })).error).toMatch(/exactly one/i);
  });

  it("ignores a row the lecturer emptied rather than counting it as an answer", () => {
    const result = parseQuestionForm(form({ ...mcqFields, "optionText.2": "   " }));

    expect(result.error).toBeNull();
    expect(result.value?.options).toHaveLength(2);
  });

  it("still reads the right answer after an earlier row was removed", () => {
    const fields = {
      ...mcqFields,
      "optionText.0": "Pacific Ocean",
      "optionText.3": "Indian Ocean",
      correctOption: "3",
    };
    delete (fields as Record<string, string>)["optionText.1"];

    const result = parseQuestionForm(form(fields));

    expect(result.error).toBeNull();
    expect(result.value?.options).toEqual([
      { text: "Pacific Ocean", isCorrect: false },
      { text: "Indian Ocean", isCorrect: true },
    ]);
  });
});

describe("reading a written question from the form", () => {
  it("collects each marking point with its own source and keywords", () => {
    const result = parseQuestionForm(form(writtenFields));

    expect(result.error).toBeNull();
    expect(result.value?.criteria).toEqual([
      {
        criterion: "Names it as zero degrees latitude",
        marks: 1,
        sourceContentUnitId: "unit-1",
        acceptedConcepts: ["zero degrees", "0°"],
      },
      {
        criterion: "Says it circles the widest part of Earth",
        marks: 1,
        sourceContentUnitId: "unit-2",
        acceptedConcepts: [],
      },
    ]);
  });

  it("refuses marking points that do not add up to the marks on offer", () => {
    const result = parseQuestionForm(form({ ...writtenFields, maxMarks: "5" }));

    expect(result.error).toMatch(/add up to 2, but the question is worth 5/i);
  });

  it("refuses a marking point with no course material behind it", () => {
    const result = parseQuestionForm(form({ ...writtenFields, "criterionSource.1": "" }));

    expect(result.error).toMatch(/unit of course material/i);
  });

  it("refuses a written question with no marking points at all", () => {
    const fields: Record<string, string> = { ...writtenFields };
    for (const key of Object.keys(fields)) if (key.startsWith("criterion")) delete fields[key];

    expect(parseQuestionForm(form(fields)).error).toMatch(/at least one marking point/i);
  });
});

describe("the rules that apply to any question", () => {
  it.each([
    ["question", /needs some text/i],
    ["explanation", /explanation is required/i],
    ["topicId", /choose the topic/i],
    ["sourceContentUnitId", /published unit/i],
  ])("refuses a question with no %s", (field, expected) => {
    expect(parseQuestionForm(form({ ...mcqFields, [field]: "" })).error).toMatch(expected);
  });
});
