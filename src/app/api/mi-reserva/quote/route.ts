import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/mi-reserva/quote?order=179066&newEndDate=2026-05-01
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const order = searchParams.get("order");
  const newEndDate = searchParams.get("newEndDate");

  if (!order || !newEndDate) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const reservation = await prisma.aeroparqueReservation.findUnique({
    where: { externalOrderId: order },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  const parsedNewEnd = new Date(newEndDate);
  if (parsedNewEnd <= reservation.endDate) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const diffMs = parsedNewEnd.getTime() - reservation.endDate.getTime();
  const extraDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const pricing = await prisma.servicePricing.findFirst({
    where: {
      destination: reservation.destination,
      serviceType: reservation.serviceType,
      active: true,
    },
  });

  const pricePerDay = pricing?.pricePerDay || 0;
  const extensionCost = extraDays * pricePerDay;

  return NextResponse.json({
    extraDays,
    pricePerDay,
    extensionCost,
    currentEndDate: reservation.endDate,
    newEndDate,
  });
}
