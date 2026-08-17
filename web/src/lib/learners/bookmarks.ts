import "server-only";
import { createUserScopedClient } from "@/lib/supabase/server";

/**
 * The set of content units this learner has saved, for rendering toggle state.
 * Returns an empty set rather than throwing, because a bookmark lookup must
 * never take down a lesson page.
 */
export async function listBookmarkedUnitIds(studentId: string): Promise<Set<string>> {
  try {
    const client = await createUserScopedClient();
    const { data, error } = await client
      .from("bookmarks")
      .select("content_unit_id")
      .eq("student_id", studentId);

    if (error || !data) return new Set();
    return new Set(data.map((row) => String((row as { content_unit_id: unknown }).content_unit_id)));
  } catch {
    return new Set();
  }
}
