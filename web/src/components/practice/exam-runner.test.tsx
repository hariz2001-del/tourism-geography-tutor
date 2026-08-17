import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ExamRunner from "./exam-runner";
import type { ExamQuestion } from "@/lib/course-brain/types";

const question: ExamQuestion = {
  id: "11111111-1111-4111-8111-111111111111",
  topicId: "topic-1",
  sourceContentUnitId: "unit-1",
  questionType: "mcq",
  question: "Which term matches the course definition?",
  difficulty: "introductory",
  maxMarks: 1,
  options: [{ id: "option-1", text: "Tourism" }],
  citation: { sourceFile: "chapter-1.pdf", chapterLabel: "Chapter 1", pageOrSlide: 2 },
};

function renderRunner(props: Partial<React.ComponentProps<typeof ExamRunner>> = {}) {
  return render(
    <ExamRunner
      title="Topic quiz"
      mcqQuestions={[question]}
      subjectiveQuestions={[]}
      returnHref="/chapters/CH1?topic=topic-1"
      returnLabel="Return to topic"
      restartHref="/practice/topic?topic=topic-1"
      mode="topic"
      scopeValue="topic-1"
      {...props}
    />,
  );
}

describe("ExamRunner", () => {
  afterEach(() => vi.restoreAllMocks());

  it("provides contextual navigation and valid progress semantics", () => {
    renderRunner();

    expect(screen.getByRole("link", { name: /return to topic/i })).toHaveAttribute("href", "/chapters/CH1?topic=topic-1");
    expect(screen.getByRole("progressbar", { name: /assessment progress/i })).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByRole("progressbar", { name: /assessment progress/i })).toHaveAttribute("aria-valuemax", "1");
  });

  it("submits the whole paper once and shows the score the server returned", async () => {
    // Totals deliberately inconsistent with the rendered question (which is
    // worth 1 mark). Only the server's figures can produce "5 / 7", so this
    // fails if the component ever goes back to totalling in the browser.
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        data: {
          attemptId: "attempt-1",
          awardedMarks: 5,
          totalMarks: 7,
          results: { [question.id]: { awardedMarks: 1, maxMarks: 1, isCorrect: true, explanation: "Correct because…", answerScheme: "Correct answer: Tourism" } },
        },
      }), { status: 200, headers: { "content-type": "application/json" } }),
    );

    renderRunner();
    await userEvent.click(screen.getByRole("radio"));
    await userEvent.click(screen.getByRole("button", { name: /submit assessment/i }));

    // The score interpolates several nodes into one paragraph, so match on the
    // element's combined text rather than a single text node.
    await waitFor(() =>
      expect(screen.getByText((_, element) => element?.textContent === "5 / 7 marks")).toBeInTheDocument(),
    );

    // One request for the paper, not one per question.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/attempts");
    const sent = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body));
    expect(sent).toMatchObject({ mode: "topic", scopeValue: "topic-1", scopeLabel: "Topic quiz" });
    expect(sent.answers).toEqual([{ questionId: question.id, questionType: "mcq", optionId: "option-1" }]);
    // The browser must not be telling the server what the marks were.
    expect(JSON.stringify(sent)).not.toMatch(/awardedMarks|maxMarks/);
  });

  it("points a signed-in learner at their saved attempt", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        data: { attemptId: "attempt-1", awardedMarks: 0, totalMarks: 1, results: { [question.id]: { awardedMarks: 0, maxMarks: 1, isCorrect: false, explanation: "Not quite." } } },
      }), { status: 200, headers: { "content-type": "application/json" } }),
    );

    renderRunner({ isLearner: true });
    await userEvent.click(screen.getByRole("radio"));
    await userEvent.click(screen.getByRole("button", { name: /submit assessment/i }));

    await waitFor(() => expect(screen.getByRole("link", { name: /review this attempt/i })).toHaveAttribute("href", "/dashboard/student/results/attempt-1"));
  });

  it("invites an anonymous visitor to sign in rather than claiming the score was kept", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        data: { attemptId: null, awardedMarks: 1, totalMarks: 1, results: { [question.id]: { awardedMarks: 1, maxMarks: 1, isCorrect: true, explanation: "Correct." } } },
      }), { status: 200, headers: { "content-type": "application/json" } }),
    );

    renderRunner();
    await userEvent.click(screen.getByRole("radio"));
    await userEvent.click(screen.getByRole("button", { name: /submit assessment/i }));

    await waitFor(() => expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login"));
    expect(screen.queryByText(/saved to your results/i)).not.toBeInTheDocument();
  });
});
