import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BRAND_NAME } from "@/lib/constants";
import { createReservationPreference, PAYMENT_WINDOW_MIN } from "@/lib/mp";

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

  const expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MIN * 60 * 1000);
  try {
    const destLabel = r.destination === "puerto" ? "Terminal de Cruceros" : "Aeroparque";
    const { preferenceId, initPoint } = await createReservationPreference({
      reservationId: r.id,
      code: r.externalOrderId,
      title: `${BRAND_NAME} — Estacionamiento + traslado a ${destLabel} (${r.externalOrderId})`,
      amount: r.price,
      payerName: r.customerName,
      payerEmail: r.email,
      expiresAt,
    });
    await prisma.aeroparqueReservation.update({
      where: { id: r.id },
      data: { status: "pending_payment", mpPreferenceId: preferenceId, paymentExpiresAt: expiresAt },
    });
    return NextResponse.json({ initPoint });
  } catch (err) {
    console.error("[reservas/pagar] error creando preferencia:", err);
    return NextResponse.json({ error: "No pudimos iniciar el pago. Probá de nuevo en un momento." }, { status: 502 });
  }
}
