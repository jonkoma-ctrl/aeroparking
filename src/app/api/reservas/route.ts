import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cruiseReservationSchema } from "@/lib/validations";
import { sendEmail } from "@/lib/email";
import { buildReservationEmail, getReservationEmailSubject } from "@/lib/email-templates";

// POST /api/reservas — Create a new cruise reservation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cruiseReservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const reservation = await prisma.cruiseReservation.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        departureDate: new Date(data.departureDate),
        arrivalTime: data.arrivalTime,
        returnDate: new Date(data.returnDate),
        pickupTime: data.pickupTime,
        passengers: data.passengers,
        licensePlate: data.licensePlate,
        carBrand: data.carBrand,
        carModel: data.carModel,
        cruiseLine: data.cruiseLine || null,
        terminal: data.terminal || null,
        notes: data.notes || null,
        status: "pending",
      },
    });

    // Send confirmation email to client (fire-and-forget)
    const emailData = {
      customerName: `${data.firstName} ${data.lastName}`,
      reservationId: reservation.id,
      destination: "puerto" as const,
      serviceType: "cruceros",
      licensePlate: data.licensePlate,
      carBrand: data.carBrand,
      carModel: data.carModel,
      startDate: new Date(data.departureDate),
      endDate: new Date(data.returnDate),
      passengers: data.passengers,
    };
    sendEmail({
      to: data.email,
      subject: getReservationEmailSubject(emailData),
      html: buildReservationEmail(emailData),
    }).catch((err) => console.error("[email] Failed to send:", err));

    return NextResponse.json(
      { id: reservation.id, status: reservation.status },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET /api/reservas — List all reservations (admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const reservations = await prisma.cruiseReservation.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
