import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/dashboard", "/guests", "/stays", "/templates", "/greetings", "/reports", "/api"];
const publicApi = ["/api/auth/login", "/api/auth/logout"];

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get("ylang_admin_session")?.value;
  if (!token) return false;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!isProtected) return NextResponse.next();
  if (publicApi.some((path) => pathname.startsWith(path))) return NextResponse.next();

  const authed = await hasValidSession(request);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/guests/:path*", "/stays/:path*", "/templates/:path*", "/greetings/:path*", "/reports/:path*", "/api/:path*"],
};
