import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  parseAeroparqueEmail,
  parseDateAR,
  isCancellationEmail,
} from "@/lib/email-parser";

const INTEGRATION_TOKEN = process.env.AEROPARQUE_MAIL_TOKEN;

/**
 * POST /api/integraciones/aeroparque/email
 *
 * Webhook para recibir datos parseados de mails de AA2000.
 * Puede ser invocado por Make.com, Zapier, o cualquier servicio
 * que lea el buzón reservas@nrauditores.com.ar y reenvíe los datos.
 *
 * Headers requeridos:
 *   x-integration-token: <AEROPARQUE_MAIL_TOKEN>
 *
 * Body JSON:
 *   { subject: string, body: string }
 *   o directamente los campos parseados.
 */
export async function POST(req: NextRequest) {
  // Autenticación por token
  const token = req.headers.get("x-integration-token");
  if (INTEGRATION_TOKEN && token !== INTEGRATION_TOKEN) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const payload = await req.json();

    // Si viene con subject + body, parseamos el mail
    if (payload.subject && payload.body) {
      return await handleRawEmail(payload.subject, payload.body);
    }

    // Si viene con campos parseados directamente
    if (payload.externalOrderId) {
      return await handleParsedData(payload);
    }

    return NextResponse.json(
      { error: "Formato no reconocido. Enviá { subject, body } o datos parseados." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error en webhook aeroparque:", error);
    return NextResponse.json(
      { error: "Error procesando el email", details: String(error) },
      { status: 500 }
    );
  }
}

async function handleRawEmail(subject: string, body: string) {
  // Detectar cancelación
  if (isCancellationEmail(subject, body)) {
    const orderMatch = subject.match(/\((\d+)\)/);
    if (orderMatch) {
      const orderId = orderMatch[1];
      const existing = await prisma.aeroparqueReservation.findUnique({
        where: { externalOrderId: orderId },
      });
      if (existing) {
        const updated = await prisma.aeroparqueReservation.update({
          where: { externalOrderId: orderId },
          data: {
            status: "cancelled",
            paymentStatus: "refunded",
          },
        });
        return NextResponse.json({
          action: "cancelled",
          orderId,
          reservationId: updated.id,
        });
      }
    }
    return NextResponse.json({
      action: "cancellation_ignored",
      reason: "No se encontró la reserva original",
    });
  }

  // Parsear nueva reserva
  const parsed = parseAeroparqueEmail(body, subject);

  // Idempotencia: si ya existe, actualizar
  const existing = await prisma.aeroparqueReservation.findUnique({
    where: { externalOrderId: parsed.externalOrderId },
  });

  if (existing) {
    return NextResponse.json({
      action: "already_exists",
      reservationId: existing.id,
      orderId: parsed.externalOrderId,
    });
  }

  // Crear nueva reserva
  const reservation = await prisma.aeroparqueReservation.create({
    data: {
      externalOrderId: parsed.externalOrderId,
      serviceType: parsed.serviceType,
      status: "confirmed",
      paymentStatus: parsed.paymentStatus,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone,
      documentType: parsed.documentType,
      documentNumber: parsed.documentNumber,
      departureDate: parseDateAR(parsed.departureDate),
      airline: parsed.airline,
      flightNumber: parsed.flightNumber,
      returnAirline: parsed.returnAirline,
      returnFlight: parsed.returnFlight,
      arrivalTime: parsed.arrivalTime,
      entryTime: parsed.entryTime,
      reservedFrom: parseDateAR(parsed.reservedFrom),
      reservedUntil: parseDateAR(parsed.reservedUntil),
      passengers: parsed.passengers,
      licensePlate: parsed.licensePlate,
      carBrand: parsed.carBrand,
      carModel: parsed.carModel,
      totalAmount: parsed.totalAmount,
      paymentMethod: parsed.paymentMethod,
      billingAddress: parsed.billingAddress,
      billingCity: parsed.billingCity,
      billingState: parsed.billingState,
      billingZip: parsed.billingZip,
      notes: parsed.notes,
      rawEmailSubject: parsed.rawEmailSubject,
    },
  });

  return NextResponse.json(
    {
      action: "created",
      reservationId: reservation.id,
      orderId: parsed.externalOrderId,
      serviceType: parsed.serviceType,
      client: `${parsed.firstName} ${parsed.lastName}`,
      vehicle: parsed.licensePlate,
      dates: `${parsed.reservedFrom} → ${parsed.reservedUntil}`,
    },
    { status: 201 }
  );
}

async function handleParsedData(data: Record<string, unknown>) {
  const orderId = String(data.externalOrderId);

  // Idempotencia
  const existing = await prisma.aeroparqueReservation.findUnique({
    where: { externalOrderId: orderId },
  });

  if (existing) {
    return NextResponse.json({
      action: "already_exists",
      reservationId: existing.id,
    });
  }

  const reservation = await prisma.aeroparqueReservation.create({
    data: {
      externalOrderId: orderId,
      serviceType: String(data.serviceType || "drop_go"),
      status: String(data.status || "confirmed"),
      paymentStatus: String(data.paymentStatus || "paid"),
      firstName: String(data.firstName || ""),
      lastName: String(data.lastName || ""),
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      documentType: data.documentType ? String(data.documentType) : null,
      documentNumber: data.documentNumber ? String(data.documentNumber) : null,
      departureDate: new Date(String(data.departureDate)),
      airline: String(data.airline || ""),
      flightNumber: String(data.flightNumber || ""),
      returnAirline: data.returnAirline ? String(data.returnAirline) : null,
      returnFlight: data.returnFlight ? String(data.returnFlight) : null,
      arrivalTime: data.arrivalTime ? String(data.arrivalTime) : null,
      entryTime: data.entryTime ? String(data.entryTime) : null,
      reservedFrom: new Date(String(data.reservedFrom)),
      reservedUntil: new Date(String(data.reservedUntil)),
      passengers: Number(data.passengers) || 1,
      licensePlate: String(data.licensePlate || ""),
      carBrand: String(data.carBrand || ""),
      carModel: String(data.carModel || ""),
      totalAmount: Number(data.totalAmount) || 0,
      paymentMethod: data.paymentMethod ? String(data.paymentMethod) : null,
      billingAddress: data.billingAddress ? String(data.billingAddress) : null,
      billingCity: data.billingCity ? String(data.billingCity) : null,
      billingState: data.billingState ? String(data.billingState) : null,
      billingZip: data.billingZip ? String(data.billingZip) : null,
      notes: data.notes ? String(data.notes) : null,
      rawEmailSubject: data.rawEmailSubject ? String(data.rawEmailSubject) : null,
    },
  });

  return NextResponse.json(
    { action: "created", reservationId: reservation.id, orderId },
    { status: 201 }
  );
}

/**
 * GET /api/integraciones/aeroparque/email
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "Webhook Aeroparque Email Integration",
    accepts: "POST { subject, body } or POST { externalOrderId, ... }",
  });
}
