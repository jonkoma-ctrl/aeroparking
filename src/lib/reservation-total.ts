import { prisma } from "@/lib/db";
import { calculateDays, priceForDays, type PriceTier } from "@/lib/pricing";

/**
 * Total de una reserva según la tarifa vigente del destino/servicio.
 * Es la única cuenta que se usa para cobrar: la llama el endpoint que crea
 * la reserva y el que muestra el total en el resumen del formulario.
 *
 * - Con grilla de precios: precio del tramo por días calendario.
 * - Sin grilla: días calendario × precio (el día de retiro cubre hasta las 23:59).
 * Devuelve 0 si no hay tarifa activa.
 */
export async function reservationTotalFor(
  destination: string,
  serviceType: string,
  start: Date,
  end: Date
): Promise<number> {
  const tariff = await prisma.servicePricing.findFirst({
    where: { destination, serviceType, active: true },
  });
  if (!tariff) return 0;
  const table = (tariff.priceTable as PriceTier[] | null) || null;
  if (Array.isArray(table) && table.length > 0) {
    return priceForDays(calculateDays(start, end), table, tariff.extraDayPrice, tariff.pricePerDay);
  }
  return Math.round(calculateDays(start, end) * tariff.pricePerDay);
}
