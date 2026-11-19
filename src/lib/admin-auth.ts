/**
 * Sesión del panel admin.
 *
 * La cookie `admin_token` ya NO guarda la clave: guarda un permiso firmado.
 * - Panel completo: `<vence>.<firma>`, firmado con ADMIN_PASSWORD.
 * - Sólo escáner: `scan.<vence>.<firma>`, firmado con SCANNER_PASSWORD.
 * Cambiar una clave invalida las sesiones abiertas con esa clave.
 * Sin SCANNER_PASSWORD cargada, el acceso de escáner no existe.
 *
 * Usa Web Crypto para funcionar igual en el middleware (Edge) y en las APIs (Node).
 */

export const ADMIN_COOKIE = "admin_token";
export const SESSION_DAYS = 30;
export const SCANNER_HOME = "/admin/scan";

export type PanelRole = "admin" | "scanner";

const SCANNER_PATHS = [SCANNER_HOME, "/api/scan"];
const enc = new TextEncoder();

function b64url(buf: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, key: string | undefined): Promise<string | null> {
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

function matches(input: unknown, real: string | undefined): boolean {
  return typeof input === "string" && !!real && safeEqual(input, real);
}

/** Qué permite la clave ingresada. La comparación es en tiempo constante. */
export function roleForPassword(input: unknown): PanelRole | null {
  if (matches(input, process.env.ADMIN_PASSWORD)) return "admin";
  if (matches(input, process.env.SCANNER_PASSWORD)) return "scanner";
  return null;
}

export async function createSessionToken(role: PanelRole): Promise<string | null> {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  if (role === "scanner") {
    const sig = await sign(`kp-scan:${exp}`, process.env.SCANNER_PASSWORD);
    return sig ? `scan.${exp}.${sig}` : null;
  }
  const sig = await sign(`kp-admin:${exp}`, process.env.ADMIN_PASSWORD);
  return sig ? `${exp}.${sig}` : null;
}

/** Qué permite la sesión de esta cookie; null si no hay sesión válida. */
export async function sessionRole(token: string | undefined | null): Promise<PanelRole | null> {
  if (!token) return null;
  const parts = token.split(".");
  const role: PanelRole = parts[0] === "scan" ? "scanner" : "admin";
  const [expStr, sig] = role === "scanner" ? parts.slice(1) : parts;
  const exp = Number(expStr);
  if (!sig || !Number.isFinite(exp) || exp < Date.now()) return null;
  const expected =
    role === "scanner"
      ? await sign(`kp-scan:${exp}`, process.env.SCANNER_PASSWORD)
      : await sign(`kp-admin:${exp}`, process.env.ADMIN_PASSWORD);
  return expected && safeEqual(sig, expected) ? role : null;
}

/** Lista cerrada: todo lo que no esté acá queda afuera para el escáner. */
export function scannerMayOpen(pathname: string): boolean {
  return SCANNER_PATHS.includes(pathname);
}
