import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { nonWebTariffEditError, webTariffChangeError, webTariffTarget } from "@/lib/web-tariff-guard";

// GET /api/admin/pricing — List all pricing
export async function GET() {
  try {
    const pricing = await prisma.servicePricing.findMany({
      orderBy: [{ destination: "asc" }, { serviceType: "asc" }],
    });
    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/admin/pricing — Crea (o actualiza) la tarifa web de un destino.
// La fila (serviceType) la decide el destino, no el que llama: ver webTariffTarget.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      destination, pricePerDay, description,
      minDays, maxDays, durationDiscounts,
    } = body;

    if (!destination || pricePerDay == null) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }
    const target = await webTariffTarget(destination, body.serviceType);
    if ("error" in target) {
      return NextResponse.json({ error: target.error }, { status: target.status });
    }
    const serviceType = target.serviceType;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseData: any = { pricePerDay, description, active: true };
    if (minDays !== undefined) baseData.minDays = minDays;
    if (maxDays !== undefined) baseData.maxDays = maxDays;
    if (durationDiscounts !== undefined) baseData.durationDiscounts = durationDiscounts;

    // Freno: no dejar sin precio la tarifa que cobra la web (ver web-tariff-guard).
    const current = await prisma.servicePricing.findUnique({
      where: { destination_serviceType: { destination, serviceType } },
    });
    const blocked = await webTariffChangeError(destination, serviceType, current, {
      active: true,
      pricePerDay: Number(pricePerDay) || 0,
      priceTable: current?.priceTable ?? null,
      extraDayPrice: current?.extraDayPrice ?? null,
    });
    if (blocked) {
      return NextResponse.json({ error: blocked }, { status: 409 });
    }

    const pricing = await prisma.servicePricing.upsert({
      where: {
        destination_serviceType: { destination, serviceType },
      },
      update: baseData,
      create: { destination, serviceType, ...baseData },
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error saving pricing:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/admin/pricing — Update by id (partial)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, pricePerDay, active, minDays, maxDays, durationDiscounts, description, transferIncluded, transferCostPerLeg, priceTable, extraDayPrice } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (pricePerDay != null) data.pricePerDay = pricePerDay;
    if (active != null) data.active = active;
    if (minDays !== undefined) data.minDays = minDays;
    if (maxDays !== undefined) data.maxDays = maxDays;
    if (durationDiscounts !== undefined) data.durationDiscounts = durationDiscounts;
    if (description !== undefined) data.description = description;
    if (transferIncluded != null) data.transferIncluded = transferIncluded;
    if (transferCostPerLeg !== undefined) data.transferCostPerLeg = transferCostPerLeg;
    if (priceTable !== undefined) data.priceTable = priceTable;
    if (extraDayPrice !== undefined) data.extraDayPrice = extraDayPrice;

    // Freno: no dejar sin precio la tarifa que cobra la web (ver web-tariff-guard).
    const current = await prisma.servicePricing.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json({ error: "Tarifa no encontrada" }, { status: 404 });
    }
    // Una tarifa por destino: a las filas que la web no usa sólo se las puede apagar.
    const nonWeb = await nonWebTariffEditError(current, body);
    if (nonWeb) {
      return NextResponse.json({ error: nonWeb }, { status: 409 });
    }
    const blocked = await webTariffChangeError(current.destination, current.serviceType, current, {
      active: data.active ?? current.active,
      pricePerDay: data.pricePerDay ?? current.pricePerDay,
      priceTable: data.priceTable !== undefined ? data.priceTable : current.priceTable,
      extraDayPrice: data.extraDayPrice !== undefined ? data.extraDayPrice : current.extraDayPrice,
    });
    if (blocked) {
      return NextResponse.json({ error: blocked }, { status: 409 });
    }

    const pricing = await prisma.servicePricing.update({
      where: { id },
      data,
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error updating pricing:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
