"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emailForUsername } from "@/lib/auth/session";
import type { AppRole } from "@/lib/auth/types";
import { createServiceRoleClient, createUserScopedClient } from "@/lib/supabase/server";

// The site is a showcase: there is no password form. A visitor chooses a role and
// is signed straight into that role's seeded demo account, whose username is the
// role name ("student" / "lecturer"). The owner chose this knowingly (2026-10-27):
// anyone can act as the lecturer, including editing the question bank.
const ROLES: readonly AppRole[] = ["student", "lecturer"];

function isRole(value: FormDataEntryValue | null): value is AppRole {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function safeNextPath(value: FormDataEntryValue | null): string {
  // Only same-origin absolute paths, so a crafted ?next= cannot bounce a visitor
  // to another host after choosing a role.
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function enterAs(formData: FormData): Promise<void> {
  const role = formData.get("role");
  if (!isRole(role)) redirect("/login");
  const next = safeNextPath(formData.get("next"));

  let admin;
  let client;
  try {
    admin = createServiceRoleClient();
    client = await createUserScopedClient();
  } catch {
    redirect("/login?error=unavailable");
  }

  // Mint a one-time sign-in token for the demo account and redeem it straight away
  // on this visitor's cookies. No password is stored or sent anywhere.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: emailForUsername(role),
  });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) redirect("/login?error=unavailable");

  // Switching roles simply replaces this visitor's session. Never call signOut()
  // here: its default scope is global, and with one shared demo account that would
  // sign every other visitor out as well.
  const { error: verifyError } = await client.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
  if (verifyError) redirect("/login?error=unavailable");

  revalidatePath("/", "layout");
  redirect(next);
}
