import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

export default async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (!session) {
    if (isAdminPage || isDashboardPage) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  // If already logged in and trying to access auth pages
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // RBAC Checks
  if (isAdminPage && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow CUSTOMER to access /dashboard (Seller Hub) and /dashboard/new (Store Creation)
  // But prevent them from accessing specific store management routes if they don't own them
  // For the MVP, we'll let the layout components handle specific store ownership checks

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/:path*"],
};
