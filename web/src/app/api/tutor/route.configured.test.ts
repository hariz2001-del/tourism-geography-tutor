import { describe, expect, it, vi } from "vitest";
import { createTutorRouteHandler } from "./route";

const request = (body: unknown) => new Request("http://localhost/api/tutor", {
  method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" },
});

const unit = {
  id: "unit-1", topicId: "topic-1", title: "Tourism geography", body: "Tourism geography studies place.",
  contentType: "explanation", citation: { sourceFile: "reviewed.pdf", chapterLabel: "Chapter 1", pageOrSlide: 4 },
};

describe("POST /api/tutor", () => {
  it("returns a grounded response from server-derived published evidence", async () => {
    const POST = createTutorRouteHandler(() => ({
      getAllPublishedContent: vi.fn().mockResolvedValue([unit]),
    }));

    const response = await POST(request({ question: "What is tourism geography?" }));

    expect(response.status).toBe(200);
    expect((await response.json()).data).toMatchObject({ kind: "grounded", citations: [{ sourceFile: "reviewed.pdf" }] });
  });

  it("returns no-support only when there is no matching evidence anywhere", async () => {
    const POST = createTutorRouteHandler(() => ({
      getAllPublishedContent: vi.fn().mockResolvedValue([]),
    }));

    const response = await POST(request({ question: "What is tourism geography?" }));

    expect(response.status).toBe(200);
    expect((await response.json()).data.kind).toBe("out_of_scope");
  });

  it("returns an error state for an unexpected repository failure", async () => {
    const POST = createTutorRouteHandler(() => ({
      getAllPublishedContent: vi.fn().mockRejectedValue(new Error("network failure")),
    }));

    const response = await POST(request({ question: "What is tourism geography?" }));

    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/temporarily unavailable/i);
  });
});
