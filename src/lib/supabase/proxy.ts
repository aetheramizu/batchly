import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

// Pages for signed-out visitors. Signed-in users are sent to the app instead.
const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

// Reachable without a session (the public landing page and email link handling).
const PUBLIC_PREFIXES = ["/auth/"];

// Signed-in home. The landing page and auth pages send signed-in users here.
const APP_HOME = "/dashboard";

// Refreshes the Supabase auth session cookies on each request and redirects
// signed-out visitors away from the app. This is a UX guard only: every data
// access is still authorized by RLS and re-checked in server code.
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it validates
  // the JWT and triggers the token refresh that writes the updated cookies.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isLanding = pathname === "/";
  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!signedIn && !isAuthPage && !isLanding && !isPublic) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    if (!isLanding) loginUrl.searchParams.set("next", `${pathname}${search}`);
    return redirectWithCookies(loginUrl, response);
  }

  if (signedIn && (isAuthPage || isLanding)) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = APP_HOME;
    appUrl.search = "";
    return redirectWithCookies(appUrl, response);
  }

  return response;
}

// Keep refreshed session cookies when redirecting.
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
