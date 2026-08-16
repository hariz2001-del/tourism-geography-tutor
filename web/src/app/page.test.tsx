import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const listChapters = vi.fn();
const listChapterTopics = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerCourseBrainRepository: () => ({ listChapters, listChapterTopics }),
}));

describe("Home", () => {
  beforeEach(() => {
    listChapters.mockReset();
    listChapterTopics.mockReset();
  });

  it("lists each chapter with links to its topics", async () => {
    listChapters.mockResolvedValue([
      { code: "CH1", title: "Chapter 1", displayOrder: 1 },
      { code: "CH2", title: "CH2", displayOrder: 2 },
    ]);
    listChapterTopics.mockImplementation(async (code: string) =>
      code === "CH1"
        ? [{ id: "topic-1", name: "Geography foundations", summary: null, displayOrder: 1 }]
        : [],
    );
    const { default: Home } = await import("./page");

    render(await Home());

    expect(screen.getByRole("heading", { name: /build your tourism geography knowledge/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /geography foundations/i })).toHaveAttribute(
      "href",
      "/chapters/CH1?topic=topic-1",
    );
    expect(screen.getByRole("link", { name: /start learning/i })).toHaveAttribute("href", "/chapters/CH1");
    expect(screen.getByRole("link", { name: /ask the tutor/i })).toHaveAttribute("href", "/chapters/CH1#tutor");
    expect(screen.getByRole("link", { name: /review flashcards/i })).toHaveAttribute("href", "/flashcards");
    expect(screen.getByRole("link", { name: /chapter flashcards/i })).toHaveAttribute("href", "/flashcards?chapter=CH1");
    expect(screen.getByText(/this chapter does not have any topics yet/i)).toBeVisible();
  });

  it("falls back to a single Chapter 1 entry point when the Course Brain is unconfigured", async () => {
    listChapters.mockRejectedValue(new Error("Course Brain is not configured."));
    const { default: Home } = await import("./page");

    render(await Home());

    expect(screen.getByRole("link", { name: /start chapter 1/i })).toBeVisible();
  });
});
