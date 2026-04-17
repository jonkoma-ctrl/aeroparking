import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

// POST /api/admin/pricing — Create or update pricing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      destination, serviceType, pricePerDay, description,
      isReference, externalCheckoutUrl, minDays, maxDays, durationDiscounts,
    } = body;

    if (!destination || !serviceType || pricePerDay == null) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseData: any = { pricePerDay, description, active: true };
    if (isReference != null) baseData.isReference = isReference;
    if (externalCheckoutUrl !== undefined) baseData.externalCheckoutUrl = externalCheckoutUrl;
    if (minDays !== undefined) baseData.minDays = minDays;
    if (maxDays !== undefined) baseData.maxDays = maxDays;
    if (durationDiscounts !== undefined) baseData.durationDiscounts = durationDiscounts;

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
    const { id, pricePerDay, active, isReference, externalCheckoutUrl, minDays, maxDays, durationDiscounts, description } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (pricePerDay != null) data.pricePerDay = pricePerDay;
    if (active != null) data.active = active;
    if (isReference != null) data.isReference = isReference;
    if (externalCheckoutUrl !== undefined) data.externalCheckoutUrl = externalCheckoutUrl;
    if (minDays !== undefined) data.minDays = minDays;
    if (maxDays !== undefined) data.maxDays = maxDays;
    if (durationDiscounts !== undefined) data.durationDiscounts = durationDiscounts;
    if (description !== undefined) data.description = description;

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
