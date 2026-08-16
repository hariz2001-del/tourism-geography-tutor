import { fireEvent, render, screen } from "@testing-library/react";
import FlashcardDeck from "./flashcard-deck";
import type { Chapter, Flashcard } from "@/lib/course-brain/types";

const chapters: Chapter[] = [
  { code: "CH1", title: "Tourism Geography", displayOrder: 1 },
  { code: "CH2", title: "World Geography and Climate", displayOrder: 2 },
];

const cards: Flashcard[] = [
  {
    id: "unit-1",
    title: "Leisure",
    answer: "Leisure is free time remaining after work, sleep, and household chores.",
    contentType: "definition",
    chapterCode: "CH1",
    chapterTitle: "Tourism Geography",
    topicId: "topic-1",
    topicName: "Tourism foundations",
    citation: { sourceFile: "chapter-1.pdf", chapterLabel: "Chapter 1", pageOrSlide: 7, chapterCode: "CH1", topicId: "topic-1", contentUnitId: "unit-1" },
  },
  {
    id: "unit-2",
    title: "Latitude and climate",
    answer: "Latitude helps shape broad bands of global climate.",
    contentType: "key_takeaway",
    chapterCode: "CH2",
    chapterTitle: "World Geography and Climate",
    topicId: "topic-2",
    topicName: "Climate zones",
    citation: { sourceFile: "chapter-2.pdf", chapterLabel: "CH2", pageOrSlide: 2, chapterCode: "CH2", topicId: "topic-2", contentUnitId: "unit-2" },
  },
];

describe("FlashcardDeck", () => {
  it("reveals sourced answers, records self-ratings, and builds a review deck", () => {
    render(<FlashcardDeck cards={cards} chapters={chapters} />);

    expect(screen.getByRole("heading", { name: "Leisure" })).toBeVisible();
    expect(screen.queryByText(/free time remaining/i)).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /flashcard progress/i })).toHaveAttribute("aria-valuenow", "0");

    fireEvent.click(screen.getByRole("button", { name: /show answer/i }));
    expect(screen.getByText(/free time remaining/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /go to this source/i })).toHaveAttribute(
      "href",
      "/chapters/CH1?topic=topic-1#unit-unit-1",
    );
    fireEvent.click(screen.getByRole("button", { name: /got it/i }));

    expect(screen.getByRole("heading", { name: "Latitude and climate" })).toBeVisible();
    expect(screen.getByRole("progressbar", { name: /flashcard progress/i })).toHaveAttribute("aria-valuenow", "1");
    fireEvent.click(screen.getByRole("button", { name: /show answer/i }));
    fireEvent.click(screen.getByRole("button", { name: /review again/i }));

    expect(screen.getByRole("heading", { name: /you reviewed 2 ideas/i })).toBeVisible();
    expect(screen.getByText(/knew 1 and marked 1/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /review marked cards/i }));
    expect(screen.getByRole("heading", { name: "Latitude and climate" })).toBeVisible();
    expect(screen.getByText(/1 card in this deck/i)).toBeVisible();
  });

  it("filters to a chapter and resets the current deck", () => {
    render(<FlashcardDeck cards={cards} chapters={chapters} />);

    fireEvent.change(screen.getByRole("combobox", { name: /chapter/i }), { target: { value: "CH2" } });

    expect(screen.getByRole("heading", { name: "Latitude and climate" })).toBeVisible();
    expect(screen.getByText(/1 card in this deck/i)).toBeVisible();
    expect(screen.getByRole("option", { name: /climate zones/i })).toBeInTheDocument();
  });
});
