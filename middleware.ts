import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ADMIN_ONLY_PATHS = [
  "/dashboard/clients",
  "/dashboard/team",
  "/dashboard/billing",
  "/dashboard/command",
  "/dashboard/search",
];

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/platform") && role !== "PLATFORM_OWNER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (role === "CLIENTE" && ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        const isPublic =
          pathname.startsWith("/login") ||
          pathname.startsWith("/registro") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/signup") ||
          pathname.startsWith("/api/onboarding") ||
          pathname === "/api/billing/webhook" ||
          pathname === "/api/health" ||
          pathname.startsWith("/legal") ||
          pathname === "/";
        if (isPublic) return true;
        if (pathname.startsWith("/api/platform")) return !!token;
        if (pathname.startsWith("/platform")) return !!token;
        if (pathname.startsWith("/dashboard")) return !!token;
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/dashboard/:path*",
    "/platform",
    "/platform/:path*",
    "/registro",
  ],
};
