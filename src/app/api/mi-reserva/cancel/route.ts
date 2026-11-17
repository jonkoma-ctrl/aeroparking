import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";
import { CANCEL_REFUND_HOURS } from "@/lib/constants";

// POST /api/mi-reserva/cancel { order, t | email, reason }
// Deja el PEDIDO de cancelación. Política de Border's: devolución del 100 %
// hasta 24 h antes del ingreso; la devolución se hace desde Mercado Pago.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const r = await findReservationWithAccess({ ...body, order: body.order ?? body.externalOrderId });
    if (!r) return NextResponse.json({ error: ACCESS_DENIED }, { status: 404 });

    if (r.checkedInAt) {
      return NextResponse.json({ error: "El auto ya ingresó: escribinos por WhatsApp." }, { status: 409 });
    }
    if (!["confirmed", "extension_requested"].includes(r.status)) {
      return NextResponse.json({ error: "Esta reserva no se puede cancelar desde acá." }, { status: 409 });
    }
    if (r.startDate.getTime() - Date.now() < CANCEL_REFUND_HOURS * 60 * 60 * 1000) {
      return NextResponse.json(
        { error: `Faltan menos de ${CANCEL_REFUND_HOURS} h para el ingreso: ya no se puede cancelar con devolución. Escribinos por WhatsApp.` },
        { status: 409 }
      );
    }

    const reason = String(body.reason || "").slice(0, 500) || "Sin motivo";
    await prisma.aeroparqueReservation.update({
      where: { id: r.id },
      data: {
        status: "cancellation_requested",
        notes: `${r.notes ? r.notes + "\n---\n" : ""}SOLICITUD CANCELACIÓN (cliente, más de ${CANCEL_REFUND_HOURS} h antes → devolver 100 %): ${reason}`,
      },
    });
    return NextResponse.json({ ok: true, status: "cancellation_requested" });
  } catch (error) {
    console.error("[mi-reserva/cancel] error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
