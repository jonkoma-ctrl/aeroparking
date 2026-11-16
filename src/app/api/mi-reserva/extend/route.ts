import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";
import { reservationTotalFor } from "@/lib/reservation-total";
import { formatPrice } from "@/lib/utils";

// POST /api/mi-reserva/extend { order, t | email, newEndDate, reason }
// Deja el PEDIDO de extensión con la diferencia calculada; la coordina Border's.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const r = await findReservationWithAccess({ ...body, order: body.order ?? body.externalOrderId });
    if (!r) return NextResponse.json({ error: ACCESS_DENIED }, { status: 404 });
    if (!["confirmed", "checked_in"].includes(r.status)) {
      return NextResponse.json({ error: "Sólo se pueden extender reservas pagas." }, { status: 409 });
    }
    const newEndDate = String(body.newEndDate || "");
    const newEnd = new Date(`${newEndDate}T${r.arrivalTime || "12:00"}`);
    if (!newEndDate || isNaN(newEnd.getTime()) || newEnd <= r.endDate) {
      return NextResponse.json({ error: "Elegí una fecha posterior a la de retiro actual." }, { status: 400 });
    }
    const newTotal = await reservationTotalFor(r.destination, r.serviceType, r.startDate, newEnd);
    const extensionCost = Math.max(0, newTotal - (r.paidAmount ?? r.price));
    const reason = String(body.reason || "").slice(0, 500) || "Sin motivo";
    await prisma.aeroparqueReservation.update({
      where: { id: r.id },
      data: {
        status: "extension_requested",
        notes: `${r.notes ? r.notes + "\n---\n" : ""}SOLICITUD EXTENSIÓN (cliente): retiro nuevo ${newEndDate}. Diferencia: ${formatPrice(extensionCost)}. Motivo: ${reason}`,
      },
    });
    return NextResponse.json({ ok: true, status: "extension_requested", newEndDate, extensionCost });
  } catch (error) {
    console.error("[mi-reserva/extend] error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
