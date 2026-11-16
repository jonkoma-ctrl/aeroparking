import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { findReservationWithAccess, ACCESS_DENIED } from "@/lib/reservation-access";

// POST /api/mi-reserva/cancel { order, t | email, reason }
// Deja el PEDIDO de cancelación: la devolución la gestiona Border's a mano
// hasta que esté definida la política (ver ESTADO.md de KingPark).
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

    const reason = String(body.reason || "").slice(0, 500) || "Sin motivo";
    await prisma.aeroparqueReservation.update({
      where: { id: r.id },
      data: {
        status: "cancellation_requested",
        notes: `${r.notes ? r.notes + "\n---\n" : ""}SOLICITUD CANCELACIÓN (cliente): ${reason}`,
      },
    });
    return NextResponse.json({ ok: true, status: "cancellation_requested" });
  } catch (error) {
    console.error("[mi-reserva/cancel] error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
