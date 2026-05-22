import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const roles = (token?.roles as string[]) || [];
    const scopes = (token?.scopes as string[]) || [];

    // 1. Protect projects paths (/projects/*)
    // Require any role with read access (all realm roles have projects:read)
    if (pathname.startsWith("/projects")) {
      const hasAccess =
        roles.includes("system-admin") ||
        roles.includes("product-owner") ||
        roles.includes("scrum-master") ||
        roles.includes("developer") ||
        scopes.includes("projects:read");

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // 2. Protect admin paths (/admin/*)
    // Require 'system-admin', 'product-owner', or 'scrum-master' roles or 'labels:create' scope
    if (pathname.startsWith("/admin")) {
      const hasAccess =
        roles.includes("system-admin") ||
        roles.includes("product-owner") ||
        roles.includes("scrum-master") ||
        scopes.includes("labels:create");

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/projects/:path*",
    "/backlog/:path*",
    "/settings/:path*",
  ],
};
