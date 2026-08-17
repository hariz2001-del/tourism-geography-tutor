"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth/session";
import { createUserScopedClient } from "@/lib/supabase/server";

export async function removeBookmark(bookmarkId: string): Promise<void> {
  const profile = await requireProfile("student");
  const client = await createUserScopedClient();

  // The student_id filter is belt-and-braces; the delete policy already scopes
  // this to the caller's own rows.
  await client.from("bookmarks").delete().eq("id", bookmarkId).eq("student_id", profile.id);

  revalidatePath("/dashboard/student/bookmarks");
  revalidatePath("/dashboard/student");
}
