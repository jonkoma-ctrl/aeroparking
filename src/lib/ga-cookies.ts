/**
 * Identificadores de Google Analytics que viajan con la reserva, para que la
 * compra que confirma el servidor se una a la visita (y al anuncio) del cliente.
 *
 * Se leen de las cookies que pone la etiqueta de Google. Si el visitante
 * rechazó las cookies no se manda nada.
 */
export const GA4_MEASUREMENT_ID = "G-H8H9PTNTZV";

const CONSENT_KEY = "kp_cookies";

export interface GaIds {
  clientId?: string;
  sessionId?: string;
}

const CLIENT_ID_RE = /^\d{1,20}\.\d{1,20}$/;
const SESSION_ID_RE = /^\d{1,20}$/;

/** "GA1.1.123456789.1700000000" → "123456789.1700000000". */
export function parseGaClientId(cookie: string | undefined | null): string | undefined {
  if (!cookie) return undefined;
  const parts = cookie.split(".");
  if (parts.length < 4) return undefined;
  const id = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
  return CLIENT_ID_RE.test(id) ? id : undefined;
}

/**
 * Cookie de sesión de la propiedad. Dos formatos en uso:
 * "GS1.1.1700000000.3.1.1700000100.0.0.0" y "GS2.1.s1700000000$o3$g1$t1700000100$j0$l0$h0".
 */
export function parseGaSessionId(cookie: string | undefined | null): string | undefined {
  if (!cookie) return undefined;
  const v2 = cookie.match(/^GS2\.\d+\.s(\d+)/);
  if (v2) return v2[1];
  const parts = cookie.split(".");
  if (parts[0] === "GS1" && parts.length >= 3 && SESSION_ID_RE.test(parts[2])) return parts[2];
  return undefined;
}

/** Lo que manda el navegador, revisado del lado del servidor. */
export function sanitizeGaIds(input: unknown): GaIds | null {
  if (!input || typeof input !== "object") return null;
  const src = input as Record<string, unknown>;
  const clean: GaIds = {};
  if (typeof src.clientId === "string" && CLIENT_ID_RE.test(src.clientId)) clean.clientId = src.clientId;
  if (typeof src.sessionId === "string" && SESSION_ID_RE.test(src.sessionId)) clean.sessionId = src.sessionId;
  return clean.clientId ? clean : null;
}

function readCookie(name: string): string | undefined {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

/** Navegador: ids de GA si el visitante no rechazó cookies. */
export function readGaIds(): GaIds | null {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(CONSENT_KEY) === "rejected") return null;
    const clientId = parseGaClientId(readCookie("_ga"));
    if (!clientId) return null;
    const sessionId = parseGaSessionId(readCookie(`_ga_${GA4_MEASUREMENT_ID.slice(2)}`));
    return sessionId ? { clientId, sessionId } : { clientId };
  } catch {
    return null;
  }
}
