import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExpandableImage from "./image-lightbox";

const image = { src: "/content-images/example.webp", alt: "A worked example", width: 800, height: 600 };

describe("ExpandableImage", () => {
  it("opens the picture full screen, and closes again on Escape", () => {
    render(<ExpandableImage image={image} label="A worked example" />);

    fireEvent.click(screen.getByRole("button", { name: /expand:/i }));
    expect(screen.getByRole("dialog", { name: "A worked example" })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", () => {
    render(<ExpandableImage image={image} label="A worked example" />);
    fireEvent.click(screen.getByRole("button", { name: /expand:/i }));

    fireEvent.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles between fitting the screen and full size", () => {
    render(<ExpandableImage image={image} label="A worked example" />);
    fireEvent.click(screen.getByRole("button", { name: /expand:/i }));

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeVisible();
  });

  it("puts the page's scrolling back the way it found it", () => {
    document.body.style.overflow = "visible";
    render(<ExpandableImage image={image} label="A worked example" />);

    fireEvent.click(screen.getByRole("button", { name: /expand:/i }));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("visible");
  });
});
