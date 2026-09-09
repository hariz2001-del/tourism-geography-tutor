import { fireEvent, render, screen } from "@testing-library/react";
import ThemeToggle from "./theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "light";
    window.localStorage.clear();
  });

  it("switches theme and remembers the learner preference", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("tgt-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
  });
});
