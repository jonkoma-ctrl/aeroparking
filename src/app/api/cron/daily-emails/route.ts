import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  buildReminderEmail,
  getReminderEmailSubject,
  buildWelcomeBackEmail,
  getWelcomeBackEmailSubject,
  buildReviewRequestEmail,
  getReviewRequestEmailSubject,
} from "@/lib/email-templates";

/**
 * GET /api/cron/daily-emails
 *
 * Cron job diario disparado por Vercel Cron Jobs (ver vercel.json).
 * Cubre los 3 mails programados al cliente:
 * - Recordatorio 24hs antes (reservas que ingresan mañana)
 * - Bienvenida post-retiro (reservas que retiraron ayer)
 * - Pedido de reseña (reservas que retiraron hace 2 días)
 *
 * Vercel envía Authorization: Bearer $CRON_SECRET. Verificamos.
 *
 * Es idempotente best-effort: marca cada reserva con flags para no
 * mandar 2 veces. Si falla algún send individual, sigue con los demás.
 */

const CRON_SECRET = process.env.CRON_SECRET;

function dayBoundaries(offsetDays: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

interface ReservationRecord {
  id: string;
  externalOrderId: string;
  destination: string;
  serviceType: string;
  customerName: string;
  email: string | null;
  licensePlate: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
  checkInTime: string | null;
  arrivalTime: string | null;
  departureAirline: string | null;
  departureFlight: string | null;
  arrivalAirline: string | null;
  arrivalFlight: string | null;
  passengers: number | null;
  status: string;
  notes: string | null;
}

function toEmailData(r: ReservationRecord) {
  return {
    customerName: r.customerName,
    externalOrderId: r.externalOrderId,
    reservationId: r.id,
    destination: r.destination,
    serviceType: r.serviceType,
    licensePlate: r.licensePlate,
    carBrand: r.carBrand,
    carModel: r.carModel,
    startDate: r.startDate,
    endDate: r.endDate,
    checkInTime: r.checkInTime,
    arrivalTime: r.arrivalTime,
    departureAirline: r.departureAirline,
    departureFlight: r.departureFlight,
    arrivalAirline: r.arrivalAirline,
    arrivalFlight: r.arrivalFlight,
    passengers: r.passengers,
    price: null,
  };
}

export async function GET(req: NextRequest) {
  // Auth Vercel Cron
  const auth = req.headers.get("authorization");
  if (CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = {
    reminders: { sent: 0, failed: 0, skipped: 0 },
    welcomeBack: { sent: 0, failed: 0, skipped: 0, completed: 0 },
    reviewRequests: { sent: 0, failed: 0, skipped: 0 },
  };

  // ─── 1) Recordatorio 24hs: reservas con startDate = mañana ────────────────
  try {
    const { start, end } = dayBoundaries(1);
    const tomorrowReservations = await prisma.aeroparqueReservation.findMany({
      where: {
        startDate: { gte: start, lt: end },
        status: { in: ["confirmed", "pending"] },
      },
    });

    for (const r of tomorrowReservations) {
      if (!r.email) {
        summary.reminders.skipped++;
        continue;
      }
      try {
        const data = toEmailData(r);
        await sendEmail({
          to: r.email,
          subject: getReminderEmailSubject({ customerName: r.customerName, destination: r.destination }),
          html: buildReminderEmail(data),
        });
        summary.reminders.sent++;
      } catch (err) {
        console.error("[cron/daily-emails] reminder failed for", r.externalOrderId, err);
        summary.reminders.failed++;
      }
    }
  } catch (err) {
    console.error("[cron/daily-emails] reminder query failed:", err);
  }

  // ─── 2) Bienvenida post-retiro: reservas con endDate = ayer ───────────────
  try {
    const { start, end } = dayBoundaries(-1);
    const yesterdayReservations = await prisma.aeroparqueReservation.findMany({
      where: {
        endDate: { gte: start, lt: end },
        status: { in: ["confirmed", "pending"] },
      },
    });

    for (const r of yesterdayReservations) {
      if (!r.email) {
        summary.welcomeBack.skipped++;
        continue;
      }
      try {
        const data = toEmailData(r);
        await sendEmail({
          to: r.email,
          subject: getWelcomeBackEmailSubject({ customerName: r.customerName }),
          html: buildWelcomeBackEmail(data),
        });
        summary.welcomeBack.sent++;
      } catch (err) {
        console.error("[cron/daily-emails] welcome-back failed for", r.externalOrderId, err);
        summary.welcomeBack.failed++;
      }
      // Marcar como completed (best-effort)
      try {
        await prisma.aeroparqueReservation.update({
          where: { id: r.id },
          data: { status: "completed" },
        });
        summary.welcomeBack.completed++;
      } catch (err) {
        console.error("[cron/daily-emails] update status failed for", r.externalOrderId, err);
      }
    }
  } catch (err) {
    console.error("[cron/daily-emails] welcome-back query failed:", err);
  }

  // ─── 3) Pedido de reseña: reservas completadas hace 2 días ────────────────
  try {
    const { start, end } = dayBoundaries(-2);
    const reviewCandidates = await prisma.aeroparqueReservation.findMany({
      where: {
        endDate: { gte: start, lt: end },
        status: "completed",
      },
    });

    for (const r of reviewCandidates) {
      if (!r.email) {
        summary.reviewRequests.skipped++;
        continue;
      }
      try {
        const data = toEmailData(r);
        await sendEmail({
          to: r.email,
          subject: getReviewRequestEmailSubject({ customerName: r.customerName }),
          html: buildReviewRequestEmail(data),
        });
        summary.reviewRequests.sent++;
      } catch (err) {
        console.error("[cron/daily-emails] review-request failed for", r.externalOrderId, err);
        summary.reviewRequests.failed++;
      }
    }
  } catch (err) {
    console.error("[cron/daily-emails] review-request query failed:", err);
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    summary,
  });
}
