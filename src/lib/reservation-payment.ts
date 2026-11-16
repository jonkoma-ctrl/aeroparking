import type { AeroparqueReservation } from "@prisma/client";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  buildReservationEmail,
  getReservationEmailSubject,
  buildAdminNotificationEmail,
  getAdminNotificationSubject,
} from "@/lib/email-templates";
import { KP_REF_PREFIX } from "@/lib/mp";
import { manageReservationPath } from "@/lib/reservation-access";

export const ADMIN_NOTIFY_EMAIL = "reservas@nrauditores.com.ar";

/** Datos mínimos de un pago de MP que usamos (lo que devuelve Payment.get). */
export interface MpPayment {
  id?: number | string | null;
  status?: string | null;
  transaction_amount?: number | null;
  external_reference?: string | null;
}

function emailDataFor(r: AeroparqueReservation) {
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
    price: r.paidAmount ?? r.price ?? null,
    qrToken: r.qrToken,
    managePath: manageReservationPath(r),
  };
}

/** Mail de confirmación (con QR) sólo al cliente. Se usa también para reenviarlo. */
export async function sendClientConfirmation(r: AeroparqueReservation): Promise<boolean> {
  if (!r.email) return false;
  await sendEmail({
    to: r.email,
    subject: getReservationEmailSubject({
      customerName: r.customerName,
      destination: r.destination,
      externalOrderId: r.externalOrderId,
    }),
    html: buildReservationEmail(emailDataFor(r)),
  });
  return true;
}

/** Mails de reserva confirmada: al cliente (con QR) y aviso interno. Best-effort. */
export async function sendConfirmationEmails(r: AeroparqueReservation) {
  const emailData = emailDataFor(r);

  if (r.email) {
    try {
      await sendEmail({
        to: r.email,
        subject: getReservationEmailSubject({
          customerName: r.customerName,
          destination: r.destination,
          externalOrderId: r.externalOrderId,
        }),
        html: buildReservationEmail(emailData),
      });
    } catch (err) {
      console.error("[reserva] mail al cliente falló:", err);
    }
  }

  try {
    await sendEmail({
      to: ADMIN_NOTIFY_EMAIL,
      subject: getAdminNotificationSubject({
        customerName: r.customerName,
        destination: r.destination,
        externalOrderId: r.externalOrderId,
        reservationId: r.id,
      }),
      html: buildAdminNotificationEmail({
        ...emailData,
        customerEmail: r.email ?? "",
        customerPhone: r.phone,
        channel: "web",
        notes: r.notes,
      }),
    });
  } catch (err) {
    console.error("[reserva] aviso interno falló:", err);
  }
}

/**
 * Aplica un pago de MP a la reserva. Idempotente: se puede llamar desde el
 * webhook y desde la página de resultado sin duplicar mails.
 * Nunca confía en el aviso: recibe el pago ya consultado a la API de MP.
 */
export async function applyReservationPayment(p: MpPayment): Promise<string> {
  const ref = p.external_reference || "";
  if (!ref.startsWith(KP_REF_PREFIX)) return "no es de KingPark";
  const reservationId = ref.slice(KP_REF_PREFIX.length);
  const paymentId = p.id != null ? String(p.id) : "";
  if (!paymentId) return "sin id de pago";

  const r = await prisma.aeroparqueReservation.findUnique({ where: { id: reservationId } });
  if (!r) return "reserva inexistente";

  if (p.status === "approved") {
    const amount = Math.round(Number(p.transaction_amount ?? 0));

    if (r.mpPaymentId && r.mpPaymentId !== paymentId) {
      await prisma.aeroparqueReservation.update({
        where: { id: r.id },
        data: {
          notes: `${r.notes ? r.notes + "\n" : ""}PAGO DUPLICADO MP ${paymentId} ($${amount}) → reembolsar`,
        },
      });
      return "pago duplicado";
    }
    if (r.mpPaymentId === paymentId) return "ya aplicado";

    if (amount !== r.price) {
      await prisma.aeroparqueReservation.update({
        where: { id: r.id },
        data: {
          status: "payment_review",
          mpPaymentId: paymentId,
          paidAmount: amount,
          paidAt: new Date(),
          notes: `${r.notes ? r.notes + "\n" : ""}MONTO DISTINTO: pagó $${amount}, se esperaba $${r.price} — MP ${paymentId}`,
        },
      });
      return "monto distinto";
    }

    // Confirmar una sola vez aunque lleguen dos avisos juntos.
    const res = await prisma.aeroparqueReservation.updateMany({
      where: { id: r.id, mpPaymentId: null },
      data: {
        status: "confirmed",
        mpPaymentId: paymentId,
        paidAmount: amount,
        paidAt: new Date(),
      },
    });
    if (res.count === 0) return "ya aplicado";

    const confirmed = await prisma.aeroparqueReservation.findUnique({ where: { id: r.id } });
    if (confirmed) await sendConfirmationEmails(confirmed);
    return "confirmada";
  }

  if (p.status === "rejected" || p.status === "cancelled") {
    if (r.status === "pending_payment") {
      await prisma.aeroparqueReservation.update({
        where: { id: r.id },
        data: { status: "payment_rejected" },
      });
    }
    return "rechazado";
  }

  return `estado ${p.status}`;
}
