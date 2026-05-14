/**
 * Seed/update tarifas con el nuevo modelo de estadías.
 *
 * Reglas (operador, may 2026):
 *  - $40.000 por estadía (24h, primera indivisible). Media estadía $20.000.
 *  - Aeroparque (drop_go + larga_estadia) → tarifa de referencia, redirige a AA2000
 *  - Puerto larga_estadia + cruceros → $40k, traslado incluido
 *  - Ezeiza larga_estadia → $40k + $40k por tramo de traslado (no incluido)
 *
 * Ejecutar: npx tsx scripts/seed-tariffs.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TariffSeed {
  destination: string;
  serviceType: string;
  pricePerDay: number;
  description: string;
  isReference?: boolean;
  externalCheckoutUrl?: string | null;
  transferIncluded: boolean;
  transferCostPerLeg?: number | null;
}

const TARIFFS: TariffSeed[] = [
  // Aeroparque (referencia AA2000)
  {
    destination: "aeroparque",
    serviceType: "drop_go",
    pricePerDay: 40000,
    description: "Drop & Go en Aeroparque. Reserva vía AA2000.",
    isReference: true,
    externalCheckoutUrl: process.env.NEXT_PUBLIC_VALET_URL || null,
    transferIncluded: true,
  },
  {
    destination: "aeroparque",
    serviceType: "larga_estadia",
    pricePerDay: 40000,
    description: "Larga estadía Aeroparque. Reserva vía AA2000.",
    isReference: true,
    externalCheckoutUrl: process.env.NEXT_PUBLIC_LONG_STAY_URL || null,
    transferIncluded: true,
  },
  // Puerto (Costa Salguero)
  {
    destination: "puerto",
    serviceType: "larga_estadia",
    pricePerDay: 40000,
    description: "Estacionamiento en Costa Salguero + traslado Puerto BA.",
    isReference: false,
    transferIncluded: true,
  },
  {
    destination: "puerto",
    serviceType: "cruceros",
    pricePerDay: 40000,
    description: "Estacionamiento Costa Salguero + traslado terminal cruceros.",
    isReference: false,
    transferIncluded: true,
  },
  // Ezeiza (traslado pago)
  {
    destination: "ezeiza",
    serviceType: "ezeiza_larga_estadia",
    pricePerDay: 40000,
    description: "Estacionamiento Costa Salguero + traslado opcional a Ezeiza ($40k por tramo).",
    isReference: false,
    transferIncluded: false,
    transferCostPerLeg: 40000,
  },
];

async function main() {
  console.log("Seeding tariffs...\n");
  for (const t of TARIFFS) {
    const result = await prisma.servicePricing.upsert({
      where: { destination_serviceType: { destination: t.destination, serviceType: t.serviceType } },
      update: {
        pricePerDay: t.pricePerDay,
        description: t.description,
        isReference: t.isReference || false,
        externalCheckoutUrl: t.externalCheckoutUrl || null,
        transferIncluded: t.transferIncluded,
        transferCostPerLeg: t.transferCostPerLeg ?? null,
        active: true,
      },
      create: {
        destination: t.destination,
        serviceType: t.serviceType,
        pricePerDay: t.pricePerDay,
        description: t.description,
        isReference: t.isReference || false,
        externalCheckoutUrl: t.externalCheckoutUrl || null,
        transferIncluded: t.transferIncluded,
        transferCostPerLeg: t.transferCostPerLeg ?? null,
        active: true,
      },
    });
    console.log(`✓ ${t.destination}/${t.serviceType} → $${t.pricePerDay.toLocaleString("es-AR")}/estadía${t.transferIncluded ? " (traslado incluido)" : ` + $${t.transferCostPerLeg?.toLocaleString("es-AR")}/tramo`}${t.isReference ? " [REFERENCIA]" : ""}`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
