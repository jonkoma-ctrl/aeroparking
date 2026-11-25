import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { TariffCard } from "./TariffCard";
import { TurnOffButton } from "./TurnOffButton";
import { tariffQuotesOneDay, webServiceTypeFor } from "@/lib/web-tariff";

export const metadata: Metadata = {
  title: `Admin — Tarifas — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

/**
 * Una tarjeta por destino con SU tarifa: la fila que cobra la web
 * (webServiceTypeFor). El operador no elige fila (incidente 25-nov-2026: se
 * cargó la grilla de cruceros en una fila que la web no usaba). Las demás filas
 * quedan abajo, plegadas y de sólo lectura; la API también las rechaza.
 */
export default async function AdminTarifasPage() {
  const [pricing, destinations] = await Promise.all([
    prisma.servicePricing.findMany({
      orderBy: [{ destination: "asc" }, { serviceType: "asc" }],
    }),
    prisma.destination.findMany({
      orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { label: "asc" }],
      select: { slug: true, label: true, iconKey: true, active: true },
    }),
  ]);

  const webRowIds = new Set<string>();
  const cards = destinations.map((d) => {
    const serviceType = webServiceTypeFor(d.iconKey);
    const row = pricing.find((p) => p.destination === d.slug && p.serviceType === serviceType) ?? null;
    if (row) webRowIds.add(row.id);
    return { dest: d, row };
  });
  const staleRows = pricing.filter((p) => !webRowIds.has(p.id));
  const labelBySlug = new Map(destinations.map((d) => [d.slug, d.label]));

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-900">Tarifas</h1>
          <p className="mt-1 text-sm text-brand-500">
            Cada destino tiene una sola tarifa: la que cobra la web. Los cambios se aplican al instante;
            las reservas ya hechas mantienen el precio que pagaron.
          </p>
          <p className="mt-1 text-xs text-brand-500">
            Para dejar de vender un destino, apagalo en <a href="/admin/destinos" className="underline">Destinos</a>.
            Para sumar uno nuevo, crealo en Destinos, cargale el precio acá y después activalo.
          </p>
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 py-16 text-center">
            <p className="text-brand-400">No hay destinos. Crealos en Destinos.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map(({ dest, row }) => (
              <TariffCard
                key={dest.slug}
                slug={dest.slug}
                destinationLabel={dest.label}
                destinationActive={dest.active}
                quotes={tariffQuotesOneDay(row)}
                tariff={
                  row
                    ? {
                        id: row.id,
                        pricePerDay: row.pricePerDay,
                        description: row.description,
                        active: row.active,
                        durationDiscounts: row.durationDiscounts as { fromDays: number; pctOff: number }[] | null,
                        transferIncluded: row.transferIncluded,
                        transferCostPerLeg: row.transferCostPerLeg,
                        priceTable: row.priceTable as { days: number; price: number }[] | null,
                        extraDayPrice: row.extraDayPrice,
                        updatedAt: formatDateTime(row.updatedAt),
                      }
                    : null
                }
              />
            ))}
          </div>
        )}

        {staleRows.length > 0 && (
          <details className="mt-8 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <summary className="cursor-pointer text-sm font-medium text-brand-600">
              Tarifas viejas que la web no usa ({staleRows.length})
            </summary>
            <p className="mt-2 text-xs text-brand-500">
              No cambian lo que paga el cliente y no se pueden editar. Si alguna está activa, se puede apagar.
            </p>
            <table className="mt-3 w-full text-left text-xs">
              <thead>
                <tr className="text-brand-400">
                  <th className="py-1 pr-3">Destino</th>
                  <th className="py-1 pr-3">Fila</th>
                  <th className="py-1 pr-3">Precio/día</th>
                  <th className="py-1 pr-3">Estado</th>
                  <th className="py-1"></th>
                </tr>
              </thead>
              <tbody className="text-brand-600">
                {staleRows.map((p) => (
                  <tr key={p.id}>
                    <td className="py-1 pr-3">{labelBySlug.get(p.destination) || p.destination}</td>
                    <td className="py-1 pr-3 font-mono">{p.serviceType}</td>
                    <td className="py-1 pr-3 font-mono">{formatPrice(p.pricePerDay)}</td>
                    <td className="py-1 pr-3">{p.active ? "Activa" : "Apagada"}</td>
                    <td className="py-1">{p.active && <TurnOffButton id={p.id} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>
    </div>
  );
}
