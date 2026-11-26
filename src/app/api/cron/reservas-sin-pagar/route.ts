import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-url";
import { findAbandonedReservations } from "@/lib/abandoned-reservations";
import {
  buildAbandonedReservationEmail,
  getAbandonedReservationEmailSubject,
} from "@/lib/email-templates";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reservas-sin-pagar — cada hora (ver vercel.json).
 *
 * A quien empezó una reserva en la web y no la pagó le manda UN mail con el
 * botón "Terminar mi reserva" (ver lib/abandoned-reservations para quién
 * califica). El botón lleva a pagar esa misma reserva.
 *
 * Corrida en seco salvo que ABANDON_EMAILS_ENABLED sea "1": sólo loguea los
 * códigos KP a los que les mandaría. En los logs nunca van nombres ni mails.
 *
 * Idempotente: marca abandonEmailSentAt ANTES de mandar (sólo si sigue en
 * null); si el envío falla, la vuelve a null para reintentar en la próxima.
 * Vercel manda Authorization: Bearer $CRON_SECRET.
 */
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enabled = process.env.ABANDON_EMAILS_ENABLED === "1";
  const now = new Date();
  const candidates = await findAbandonedReservations(prisma, now);
  const codes = candidates.map((r) => r.externalOrderId);

  if (!enabled) {
    console.log(
      `[cron/reservas-sin-pagar] EN SECO (ABANDON_EMAILS_ENABLED no es "1"): mandaría ${codes.length} mail(s): ${codes.join(", ") || "ninguno"}`
    );
    return NextResponse.json({ ok: true, dryRun: true, wouldSend: codes });
  }

  const sent: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];
  const base = getSiteUrl();

  for (const r of candidates) {
    // Marcar primero: si dos corridas se pisan, sólo una gana.
    const claim = await prisma.aeroparqueReservation.updateMany({
      where: { id: r.id, abandonEmailSentAt: null },
      data: { abandonEmailSentAt: new Date() },
    });
    if (claim.count === 0) {
      skipped.push(r.externalOrderId);
      continue;
    }
    try {
      await sendEmail({
        to: r.email as string,
        logLabel: r.externalOrderId,
        subject: getAbandonedReservationEmailSubject(),
        html: buildAbandonedReservationEmail({
          firstName: r.customerName.trim().split(/\s+/)[0] || "",
          startDate: r.startDate,
          finishUrl: `${base}/reservar/resultado?r=${r.id}`,
        }),
      });
      sent.push(r.externalOrderId);
    } catch (err) {
      // Sin el mensaje del error: puede traer la dirección del cliente.
      console.error(
        `[cron/reservas-sin-pagar] falló el envío de ${r.externalOrderId}:`,
        err instanceof Error ? err.name : "error"
      );
      await prisma.aeroparqueReservation
        .update({ where: { id: r.id }, data: { abandonEmailSentAt: null } })
        .catch(() => {});
      failed.push(r.externalOrderId);
    }
  }

  console.log(
    `[cron/reservas-sin-pagar] enviados: ${sent.join(", ") || "ninguno"} · fallidos: ${failed.join(", ") || "ninguno"}`
  );
  return NextResponse.json({ ok: true, dryRun: false, sent, failed, skipped });
}
