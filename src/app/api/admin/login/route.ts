import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_DAYS, createSessionToken, roleForPassword } from "@/lib/admin-auth";

// Límite de intentos fallidos por IP (por instancia del servidor) + demora en
// cada fallo. Con una clave larga y aleatoria, probar claves deja de ser viable.
const MAX_FAILS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { n: number; since: number }>();

function ipOf(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export async function POST(req: NextRequest) {
  const ip = ipOf(req);
  const now = Date.now();
  const f = fails.get(ip);
  if (f && now - f.since < WINDOW_MS && f.n >= MAX_FAILS) {
    return NextResponse.json({ error: "Demasiados intentos. Probá de nuevo en 15 minutos." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const role = roleForPassword(body?.password);
  if (!role) {
    const cur = f && now - f.since < WINDOW_MS ? f : { n: 0, since: now };
    cur.n += 1;
    fails.set(ip, cur);
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }

  fails.delete(ip);
  const token = await createSessionToken(role);
  if (!token) return NextResponse.json({ error: "Panel sin configurar" }, { status: 500 });

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
  });
  return res;
}
