import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import SiteHeader from "./site-header";
import type { Profile } from "@/lib/auth/types";

vi.mock("next/navigation", () => ({ usePathname: () => "/flashcards" }));
vi.mock("@/app/login/actions", () => ({ signOut: vi.fn() }));

const student: Profile = { id: "s1", username: "student", displayName: "Student One", role: "student" };
const lecturer: Profile = { id: "l1", username: "lecturer", displayName: "Dr. Lecturer", role: "lecturer" };

describe("SiteHeader", () => {
  it("places the uppercase guide first in the primary navigation", () => {
    render(<SiteHeader profile={student} />);

    const primaryNavigation = screen.getByRole("navigation", { name: "Primary" });
    const firstLink = primaryNavigation.querySelector("a");
    // The label is rendered twice — a short mobile form and the uppercase
    // desktop form — so match the link rather than an exact string.
    expect(firstLink).toHaveAttribute("href", "/about");
    expect(firstLink?.textContent).toMatch(/guide/i);
  });

  it("links to flashcards and marks that section as current", () => {
    render(<SiteHeader profile={student} />);

    expect(screen.getByRole("link", { name: /flashcards/i })).toHaveAttribute("href", "/flashcards");
    expect(screen.getByRole("link", { name: /flashcards/i })).toHaveAttribute("aria-current", "page");
  });

  it("offers a signed-out visitor nothing to navigate to, since the site is behind sign-in", () => {
    render(<SiteHeader profile={null} />);

    expect(screen.queryByRole("navigation", { name: "Primary" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /flashcards/i })).not.toBeInTheDocument();
    // The course name still identifies the site on the sign-in page.
    expect(screen.getByRole("link", { name: /tourism geography tutor/i })).toHaveAttribute("href", "/");
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
