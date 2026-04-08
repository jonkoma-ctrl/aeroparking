import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/aeroparque/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await prisma.aeroparqueReservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error fetching aeroparque reservation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/aeroparque/:id — Update status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, destination, checkInTime } = body;

    const data: Record<string, string> = {};
    if (checkInTime) data.checkInTime = checkInTime;
    if (status) {
      if (!["confirmed", "cancelled", "completed"].includes(status)) {
        return NextResponse.json(
          { error: "Estado inválido" },
          { status: 400 }
        );
      }
      data.status = status;
    }
    if (destination) {
      if (!["aeroparque", "puerto"].includes(destination)) {
        return NextResponse.json(
          { error: "Destino inválido" },
          { status: 400 }
        );
      }
      data.destination = destination;
    }

    const reservation = await prisma.aeroparqueReservation.update({
      where: { id },
      data,
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error updating aeroparque reservation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
