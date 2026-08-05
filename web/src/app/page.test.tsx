import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("offers the Chapter 1 learning entry point", () => {
    render(<Home />);

    expect(
      screen.getByRole("link", { name: /start chapter 1/i }),
    ).toBeVisible();
  });
});
