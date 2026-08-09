import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContentUnit from "./content-unit";

describe("ContentUnit", () => {
  it("renders reviewed content without a per-unit source box", () => {
    render(<ContentUnit unit={{ id: "unit-1", topicId: "topic-1", title: "Place", body: "Approved explanation.", contentType: "explanation", citation: { sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 } }} variant="stack" />);
    expect(screen.getByRole("heading", { name: "Place" })).toBeVisible();
    expect(screen.getByText("Approved explanation.")).toBeVisible();
    expect(screen.queryByText(/reviewed\.pdf/i)).not.toBeInTheDocument();
  });

  it("briefly highlights itself when the URL hash points at its anchor id", () => {
    window.location.hash = "#unit-unit-1";
    render(<ContentUnit unit={{ id: "unit-1", topicId: "topic-1", title: "Place", body: "Approved explanation.", contentType: "explanation", citation: { sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 } }} variant="stack" />);

    expect(screen.getByRole("heading", { name: "Place" }).closest("article")).toHaveAttribute("data-highlighted", "true");
    window.location.hash = "";
  });

  it("does not highlight itself when the URL hash points elsewhere", () => {
    window.location.hash = "#unit-some-other-unit";
    render(<ContentUnit unit={{ id: "unit-1", topicId: "topic-1", title: "Place", body: "Approved explanation.", contentType: "explanation", citation: { sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 } }} variant="stack" />);

    expect(screen.getByRole("heading", { name: "Place" }).closest("article")).toHaveAttribute("data-highlighted", "false");
    window.location.hash = "";
  });
});
