import { NextRequest, NextResponse } from "next/server";
import { Payment } from "mercadopago";
import { mp, KP_REF_PREFIX } from "@/lib/mp";
import { applyReservationPayment } from "@/lib/reservation-payment";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { buildReservationEmail, getReservationEmailSubject } from "@/lib/email-templates";

// POST /api/payments/webhook — aviso de pago de Mercado Pago.
// Nunca confiamos en el cuerpo: con el id consultamos el pago REAL a MP.
// Los cobros de KingPark llevan external_reference "kp:<id>"; los demás son
// del flujo viejo (cruceros / aeroparque legacy).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const q = req.nextUrl.searchParams;
  const tipo = String(body?.type ?? body?.topic ?? q.get("type") ?? q.get("topic") ?? body?.action ?? "");
  const paymentId = String(
    (body?.data as { id?: unknown } | undefined)?.id ?? q.get("data.id") ?? q.get("id") ?? "",
  );

  if (!tipo.includes("payment") || !paymentId) return NextResponse.json({ ok: true });

  let paymentData;
  try {
    paymentData = await new Payment(mp).get({ id: paymentId });
  } catch (error) {
    if ((error as { status?: number })?.status === 404) {
      console.warn("[mp-webhook] pago inexistente, se ignora:", paymentId);
      return NextResponse.json({ ok: true });
    }
    // 500 → MP reintenta más tarde (aplicar el pago es idempotente).
    console.error("[mp-webhook] no se pudo consultar el pago", paymentId, error);
    return NextResponse.json({ error: "reintentar" }, { status: 500 });
  }

  try {
    const externalRef = paymentData.external_reference;
    if (!externalRef) return NextResponse.json({ ok: true });

    if (externalRef.startsWith(KP_REF_PREFIX)) {
      const resultado = await applyReservationPayment(paymentData);
      console.log(`[mp-webhook] pago ${paymentId} (${paymentData.status}) → ${resultado}`);
      return NextResponse.json({ ok: true });
    }

    const isCruise = externalRef.startsWith("cruise:");
    const reservationId = isCruise ? externalRef.slice(7) : externalRef;
    if (isCruise) {
      await handleCruisePayment(reservationId, paymentData, paymentId);
    } else {
      await handleAeroparquePayment(reservationId, paymentData, paymentId);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[mp-webhook] Error:", error);
    return NextResponse.json({ error: "reintentar" }, { status: 500 });
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
