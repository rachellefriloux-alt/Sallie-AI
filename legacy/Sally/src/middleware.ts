import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Temporary: Disable authentication for development purposes
  // Remove this and uncomment the original code when authentication is implemented
  return NextResponse.next();

  // Original authentication code (commented out)
  /*
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApi = request.nextUrl.pathname.startsWith("/api");
  const hasCodeParameter = request.nextUrl.searchParams.has("code");

  // If there's a code parameter on the root URL, redirect to callback endpoint
  if (hasCodeParameter && request.nextUrl.pathname === "/") {
    const callbackUrl = new URL("/auth/callback", request.url);
    callbackUrl.searchParams.set("code", request.nextUrl.searchParams.get("code")!);
    if (request.nextUrl.searchParams.has("next")) {
      callbackUrl.searchParams.set("next", request.nextUrl.searchParams.get("next")!);
    }
    return NextResponse.redirect(callbackUrl);
  }

  let user: { id: string } | null = null;
  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const { supabase, response: res } = createClient(request);
    response = res;
    const { data } = await supabase.auth.getUser();
    user = data?.user ?? null;
  } catch (err) {
    console.error("[middleware] auth getUser failed:", err instanceof Error ? err.message : err);
    if (!isAuthPage && !isApi) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    return response;
  }

  if (!user && !isAuthPage && !isApi) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (user && isAuthPage && !request.nextUrl.pathname.includes("/callback")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
  */
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
