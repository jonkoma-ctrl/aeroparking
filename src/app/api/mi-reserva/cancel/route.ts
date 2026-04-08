import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/mi-reserva/cancel — Request cancellation
export async function POST(req: NextRequest) {
  try {
    const { externalOrderId, reason } = await req.json();

    if (!externalOrderId) {
      return NextResponse.json({ error: "Falta número de pedido" }, { status: 400 });
    }

    const reservation = await prisma.aeroparqueReservation.findUnique({
      where: { externalOrderId },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (reservation.status === "cancelled") {
      return NextResponse.json({ error: "La reserva ya está cancelada" }, { status: 400 });
    }

    await prisma.aeroparqueReservation.update({
      where: { externalOrderId },
      data: {
        status: "cancellation_requested",
        notes: reservation.notes
          ? `${reservation.notes}\n---\nSOLICITUD CANCELACIÓN: ${reason || "Sin motivo"}`
          : `SOLICITUD CANCELACIÓN: ${reason || "Sin motivo"}`,
      },
    });

    return NextResponse.json({ ok: true, status: "cancellation_requested" });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
