import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TutorWidget from "./tutor-widget";
import { requestTutor } from "@/lib/tutor/open-event";

function answerOnce(text: string) {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ data: { kind: "grounded", text, citations: [] } }),
  })));
}

async function ask(question: string) {
  fireEvent.change(screen.getByLabelText(/ask the tutor/i), { target: { value: question } });
  fireEvent.click(screen.getByRole("button", { name: /^ask tutor$/i }));
}

describe("TutorWidget", () => {
  it("starts minimized and opens the chat when the launcher is clicked", () => {
    render(<TutorWidget />);

    const launcher = screen.getByRole("button", { name: /ask the tutor/i });
    expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
    expect(launcher).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(launcher);

    expect(screen.getByRole("dialog")).toBeVisible();
    expect(screen.getByLabelText(/ask the tutor/i)).toHaveFocus();
  });

  it("keeps the conversation after minimizing and reopening", async () => {
    answerOnce("Tourism geography studies places people travel to.");
    render(<TutorWidget />);

    fireEvent.click(screen.getByRole("button", { name: /ask the tutor/i }));
    await ask("What is tourism geography?");

    expect(await screen.findByText(/studies places people travel to/i)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /minimize tutor/i }));
    expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /ask the tutor/i }));
    expect(screen.getByText(/studies places people travel to/i)).toBeVisible();
    expect(screen.getByText(/what is tourism geography\?/i)).toBeVisible();
  });

  it("closes on Escape and returns focus to the launcher", async () => {
    render(<TutorWidget />);
    const launcher = screen.getByRole("button", { name: /ask the tutor/i });
    fireEvent.click(launcher);

    fireEvent.keyDown(screen.getByLabelText(/ask the tutor/i), { key: "Escape" });

    expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await waitFor(() => expect(screen.getByRole("button", { name: /ask the tutor/i })).toHaveFocus());
  });

  it("opens when another part of the page requests the tutor", async () => {
    render(<TutorWidget />);

    requestTutor();

    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  });
});
