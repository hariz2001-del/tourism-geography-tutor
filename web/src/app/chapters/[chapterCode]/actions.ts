"use server";

import { getProfile } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";

/**
 * Records that a signed-in learner opened a topic. Called from a client effect
 * rather than during render, so a prefetch or a replayed render does not count
 * as reading. Silent for anonymous visitors — the course stays open without an
 * account, and a failure here must never break the page.
 */
export async function recordTopicView(topicId: string): Promise<void> {
  const profile = await getProfile();
  if (!profile || profile.role !== "student") return;

  try {
    const client = await createUserScopedClient();
    const now = new Date().toISOString();

    const { data: existing } = await client
      .from("topic_progress")
      .select("view_count")
      .eq("student_id", profile.id)
      .eq("topic_id", topicId)
      .maybeSingle();

    if (existing) {
      await client
        .from("topic_progress")
        .update({ last_viewed_at: now, view_count: Number(existing.view_count) + 1 })
        .eq("student_id", profile.id)
        .eq("topic_id", topicId);
      return;
    }

    await client
      .from("topic_progress")
      .insert({ student_id: profile.id, topic_id: topicId, first_viewed_at: now, last_viewed_at: now });
  } catch {
    // Reading history is a convenience, never a reason to fail the lesson.
  }
}
