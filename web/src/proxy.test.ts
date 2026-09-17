import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const getUser = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

import { config, proxy } from "./proxy";

function request(path: string) {
  return new NextRequest(new URL(path, "https://tgt.example"));
}

function signedIn(yes: boolean) {
  getUser.mockResolvedValue({ data: { user: yes ? { id: "u1" } : null } });
}

describe("the sign-in gate", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    getUser.mockReset();
  });

  it("sends an anonymous visitor to sign in, whichever page they opened", async () => {
    signedIn(false);

    const home = await proxy(request("/"));
    expect(home.status).toBe(307);
    expect(new URL(home.headers.get("location")!).pathname).toBe("/login");
  });

  it("remembers the page a shared link was pointing at", async () => {
    signedIn(false);

    const response = await proxy(request("/chapters/CH3?topic=latitude"));
    const location = new URL(response.headers.get("location")!);

    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toBe("/chapters/CH3?topic=latitude");
  });

  it("answers an anonymous API call rather than redirecting it into a page of HTML", async () => {
    signedIn(false);

    const response = await proxy(request("/api/tutor"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Sign in to continue." });
  });

  it("lets a signed-in learner through to the course", async () => {
    signedIn(true);

    const response = await proxy(request("/chapters/CH1"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("does not hold a signed-in learner on the sign-in page", async () => {
    signedIn(true);

    const response = await proxy(request("/login"));

    expect(new URL(response.headers.get("location")!).pathname).toBe("/dashboard");
  });

  it("leaves the sign-in page itself reachable", async () => {
    signedIn(false);

    const response = await proxy(request("/login"));

    expect(response.status).toBe(200);
  });

  it("still serves the badge and the fonts, so the sign-in page is not blank", () => {
    const matcher = new RegExp(`^${config.matcher[0]}$`);

    expect(matcher.test("/brand/geotourism-learning-badge.png")).toBe(false);
    expect(matcher.test("/_next/static/chunk.js")).toBe(false);
    expect(matcher.test("/chapters/CH1")).toBe(true);
  });
});
