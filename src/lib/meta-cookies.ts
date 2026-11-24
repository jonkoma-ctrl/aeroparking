/**
 * Identificadores de Meta que viajan con la reserva, para que la compra que
 * confirma el servidor (Conversions API) se una al clic y a la visita del
 * cliente.
 *
 * - _fbp: cookie del píxel (visitante).
 * - _fbc: cookie del clic en un anuncio. Si no está pero la URL de llegada
 *   trajo fbclid (guardado en la atribución), se arma con el mismo formato.
 *
 * Si el visitante rechazó las cookies no se manda nada.
 *
 * Este archivo corre también en el navegador: nada de módulos de Node acá.
 */
import { readAttributionEntry } from "@/lib/attribution";

const CONSENT_KEY = "kp_cookies";

export interface MetaIds {
  fbp?: string;
  fbc?: string;
}

// "fb.1.1558571054389.1098115397" (puede venir con un sufijo extra ".xx").
const FBP_RE = /^fb\.\d\.\d{10,16}\.\d{1,25}(\.[A-Za-z0-9_-]{1,64})?$/;
// "fb.1.1554763741205.IwAR2F4-dbP0..." (el fbclid admite letras, números, _ y -).
const FBC_RE = /^fb\.\d\.\d{10,16}\.[A-Za-z0-9_-]{8,500}(\.[A-Za-z0-9_-]{1,64})?$/;
const FBCLID_RE = /^[A-Za-z0-9_-]{8,500}$/;

export function isValidFbp(v: unknown): v is string {
  return typeof v === "string" && FBP_RE.test(v);
}

export function isValidFbc(v: unknown): v is string {
  return typeof v === "string" && FBC_RE.test(v);
}

/** fbclid + momento del clic (ms) → valor de _fbc, o undefined si no sirve. */
export function fbcFromFbclid(fbclid: string | undefined | null, clickedAtMs: number): string | undefined {
  if (!fbclid || !FBCLID_RE.test(fbclid) || !Number.isFinite(clickedAtMs) || clickedAtMs <= 0) return undefined;
  const fbc = `fb.1.${Math.floor(clickedAtMs)}.${fbclid}`;
  return isValidFbc(fbc) ? fbc : undefined;
}

/**
 * Lo que manda el navegador, revisado del lado del servidor.
 * null = el navegador no mandó nada (rechazó cookies o versión vieja del sitio).
 */
export function sanitizeMetaIds(input: unknown): MetaIds | null {
  if (!input || typeof input !== "object") return null;
  const src = input as Record<string, unknown>;
  const clean: MetaIds = {};
  if (isValidFbp(src.fbp)) clean.fbp = src.fbp;
  if (isValidFbc(src.fbc)) clean.fbc = src.fbc;
  return clean;
}

function readCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

/** Navegador: _fbp / _fbc si el visitante no rechazó cookies. */
export function readMetaIds(): MetaIds | null {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(CONSENT_KEY) === "rejected") return null;
    const ids: MetaIds = {};
    const fbp = readCookie("_fbp");
    if (isValidFbp(fbp)) ids.fbp = fbp;
    const fbc = readCookie("_fbc");
    if (isValidFbc(fbc)) {
      ids.fbc = fbc;
    } else {
      const entry = readAttributionEntry();
      const built = fbcFromFbclid(entry?.data.fbclid, entry?.at ?? 0);
      if (built) ids.fbc = built;
    }
    return ids;
  } catch {
    return null;
  }
}
