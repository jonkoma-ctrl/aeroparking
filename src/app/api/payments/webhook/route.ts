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

    // MP sends different notification types
    if (body.type === "payment" || body.action === "payment.created" || body.action === "payment.updated") {
      const paymentId = body.data?.id;
      if (!paymentId) return NextResponse.json({ ok: true });

      const payment = new Payment(mp);
      const paymentData = await payment.get({ id: paymentId });

      const reservationId = paymentData.external_reference;
      if (!reservationId) return NextResponse.json({ ok: true });

      const reservation = await prisma.aeroparqueReservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) {
        console.error("[mp-webhook] Reservation not found:", reservationId);
        return NextResponse.json({ ok: true });
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

        // Send confirmation email
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

        console.log("[mp-webhook] Payment approved:", reservationId, paymentId);
      } else if (paymentData.status === "rejected") {
        await prisma.aeroparqueReservation.update({
          where: { id: reservationId },
          data: { status: "payment_rejected" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[mp-webhook] Error:", error);
    return NextResponse.json({ ok: true }); // Always 200 for MP
  }
}
