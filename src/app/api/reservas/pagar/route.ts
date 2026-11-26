import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BRAND_NAME, CRUISE_TERMINAL } from "@/lib/constants";
import { createReservationPreference, PAYMENT_WINDOW_MIN } from "@/lib/mp";
import { reservationTotalFor } from "@/lib/reservation-total";

export const dynamic = "force-dynamic";

// POST /api/reservas/pagar { id } — nuevo link de pago para una reserva que
// todavía no se pagó (rechazado, vencido o abandonado).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Falta la reserva" }, { status: 400 });

  const r = await prisma.aeroparqueReservation.findUnique({ where: { id } });
  if (!r) return NextResponse.json({ error: "No encontramos la reserva" }, { status: 404 });
  if (!["pending_payment", "payment_rejected", "payment_expired"].includes(r.status)) {
    return NextResponse.json({ error: "Esta reserva ya no está esperando un pago." }, { status: 409 });
  }
  if (!r.email || !r.price) {
    return NextResponse.json({ error: "Faltan datos para cobrar. Escribinos por WhatsApp." }, { status: 400 });
  }
  // Las fechas se guardan como hora de Buenos Aires escrita en UTC: comparamos igual.
  const nowWall = new Date(Date.now() - 3 * 60 * 60 * 1000);
  if (r.startDate <= nowWall) {
    return NextResponse.json(
      { error: "La fecha de ingreso de esta reserva ya pasó. Hacé una reserva nueva o escribinos por WhatsApp." },
      { status: 409 }
    );
  }

  // Si el cobro anterior venció o lo rechazaron, se cobra con la tarifa de
  // hoy (la misma cuenta que usa la web al reservar). Pendiente: se respeta
  // el precio que ya vio.
  let amount = r.price;
  if (r.status !== "pending_payment") {
    const total = await reservationTotalFor(r.destination, r.serviceType, r.startDate, r.endDate);
    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "No encontramos una tarifa para esas fechas. Escribinos por WhatsApp y te ayudamos." },
        { status: 409 }
      );
    }
    amount = total;
  }

  const expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MIN * 60 * 1000);
  try {
    const destLabel = r.destination === "puerto" ? CRUISE_TERMINAL.name : "Aeroparque";
    const { preferenceId, initPoint } = await createReservationPreference({
      reservationId: r.id,
      code: r.externalOrderId,
      title: `${BRAND_NAME} — Estacionamiento + traslado a ${destLabel} (${r.externalOrderId})`,
      amount,
      payerName: r.customerName,
      payerEmail: r.email,
      expiresAt,
    });
    await prisma.aeroparqueReservation.update({
      where: { id: r.id },
      data: { status: "pending_payment", price: amount, mpPreferenceId: preferenceId, paymentExpiresAt: expiresAt },
    });
    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("[reservas/pagar] error creando preferencia:", err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Probá de nuevo en un momento." }, { status: 502 });
  }
}
