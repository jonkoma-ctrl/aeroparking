/**
 * Seed/update tarifas con el nuevo modelo de estadías.
 *
 * Reglas (operador, may 2026):
 *  - $40.000 por estadía (24h, primera indivisible). Media estadía $20.000.
 *  - TODAS las operaciones son propias — sin redirects a AA2000.
 *  - Puerto larga_estadia + cruceros → $40k, traslado incluido.
 *  - Ezeiza larga_estadia → $40k + $40k por tramo de traslado (no incluido).
 *  - Aeroparque larga_estadia → $40k, traslado incluido, OPERACIÓN PROPIA.
 *  - Aeroparque drop_go → desactivado por defecto (no operamos drop & go dentro
 *    del aeropuerto). Si querés ofrecerlo, prendelo desde /admin/tarifas.
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
  active?: boolean;
  isReference?: boolean;
  externalCheckoutUrl?: string | null;
  transferIncluded: boolean;
  transferCostPerLeg?: number | null;
}

const TARIFFS: TariffSeed[] = [
  // Aeroparque — operación propia (sin AA2000)
  {
    destination: "aeroparque",
    serviceType: "drop_go",
    pricePerDay: 40000,
    description: "Drop & Go en Aeroparque (no activo por defecto).",
    active: false,
    isReference: false,
    externalCheckoutUrl: null,
    transferIncluded: true,
  },
  {
    destination: "aeroparque",
    serviceType: "larga_estadia",
    pricePerDay: 40000,
    description: "Estacionamiento Costa Salguero + traslado a Aeroparque.",
    isReference: false,
    externalCheckoutUrl: null,
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
  // NOTA: serviceType es "larga_estadia" (no "ezeiza_larga_estadia"). El código
  // construye el serviceType público concatenando: `${destination}_${serviceType}`.
  {
    destination: "ezeiza",
    serviceType: "larga_estadia",
    pricePerDay: 40000,
    description: "Estacionamiento Costa Salguero + traslado opcional al aeropuerto (con cargo configurable).",
    isReference: false,
    transferIncluded: false,
    transferCostPerLeg: 40000,
  },
];

async function main() {
  console.log("Seeding tariffs...\n");

  // Cleanup: borrar tarifas legacy con el serviceType viejo "ezeiza_larga_estadia"
  // (era el formato anterior, ahora la convención es "larga_estadia" sin prefijo de destino).
  const legacy = await prisma.servicePricing.deleteMany({
    where: { destination: "ezeiza", serviceType: "ezeiza_larga_estadia" },
  });
  if (legacy.count > 0) {
    console.log(`🧹 Borradas ${legacy.count} tarifa(s) legacy ezeiza_larga_estadia\n`);
  }

  for (const t of TARIFFS) {
    await prisma.servicePricing.upsert({
      where: { destination_serviceType: { destination: t.destination, serviceType: t.serviceType } },
      update: {
        pricePerDay: t.pricePerDay,
        description: t.description,
        isReference: t.isReference || false,
        externalCheckoutUrl: t.externalCheckoutUrl || null,
        transferIncluded: t.transferIncluded,
        transferCostPerLeg: t.transferCostPerLeg ?? null,
        active: t.active ?? true,
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
        active: t.active ?? true,
      },
    });
    const status = t.active === false ? " [INACTIVA]" : "";
    console.log(
      `✓ ${t.destination}/${t.serviceType} → $${t.pricePerDay.toLocaleString("es-AR")}/estadía${
        t.transferIncluded ? " (traslado incluido)" : ` + $${t.transferCostPerLeg?.toLocaleString("es-AR")}/tramo`
      }${status}`
    );
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
