import { createClient } from "@supabase/supabase-js";
import {
  createCourseBrainRepository,
  type SupabaseQueryAdapter,
} from "../course-brain/repository";

export function createServerCourseBrainRepository() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Course Brain is not configured.");
  }

  return createCourseBrainRepository(
    createClient(url, anonKey) as unknown as SupabaseQueryAdapter,
  );
}
