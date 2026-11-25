import { prisma } from "@/lib/db";
import { reservationTotalFor } from "@/lib/reservation-total";
import { webServiceTypeFor } from "@/lib/web-tariff";

export interface TariffCheck {
  slug: string;
  label: string;
  serviceType: string;
  startDate: string;
  endDate: string;
  total: number;
}

/** Fecha calendario en Argentina (UTC−3) desplazada `offsetDays`, como YYYY-MM-DD. */
function artDate(now: Date, offsetDays: number): string {
  const art = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  art.setUTCDate(art.getUTCDate() + offsetDays);
  return art.toISOString().slice(0, 10);
}

/**
 * Cotiza, para cada destino activo, una estadía de prueba de 7 días dentro de
 * 30 días con la misma cuenta y la misma tarifa que usa la reserva online.
 * Sólo lee la base. Un total 0 significa que la web muestra
 * "No hay tarifa para esas fechas" y nadie puede reservar ese destino.
 */
export async function checkWebTariffs(now: Date = new Date()): Promise<TariffCheck[]> {
  const destinations = await prisma.destination.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    select: { slug: true, label: true, iconKey: true },
  });
  const startDate = artDate(now, 30);
  const endDate = artDate(now, 37);
  // Mismo armado de fechas que /api/reservas/total y la reserva presencial.
  const start = new Date(`${startDate}T10:00`);
  const end = new Date(`${endDate}T10:00`);

  const results: TariffCheck[] = [];
  for (const d of destinations) {
    const serviceType = webServiceTypeFor(d.iconKey);
    const total = await reservationTotalFor(d.slug, serviceType, start, end);
    results.push({ slug: d.slug, label: d.label, serviceType, startDate, endDate, total });
  }
  return results;
}
