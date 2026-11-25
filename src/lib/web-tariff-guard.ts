import { prisma } from "@/lib/db";
import {
  NON_WEB_TARIFF_MESSAGE,
  destinationNeedsTariffMessage,
  isWebTariffRow,
  tariffQuotesOneDay,
  webServiceTypeFor,
  webTariffBlockedMessage,
  type TariffPriceFields,
} from "@/lib/web-tariff";

/**
 * Freno del panel de tarifas (incidente 25-nov-2026: se apagó la fila
 * puerto/cruceros y se cargó la grilla en puerto/larga_estadia; la web cotizaba
 * $0 y nadie pudo reservar cruceros).
 *
 * Devuelve el mensaje de rechazo si el cambio deja sin precio a la tarifa que
 * cobra la web para un destino activo; null si el cambio se puede guardar.
 *
 * Sólo frena cuando el cambio EMPEORA: si la tarifa ya estaba rota antes,
 * cualquier paso (cargar la grilla, activarla) tiene que poder guardarse.
 */
export async function webTariffChangeError(
  destination: string,
  serviceType: string,
  before: TariffPriceFields | null,
  after: TariffPriceFields
): Promise<string | null> {
  const dest = await prisma.destination.findUnique({
    where: { slug: destination },
    select: { active: true, label: true, iconKey: true },
  });
  if (!dest || !dest.active) return null;
  if (webServiceTypeFor(dest.iconKey) !== serviceType) return null;
  if (tariffQuotesOneDay(after)) return null;
  if (!tariffQuotesOneDay(before)) return null;
  return webTariffBlockedMessage(dest.label);
}

/**
 * Una tarifa por destino (Jon, 25-nov-2026: "que el error no se pueda cometer").
 *
 * De las filas de ServicePricing, la única que se puede editar es la que cobra
 * la web para su destino (webServiceTypeFor). A cualquier otra fila sólo se la
 * puede apagar: así ni desde el panel ni por API se cargan precios en una fila
 * que no cambia lo que paga el cliente.
 *
 * Devuelve el mensaje de rechazo o null si se puede guardar.
 */
export async function nonWebTariffEditError(
  row: { destination: string; serviceType: string },
  body: Record<string, unknown>
): Promise<string | null> {
  const dest = await prisma.destination.findUnique({
    where: { slug: row.destination },
    select: { iconKey: true },
  });
  if (dest && isWebTariffRow(dest.iconKey, row.serviceType)) return null;
  const keys = Object.keys(body).filter((k) => k !== "id" && body[k] !== undefined);
  const onlyTurnOff = keys.length === 1 && keys[0] === "active" && body.active === false;
  return onlyTurnOff ? null : NON_WEB_TARIFF_MESSAGE;
}

/**
 * Para dar de alta (o pisar por POST) la tarifa de un destino: la fila la
 * decide el destino, nunca el operador. Si el que llama manda un serviceType
 * distinto al que usa la web, se rechaza.
 */
export async function webTariffTarget(
  destination: string,
  requestedServiceType: unknown
): Promise<{ serviceType: string; label: string } | { error: string; status: number }> {
  const dest = await prisma.destination.findUnique({
    where: { slug: destination },
    select: { iconKey: true, label: true },
  });
  if (!dest) return { error: "Ese destino no existe. Crealo primero en Destinos.", status: 400 };
  const serviceType = webServiceTypeFor(dest.iconKey);
  if (requestedServiceType != null && requestedServiceType !== "" && requestedServiceType !== serviceType) {
    return { error: NON_WEB_TARIFF_MESSAGE, status: 409 };
  }
  return { serviceType, label: dest.label };
}

/** true si la tarifa que cobra la web para ese destino/ícono está activa y cotiza. */
export async function destinationHasWebTariff(slug: string, iconKey: string): Promise<boolean> {
  const tariff = await prisma.servicePricing.findUnique({
    where: { destination_serviceType: { destination: slug, serviceType: webServiceTypeFor(iconKey) } },
    select: { active: true, pricePerDay: true, priceTable: true, extraDayPrice: true },
  });
  return tariffQuotesOneDay(tariff);
}

/**
 * Freno de /admin/destinos: un destino sólo puede quedar activo si su tarifa
 * web cotiza. Frena al activarlo y al cambiarle el ícono estando activo (el
 * ícono decide qué fila cobra la web).
 */
export async function destinationChangeError(
  current: { slug: string; label: string; iconKey: string; active: boolean },
  next: { active?: boolean; iconKey?: string; label?: string }
): Promise<string | null> {
  const active = next.active ?? current.active;
  const iconKey = next.iconKey ?? current.iconKey;
  if (!active) return null;
  const activating = !current.active;
  const webRowChanges = webServiceTypeFor(iconKey) !== webServiceTypeFor(current.iconKey);
  if (!activating && !webRowChanges) return null;
  if (await destinationHasWebTariff(current.slug, iconKey)) return null;
  const label = next.label || current.label;
  if (activating) return destinationNeedsTariffMessage(label);
  return `Con ese ícono la web cobraría ${label} con otra tarifa, que no tiene precios. Para cambiarlo: apagá el destino, cambiá el ícono, cargale la tarifa en Tarifas y volvé a activarlo.`;
}
