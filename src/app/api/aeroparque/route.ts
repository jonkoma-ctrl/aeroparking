import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/aeroparque — List all Aeroparque reservations
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to");     // YYYY-MM-DD

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (serviceType) where.serviceType = serviceType;
    if (from || to) {
      where.reservedFrom = {};
      if (from) (where.reservedFrom as Record<string, unknown>).gte = new Date(from);
      if (to) (where.reservedFrom as Record<string, unknown>).lte = new Date(to);
    }

    const reservations = await prisma.aeroparqueReservation.findMany({
      where,
      orderBy: { reservedFrom: "asc" },
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
