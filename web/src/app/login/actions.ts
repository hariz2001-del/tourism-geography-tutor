"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { emailForUsername } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

function safeNextPath(value: FormDataEntryValue | null): string {
  // Only same-origin absolute paths, so a crafted ?next= cannot bounce a learner
  // to another host after signing in.
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!username || !password) {
    return { error: "Enter both a username and a password." };
  }

  let client;
  try {
    client = await createUserScopedClient();
  } catch {
    return { error: "Sign-in is not configured." };
  }

  const { error } = await client.auth.signInWithPassword({
    email: emailForUsername(username),
    password,
  });

  // Deliberately generic: do not reveal whether the username or the password was
  // the part that did not match.
  if (error) return { error: "That username and password do not match an account." };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut(): Promise<void> {
  try {
    const client = await createUserScopedClient();
    await client.auth.signOut();
  } catch {
    // Already signed out or unconfigured — fall through to the redirect.
  }
  revalidatePath("/", "layout");
  redirect("/");
}
