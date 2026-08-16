import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import SiteHeader from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/flashcards" }));

describe("SiteHeader", () => {
  it("links to flashcards and marks that section as current", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /flashcards/i })).toHaveAttribute("href", "/flashcards");
    expect(screen.getByRole("link", { name: /flashcards/i })).toHaveAttribute("aria-current", "page");
  });
});
