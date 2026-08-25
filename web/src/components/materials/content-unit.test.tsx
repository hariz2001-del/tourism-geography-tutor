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

  it("shows accessible attribution for an openly licensed supporting photo", () => {
    render(
      <ContentUnit
        unit={{
          id: "82c13fdc-c0c5-46d7-9320-d2cf89f273fc",
          topicId: "topic-1",
          title: "Summer monsoon",
          body: "Approved explanation.",
          contentType: "explanation",
          citation: { sourceFile: "chapter-2.pdf", chapterLabel: "Chapter 2", pageOrSlide: 14 },
        }}
        variant="stack"
      />,
    );

    expect(screen.getByRole("img", { name: /heavy summer monsoon clouds/i })).toBeVisible();
    expect(screen.getByText(/photo: lensnmatter/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "source" })).toHaveAttribute("href", expect.stringContaining("wikimedia.org"));
    expect(screen.getByRole("link", { name: "CC BY 2.0" })).toHaveAttribute("href", "https://creativecommons.org/licenses/by/2.0/");
  });
});
