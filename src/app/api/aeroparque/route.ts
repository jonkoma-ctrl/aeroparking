import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/aeroparque — List reservations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const destination = searchParams.get("destination");

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (destination) where.destination = destination;

    const reservations = await prisma.aeroparqueReservation.findMany({
      where,
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching aeroparque reservations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
