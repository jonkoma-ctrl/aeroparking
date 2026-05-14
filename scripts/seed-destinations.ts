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
  imageUrl?: string;
  imageAlt?: string;
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
    imageUrl: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1600&q=80",
    imageAlt: "Aeropuerto Jorge Newbery — Aeroparque",
  },
  {
    slug: "ezeiza",
    label: "Aeropuerto de Ezeiza",
    shortLabel: "Ezeiza",
    iconKey: "plane",
    accentColor: "sky",
    description: "Estacionamiento en Costa Salguero con traslado a Ezeiza ($40k por tramo).",
    sortOrder: 20,
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80",
    imageAlt: "Aeropuerto Internacional de Ezeiza",
  },
  {
    slug: "puerto",
    label: "Terminal de Cruceros — Puerto de Buenos Aires",
    shortLabel: "Cruceros",
    iconKey: "ship",
    accentColor: "violet",
    description: "Estacionamiento en Costa Salguero con traslado incluido a la Terminal de Cruceros.",
    sortOrder: 30,
    imageUrl: "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1600&q=80",
    imageAlt: "Terminal de Cruceros — Puerto de Buenos Aires",
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
        imageUrl: d.imageUrl ?? null,
        imageAlt: d.imageAlt ?? null,
        active: true,
      },
      create: {
        ...d,
        imageUrl: d.imageUrl ?? null,
        imageAlt: d.imageAlt ?? null,
      },
    });
    console.log(`✓ ${d.slug} → ${d.label}`);
  }
  console.log("\nDone.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
