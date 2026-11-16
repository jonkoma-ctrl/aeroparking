import crypto from "crypto";
import type { AeroparqueReservation } from "@prisma/client";
import { prisma } from "@/lib/db";

/**
 * Acceso a "Mi reserva" sin cuenta.
 *
 * El código de reserva solo no alcanza (es corto y adivinable), así que para
 * ver o tocar una reserva hace falta, además:
 *  - el link firmado del mail (`t`, HMAC del id con RESERVATION_LINK_SECRET), o
 *  - el mail con el que se hizo la reserva.
 */

function secret(): string {
  const s = process.env.RESERVATION_LINK_SECRET;
  if (!s) throw new Error("Falta RESERVATION_LINK_SECRET");
  return s;
}

export function reservationLinkToken(reservationId: string): string {
  return crypto.createHmac("sha256", secret()).update(reservationId).digest("base64url").slice(0, 22);
}

export function manageReservationPath(r: { id: string; externalOrderId: string }): string {
  return `/mi-reserva?order=${encodeURIComponent(r.externalOrderId)}&t=${reservationLinkToken(r.id)}`;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export interface AccessInput {
  order?: string | null;
  email?: string | null;
  t?: string | null;
}

/** Devuelve la reserva si el código + (link firmado o mail) coinciden; si no, null. */
export async function findReservationWithAccess(input: AccessInput): Promise<AeroparqueReservation | null> {
  const order = (input.order || "").trim().toUpperCase();
  if (!order) return null;
  const r = await prisma.aeroparqueReservation.findUnique({ where: { externalOrderId: order } });
  if (!r) return null;

  const t = (input.t || "").trim();
  if (t && safeEqual(t, reservationLinkToken(r.id))) return r;

  const email = (input.email || "").trim().toLowerCase();
  if (email && r.email && safeEqual(email, r.email.trim().toLowerCase())) return r;

  return null;
}

/** Respuesta genérica para no revelar si el código existe. */
export const ACCESS_DENIED = "No encontramos una reserva con ese código y ese mail. Revisá los datos o escribinos por WhatsApp.";
