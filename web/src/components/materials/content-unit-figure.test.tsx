import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ContentUnit from "./content-unit";
import { contentImages } from "@/lib/course-brain/content-images";
import type { PublishedContentUnit } from "@/lib/course-brain/types";

function unit(id: string): PublishedContentUnit {
  return {
    id,
    topicId: "topic",
    title: "A unit",
    body: "Its body.",
    contentType: "definition",
    citation: { sourceFile: "chapter-1.pdf", chapterLabel: "Chapter 1", pageOrSlide: 1 },
  };
}

const [photoId, photo] = Object.entries(contentImages).find(([, image]) => image.attribution)!;
const [figureId, figure] = Object.entries(contentImages).find(([, image]) => image.sourceFile)!;

describe("a unit's photograph", () => {
  it("fills the shared 3:2 frame when it sits in a grid of cards, so a row lines up", () => {
    render(<ContentUnit unit={unit(photoId)} variant="entry" />);
    const image = screen.getByRole("img", { name: photo.alt });

    expect(image.className).toContain("aspect-[3/2]");
    expect(image.className).toContain("object-cover");
    // a card already has its column's width; it is not capped again
    expect(image.closest("figure")?.className).not.toContain("max-w-2xl");
  });

  it("is held to about the width of the text when it stands on its own", () => {
    render(<ContentUnit unit={unit(photoId)} variant="stack" />);
    const image = screen.getByRole("img", { name: photo.alt });

    expect(image.closest("figure")?.className).toContain("max-w-2xl");
  });

  it("fits a figure taken from the slides inside the frame rather than cropping it", () => {
    render(<ContentUnit unit={unit(figureId)} variant="entry" />);
    const image = screen.getByRole("img", { name: figure.alt });

    expect(image.className).toContain("aspect-[3/2]");
    expect(image.className).toContain("object-contain");
    expect(image.className).not.toContain("object-cover");
  });
});
