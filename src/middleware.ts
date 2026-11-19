import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SCANNER_HOME, scannerMayOpen, sessionRole } from "@/lib/admin-auth";
import { RESULT_COOKIE, RESULT_PATH, serializeResultCookie } from "@/lib/result-cookie";

// Todo lo del panel exige sesión: las pantallas /admin/* (redirigen al login)
// y sus APIs (responden 401). El login es la única excepción.
export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Vuelta de Mercado Pago: los datos pasan a una cookie y la URL queda limpia,
  // para que el id de la reserva no llegue a Google ni a Meta.
  if (pathname === RESULT_PATH) {
    const value = serializeResultCookie(
      searchParams.get("r"),
      searchParams.get("payment_id") || searchParams.get("collection_id")
    );
    if (!value) return NextResponse.next();
    const clean = req.nextUrl.clone();
    clean.search = "";
    const res = NextResponse.redirect(clean, 303);
    res.cookies.set(RESULT_COOKIE, value, {
      httpOnly: true,
      sameSite: "lax",
      secure: req.nextUrl.protocol === "https:",
      path: RESULT_PATH,
      maxAge: 60 * 60 * 24,
    });
    return res;
  }

  if (pathname === "/admin/login" || pathname === "/api/admin/login") return NextResponse.next();

  const role = await sessionRole(req.cookies.get(ADMIN_COOKIE)?.value);
  if (role === "admin") return NextResponse.next();

  // La clave del escáner abre sólo el escáner, aunque se escriba otra dirección.
  if (role === "scanner") {
    if (scannerMayOpen(pathname)) return NextResponse.next();
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Este acceso sólo permite usar el escáner" }, { status: 403 });
    }
    return NextResponse.redirect(new URL(SCANNER_HOME, req.url));
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/aeroparque/:path*", "/api/scan/:path*", "/reservar/resultado"],
};
