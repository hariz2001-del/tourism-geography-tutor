import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TimeZoneExplorer from "./time-zone-explorer";

describe("TimeZoneExplorer", () => {
  it("opens on Greenwich and names its cities", () => {
    render(<TimeZoneExplorer />);

    expect(screen.getByText("GMT")).toBeVisible();
    expect(screen.getByText("London")).toBeVisible();
    expect(screen.getByText("United Kingdom")).toBeVisible();
    expect(screen.getByText("Accra")).toBeVisible();
    expect(screen.getByText("Ghana")).toBeVisible();
  });

  it("gives every zone a button a keyboard can reach", () => {
    render(<TimeZoneExplorer />);
    const bands = screen.getByRole("group", { name: /world map divided into hourly time zones/i });
    expect(within(bands).getAllByRole("button")).toHaveLength(25);
  });

  it("shows a zone's offset and cities when it is selected", async () => {
    const user = userEvent.setup();
    render(<TimeZoneExplorer />);

    await user.click(screen.getByRole("button", { name: /GMT\+8, for example Kuala Lumpur/i }));

    expect(screen.getByText("GMT+8")).toBeVisible();
    expect(screen.getByText("Kuala Lumpur")).toBeVisible();
    expect(screen.getByText("Malaysia")).toBeVisible();
    // the zone panel ties the offset back to the 15-degrees-per-hour rule the unit teaches
    expect(screen.getByText(/8 hours ahead of Greenwich — 120° of longitude at 15° per hour/)).toBeVisible();
  });

  it("says plainly where a zone has no permanent population", async () => {
    const user = userEvent.setup();
    render(<TimeZoneExplorer />);

    await user.click(screen.getByRole("button", { name: /^GMT-12$/i }));

    expect(screen.getByText(/no permanent population/i)).toBeVisible();
  });

  it("converts a time through Greenwich to a second city", () => {
    render(<TimeZoneExplorer />);

    // defaults: 09:00 in Kuala Lumpur (GMT+8) -> 01:00 GMT -> 20:00 the previous day in New York
    expect(screen.getByText("01:00")).toBeVisible();
    expect(screen.getByText("20:00")).toBeVisible();
    expect(screen.getByText(/New York is/)).toHaveTextContent("13 hours behind Kuala Lumpur");
    expect(screen.getByText(/already the previous day there/)).toBeVisible();
  });

  it("carries the daylight-saving caveat the data cannot model", () => {
    render(<TimeZoneExplorer />);

    expect(screen.getByText(/does not account for daylight saving/i)).toBeVisible();
    expect(screen.getByText(/real\s+boundaries bend to follow national borders/i)).toBeVisible();
  });
});
