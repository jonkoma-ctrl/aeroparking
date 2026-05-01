/**
 * Seed inicial de catálogos editables.
 *
 * Idempotente: usa upsert por slug. Correr cada vez que querés asegurar que
 * los datos base existen en la DB.
 *
 * Comando: npm run db:seed
 *
 * Nota: los precios de Tariff están como placeholders ($0). Cuando llegue
 * la respuesta del requirente sobre estadía/½ estadía y precio por destino,
 * actualizar estos valores acá o desde /admin/configuracion/tarifas.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Destinos ──────────────────────────────────────────────────────────────
  const destinations = [
    {
      slug: "aeroparque",
      name: "Aeroparque Jorge Newbery",
      description:
        "Servicio de estacionamiento y traslado a Aeroparque. Dejás tu auto en Costa Salguero, te llevamos al aeropuerto y te buscamos al regreso.",
      order: 1,
    },
    {
      slug: "ezeiza",
      name: "Aeropuerto de Ezeiza",
      description:
        "Servicio de estacionamiento y traslado al Aeropuerto Internacional de Ezeiza. Traslado ida y vuelta incluido.",
      order: 2,
    },
    {
      slug: "cruceros",
      name: "Terminal de Cruceros",
      description:
        "Servicio de estacionamiento y traslado a la Terminal de Cruceros de Buenos Aires. Tu auto seguro mientras estás de viaje.",
      order: 3,
    },
  ];

  for (const dest of destinations) {
    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: { name: dest.name, description: dest.description, order: dest.order },
      create: { ...dest, active: true },
    });
  }

  // ─── Tarifas (placeholder hasta confirmación del requirente) ───────────────
  const allDestinations = await prisma.destination.findMany();
  for (const dest of allDestinations) {
    await prisma.tariff.upsert({
      where: { destinationId: dest.id },
      update: {},
      create: {
        destinationId: dest.id,
        pricePerStay: 0, // pendiente respuesta requirente (ronda 2)
        priceHalfStay: 0,
      },
    });
  }

  // ─── Tipos de vehículo ─────────────────────────────────────────────────────
  const vehicleTypes = [
    { slug: "auto_chico", name: "Auto chico / sedán", order: 1 },
    { slug: "suv", name: "SUV", order: 2 },
    { slug: "camioneta", name: "Camioneta / pick-up", order: 3 },
    { slug: "otro", name: "Otro", order: 4 },
  ];

  for (const vt of vehicleTypes) {
    await prisma.vehicleType.upsert({
      where: { slug: vt.slug },
      update: { name: vt.name, order: vt.order },
      create: { ...vt, active: true },
    });
  }

  // ─── Settings (singleton) ──────────────────────────────────────────────────
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      reservationLeadHours: 24,
      cancelPolicy:
        "Como el pago se realiza al dejar el vehículo, cancelar antes del ingreso no tiene costo. Si dejás el vehículo y luego te cancelan el vuelo, contás con 3 horas para retirarlo sin cargo. Pasado ese tiempo se cobra la estadía o queda imputada como crédito para tu próximo viaje.",
      adminNotifyEmail: "reservas@nrauditores.com.ar",
      contactPhone: "11 3160 6994",
    },
  });

  console.log("✅ Seed completo: destinos, tarifas (placeholder), tipos de vehículo, settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
