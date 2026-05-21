import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if ((path.startsWith("/erp/") || path === "/erp") && path !== "/erp/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/erp/login", request.url));
    }

    const VALID_ROLES = ["admin", "faculty", "parent", "superadmin"];
    const role = user.app_metadata?.role as string | undefined;
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/erp/login", request.url));
    }

    if (path.startsWith("/erp/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(`/erp/${role}`, request.url));
    }
    if (path.startsWith("/erp/faculty") && role !== "faculty") {
      return NextResponse.redirect(new URL(`/erp/${role}`, request.url));
    }
    if (path.startsWith("/erp/parent") && role !== "parent") {
      return NextResponse.redirect(new URL(`/erp/${role}`, request.url));
    }
    if (path.startsWith("/erp/superadmin") && role !== "superadmin") {
      return NextResponse.redirect(new URL(`/erp/${role}`, request.url));
    }
  }

  if (path === "/erp/login" && user) {
    const role = user.app_metadata?.role as string | undefined;
    const validRoles = ["admin", "faculty", "parent", "superadmin"];
    if (role && validRoles.includes(role)) {
      return NextResponse.redirect(new URL(`/erp/${role}`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
