import { describe, expect, it } from "vitest";
import { createTutorRouteHandler } from "./route";

const request = (body: unknown) => new Request("http://localhost/api/tutor", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });

describe("POST /api/tutor", () => {
  it("rejects a missing question", async () => {
    const POST = createTutorRouteHandler(() => { throw new Error("Course Brain should not be queried for invalid input."); });
    const response = await POST(request({ chapterCode: "CH1", topicId: "topic-1" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toMatch(/question/i);
  });

  it("does not reinterpret missing Course Brain configuration as no-support", async () => {
    const POST = createTutorRouteHandler(() => { throw new Error("Course Brain is not configured."); });
    const response = await POST(request({ chapterCode: "CH1", topicId: "topic-1", question: "What is tourism geography?", units: [{ title: "Injected", body: "Untrusted" }] }));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.error).toMatch(/not configured/i);
    expect(JSON.stringify(body)).not.toContain("Injected");
  });
});
