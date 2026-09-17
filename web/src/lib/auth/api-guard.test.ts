import { describe, expect, it, vi, beforeEach } from "vitest";

// vi.mock is hoisted above the file, so the spy has to be hoisted with it.
const { getProfile } = vi.hoisted(() => ({ getProfile: vi.fn() }));
vi.mock("./session", () => ({ getProfile }));

import { withSignedIn } from "./api-guard";

describe("withSignedIn", () => {
  beforeEach(() => getProfile.mockReset());

  it("refuses an anonymous request without running the handler", async () => {
    getProfile.mockResolvedValue(null);
    const handler = vi.fn();

    const response = await withSignedIn(handler)(new Request("https://tgt.example/api/tutor"));

    expect(response.status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes a signed-in learner's request to the handler", async () => {
    getProfile.mockResolvedValue({ id: "s1", username: "student", displayName: "Student One", role: "student" });
    const handler = vi.fn(async () => Response.json({ data: "ok" }));

    const response = await withSignedIn(handler)(new Request("https://tgt.example/api/tutor"));

    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledOnce();
  });
});
