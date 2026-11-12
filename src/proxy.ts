import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const scopes = (token?.scopes as string[]) || [];

    // 1. Protect projects paths (/projects/*)
    // Uses scope-based auth — all realm roles have projects:read
    if (pathname.startsWith("/projects")) {
      const hasAccess = scopes.includes("projects:read");

      if (!hasAccess) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // 2. Protect admin paths (/admin/*)
    // Uses scope-based auth — only system-admin, product-owner, and scrum-master have labels:create
    if (pathname.startsWith("/admin")) {
      const hasAccess = scopes.includes("labels:create");

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
    "/workitems/:path*",
    "/settings/:path*",
  ],
};
