import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  calculateQuote,
  recommendCheapestService,
  validateBookingDates,
  type PricingRule,
  type Destino,
  type ServiceType,
  type DurationDiscount,
} from "@/lib/pricing";

type PrismaPricing = {
  id: string;
  destination: string;
  serviceType: string;
  pricePerDay: number;
  description: string | null;
  active: boolean;
  isReference: boolean;
  externalCheckoutUrl: string | null;
  minDays: number | null;
  maxDays: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  durationDiscounts: any;
};

function toRule(row: PrismaPricing): PricingRule {
  return {
    id: row.id,
    destination: row.destination as Destino,
    serviceType: row.serviceType as ServiceType,
    pricePerDay: row.pricePerDay,
    isReference: row.isReference,
    externalCheckoutUrl: row.externalCheckoutUrl,
    minDays: row.minDays,
    maxDays: row.maxDays,
    durationDiscounts: (row.durationDiscounts as DurationDiscount[] | null) || [],
    description: row.description,
  };
}

// GET /api/pricing/quote?destino=puerto&serviceType=puerto_larga_estadia&ingreso=2026-05-01&retiro=2026-05-10
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destino = searchParams.get("destino") as Destino | null;
    const serviceType = searchParams.get("serviceType") as ServiceType | null;
    const ingresoStr = searchParams.get("ingreso");
    const retiroStr = searchParams.get("retiro");

    if (!destino || !ingresoStr || !retiroStr) {
      return NextResponse.json(
        { error: "Faltan parámetros: destino, ingreso, retiro" },
        { status: 400 }
      );
    }

    const ingreso = new Date(ingresoStr);
    const retiro = new Date(retiroStr);

    const validation = validateBookingDates(ingreso, retiro, {
      minDays: 1,
      maxDays: 90,
    });
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.message, field: validation.field },
        { status: 400 }
      );
    }

    const pricingRows = (await prisma.servicePricing.findMany({
      where: { active: true },
    })) as PrismaPricing[];

    const rules = pricingRows.map(toRule);

    if (serviceType) {
      const rule = rules.find((r) => r.serviceType === serviceType);
      if (!rule) {
        return NextResponse.json({ error: "Servicio no disponible" }, { status: 404 });
      }
      const quote = calculateQuote({ destino, serviceType, ingreso, retiro }, rule);
      return NextResponse.json({ quote });
    }

    const recommendation = recommendCheapestService(
      { destino, ingreso, retiro },
      rules
    );
    if (!recommendation) {
      return NextResponse.json(
        { error: "No hay servicios disponibles para esas fechas" },
        { status: 404 }
      );
    }
    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
