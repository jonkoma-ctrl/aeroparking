/**
 * Seed inicial de destinos. Idempotente (upsert por slug).
 * Ejecutar: npx tsx scripts/seed-destinations.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DestinationSeed {
  slug: string;
  label: string;
  shortLabel: string;
  iconKey: string;
  accentColor: string;
  description: string;
  sortOrder: number;
}

const DESTINATIONS: DestinationSeed[] = [
  {
    slug: "aeroparque",
    label: "Aeroparque Jorge Newbery",
    shortLabel: "Aeroparque",
    iconKey: "plane",
    accentColor: "blue",
    description: "Estacionamiento en Costa Salguero con traslado incluido a Aeroparque (4 km).",
    sortOrder: 10,
  },
  {
    slug: "ezeiza",
    label: "Aeropuerto de Ezeiza",
    shortLabel: "Ezeiza",
    iconKey: "plane",
    accentColor: "sky",
    description: "Estacionamiento en Costa Salguero con traslado a Ezeiza ($40k por tramo).",
    sortOrder: 20,
  },
  {
    slug: "puerto",
    label: "Terminal de Cruceros — Puerto de Buenos Aires",
    shortLabel: "Cruceros",
    iconKey: "ship",
    accentColor: "violet",
    description: "Estacionamiento en Costa Salguero con traslado incluido a la Terminal de Cruceros.",
    sortOrder: 30,
  },
];

async function main() {
  console.log("Seeding destinations...\n");
  for (const d of DESTINATIONS) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {
        label: d.label,
        shortLabel: d.shortLabel,
        iconKey: d.iconKey,
        accentColor: d.accentColor,
        description: d.description,
        sortOrder: d.sortOrder,
        active: true,
      },
      create: d,
    });
    console.log(`✓ ${d.slug} → ${d.label}`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
