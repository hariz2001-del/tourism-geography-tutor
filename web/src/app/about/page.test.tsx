import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("explains the study flow and links into the course", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: /read, ask, and practise/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /what the tutor can support/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /start chapter 1/i })).toHaveAttribute("href", "/chapters/CH1");
  });
});
