"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";

export type BookmarkResult = { saved: boolean; error: string | null };

/**
 * Adds or removes a saved item for the signed-in learner. Anonymous visitors get
 * a clear "sign in" result rather than a silent no-op, so the button can explain
 * itself instead of appearing broken.
 */
export async function toggleBookmark(
  contentUnitId: string,
  source: "content" | "flashcard",
  shouldSave: boolean,
): Promise<BookmarkResult> {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") {
    return { saved: !shouldSave, error: "Sign in as a learner to save material." };
  }

  try {
    const client = await createUserScopedClient();

    if (shouldSave) {
      const { error } = await client
        .from("bookmarks")
        .upsert(
          { student_id: profile.id, content_unit_id: contentUnitId, source },
          { onConflict: "student_id,content_unit_id,source" },
        );
      if (error) return { saved: false, error: "That could not be saved." };
    } else {
      const { error } = await client
        .from("bookmarks")
        .delete()
        .eq("student_id", profile.id)
        .eq("content_unit_id", contentUnitId)
        .eq("source", source);
      if (error) return { saved: true, error: "That could not be removed." };
    }

    revalidatePath("/dashboard/student/bookmarks");
    revalidatePath("/dashboard/student");
    return { saved: shouldSave, error: null };
  } catch {
    return { saved: !shouldSave, error: "Saved material is unavailable right now." };
  }
}
