import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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

export function createServerOnlyCourseBrainRepository() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Course Brain is not configured.");
  }

  return createCourseBrainRepository(
    createClient(url, serviceRoleKey) as unknown as SupabaseQueryAdapter,
  );
}

/**
 * The Course Brain as the signed-in learner.
 *
 * Needed for anything reached through a definer function that asks who is calling —
 * get_exam_questions lets a lecturer preview her own unpublished paper, and the
 * anon client has no user to be. It is also the honest client for learner-scoped
 * reads, since RLS then applies.
 */
export async function createUserScopedCourseBrainRepository() {
  const client = await createUserScopedClient();
  return createCourseBrainRepository(client as unknown as SupabaseQueryAdapter);
}

// Raw service-role client, for the one job RLS cannot do: writing an assessment
// result on a learner's behalf. Learners have no insert policy on their own
// attempts precisely so a score cannot be self-reported.
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Course Brain is not configured.");
  }

  return createClient(url, serviceRoleKey);
}

// Runs every query as the signed-in learner, so the row-level policies added in
// 202608170001_learner_accounts.sql are what actually decide access. Use this for
// anything learner-scoped; keep the anon client above for public course content.
export async function createUserScopedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Course Brain is not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the session
          // on every request, so a failure here is safe to ignore.
        }
      },
    },
  });
}
