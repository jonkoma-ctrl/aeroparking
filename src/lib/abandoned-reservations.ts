import type { AeroparqueReservation, PrismaClient } from "@prisma/client";

/**
 * Reservas web que empezaron y no se pagaron: a quién le mandamos UN mail
 * para que termine la reserva.
 *
 * Califica una reserva si:
 *  - es de la web (código KP-),
 *  - se creó hace entre 1 h y 24 h,
 *  - está en pending_payment o payment_expired, y el link de pago ya venció
 *    (si sigue vigente, puede estar pagando en este momento),
 *  - todavía no se le mandó este mail,
 *  - la fecha de ingreso es futura,
 *  - ese mail no tiene una reserva paga creada después (ni en las 24 h
 *    anteriores: si ya pagó una y después abrió otra, no lo molestamos).
 * Si el mismo mail dejó varias reservas sin pagar, va sólo la más nueva, y
 * no se repite si ese mail ya recibió este aviso en los últimos 7 días.
 */

export const ABANDON_MIN_AGE_MS = 60 * 60 * 1000; // 1 h
export const ABANDON_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 h
const SAME_EMAIL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const ABANDONED_STATUSES = ["pending_payment", "payment_expired"];
/** Pagó: confirmada, en sede, completada, con pedidos o con el pago en revisión. */
const PAID_STATUSES = [
  "confirmed",
  "checked_in",
  "completed",
  "payment_review",
  "cancellation_requested",
  "extension_requested",
];

export async function findAbandonedReservations(
  prisma: PrismaClient,
  now: Date = new Date()
): Promise<AeroparqueReservation[]> {
  const candidates = await prisma.aeroparqueReservation.findMany({
    where: {
      externalOrderId: { startsWith: "KP-" },
      status: { in: ABANDONED_STATUSES },
      abandonEmailSentAt: null,
      email: { not: null },
      createdAt: {
        gte: new Date(now.getTime() - ABANDON_MAX_AGE_MS),
        lte: new Date(now.getTime() - ABANDON_MIN_AGE_MS),
      },
      startDate: { gt: now },
      OR: [{ paymentExpiresAt: null }, { paymentExpiresAt: { lt: now } }],
    },
    orderBy: { createdAt: "desc" },
  });

  const result: AeroparqueReservation[] = [];
  const seenEmails = new Set<string>();

  for (const r of candidates) {
    const email = (r.email || "").trim();
    if (!email) continue;
    const key = email.toLowerCase();
    // La más nueva de cada mail (vienen ordenadas de más nueva a más vieja).
    if (seenEmails.has(key)) continue;
    seenEmails.add(key);

    const paidAfter = await prisma.aeroparqueReservation.count({
      where: {
        email: { equals: email, mode: "insensitive" },
        status: { in: PAID_STATUSES },
        createdAt: { gt: new Date(r.createdAt.getTime() - ABANDON_MAX_AGE_MS) },
      },
    });
    if (paidAfter > 0) continue;

    const recentlyEmailed = await prisma.aeroparqueReservation.count({
      where: {
        email: { equals: email, mode: "insensitive" },
        abandonEmailSentAt: { gte: new Date(now.getTime() - SAME_EMAIL_COOLDOWN_MS) },
      },
    });
    if (recentlyEmailed > 0) continue;

    result.push(r);
  }

  return result;
}
