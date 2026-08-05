import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TopicList from "./topic-list";

describe("TopicList", () => {
  it("navigates to the selected topic instead of rendering static labels", () => {
    render(<TopicList chapterCode="CH1" selectedTopicId="topic-1" topics={[
      { id: "topic-1", name: "First topic", summary: null, displayOrder: 1 },
      { id: "topic-2", name: "Second topic", summary: null, displayOrder: 2 },
    ]} />);

    expect(screen.getByRole("link", { name: "Second topic" })).toHaveAttribute("href", "/chapters/CH1?topic=topic-2");
  });
});
