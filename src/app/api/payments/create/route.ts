import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/db";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aeroparking.vercel.app";

// POST /api/payments/create — Create MP Checkout Pro preference
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      firstName, lastName, email, phone,
      licensePlate, carBrand, carModel,
      startDate, endDate, passengers,
      notes,
    } = data;

    // Validate required fields
    if (!firstName || !lastName || !email || !licensePlate || !startDate || !endDate) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    // Calculate days and price from tariff
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return NextResponse.json({ error: "La fecha de retiro debe ser posterior al ingreso" }, { status: 400 });
    }

    const pricing = await prisma.servicePricing.findFirst({
      where: { destination: "puerto", serviceType: "larga_estadia", active: true },
    });

    if (!pricing) {
      return NextResponse.json({ error: "Tarifa no configurada" }, { status: 500 });
    }

    const totalPrice = days * pricing.pricePerDay;

    // Create reservation in pending_payment status
    const reservation = await prisma.aeroparqueReservation.create({
      data: {
        externalOrderId: `WEB-${Date.now()}`,
        destination: "puerto",
        serviceType: "larga_estadia",
        status: "pending_payment",
        customerName: `${firstName} ${lastName}`,
        email,
        phone: phone || null,
        licensePlate: licensePlate.toUpperCase(),
        carBrand,
        carModel,
        startDate: start,
        endDate: end,
        price: totalPrice,
        passengers: passengers ? parseInt(passengers, 10) : null,
        notes: notes || null,
      },
    });

    // Create MP preference
    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        items: [
          {
            id: reservation.id,
            title: `Estacionamiento Puerto de BA — ${days} días`,
            description: `${licensePlate.toUpperCase()} — ${carBrand} ${carModel} — ${startDate} a ${endDate}`,
            quantity: 1,
            unit_price: totalPrice,
            currency_id: "ARS",
          },
        ],
        payer: {
          name: firstName,
          surname: lastName,
          email,
        },
        back_urls: {
          success: `${SITE_URL}/reservar/puerto/resultado?status=approved&reservation=${reservation.id}`,
          failure: `${SITE_URL}/reservar/puerto/resultado?status=rejected&reservation=${reservation.id}`,
          pending: `${SITE_URL}/reservar/puerto/resultado?status=pending&reservation=${reservation.id}`,
        },
        auto_return: "approved",
        external_reference: reservation.id,
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
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Error creando pago" }, { status: 500 });
  }
}
