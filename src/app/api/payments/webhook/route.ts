import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { buildReservationEmail, getReservationEmailSubject } from "@/lib/email-templates";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

// POST /api/payments/webhook — MP IPN notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "payment" || body.action === "payment.created" || body.action === "payment.updated") {
      const paymentId = body.data?.id;
      if (!paymentId) return NextResponse.json({ ok: true });

      const payment = new Payment(mp);
      const paymentData = await payment.get({ id: paymentId });

      const externalRef = paymentData.external_reference;
      if (!externalRef) return NextResponse.json({ ok: true });

      // Check if it's a cruise reservation (prefix "cruise:") or aeroparque
      const isCruise = externalRef.startsWith("cruise:");
      const reservationId = isCruise ? externalRef.slice(7) : externalRef;

      if (isCruise) {
        await handleCruisePayment(reservationId, paymentData, paymentId);
      } else {
        await handleAeroparquePayment(reservationId, paymentData, paymentId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[mp-webhook] Error:", error);
    return NextResponse.json({ ok: true });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleAeroparquePayment(reservationId: string, paymentData: any, paymentId: string) {
  const reservation = await prisma.aeroparqueReservation.findUnique({ where: { id: reservationId } });
  if (!reservation) {
    console.error("[mp-webhook] Aeroparque reservation not found:", reservationId);
    return;
  }

  if (paymentData.status === "approved") {
    await prisma.aeroparqueReservation.update({
      where: { id: reservationId },
      data: {
        status: "confirmed",
        notes: reservation.notes
          ? `${reservation.notes}\n---\nPAGO MP: $${paymentData.transaction_amount} — ID: ${paymentId}`
          : `PAGO MP: $${paymentData.transaction_amount} — ID: ${paymentId}`,
      },
    });

    if (reservation.email) {
      const emailData = {
        customerName: reservation.customerName,
        externalOrderId: reservation.externalOrderId,
        destination: reservation.destination,
        serviceType: reservation.serviceType,
        licensePlate: reservation.licensePlate,
        carBrand: reservation.carBrand,
        carModel: reservation.carModel,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        price: reservation.price,
        passengers: reservation.passengers,
      };
      try {
        await sendEmail({
          to: reservation.email,
          subject: getReservationEmailSubject(emailData),
          html: buildReservationEmail(emailData),
        });
      } catch (err) {
        console.error("[mp-webhook] Email error:", err);
      }
    }
    console.log("[mp-webhook] Aeroparque payment approved:", reservationId);
  } else if (paymentData.status === "rejected") {
    await prisma.aeroparqueReservation.update({
      where: { id: reservationId },
      data: { status: "payment_rejected" },
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCruisePayment(reservationId: string, paymentData: any, paymentId: string) {
  const reservation = await prisma.cruiseReservation.findUnique({ where: { id: reservationId } });
  if (!reservation) {
    console.error("[mp-webhook] Cruise reservation not found:", reservationId);
    return;
  }

  if (paymentData.status === "approved") {
    await prisma.cruiseReservation.update({
      where: { id: reservationId },
      data: {
        status: "confirmed",
        notes: reservation.notes
          ? `${reservation.notes}\n---\nPAGO MP: $${paymentData.transaction_amount} — ID: ${paymentId}`
          : `PAGO MP: $${paymentData.transaction_amount} — ID: ${paymentId}`,
      },
    });

    if (reservation.email) {
      const emailData = {
        customerName: `${reservation.firstName} ${reservation.lastName}`,
        reservationId: reservation.id,
        destination: "puerto",
        serviceType: "cruceros",
        licensePlate: reservation.licensePlate,
        carBrand: reservation.carBrand,
        carModel: reservation.carModel,
        startDate: reservation.departureDate,
        endDate: reservation.returnDate,
        passengers: reservation.passengers,
        price: paymentData.transaction_amount || null,
      };
      try {
        await sendEmail({
          to: reservation.email,
          subject: getReservationEmailSubject(emailData),
          html: buildReservationEmail(emailData),
        });
      } catch (err) {
        console.error("[mp-webhook] Cruise email error:", err);
      }
    }
    console.log("[mp-webhook] Cruise payment approved:", reservationId);
  } else if (paymentData.status === "rejected") {
    await prisma.cruiseReservation.update({
      where: { id: reservationId },
      data: { status: "payment_rejected" },
    });
  }
}
