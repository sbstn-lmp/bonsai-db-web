import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getClaims();

  const isAuthenticated = !!data?.claims?.sub;

  const isProtectedTreesRoute =
    request.nextUrl.pathname === "/trees" ||
    request.nextUrl.pathname.startsWith("/trees/");

  if (isProtectedTreesRoute && !isAuthenticated) {
    const lang = request.nextUrl.searchParams.get("lang") ?? "de";

    const redirectUrl = request.nextUrl.clone();
    const returnTo =
      request.nextUrl.pathname + request.nextUrl.search;

    redirectUrl.pathname = "/";
    redirectUrl.search = "";

    redirectUrl.searchParams.set("lang", lang);
    redirectUrl.searchParams.set("login", "required");
    redirectUrl.searchParams.set("returnTo", returnTo);

    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}