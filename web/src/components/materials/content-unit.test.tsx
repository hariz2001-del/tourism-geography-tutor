import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContentUnit from "./content-unit";

describe("ContentUnit", () => {
  it("renders reviewed content with its source citation", () => {
    render(<ContentUnit unit={{ id: "unit-1", topicId: "topic-1", title: "Place", body: "Approved explanation.", contentType: "explanation", citation: { sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 } }} />);
    expect(screen.getByRole("heading", { name: "Place" })).toBeVisible();
    expect(screen.getByText(/reviewed\.pdf/i)).toBeVisible();
  });
});
