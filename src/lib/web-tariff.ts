import { priceForDays, type DbServiceType, type PriceTier } from "@/lib/pricing";

/**
 * Qué fila de ServicePricing cobra la reserva online de cada destino.
 *
 * Es la misma regla que usa el formulario de reserva (PresentialBookingForm):
 * los destinos con ícono de barco cobran con "cruceros"; el resto, con
 * "larga_estadia". Si se cambia acá, cambia en el formulario, en el freno del
 * panel de tarifas y en la alarma.
 *
 * Archivo sin acceso a la base: lo importa también el formulario del cliente.
 */
export function webServiceTypeFor(iconKey: string): DbServiceType {
  return iconKey === "ship" ? "cruceros" : "larga_estadia";
}

export interface TariffPriceFields {
  active: boolean;
  pricePerDay: number;
  priceTable: unknown;
  extraDayPrice: number | null;
}

/** true si la tarifa está activa y cotiza más de $0 para 1 día. */
export function tariffQuotesOneDay(t: TariffPriceFields | null | undefined): boolean {
  if (!t || !t.active) return false;
  const table = Array.isArray(t.priceTable) ? (t.priceTable as PriceTier[]) : null;
  return priceForDays(1, table, t.extraDayPrice, t.pricePerDay) > 0;
}

/** Mensaje del freno del panel de tarifas. */
export function webTariffBlockedMessage(destinationLabel: string): string {
  return `Esta es la tarifa que cobra la web para ${destinationLabel}. Si la apagás o la dejás sin precios, nadie puede reservar ese destino.`;
}
