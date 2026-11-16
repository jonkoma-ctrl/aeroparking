import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

// Todo lo del panel exige sesión: las pantallas /admin/* (redirigen al login)
// y sus APIs (responden 401). El login es la única excepción.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

  const ok = await isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/aeroparque/:path*", "/api/scan/:path*"],
};
