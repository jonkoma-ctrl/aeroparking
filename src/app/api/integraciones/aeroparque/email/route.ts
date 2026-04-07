import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseAeroparqueEmail } from "@/lib/email-parser";

export async function POST(req: NextRequest) {
  try {
    // 1. Validate auth token
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (token !== process.env.AEROPARQUE_MAIL_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const payload = await req.json();
    const { subject, body } = payload as { subject?: string; body?: string };

    if (!subject || !body) {
      return NextResponse.json(
        { error: "Faltan campos: subject, body" },
        { status: 400 }
      );
    }

    // 3. Parse email content
    const parsed = parseAeroparqueEmail(subject, body);
    if (!parsed) {
      // Log enough to debug but not the full body (could be huge)
      console.error("Could not parse email:", {
        subject,
        bodyLength: body.length,
        bodyPreview: body.slice(0, 1000),
        hasPatente: /[Pp]atente/i.test(body),
        hasMarca: /[Mm]arca:/i.test(body),
        hasReservado: /[Rr]eservado desde/i.test(body),
        hasDropGo: /Drop/i.test(body),
        hasLargaEstadia: /Larga/i.test(body),
      });
      return NextResponse.json(
        { error: "No se pudo parsear el email" },
        { status: 422 }
      );
    }

    // 4. Upsert (idempotent by externalOrderId)
    const reservation = await prisma.aeroparqueReservation.upsert({
      where: { externalOrderId: parsed.externalOrderId },
      update: {}, // no-op if already exists
      create: {
        externalOrderId: parsed.externalOrderId,
        destination: parsed.destination,
        serviceType: parsed.serviceType,
        customerName: parsed.customerName,
        email: parsed.email,
        phone: parsed.phone,
        dni: parsed.dni,
        licensePlate: parsed.licensePlate,
        carBrand: parsed.carBrand,
        carModel: parsed.carModel,
        startDate: parsed.startDate,
        endDate: parsed.endDate,
        price: parsed.price,
        departureFlightDate: parsed.departureFlightDate,
        departureAirline: parsed.departureAirline,
        departureFlight: parsed.departureFlight,
        arrivalAirline: parsed.arrivalAirline,
        arrivalFlight: parsed.arrivalFlight,
        arrivalTime: parsed.arrivalTime,
        passengers: parsed.passengers,
        notes: parsed.notes,
        rawEmailSubject: subject,
        rawEmailBody: body,
      },
    });

    // Check if it was a new creation or existing
    const isNew =
      reservation.createdAt.getTime() === reservation.updatedAt.getTime();

    return NextResponse.json(
      {
        id: reservation.id,
        externalOrderId: reservation.externalOrderId,
        status: isNew ? "created" : "already_exists",
      },
      { status: isNew ? 201 : 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
