import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import ContinentExplorer from "./continent-explorer";
import type { Continent } from "@/lib/course-brain/continents";

const continents: Continent[] = [
  {
    key: "asia",
    unitId: "0ddca5b3-8e97-4559-9975-17cdffd9cc5f",
    name: "Asia",
    body: "Asia is the largest continent, with an area of 44.58 million km², and is home to Mount Everest, the world's highest peak.",
    area: "44.58 million km²",
    rank: "largest",
    pageOrSlide: 4,
  },
  {
    key: "south-america",
    unitId: "8327f8a6-26ff-4000-9092-087e912e610a",
    name: "South America",
    body: "South America is connected to North America by the Isthmus of Panama and contains the Andes, the world's longest continental mountain range.",
    area: null,
    rank: null,
    pageOrSlide: 5,
  },
];

describe("ContinentExplorer", () => {
  it("opens on the first continent with its size and its fact", () => {
    render(<ContinentExplorer continents={continents} />);

    expect(screen.getByRole("heading", { name: "Asia" })).toBeVisible();
    expect(screen.getByText("44.58 million km²")).toBeVisible();
    expect(screen.getByText("the largest")).toBeVisible();
    expect(screen.getByText(/home to Mount Everest/)).toBeVisible();
    expect(screen.getByText("chapter-2.pdf, page/slide 4")).toBeVisible();
  });

  it("switches continent when one is chosen, for people not using a mouse", async () => {
    const user = userEvent.setup();
    render(<ContinentExplorer continents={continents} />);

    const chooser = screen.getByRole("group", { name: "Choose a continent" });
    await user.click(within(chooser).getByRole("button", { name: "South America" }));

    expect(screen.getByRole("heading", { name: "South America" })).toBeVisible();
    expect(screen.getByText(/Isthmus of Panama/)).toBeVisible();
  });

  it("says the deck gives no size rather than supplying one", async () => {
    const user = userEvent.setup();
    render(<ContinentExplorer continents={continents} />);

    await user.click(screen.getByRole("button", { name: "South America" }));

    expect(screen.getAllByText("not given on this slide")).toHaveLength(2);
    expect(screen.queryByText(/17\.8|million km² *$/)).not.toBeInTheDocument();
  });

  it("keeps an anchor for every unit the model consumed, so bookmarks still land", () => {
    render(<ContinentExplorer continents={continents} />);

    for (const continent of continents) {
      expect(document.querySelector(`#unit-${continent.unitId}`)).toBeInTheDocument();
    }
  });

  it("highlights the selected continent with its own mask", async () => {
    const user = userEvent.setup();
    const { container } = render(<ContinentExplorer continents={continents} />);
    const highlight = () => container.querySelector<HTMLElement>("span[aria-hidden='true']");

    expect(highlight()?.style.maskImage).toContain("ch2-continent-asia.webp");

    await user.click(screen.getByRole("button", { name: "South America" }));
    expect(highlight()?.style.maskImage).toContain("ch2-continent-south-america.webp");
  });

  it("offers the bookmark control only to signed-in learners", () => {
    const { rerender } = render(<ContinentExplorer continents={continents} />);
    expect(screen.queryByRole("button", { name: /save|remove/i })).not.toBeInTheDocument();

    rerender(<ContinentExplorer continents={continents} bookmarkedUnitIds={new Set()} />);
    expect(screen.getByRole("button", { name: /save|remove/i })).toBeVisible();
  });
});
