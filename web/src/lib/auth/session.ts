import "server-only";
import { redirect } from "next/navigation";
import { createUserScopedClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "./types";

// Supabase Auth is email-based, but this prototype signs in by username only.
// The mapping lives here so the login form, the seed script, and any future
// account tooling all agree on it.
export const USERNAME_EMAIL_DOMAIN = "tgtutor.local";

export function emailForUsername(username: string): string {
  return `${username.trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`;
}

export const dashboardPathForRole: Record<AppRole, string> = {
  lecturer: "/dashboard/lecturer",
  student: "/dashboard/student",
};

// The Data Access Layer check. Next's own authentication guide is explicit that
// a proxy check is optimistic only, so every page and route handler that reads
// learner data calls this rather than trusting the proxy.
export async function getProfile(): Promise<Profile | null> {
  let client;
  try {
    client = await createUserScopedClient();
  } catch {
    return null;
  }

  const { data: userResult } = await client.auth.getUser();
  const user = userResult?.user;
  if (!user) return null;

  const { data, error } = await client
    .from("profiles")
    .select("id, username, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: String(data.id),
    username: String(data.username),
    displayName: String(data.display_name),
    role: data.role as AppRole,
  };
}

export async function requireProfile(role?: AppRole): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (role && profile.role !== role) redirect(dashboardPathForRole[profile.role]);
  return profile;
}
