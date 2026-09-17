import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next 16 renamed the `middleware` file convention to `proxy`. This does two
// things and nothing more: it refreshes the Supabase session cookie so a signed-in
// learner is not silently logged out, and it turns anonymous traffic away from the
// whole site. It is an optimistic check only — every page and route handler
// independently calls requireProfile() from lib/auth/session.
//
// The course used to be readable without an account. The lecturer asked for the
// opposite: the site opens on the sign-in page, and nothing is reachable until a
// learner is signed in.
const PUBLIC_PATHS = new Set(["/login"]);

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

  if (!isSignedIn && !PUBLIC_PATHS.has(pathname)) {
    // An API call gets an answer it can act on; a redirect to a sign-in page would
    // arrive at fetch() as a body of HTML.
    if (pathname.startsWith("/api/")) {
      return Response.json({ error: "Sign in to continue." }, { status: 401 });
    }

    const signIn = request.nextUrl.clone();
    signIn.pathname = "/login";
    // Somewhere to return to, so a shared link still lands on the right page.
    signIn.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(signIn);
  }

  if (isSignedIn && pathname === "/login") {
    const home = request.nextUrl.clone();
    home.pathname = "/dashboard";
    home.search = "";
    return NextResponse.redirect(home);
  }

  return response;
}

export const config = {
  // Everything except Next's own assets and any file in public/ (all of which
  // carry an extension). Sign-in cannot depend on the fonts and images loading.
  matcher: ["/((?!_next/static|_next/image|.*\\.).*)"],
};
