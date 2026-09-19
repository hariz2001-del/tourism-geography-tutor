import { describe, expect, it } from "vitest";
import { reordered } from "./exam-order";

const paper = ["a", "b", "c"];

describe("moving a question within a paper", () => {
  it("swaps a question with the one above it", () => {
    expect(reordered(paper, "b", "up")).toEqual(["b", "a", "c"]);
  });

  it("swaps a question with the one below it", () => {
    expect(reordered(paper, "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("leaves the first question alone when it is already at the top", () => {
    expect(reordered(paper, "a", "up")).toEqual(paper);
  });

  it("leaves the last question alone rather than wrapping it round to the front", () => {
    expect(reordered(paper, "c", "down")).toEqual(paper);
  });

  it("does nothing for a question that is not in this paper", () => {
    expect(reordered(paper, "z", "up")).toEqual(paper);
  });

  it("does not modify the list it was given", () => {
    const original = [...paper];
    reordered(paper, "b", "up");
    expect(paper).toEqual(original);
  });
});
