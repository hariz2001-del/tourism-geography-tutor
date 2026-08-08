import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TutorPanel from "./tutor-panel";

function mockResponse(data: unknown) {
  return Promise.resolve({ ok: true, json: async () => ({ data }) });
}

describe("TutorPanel", () => {
  it("submits a question and renders a returned citation", async () => {
    vi.stubGlobal("fetch", vi.fn(() => mockResponse({
      kind: "grounded",
      text: "Tourism geography examines tourism, place, and movement.",
      citations: [{ sourceFile: "chapter-1-reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 }],
    })));

    render(<TutorPanel topicTitle="Tourism geography" />);
    fireEvent.change(screen.getByLabelText(/ask the tutor/i), { target: { value: "What is tourism geography?" } });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    expect(await screen.findByText(/tourism geography examines/i)).toBeVisible();
    expect(screen.getByText(/chapter-1-reviewed\.pdf/i)).toBeVisible();
    expect(screen.getByText(/page\/slide 4/i)).toBeVisible();
  });

  it("labels an AI-generated answer distinctly from a direct course-material answer", async () => {
    vi.stubGlobal("fetch", vi.fn(() => mockResponse({
      kind: "ai_grounded",
      text: "A desert has very low precipitation.",
      citations: [{ sourceFile: "chapter-4.pdf", chapterLabel: "Chapter 4", pageOrSlide: 18 }],
    })));

    render(<TutorPanel topicTitle="Tourism geography" />);
    fireEvent.change(screen.getByLabelText(/ask the tutor/i), { target: { value: "whats a dessert with low precipitaton" } });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    expect(await screen.findByText(/ai-generated from course material/i)).toBeVisible();
    expect(screen.getByText(/desert has very low precipitation/i)).toBeVisible();
  });

  it("clearly renders an out-of-scope answer", async () => {
    vi.stubGlobal("fetch", vi.fn(() => mockResponse({
      kind: "out_of_scope",
      text: "I could not find support for that in the approved Chapter 1 material.",
      citations: [],
    })));

    render(<TutorPanel topicTitle="Tourism geography" />);
    fireEvent.change(screen.getByLabelText(/ask the tutor/i), { target: { value: "Tell me about another subject" } });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/could not find support/i));
  });
});
