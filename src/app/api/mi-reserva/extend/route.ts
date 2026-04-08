import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/mi-reserva/extend — Request extension (Puerto only)
export async function POST(req: NextRequest) {
  try {
    const { externalOrderId, newEndDate, reason } = await req.json();

    if (!externalOrderId || !newEndDate) {
      return NextResponse.json(
        { error: "Faltan datos: número de pedido y nueva fecha" },
        { status: 400 }
      );
    }

    const reservation = await prisma.aeroparqueReservation.findUnique({
      where: { externalOrderId },
    });

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    if (reservation.destination !== "puerto") {
      return NextResponse.json(
        { error: "La extensión solo está disponible para reservas de Puerto" },
        { status: 400 }
      );
    }

    if (reservation.status !== "confirmed") {
      return NextResponse.json(
        { error: "Solo se pueden extender reservas confirmadas" },
        { status: 400 }
      );
    }

    const parsedNewEnd = new Date(newEndDate);
    if (parsedNewEnd <= reservation.endDate) {
      return NextResponse.json(
        { error: "La nueva fecha debe ser posterior a la fecha actual de retiro" },
        { status: 400 }
      );
    }

    // Calculate extra days
    const diffMs = parsedNewEnd.getTime() - reservation.endDate.getTime();
    const extraDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Get pricing
    const pricing = await prisma.servicePricing.findFirst({
      where: {
        destination: reservation.destination,
        serviceType: reservation.serviceType,
        active: true,
      },
    });

    const pricePerDay = pricing?.pricePerDay || 0;
    const extensionCost = extraDays * pricePerDay;

    await prisma.aeroparqueReservation.update({
      where: { externalOrderId },
      data: {
        status: "extension_requested",
        notes: reservation.notes
          ? `${reservation.notes}\n---\nSOLICITUD EXTENSIÓN: ${extraDays} días extra hasta ${newEndDate}. Costo: $${extensionCost.toLocaleString("es-AR")}. Motivo: ${reason || "Sin motivo"}`
          : `SOLICITUD EXTENSIÓN: ${extraDays} días extra hasta ${newEndDate}. Costo: $${extensionCost.toLocaleString("es-AR")}. Motivo: ${reason || "Sin motivo"}`,
      },
    });

    return NextResponse.json({
      ok: true,
      status: "extension_requested",
      extraDays,
      newEndDate,
      pricePerDay,
      extensionCost,
    });
  } catch (error) {
    console.error("Extend error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
