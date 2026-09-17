import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import AboutPage from "./page";

// Every page now sits behind the sign-in gate; these tests are the signed-in view.
vi.mock("@/lib/auth/session", () => ({
  requireProfile: async () => ({ id: "s1", username: "student", displayName: "Student One", role: "student" }),
  getProfile: async () => ({ id: "s1", username: "student", displayName: "Student One", role: "student" }),
}));


describe("AboutPage", () => {
  it("explains the study flow and links into the learning experience", async () => {
    render(await AboutPage());

    expect(screen.getByRole("heading", { name: /study tourism geography with a clear routine/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /how references help/i })).toBeVisible();
    expect(screen.getByRole("link", { name: /start chapter 1/i })).toHaveAttribute("href", "/chapters/CH1");
    expect(screen.getByRole("link", { name: /review flashcards/i })).toHaveAttribute("href", "/flashcards");
  });
});
