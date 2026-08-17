import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import SiteHeader from "./site-header";
import type { Profile } from "@/lib/auth/types";

vi.mock("next/navigation", () => ({ usePathname: () => "/flashcards" }));
vi.mock("@/app/login/actions", () => ({ signOut: vi.fn() }));

const student: Profile = { id: "s1", username: "student", displayName: "Student One", role: "student" };
const lecturer: Profile = { id: "l1", username: "lecturer", displayName: "Dr. Lecturer", role: "lecturer" };

describe("SiteHeader", () => {
  it("links to flashcards and marks that section as current", () => {
    render(<SiteHeader profile={null} />);

    expect(screen.getByRole("link", { name: /flashcards/i })).toHaveAttribute("href", "/flashcards");
    expect(screen.getByRole("link", { name: /flashcards/i })).toHaveAttribute("aria-current", "page");
  });

  it("offers sign-in and no dashboard link when signed out", () => {
    render(<SiteHeader profile={null} />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /my learning/i })).not.toBeInTheDocument();
  });

  it("shows a learner their dashboard and a sign-out control", () => {
    render(<SiteHeader profile={student} />);

    expect(screen.getByRole("link", { name: /my learning/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("labels the lecturer's dashboard entry for teaching", () => {
    render(<SiteHeader profile={lecturer} />);

    expect(screen.getByRole("link", { name: /teaching/i })).toHaveAttribute("href", "/dashboard");
  });
});
