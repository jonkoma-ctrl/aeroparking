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
    const { destination, serviceType, pricePerDay, description } = await req.json();

    if (!destination || !serviceType || pricePerDay == null) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const pricing = await prisma.servicePricing.upsert({
      where: {
        destination_serviceType: { destination, serviceType },
      },
      update: { pricePerDay, description, active: true },
      create: { destination, serviceType, pricePerDay, description },
    });

    return NextResponse.json(pricing);
  } catch (error) {
    console.error("Error saving pricing:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/admin/pricing — Update price by id
export async function PATCH(req: NextRequest) {
  try {
    const { id, pricePerDay, active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (pricePerDay != null) data.pricePerDay = pricePerDay;
    if (active != null) data.active = active;

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
