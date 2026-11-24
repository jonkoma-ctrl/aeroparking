import { createHash } from "crypto";
import { isIP } from "net";
import type { AeroparqueReservation } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Compra confirmada → evento "Purchase" a Meta desde el servidor (Conversions
 * API). Así la conversión no depende de que el cliente vuelva a
 * /reservar/resultado con el píxel cargado.
 *
 * Lleva event_id = código KP, el mismo eventID que manda el píxel del
 * navegador: Meta descarta el repetido.
 *
 * Mail, teléfono, nombre e id de reserva viajan SIEMPRE hasheados (SHA-256),
 * como exige Meta. fbp, fbc e IP van sólo si el visitante no rechazó cookies
 * (si los rechazó no se guardaron). Nunca se manda la patente.
 */

export const META_DATASET_ID = "1456815673231084";
const GRAPH_VERSION = "v27.0";
const ENDPOINT = `https://graph.facebook.com/${GRAPH_VERSION}/${META_DATASET_ID}/events`;
const TIMEOUT_MS = 3000;
const EVENT_SOURCE_URL = "https://kingpark.com.ar/reservar/resultado";
/** Meta rechaza eventos de hace más de 7 días. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 - 60 * 60 * 1000;

type MetaPurchaseSource = Pick<
  AeroparqueReservation,
  | "id"
  | "externalOrderId"
  | "destination"
  | "serviceType"
  | "price"
  | "paidAmount"
  | "paidAt"
  | "customerName"
  | "email"
  | "phone"
  | "metaFbp"
  | "metaFbc"
  | "clientIp"
  | "clientUserAgent"
>;

// ── Del lado del servidor, al crear la reserva ──────────────────────────────

/** Primera IP de x-forwarded-for (la del cliente en Vercel), validada. */
export function clientIpFrom(forwardedFor: string | null | undefined): string | null {
  const first = forwardedFor?.split(",")[0]?.trim();
  if (!first) return null;
  return isIP(first) ? first : null;
}

/** User agent recortado y sin caracteres de control. */
export function cleanUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  // eslint-disable-next-line no-control-regex
  const clean = ua.replace(/[\x00-\x1f\x7f]/g, "").trim().slice(0, 512);
  return clean || null;
}

// ── Normalización y hash (reglas de Meta) ───────────────────────────────────

export function sha256(v: string): string {
  return createHash("sha256").update(v, "utf8").digest("hex");
}

/** Sin espacios a los costados y en minúsculas. */
export function normalizeEmail(email: string | null | undefined): string | undefined {
  const e = email?.trim().toLowerCase();
  return e && e.includes("@") ? e : undefined;
}

/**
 * Sólo dígitos, con código de país. Para Argentina se mandan las dos formas
 * en que Meta puede tener guardado un celular: 54 + área + número y con el 9
 * de móvil (549…). Si el número vino con "+" y otro país, se respeta.
 */
export function normalizePhones(phone: string | null | undefined): string[] {
  if (!phone) return [];
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length < 8) return [];

  if (raw.startsWith("+") && !digits.startsWith("54")) return [digits];

  let national = digits.startsWith("54") && digits.length >= 12 ? digits.slice(2) : digits;
  if (national.length === 11 && national.startsWith("9")) national = national.slice(1);

  if (national.length === 10) return [`54${national}`, `549${national}`];
  return [`54${national}`];
}

/** Minúsculas, sin signos de puntuación ni espacios; conserva tildes (UTF-8). */
export function normalizeName(name: string | null | undefined): string | undefined {
  const n = name?.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  return n || undefined;
}

/** "Juan Manuel Einaudi" → { fn: "juan", ln: "einaudi" }. */
export function splitName(full: string | null | undefined): { fn?: string; ln?: string } {
  const parts = (full ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  const fn = normalizeName(parts[0]);
  const ln = parts.length > 1 ? normalizeName(parts[parts.length - 1]) : undefined;
  return { fn, ln };
}

// ── Armado del evento ───────────────────────────────────────────────────────

export function buildMetaPurchasePayload(r: MetaPurchaseSource, now: Date = new Date()) {
  const value = r.paidAmount ?? r.price ?? 0;

  const paid = r.paidAt ?? now;
  const eventMs =
    paid.getTime() > now.getTime() || now.getTime() - paid.getTime() > MAX_AGE_MS
      ? now.getTime()
      : paid.getTime();

  const email = normalizeEmail(r.email);
  const phones = normalizePhones(r.phone);
  const { fn, ln } = splitName(r.customerName);

  const user_data: Record<string, unknown> = {
    external_id: [sha256(r.id)],
  };
  if (email) user_data.em = [sha256(email)];
  if (phones.length) user_data.ph = phones.map(sha256);
  if (fn) user_data.fn = [sha256(fn)];
  if (ln) user_data.ln = [sha256(ln)];
  if (r.metaFbp) user_data.fbp = r.metaFbp;
  if (r.metaFbc) user_data.fbc = r.metaFbc;
  if (r.clientIp) user_data.client_ip_address = r.clientIp;
  if (r.clientUserAgent) user_data.client_user_agent = r.clientUserAgent;

  const testCode = process.env.META_CAPI_TEST_CODE?.trim();

  return {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(eventMs / 1000),
        event_id: r.externalOrderId,
        action_source: "website",
        event_source_url: EVENT_SOURCE_URL,
        user_data,
        custom_data: {
          value,
          currency: "ARS",
          content_ids: [`${r.destination}_${r.serviceType}`],
          content_type: "product",
          order_id: r.externalOrderId,
        },
      },
    ],
    ...(testCode ? { test_event_code: testCode } : {}),
  };
}

/**
 * Manda el Purchase una sola vez por reserva. Nunca tira error: el webhook de
 * Mercado Pago no puede fallar por esto.
 */
export async function sendMetaPurchase(r: MetaPurchaseSource): Promise<void> {
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.warn("[meta-capi] falta META_CAPI_TOKEN: no se manda el Purchase del servidor");
    return;
  }

  // Decisión de Jon (24-nov): si el cliente rechazó cookies no se le manda nada
  // a Meta. metaFbp sólo se guarda cuando no las rechazó y el píxel cargó.
  if (!r.metaFbp) return;

  try {
    // Reservar el envío: si dos llamadas llegan juntas, sólo una lo manda.
    const claim = await prisma.aeroparqueReservation.updateMany({
      where: { id: r.id, metaCapiSentAt: null },
      data: { metaCapiSentAt: new Date() },
    });
    if (claim.count === 0) return;

    let ok = false;
    try {
      // El token va en el cuerpo, no en la URL: así no queda en ningún log.
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...buildMetaPurchasePayload(r), access_token: token }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      ok = res.ok;
      if (!ok) {
        let code = "";
        try {
          const j = (await res.json()) as { error?: { code?: number; error_subcode?: number } };
          code = ` (código ${j.error?.code ?? "?"}/${j.error?.error_subcode ?? "-"})`;
        } catch {
          // Sin cuerpo legible.
        }
        console.error(`[meta-capi] Purchase ${r.externalOrderId}: Meta respondió ${res.status}${code}`);
      }
    } catch (err) {
      console.error(`[meta-capi] Purchase ${r.externalOrderId}: no se pudo mandar (${(err as Error)?.name ?? "error"})`);
    }

    // Si no salió, se libera para poder reintentarlo.
    if (!ok) {
      await prisma.aeroparqueReservation.update({
        where: { id: r.id },
        data: { metaCapiSentAt: null },
      });
    }
  } catch (err) {
    console.error(`[meta-capi] Purchase ${r.externalOrderId}: error inesperado (${(err as Error)?.name ?? "error"})`);
  }
}
