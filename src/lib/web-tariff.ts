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

/** true si `serviceType` es la fila que cobra la web para un destino con ese ícono. */
export function isWebTariffRow(iconKey: string, serviceType: string): boolean {
  return webServiceTypeFor(iconKey) === serviceType;
}

/** Mensaje del freno del panel de tarifas. */
export function webTariffBlockedMessage(destinationLabel: string): string {
  return `Esta es la tarifa que cobra la web para ${destinationLabel}. Si la apagás o la dejás sin precios, nadie puede reservar ese destino. Si querés dejar de vender ese destino, apagalo en Destinos.`;
}

/** Mensaje cuando se intenta activar un destino cuya tarifa web no cotiza. */
export function destinationNeedsTariffMessage(destinationLabel: string): string {
  return `Antes de activar ${destinationLabel}, cargale la tarifa en Tarifas.`;
}

/** Mensaje cuando se intenta cargar precios en una fila que la web no usa. */
export const NON_WEB_TARIFF_MESSAGE =
  "Esta tarifa no la usa la web: lo que cargues acá no cambia lo que paga el cliente. Cargá los precios en la tarjeta del destino en Tarifas. A esta fila sólo se la puede apagar.";
