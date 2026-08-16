import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopicList from "./topic-list";

describe("TopicList", () => {
  it("keeps a small topic set open and navigates to the selected topic", () => {
    render(<TopicList chapterCode="CH1" selectedTopicId="topic-1" topics={[
      { id: "topic-1", name: "First topic", summary: null, displayOrder: 1 },
      { id: "topic-2", name: "Second topic", summary: null, displayOrder: 2 },
    ]} />);

    const secondTopicLinks = screen.getAllByRole("link", { name: "Second topic" });
    expect(secondTopicLinks[0]).toHaveAttribute("href", "/chapters/CH1?topic=topic-2");
    expect(secondTopicLinks[0].closest("details")).toHaveAttribute("open");
    expect(screen.getAllByRole("link", { name: "First topic" }).every((link) => link.getAttribute("aria-current") === "page")).toBe(true);
  });

  it("summarizes the current topic and collapses a long mobile menu", () => {
    const topics = Array.from({ length: 8 }, (_, index) => ({
      id: `topic-${index + 1}`,
      name: `Topic ${index + 1}`,
      summary: null,
      displayOrder: index + 1,
    }));

    render(<TopicList chapterCode="CH2" selectedTopicId="topic-3" topics={topics} />);

    expect(screen.getByText("Topic 3", { selector: "summary span span" })).toBeVisible();
    expect(screen.getByText("Topic 3", { selector: "summary span span" }).closest("details")).not.toHaveAttribute("open");
  });
});
