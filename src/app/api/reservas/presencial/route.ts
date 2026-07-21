import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { presentialReservationSchema } from "@/lib/validations";
import { calculateStays } from "@/lib/pricing";
import { generateQrToken, qrPngBuffer } from "@/lib/qr";
import { sendEmail } from "@/lib/email";
import {
  buildReservationEmail,
  getReservationEmailSubject,
  buildAdminNotificationEmail,
  getAdminNotificationSubject,
} from "@/lib/email-templates";

/**
 * POST /api/reservas/presencial
 *
 * Crea una reserva con pago presencial (sin MercadoPago).
 * Para los 3 destinos: aeroparque, ezeiza, puerto.
 *
 * Flujo:
 * 1. Valida payload con presentialReservationSchema
 * 2. Genera externalOrderId único (formato AP-YYYY-XXXXXX)
 * 3. Crea AeroparqueReservation con paymentStatus pendiente y price 0
 *    (el monto se confirma al cobrar en sede)
 * 4. Dispara mail de confirmación al cliente y aviso al admin
 *
 * Retorna { id, code, status }.
 */

const ADMIN_NOTIFY_EMAIL = "reservas@nrauditores.com.ar";

function generateOrderCode() {
  const year = new Date().getFullYear();
  const rnd = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  return `AP-${year}-${rnd}`;
}

async function generateUniqueCode(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const code = generateOrderCode();
    const existing = await prisma.aeroparqueReservation.findUnique({
      where: { externalOrderId: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throw new Error("No se pudo generar un código único de reserva");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = presentialReservationSchema.safeParse(body);

    if (!parsed.success) {
      const flat = parsed.error.flatten();
      // Primer mensaje de error concreto (campo o refine cross-field) para
      // mostrarle al cliente algo accionable en vez de "Datos inválidos".
      const firstFieldError = Object.values(flat.fieldErrors).flat()[0];
      const firstFormError = flat.formErrors[0];
      const msg = firstFieldError || firstFormError || "Revisá los datos ingresados";
      console.error("[reservas/presencial] validación falló:", JSON.stringify(flat));
      return NextResponse.json(
        { error: msg, details: flat },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const code = await generateUniqueCode();
    const customerName = `${data.firstName} ${data.lastName}`;

    // Compose start/end as full datetimes
    const startDate = new Date(`${data.startDate}T${data.checkInTime}`);
    const endDate = new Date(`${data.endDate}T${data.arrivalTime}`);

    // Precio estimado de la cochera según tarifa vigente y estadías.
    // El pago es presencial, pero guardamos el estimado para que la agenda
    // y el dashboard muestren el monto. El traslado de Ezeiza (opcional) se
    // suma al cobrar en sede, no acá.
    let estimatedPrice = 0;
    try {
      const tariff = await prisma.servicePricing.findFirst({
        where: { destination: data.destination, serviceType: data.serviceType, active: true },
      });
      if (tariff) {
        const stays = calculateStays(startDate, endDate);
        estimatedPrice = Math.round(stays.totalEquivalent * tariff.pricePerDay);
      }
    } catch (e) {
      console.error("[reservas/presencial] no se pudo calcular precio estimado:", e);
    }

    // Token QR único (para el check-in con escáner en BA Ferial (ex Costa Salguero))
    const qrToken = generateQrToken();

    const reservation = await prisma.aeroparqueReservation.create({
      data: {
        externalOrderId: code,
        status: "confirmed", // confirmada al recibir; pago se ajusta al cobrar
        destination: data.destination,
        serviceType: data.serviceType,
        customerName,
        email: data.email,
        phone: data.phone,
        licensePlate: data.licensePlate,
        carBrand: data.carBrand,
        carModel: data.carModel,
        startDate,
        endDate,
        price: estimatedPrice, // estimado según tarifa; el monto final se ajusta al cobrar
        passengers: data.passengers,
        checkInTime: data.checkInTime,
        arrivalTime: data.arrivalTime,
        departureAirline: data.departureAirline || null,
        departureFlight: data.departureFlight || null,
        arrivalAirline: data.arrivalAirline || null,
        arrivalFlight: data.arrivalFlight || null,
        cruiseLine: data.cruiseLine || null,
        terminal: data.terminal || null,
        notes: data.notes || null,
        qrToken,
      },
    });

    // Datos compartidos para los mails
    const emailData = {
      customerName,
      externalOrderId: code,
      reservationId: reservation.id,
      destination: data.destination,
      serviceType: data.serviceType,
      licensePlate: data.licensePlate,
      carBrand: data.carBrand,
      carModel: data.carModel,
      startDate,
      endDate,
      checkInTime: data.checkInTime,
      arrivalTime: data.arrivalTime,
      departureAirline: data.departureAirline || null,
      departureFlight: data.departureFlight || null,
      arrivalAirline: data.arrivalAirline || null,
      arrivalFlight: data.arrivalFlight || null,
      passengers: data.passengers,
      price: estimatedPrice || null,
      qrToken,
    };

    // Mail de confirmación al cliente (best-effort, no rompe el create si falla)
    try {
      await sendEmail({
        to: data.email,
        subject: getReservationEmailSubject({
          customerName,
          destination: data.destination,
          externalOrderId: code,
        }),
        html: buildReservationEmail(emailData),
      });
    } catch (err) {
      console.error("[reservas/presencial] confirmation mail failed:", err);
    }

    // Mail al admin (best-effort)
    try {
      await sendEmail({
        to: ADMIN_NOTIFY_EMAIL,
        subject: getAdminNotificationSubject({
          customerName,
          destination: data.destination,
          externalOrderId: code,
          reservationId: reservation.id,
        }),
        html: buildAdminNotificationEmail({
          ...emailData,
          customerEmail: data.email,
          customerPhone: data.phone,
          channel: "web",
          notes: data.notes || null,
        }),
      });
    } catch (err) {
      console.error("[reservas/presencial] admin notification failed:", err);
    }

    return NextResponse.json(
      {
        id: reservation.id,
        code,
        status: reservation.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[reservas/presencial] error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
