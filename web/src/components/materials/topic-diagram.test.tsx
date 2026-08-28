import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopicDiagramFigure from "./topic-diagram";

const diagram = {
  src: "/diagrams/example.jpg",
  alt: "Example diagram",
  caption: "Example Diagram",
  sourceFile: "reviewed.pdf",
  pageOrSlide: 4,
};

describe("TopicDiagramFigure", () => {
  it("renders a thumbnail with its caption and source citation", () => {
    render(<TopicDiagramFigure diagram={diagram} />);
    expect(screen.getByRole("img", { name: "Example diagram" })).toBeVisible();
    expect(screen.getByText(/Example Diagram/)).toBeVisible();
    expect(screen.getByText(/reviewed\.pdf/i)).toBeVisible();
  });

  it("expands into a full-screen dialog when the thumbnail is clicked, and closes on Escape", () => {
    render(<TopicDiagramFigure diagram={diagram} />);

    fireEvent.click(screen.getByRole("button", { name: /expand:/i }));
    expect(screen.getByRole("dialog", { name: /Example Diagram/ })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles zoom when the expanded image is clicked", () => {
    render(<TopicDiagramFigure diagram={diagram} />);
    fireEvent.click(screen.getByRole("button", { name: /expand:/i }));

    const zoomButton = screen.getByRole("button", { name: "Zoom in" });
    fireEvent.click(zoomButton);
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeVisible();
  });
});
