import { prisma } from "@/lib/db";
import {
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
