import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("explains the study flow and links into the learning experience", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: /study tourism geography with a clear routine/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /how references help/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /start chapter 1/i })).toHaveAttribute("href", "/chapters/CH1");
    expect(screen.getByRole("link", { name: /review flashcards/i })).toHaveAttribute("href", "/flashcards");
  });
});
