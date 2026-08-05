import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopicDiagramFigure from "./topic-diagram";

describe("TopicDiagramFigure", () => {
  it("renders the diagram image with its caption and source citation", () => {
    render(
      <TopicDiagramFigure
        diagram={{
          src: "/diagrams/example.jpg",
          alt: "Example diagram",
          caption: "Example Diagram",
          sourceFile: "reviewed.pdf",
          pageOrSlide: 4,
        }}
      />,
    );
    expect(screen.getByRole("img", { name: "Example diagram" })).toBeVisible();
    expect(screen.getByText(/Example Diagram/)).toBeVisible();
    expect(screen.getByText(/reviewed\.pdf/i)).toBeVisible();
  });
});
