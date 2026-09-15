import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TutorWidget from "./tutor-widget";
import { requestTutor } from "@/lib/tutor/open-event";

let pathname = "/chapters/CH1";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function wideScreen(matches: boolean) {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
}

function answerOnce(text: string) {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ data: { kind: "grounded", text, citations: [] } }),
  })));
}

describe("the docked tutor on a wide chapter page", () => {
  beforeEach(() => {
    pathname = "/chapters/CH1";
    localStorage.clear();
    wideScreen(true);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete document.documentElement.dataset.tutorDock;
  });

  it("sits open beside the reading column, and tells the page to leave room for it", () => {
    render(<TutorWidget />);

    expect(screen.getByRole("complementary", { name: /tutor chat/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /ask the tutor/i })).not.toBeInTheDocument();
    expect(document.documentElement.dataset.tutorDock).toBe("open");
    // appearing open on page load must not pull focus into the composer
    expect(screen.getByLabelText(/ask the tutor/i)).not.toHaveFocus();
  });

  it("collapses to a tab, remembers that, and expands again with the conversation intact", async () => {
    answerOnce("A gulf is part of a sea within a wide curve of the shore.");
    render(<TutorWidget />);

    fireEvent.change(screen.getByLabelText(/ask the tutor/i), { target: { value: "What is a gulf?" } });
    fireEvent.click(screen.getByRole("button", { name: /^ask tutor$/i }));
    expect(await screen.findByText(/wide curve of the shore/i)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /collapse tutor/i }));
    expect(screen.getByRole("complementary", { hidden: true })).not.toBeVisible();
    expect(document.documentElement.dataset.tutorDock).toBe("collapsed");
    expect(localStorage.getItem("tgt-tutor-dock")).toBe("collapsed");
    await waitFor(() => expect(screen.getByRole("button", { name: /expand tutor/i })).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: /expand tutor/i }));
    expect(screen.getByRole("complementary")).toBeVisible();
    expect(screen.getByText(/wide curve of the shore/i)).toBeVisible();
    expect(screen.getByLabelText(/ask the tutor/i)).toHaveFocus();
  });

  it("opens from a collapsed tab when another part of the page asks for the tutor", async () => {
    localStorage.setItem("tgt-tutor-dock", "collapsed");
    render(<TutorWidget />);
    fireEvent.click(screen.getByRole("button", { name: /collapse tutor/i, hidden: true }));

    requestTutor();

    await waitFor(() => expect(screen.getByRole("complementary")).toBeVisible());
  });

  it("stays a floating chat on a phone, even on a chapter page", () => {
    wideScreen(false);
    render(<TutorWidget />);

    expect(screen.getByRole("button", { name: /ask the tutor/i })).toBeVisible();
    expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
    expect(document.documentElement.dataset.tutorDock).toBe("none");
  });

  it("stays a floating chat away from the chapters", () => {
    pathname = "/flashcards";
    render(<TutorWidget />);

    expect(screen.getByRole("button", { name: /ask the tutor/i })).toBeVisible();
    expect(document.documentElement.dataset.tutorDock).toBe("none");
  });
});
