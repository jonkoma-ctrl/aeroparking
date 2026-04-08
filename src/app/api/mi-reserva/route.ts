import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/mi-reserva?order=177666 or ?id=cmnp...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const order = searchParams.get("order");
  const id = searchParams.get("id");

  if (!order && !id) {
    return NextResponse.json(
      { error: "Ingresá un número de pedido o ID de reserva" },
      { status: 400 }
    );
  }

  try {
    // Try AeroparqueReservation first
    if (order) {
      const aeroRes = await prisma.aeroparqueReservation.findUnique({
        where: { externalOrderId: order },
        select: {
          id: true,
          externalOrderId: true,
          destination: true,
          serviceType: true,
          customerName: true,
          licensePlate: true,
          carBrand: true,
          carModel: true,
          startDate: true,
          endDate: true,
          price: true,
          status: true,
          departureFlightDate: true,
          departureAirline: true,
          departureFlight: true,
          arrivalAirline: true,
          arrivalFlight: true,
          arrivalTime: true,
          passengers: true,
          createdAt: true,
        },
      });
      if (aeroRes) {
        return NextResponse.json({ type: "aeroparque", ...aeroRes });
      }
    }

    // Try CruiseReservation by ID
    if (id) {
      const cruiseRes = await prisma.cruiseReservation.findUnique({
        where: { id },
        select: {
          id: true,
          status: true,
          firstName: true,
          lastName: true,
          licensePlate: true,
          carBrand: true,
          carModel: true,
          departureDate: true,
          returnDate: true,
          cruiseLine: true,
          createdAt: true,
        },
      });
      if (cruiseRes) {
        return NextResponse.json({
          type: "cruceros",
          customerName: `${cruiseRes.firstName} ${cruiseRes.lastName}`,
          ...cruiseRes,
        });
      }
    }

    return NextResponse.json(
      { error: "Reserva no encontrada" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
