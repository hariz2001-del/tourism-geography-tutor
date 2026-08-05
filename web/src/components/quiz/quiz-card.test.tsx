import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import QuizCard from "./quiz-card";

const question = {
  id: "quiz-1",
  question: "Which idea is central to this topic?",
  explanation: "The approved note identifies place as central.",
  options: [
    { id: "a", text: "Place" },
    { id: "b", text: "Unrelated fact" },
  ],
  citation: { sourceFile: "chapter-1-reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 },
};

describe("QuizCard", () => {
  it("checks the selected answer through the server and reveals feedback afterward", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { isCorrect: true, explanation: question.explanation } }),
    })));
    render(<QuizCard question={question} />);

    expect(screen.queryByText(/the approved note identifies/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Place"));
    fireEvent.click(screen.getByRole("button", { name: /check answer/i }));

    expect(await screen.findByText(/the approved note identifies/i)).toBeVisible();
    expect(screen.getByText(/correct/i)).toBeVisible();
    expect(fetch).toHaveBeenCalledWith("/api/quiz/answer", expect.objectContaining({ method: "POST" }));
  });

  it("does not receive an answer-key field in its question payload", () => {
    render(<QuizCard question={question} />);
    expect(JSON.stringify(question)).not.toContain("isCorrect");
  });
});
