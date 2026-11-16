import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { presentialReservationSchema } from "@/lib/validations";
import { reservationTotalFor } from "@/lib/reservation-total";
import { generateQrToken } from "@/lib/qr";
import { createReservationPreference, PAYMENT_WINDOW_MIN } from "@/lib/mp";
import { BRAND_NAME } from "@/lib/constants";

/**
 * POST /api/reservas/presencial
 *
 * Crea una reserva y su cobro online con Mercado Pago (Border's Parking SRL).
 *
 * Flujo:
 * 1. Valida payload con presentialReservationSchema
 * 2. Calcula el total con la tarifa vigente (grilla o lineal)
 * 3. Crea la reserva en "pending_payment" (guardada 30 min)
 * 4. Crea la preferencia de MP y devuelve el link de pago (initPoint)
 * 5. El webhook / la página de resultado confirman y mandan los mails
 *
 * Retorna { id, code, status, initPoint, amount }.
 */

function generateOrderCode() {
  const year = new Date().getFullYear();
  const rnd = Math.floor(100000 + Math.random() * 900000); // 6 dígitos
  return `KP-${year}-${rnd}`;
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

    // Total a cobrar: misma cuenta que muestra el resumen del formulario.
    const estimatedPrice = await reservationTotalFor(
      data.destination,
      data.serviceType,
      startDate,
      endDate
    );

    // Sólo se reserva un destino activo y con tarifa: el cobro online
    // necesita un monto real.
    const dest = await prisma.destination.findUnique({
      where: { slug: data.destination },
      select: { active: true },
    });
    if (dest && !dest.active) {
      return NextResponse.json(
        { error: "Ese destino no está disponible por ahora." },
        { status: 400 }
      );
    }
    if (!estimatedPrice || estimatedPrice <= 0) {
      return NextResponse.json(
        { error: "No encontramos una tarifa para esas fechas. Escribinos por WhatsApp y te ayudamos." },
        { status: 400 }
      );
    }

    // Token QR único (para el check-in con escáner en BA Ferial)
    const qrToken = generateQrToken();
    const paymentExpiresAt = new Date(Date.now() + PAYMENT_WINDOW_MIN * 60 * 1000);

    const reservation = await prisma.aeroparqueReservation.create({
      data: {
        externalOrderId: code,
        status: "pending_payment", // se confirma cuando Mercado Pago aprueba el pago
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
        price: estimatedPrice,
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
        paymentExpiresAt,
      },
    });

    // Cobro con Mercado Pago. Los mails de confirmación (con el QR) salen
    // recién cuando el pago se aprueba — ver lib/reservation-payment.ts.
    try {
      const destLabel = data.destination === "puerto" ? "Terminal de Cruceros" : "Aeroparque";
      const { preferenceId, initPoint } = await createReservationPreference({
        reservationId: reservation.id,
        code,
        title: `${BRAND_NAME} — Estacionamiento + traslado a ${destLabel} (${code})`,
        amount: estimatedPrice,
        payerName: customerName,
        payerEmail: data.email,
        expiresAt: paymentExpiresAt,
      });
      await prisma.aeroparqueReservation.update({
        where: { id: reservation.id },
        data: { mpPreferenceId: preferenceId },
      });
      return NextResponse.json(
        { id: reservation.id, code, status: reservation.status, initPoint, amount: estimatedPrice },
        { status: 201 }
      );
    } catch (err) {
      console.error("[reservas/presencial] no se pudo crear el cobro en MP:", err);
      await prisma.aeroparqueReservation.update({
        where: { id: reservation.id },
        data: { status: "payment_expired" },
      });
      return NextResponse.json(
        { error: "No pudimos iniciar el pago. Probá de nuevo en un momento." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[reservas/presencial] error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
