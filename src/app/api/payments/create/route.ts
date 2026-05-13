import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/db";
import { calculateStays } from "@/lib/pricing";

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || "",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aeroparking.vercel.app";

// POST /api/payments/create — Puerto Larga Estadía + Ezeiza
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      firstName, lastName, email, phone,
      licensePlate, carBrand, carModel,
      startDate, endDate, passengers,
      notes,
      destination = "puerto",       // "puerto" | "ezeiza"
      transferLegs = 0,             // solo Ezeiza
      appliedCreditId,              // opcional: id de CustomerCredit a consumir
    } = data;

    if (!firstName || !lastName || !email || !licensePlate || !startDate || !endDate) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json({ error: "La fecha de retiro debe ser posterior al ingreso" }, { status: 400 });
    }

    const stays = calculateStays(start, end);

    // Service type: puerto = larga_estadia, ezeiza = larga_estadia
    const serviceType = "larga_estadia";

    const pricing = await prisma.servicePricing.findFirst({
      where: { destination, serviceType, active: true },
    });

    if (!pricing) {
      return NextResponse.json({ error: "Tarifa no configurada" }, { status: 500 });
    }

    const parkingSubtotal = Math.round(stays.totalEquivalent * pricing.pricePerDay);
    const transferCost = pricing.transferIncluded ? 0 : (pricing.transferCostPerLeg || 0) * transferLegs;
    let totalPrice = parkingSubtotal + transferCost;

    // Apply credit if provided
    let creditApplied = 0;
    if (appliedCreditId) {
      const credit = await prisma.customerCredit.findUnique({ where: { id: appliedCreditId } });
      if (credit && credit.status === "available" && credit.email === email.toLowerCase()) {
        creditApplied = Math.min(credit.amountAvailable, totalPrice);
        totalPrice -= creditApplied;
      }
    }

    const reservation = await prisma.aeroparqueReservation.create({
      data: {
        externalOrderId: `WEB-${Date.now()}`,
        destination,
        serviceType,
        status: totalPrice === 0 ? "confirmed" : "pending_payment",
        customerName: `${firstName} ${lastName}`,
        email: email.toLowerCase(),
        phone: phone || null,
        licensePlate: licensePlate.toUpperCase(),
        carBrand,
        carModel,
        startDate: start,
        endDate: end,
        price: totalPrice + creditApplied, // precio bruto antes de crédito
        passengers: passengers ? parseInt(passengers, 10) : null,
        notes: [
          notes,
          `Estadías: ${stays.fullStays} completas + ${stays.halfStays} media${stays.halfStays !== 1 ? "s" : ""} (${Math.round(stays.totalHours)}hs)`,
          transferLegs > 0 ? `Traslado Ezeiza: ${transferLegs} tramo(s) = $${transferCost.toLocaleString("es-AR")}` : null,
          creditApplied > 0 ? `Crédito aplicado: $${creditApplied.toLocaleString("es-AR")}` : null,
        ].filter(Boolean).join("\n"),
      },
    });

    // Si hay crédito y cubre todo → no hace falta MP
    if (totalPrice === 0 && creditApplied > 0) {
      await prisma.customerCredit.update({
        where: { id: appliedCreditId },
        data: { status: "used", usedAt: new Date(), usedReservationId: reservation.id },
      });
      return NextResponse.json({
        reservationId: reservation.id,
        fullyCovered: true,
        creditApplied,
      });
    }

    // Create MP preference
    const preference = new Preference(mp);
    const result = await preference.create({
      body: {
        items: [
          {
            id: reservation.id,
            title: `Estacionamiento ${destination === "ezeiza" ? "Ezeiza" : "Puerto de BA"} — ${stays.totalEquivalent} estadía(s)`,
            description: `${licensePlate.toUpperCase()} — ${carBrand} ${carModel}`,
            quantity: 1,
            unit_price: totalPrice,
            currency_id: "ARS",
          },
        ],
        payer: { name: firstName, surname: lastName, email },
        back_urls: {
          success: `${SITE_URL}/reservar/puerto/resultado?status=approved&reservation=${reservation.id}`,
          failure: `${SITE_URL}/reservar/puerto/resultado?status=rejected&reservation=${reservation.id}`,
          pending: `${SITE_URL}/reservar/puerto/resultado?status=pending&reservation=${reservation.id}`,
        },
        auto_return: "approved",
        external_reference: appliedCreditId ? `aeroparque:${reservation.id}:credit:${appliedCreditId}` : reservation.id,
        notification_url: `${SITE_URL}/api/payments/webhook`,
      },
    });

    return NextResponse.json({
      preferenceId: result.id,
      initPoint: result.init_point,
      reservationId: reservation.id,
      stays: stays.totalEquivalent,
      pricePerStay: pricing.pricePerDay,
      parkingSubtotal,
      transferCost,
      creditApplied,
      totalPrice,
    });
  } catch (error) {
    console.error("Payment create error:", error);
    return NextResponse.json({ error: "Error creando pago" }, { status: 500 });
  }
}
