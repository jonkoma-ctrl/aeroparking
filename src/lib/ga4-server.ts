import { createHash } from "crypto";
import type { AeroparqueReservation } from "@prisma/client";
import { prisma } from "@/lib/db";
import { GA4_MEASUREMENT_ID } from "@/lib/ga-cookies";

/**
 * Compra confirmada → evento "purchase" a GA4 desde el servidor (Measurement
 * Protocol). Así la conversión no depende de que el cliente vuelva a
 * /reservar/resultado con las cookies aceptadas.
 *
 * Lleva el mismo transaction_id (código KP) que el evento del navegador: GA4
 * descarta el repetido. Sin datos personales: ni nombre, ni mail, ni patente,
 * ni teléfono.
 *
 * gclid: el Measurement Protocol no lo acepta. La unión con el anuncio la hace
 * GA4 por el client_id (la visita con el gclid ya la registró la etiqueta). El
 * gclid queda guardado en `attribution` por si después se suben conversiones
 * offline directo a Google Ads.
 */

const ENDPOINT = "https://www.google-analytics.com/mp/collect";
const TIMEOUT_MS = 3000;
/** GA4 une la compra a la sesión sólo si llega dentro de las 24 h de su inicio. */
const SESSION_WINDOW_MS = 23 * 60 * 60 * 1000;

type PurchaseSource = Pick<
  AeroparqueReservation,
  | "id"
  | "externalOrderId"
  | "destination"
  | "serviceType"
  | "price"
  | "paidAmount"
  | "createdAt"
  | "gaClientId"
  | "gaSessionId"
>;

/**
 * Sin cookie de GA (rechazó, bloqueador, reserva vieja): un id estable que sale
 * de la reserva, con el formato de GA ("número.segundos"). Cuenta la venta
 * pero no la une a ningún anuncio.
 */
export function fallbackClientId(reservationId: string, createdAt: Date): string {
  const hash = createHash("sha256").update(reservationId).digest("hex");
  const n = parseInt(hash.slice(0, 8), 16);
  return `${n}.${Math.floor(createdAt.getTime() / 1000)}`;
}

export function buildPurchasePayload(r: PurchaseSource, now: Date = new Date()) {
  const value = r.paidAmount ?? r.price;
  const withinSession =
    !!r.gaSessionId && now.getTime() - r.createdAt.getTime() < SESSION_WINDOW_MS;

  return {
    client_id: r.gaClientId || fallbackClientId(r.id, r.createdAt),
    events: [
      {
        name: "purchase",
        params: {
          transaction_id: r.externalOrderId,
          value,
          currency: "ARS",
          items: [
            {
              item_id: `${r.destination}_${r.serviceType}`,
              item_name: r.destination === "puerto" ? "Estacionamiento Cruceros" : "Estacionamiento Aeroparque",
              price: value,
              quantity: 1,
            },
          ],
          ...(withinSession ? { session_id: r.gaSessionId } : {}),
          engagement_time_msec: 1,
        },
      },
    ],
  };
}

/**
 * Manda el purchase una sola vez por reserva. Nunca tira error: el webhook de
 * Mercado Pago no puede fallar por esto.
 */
export async function sendServerPurchase(r: PurchaseSource): Promise<void> {
  const secret = process.env.GA4_API_SECRET;
  if (!secret) {
    console.warn("[ga4] falta GA4_API_SECRET: no se manda el purchase del servidor");
    return;
  }

  try {
    // Reservar el envío: si dos llamadas llegan juntas, sólo una lo manda.
    const claim = await prisma.aeroparqueReservation.updateMany({
      where: { id: r.id, purchaseSentAt: null },
      data: { purchaseSentAt: new Date() },
    });
    if (claim.count === 0) return;

    const url = `${ENDPOINT}?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${encodeURIComponent(secret)}`;
    let ok = false;
    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(buildPurchasePayload(r)),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      ok = res.ok;
      if (!ok) console.error(`[ga4] purchase ${r.externalOrderId}: GA4 respondió ${res.status}`);
    } catch (err) {
      console.error(`[ga4] purchase ${r.externalOrderId}: no se pudo mandar (${(err as Error)?.name ?? "error"})`);
    }

    // Si no salió, se libera para poder reintentarlo.
    if (!ok) {
      await prisma.aeroparqueReservation.update({
        where: { id: r.id },
        data: { purchaseSentAt: null },
      });
    }
  } catch (err) {
    console.error(`[ga4] purchase ${r.externalOrderId}: error inesperado (${(err as Error)?.name ?? "error"})`);
  }
}
