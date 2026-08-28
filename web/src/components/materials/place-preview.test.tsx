import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PlacePreview from "./place-preview";

describe("PlacePreview", () => {
  it("shows the photograph on hover and takes it away again", () => {
    render(<PlacePreview value="Kalahari" />);
    const name = screen.getByRole("button", { name: "Kalahari" });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    fireEvent.mouseEnter(name);
    expect(screen.getByRole("tooltip")).toHaveTextContent("The Kalahari in Botswana");

    fireEvent.mouseLeave(name);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("looks past the other names a mountain goes by", () => {
    render(<PlacePreview value="Mount Everest / Sagarmatha / Chomolungma" />);
    fireEvent.mouseEnter(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Khumbu Glacier");
  });

  it("keeps only one card on screen, however it was opened", () => {
    render(
      <>
        <PlacePreview value="Kalahari" />
        <PlacePreview value="Gobi" />
      </>,
    );

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Kalahari" }));
    fireEvent.focus(screen.getByRole("button", { name: "Gobi" }));

    const cards = screen.getAllByRole("tooltip");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Khongoryn Els");
  });

  it("closes the card on Escape", () => {
    render(<PlacePreview value="Sahara" />);
    fireEvent.mouseEnter(screen.getByRole("button", { name: "Sahara" }));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens the full-screen view when the name is clicked", () => {
    render(<PlacePreview value="Sahara" />);
    fireEvent.click(screen.getByRole("button", { name: "Sahara" }));
    expect(screen.getByRole("dialog")).toBeVisible();
  });

  it("leaves a name it has no photograph for as plain text", () => {
    render(<PlacePreview value="Bay of Bengal" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Bay of Bengal")).toBeVisible();
  });
});
