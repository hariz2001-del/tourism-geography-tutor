import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const listChapters = vi.fn();
const listChapterTopics = vi.fn();
const getAllPublishedContent = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerCourseBrainRepository: () => ({ listChapters, listChapterTopics, getAllPublishedContent }),
}));

// Every page now sits behind the sign-in gate; these tests are the signed-in view.
vi.mock("@/lib/auth/session", () => ({
  requireProfile: async () => ({ id: "s1", username: "student", displayName: "Student One", role: "student" }),
  getProfile: async () => ({ id: "s1", username: "student", displayName: "Student One", role: "student" }),
}));

describe("FlashcardsPage", () => {
  beforeEach(() => {
    listChapters.mockReset();
    listChapterTopics.mockReset();
    getAllPublishedContent.mockReset();
    listChapters.mockResolvedValue([
      { code: "CH1", title: "Tourism Geography", displayOrder: 1 },
      { code: "CH2", title: "World Geography and Climate", displayOrder: 2 },
    ]);
    listChapterTopics.mockImplementation(async (code: string) => code === "CH1"
      ? [{ id: "topic-1", name: "Tourism foundations", summary: null, displayOrder: 1 }]
      : [{ id: "topic-2", name: "Climate zones", summary: null, displayOrder: 1 }]);
    getAllPublishedContent.mockResolvedValue([
      { id: "unit-1", topicId: "topic-1", title: "Leisure", body: "Free time.", contentType: "definition", citation: { sourceFile: "chapter-1.pdf", chapterLabel: "Chapter 1", pageOrSlide: 7, chapterCode: "CH1", topicId: "topic-1", contentUnitId: "unit-1" } },
      { id: "unit-2", topicId: "topic-2", title: "Latitude and climate", body: "Latitude shapes climate bands.", contentType: "key_takeaway", citation: { sourceFile: "chapter-2.pdf", chapterLabel: "CH2", pageOrSlide: 2, chapterCode: "CH2", topicId: "topic-2", contentUnitId: "unit-2" } },
      { id: "unit-3", topicId: "topic-2", title: "A climate example", body: "An example.", contentType: "example", citation: { sourceFile: "chapter-2.pdf", chapterLabel: "CH2", pageOrSlide: 3 } },
    ]);
  });

  it("builds cards only from definitions and key takeaways and respects an initial chapter", async () => {
    const { default: FlashcardsPage } = await import("./page");
    render(await FlashcardsPage({ searchParams: Promise.resolve({ chapter: "CH2" }) }));

    expect(screen.getByRole("heading", { name: /recall the idea before you reveal it/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Latitude and climate" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "Leisure" })).not.toBeInTheDocument();
    expect(screen.queryByText("A climate example")).not.toBeInTheDocument();
    expect(screen.getByText(/1 card in this deck/i)).toBeVisible();
  });

  it("shows a useful fallback when flashcards cannot load", async () => {
    listChapters.mockRejectedValue(new Error("unavailable"));
    const { default: FlashcardsPage } = await import("./page");
    render(await FlashcardsPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: /flashcards are temporarily unavailable/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /browse chapters/i })).toHaveAttribute("href", "/");
  });
});
