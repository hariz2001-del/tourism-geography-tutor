import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CitationCard from "./citation-card";

describe("CitationCard", () => {
  it("links to the source topic and unit when navigation fields are known", () => {
    render(<CitationCard citation={{ sourceFile: "chapter-2.pdf", chapterLabel: "CH2", pageOrSlide: 3, chapterCode: "CH2", topicId: "topic-1", contentUnitId: "unit-1" }} />);

    const link = screen.getByRole("link", { name: /go to this source/i });
    expect(link).toHaveAttribute("href", "/chapters/CH2?topic=topic-1#unit-unit-1");
  });

  it("renders as a static, non-interactive card when navigation fields are missing", () => {
    render(<CitationCard citation={{ sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 }} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/source citation/i)).toBeVisible();
  });
});
