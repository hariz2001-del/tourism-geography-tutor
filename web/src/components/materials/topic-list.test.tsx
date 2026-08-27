import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TopicList from "./topic-list";
import { ChapterTopicsProvider, TopicPanel } from "@/app/chapters/[chapterCode]/chapter-topics";

const topics = [
  { id: "topic-1", name: "First topic", summary: null, displayOrder: 1 },
  { id: "topic-2", name: "Second topic", summary: null, displayOrder: 2 },
];

function renderList(selectedTopicId: string, list = topics) {
  return render(
    <ChapterTopicsProvider chapterCode="CH1" initialTopicId={selectedTopicId} topicIds={list.map((topic) => topic.id)}>
      <TopicList chapterCode="CH1" topics={list} />
      {list.map((topic) => (
        <TopicPanel key={topic.id} topicId={topic.id}>
          <p>{topic.name} content</p>
        </TopicPanel>
      ))}
    </ChapterTopicsProvider>,
  );
}

describe("TopicList", () => {
  it("keeps a small topic set open and marks the selected topic", () => {
    renderList("topic-1");

    const secondTopicLinks = screen.getAllByRole("link", { name: "Second topic" });
    expect(secondTopicLinks[0]).toHaveAttribute("href", "/chapters/CH1?topic=topic-2");
    expect(secondTopicLinks[0].closest("details")).toHaveAttribute("open");
    expect(
      screen.getAllByRole("link", { name: "First topic" }).every((link) => link.getAttribute("aria-current") === "page"),
    ).toBe(true);
  });

  /**
   * The point of the whole arrangement: the other topic's content is already in the document,
   * so choosing it is a state change rather than a page load.
   */
  it("switches to a topic that was already rendered, without following the link", async () => {
    const user = userEvent.setup();
    renderList("topic-1");

    expect(screen.getByText("Second topic content")).not.toBeVisible();

    await user.click(screen.getAllByRole("link", { name: "Second topic" })[0]);

    expect(screen.getByText("Second topic content")).toBeVisible();
    expect(screen.getByText("First topic content")).not.toBeVisible();
    expect(window.location.search).toContain("topic=topic-2");
  });

  it("summarizes the current topic and collapses a long mobile menu", () => {
    const many = Array.from({ length: 8 }, (_, index) => ({
      id: `topic-${index + 1}`,
      name: `Topic ${index + 1}`,
      summary: null,
      displayOrder: index + 1,
    }));

    renderList("topic-3", many);

    const summaryName = screen.getByText("Topic 3", { selector: "summary span span span" });
    expect(summaryName).toBeVisible();
    expect(summaryName.closest("details")).not.toHaveAttribute("open");
  });
});
