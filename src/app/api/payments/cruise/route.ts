import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/db";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aeroparking.vercel.app";

// POST /api/payments/cruise — Create MP preference for cruise reservation
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      firstName, lastName, email, phone,
      licensePlate, carBrand, carModel,
      departureDate, arrivalTime, returnDate, pickupTime,
      passengers, cruiseLine, terminal, notes,
    } = data;

    if (!firstName || !lastName || !email || !licensePlate || !departureDate || !returnDate) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Calculate days
    const start = new Date(departureDate);
    const end = new Date(returnDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return NextResponse.json({ error: "La fecha de retorno debe ser posterior a la salida" }, { status: 400 });
    }

    // Get cruise pricing
    const pricing = await prisma.servicePricing.findFirst({
      where: { destination: "puerto", serviceType: "cruceros", active: true },
    });

    if (!pricing) {
      return NextResponse.json(
        { error: "La tarifa para cruceros aún no está configurada. Contactanos." },
        { status: 500 }
      );
    }

    const totalPrice = days * pricing.pricePerDay;

    // Create reservation with pending_payment status
    const reservation = await prisma.cruiseReservation.create({
      data: {
        firstName, lastName, email,
        phone: phone || "",
        departureDate: start,
        arrivalTime,
        returnDate: end,
        pickupTime,
        passengers: parseInt(passengers, 10) || 1,
        licensePlate: licensePlate.toUpperCase(),
        carBrand, carModel,
        cruiseLine: cruiseLine || null,
        terminal: terminal || null,
        notes: notes || null,
        status: "pending_payment",
      },
    });

    // Create MP preference
    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        items: [
          {
            id: reservation.id,
            title: `Estacionamiento Cruceros — ${days} días`,
            description: `${licensePlate.toUpperCase()} — ${carBrand} ${carModel} — ${departureDate} a ${returnDate}`,
            quantity: 1,
            unit_price: totalPrice,
            currency_id: "ARS",
          },
        ],
        payer: { name: firstName, surname: lastName, email },
        back_urls: {
          success: `${SITE_URL}/reservar/cruceros/resultado?status=approved&reservation=${reservation.id}`,
          failure: `${SITE_URL}/reservar/cruceros/resultado?status=rejected&reservation=${reservation.id}`,
          pending: `${SITE_URL}/reservar/cruceros/resultado?status=pending&reservation=${reservation.id}`,
        },
        auto_return: "approved",
        external_reference: `cruise:${reservation.id}`,
        notification_url: `${SITE_URL}/api/payments/webhook`,
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      reservationId: reservation.id,
      days,
      pricePerDay: pricing.pricePerDay,
      totalPrice,
    });
  } catch (error) {
    console.error("Cruise payment create error:", error);
    return NextResponse.json({ error: "Error creando pago" }, { status: 500 });
  }
}
