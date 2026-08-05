import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TutorPanel from "./tutor-panel";

describe("TutorPanel response announcements", () => {
  it("announces a successful grounded response in a live region", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: {
        kind: "grounded", text: "Approved explanation.",
        citations: [{ sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 }],
      } }),
    })));

    render(<TutorPanel chapterCode="CH1" topicId="topic-1" topicTitle="Topic one" />);
    fireEvent.change(screen.getByLabelText(/ask the tutor/i), { target: { value: "What is topic one?" } });
    fireEvent.click(screen.getByRole("button", { name: /ask tutor/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("Approved explanation.");
  });
});
