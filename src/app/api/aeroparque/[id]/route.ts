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
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PATCH /api/aeroparque/:id — Update status or payment status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updateData: Record<string, string> = {};

    if (body.status) {
      if (!["confirmed", "cancelled", "completed", "no_show"].includes(body.status)) {
        return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
      }
      updateData.status = body.status;
    }

    if (body.paymentStatus) {
      if (!["paid", "refunded", "pending"].includes(body.paymentStatus)) {
        return NextResponse.json({ error: "Estado de pago inválido" }, { status: 400 });
      }
      updateData.paymentStatus = body.paymentStatus;
    }

    const reservation = await prisma.aeroparqueReservation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
