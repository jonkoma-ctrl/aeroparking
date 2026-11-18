/**
 * De dónde vino el cliente: identificadores de clic y UTMs de la URL de entrada.
 * Se guardan 90 días en el navegador (gana el último anuncio que trajo al
 * cliente) y viajan con la reserva, para poder atribuir el pago a la campaña.
 */
export const ATTRIBUTION_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;

const STORAGE_KEY = "kp_attribution";
const TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_LENGTH = 512;

/** Deja sólo las claves conocidas, como texto corto. Lo usa también el servidor. */
export function sanitizeAttribution(input: unknown): Attribution | null {
  if (!input || typeof input !== "object") return null;
  const source = input as Record<string, unknown>;
  const clean: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim() && value.length <= MAX_LENGTH) {
      clean[key] = value.trim();
    }
  }
  return Object.keys(clean).length > 0 ? clean : null;
}

export function captureAttribution(search: string): void {
  try {
    const params = new URLSearchParams(search);
    const found = sanitizeAttribution(Object.fromEntries(params.entries()));
    if (!found) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), data: found }));
  } catch {
    // Sin almacenamiento disponible: la reserva sigue, sin atribución.
  }
}

export function readAttribution(): Attribution | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: number; data?: unknown };
    if (!parsed.at || Date.now() - parsed.at > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return sanitizeAttribution(parsed.data);
  } catch {
    return null;
  }
}

export function clearAttribution(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar.
  }
}
