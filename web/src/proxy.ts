import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renamed the `middleware` file convention to `proxy`. This does two
// things and nothing more: it refreshes the Supabase session cookie so a signed-in
// learner is not silently logged out, and it bounces obviously-anonymous traffic
// away from /dashboard. It is an optimistic check only — every dashboard page and
// route handler independently calls requireProfile() from lib/auth/session.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const isSignedIn = Boolean(data?.user);
  const { pathname, search } = request.nextUrl;

  if (!isSignedIn && pathname.startsWith("/dashboard")) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/login";
    signIn.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(signIn);
  }

  if (isSignedIn && pathname === "/login") {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";
    return NextResponse.redirect(dashboard);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
