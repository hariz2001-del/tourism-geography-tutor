import { beforeEach, describe, expect, it, vi } from "vitest";

// redirect() ends a server action by throwing; mirror that so a test can see where it went.
const redirect = vi.fn((path: string) => {
  throw new Error(`REDIRECT:${path}`);
});
vi.mock("next/navigation", () => ({ redirect: (path: string) => redirect(path) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({
  emailForUsername: (username: string) => `${username}@tgtutor.local`,
}));

const generateLink = vi.fn();
const verifyOtp = vi.fn();
const signOut = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleClient: () => ({ auth: { admin: { generateLink } } }),
  createUserScopedClient: async () => ({ auth: { verifyOtp, signOut } }),
}));

import { enterAs } from "./actions";

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

async function destination(fields: Record<string, string>) {
  try {
    await enterAs(form(fields));
  } catch (error) {
    return String((error as Error).message).replace("REDIRECT:", "");
  }
  throw new Error("enterAs finished without redirecting");
}

describe("choosing a role", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    generateLink.mockResolvedValue({ data: { properties: { hashed_token: "hash-123" } }, error: null });
    verifyOtp.mockResolvedValue({ error: null });
  });

  it("signs the visitor into the chosen role's demo account and opens the dashboard", async () => {
    await expect(destination({ role: "lecturer" })).resolves.toBe("/dashboard");

    expect(generateLink).toHaveBeenCalledWith({ type: "magiclink", email: "lecturer@tgtutor.local" });
    expect(verifyOtp).toHaveBeenCalledWith({ type: "magiclink", token_hash: "hash-123" });
  });

  it("returns a shared link to the page it was pointing at", async () => {
    await expect(destination({ role: "student", next: "/chapters/CH2" })).resolves.toBe("/chapters/CH2");
  });

  it("refuses to bounce the visitor to another host", async () => {
    await expect(destination({ role: "student", next: "//evil.example" })).resolves.toBe("/dashboard");
  });

  it("ignores anything that is not one of the two roles", async () => {
    await expect(destination({ role: "admin" })).resolves.toBe("/login");
    expect(generateLink).not.toHaveBeenCalled();
  });

  it("explains rather than half-signing-in when the account cannot be opened", async () => {
    generateLink.mockResolvedValue({ data: null, error: { message: "unavailable" } });

    await expect(destination({ role: "student" })).resolves.toBe("/login?error=unavailable");
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  it("never signs the shared demo account out, which would end every other visitor's session", async () => {
    await destination({ role: "student" });

    expect(signOut).not.toHaveBeenCalled();
  });
});
