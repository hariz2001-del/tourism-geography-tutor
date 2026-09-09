import { describe, expect, it } from "vitest";
import { formatChapterLabel } from "./chapter-label";

describe("formatChapterLabel", () => {
  it("expands compact chapter codes", () => {
    expect(formatChapterLabel("CH1")).toBe("CHAPTER 1");
    expect(formatChapterLabel("CH 2")).toBe("CHAPTER 2");
  });

  it("normalizes existing chapter labels and keeps descriptive suffixes", () => {
    expect(formatChapterLabel("Chapter 3")).toBe("CHAPTER 3");
    expect(formatChapterLabel("Chapter 4 — Tourism Natural Resources")).toBe(
      "CHAPTER 4 — Tourism Natural Resources",
    );
  });

  it("leaves unrelated labels unchanged", () => {
    expect(formatChapterLabel("Course overview")).toBe("Course overview");
  });
});
