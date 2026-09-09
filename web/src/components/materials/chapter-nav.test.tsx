import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ChapterNav from "./chapter-nav";

describe("ChapterNav", () => {
  it("links to every chapter and marks the active one", () => {
    render(<ChapterNav activeChapterCode="CH2" chapters={[
      { code: "CH1", title: "Chapter 1", displayOrder: 1 },
      { code: "CH2", title: "CH2", displayOrder: 2 },
    ]} />);

    expect(screen.getByRole("link", { name: "CHAPTER 1" })).toHaveAttribute("href", "/chapters/CH1");
    const active = screen.getByRole("link", { name: "CHAPTER 2" });
    expect(active).toHaveAttribute("href", "/chapters/CH2");
    expect(active).toHaveAttribute("aria-current", "page");
  });
});
