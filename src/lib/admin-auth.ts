/**
 * Sesión del panel admin.
 *
 * La cookie `admin_token` ya NO guarda la clave: guarda un permiso firmado
 * `<vence>.<firma>`, con firma = HMAC-SHA256(ADMIN_PASSWORD, "kp-admin:<vence>").
 * Cambiar ADMIN_PASSWORD invalida todas las sesiones abiertas.
 *
 * Usa Web Crypto para funcionar igual en el middleware (Edge) y en las APIs (Node).
 */

export const ADMIN_COOKIE = "admin_token";
export const SESSION_DAYS = 30;

const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string): Promise<string | null> {
  const key = process.env.ADMIN_PASSWORD;
  if (!key) return null;
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", k, enc.encode(payload)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Compara la clave ingresada con ADMIN_PASSWORD en tiempo constante. */
export function passwordMatches(input: unknown): boolean {
  const real = process.env.ADMIN_PASSWORD;
  return typeof input === "string" && !!real && safeEqual(input, real);
}

export async function createAdminToken(): Promise<string | null> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const sig = await sign(`kp-admin:${exp}`);
  return sig ? `${exp}.${sig}` : null;
}

export async function isValidAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!sig || !Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await sign(`kp-admin:${exp}`);
  return !!expected && safeEqual(sig, expected);
}
