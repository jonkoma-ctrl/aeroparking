import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { PricingRow } from "./PricingRow";
import { AddPricingForm } from "./AddPricingForm";
import { webServiceTypeFor } from "@/lib/web-tariff";

export const metadata: Metadata = {
  title: `Admin — Tarifas — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

export default async function AdminTarifasPage() {
  const [pricing, activeDestinations] = await Promise.all([
    prisma.servicePricing.findMany({
      orderBy: [{ destination: "asc" }, { serviceType: "asc" }],
    }),
    prisma.destination.findMany({
      where: { active: true },
      select: { slug: true, iconKey: true },
    }),
  ]);
  // Fila que cobra la reserva online de cada destino activo (misma regla que el formulario).
  const webTypeBySlug = new Map(activeDestinations.map((d) => [d.slug, webServiceTypeFor(d.iconKey)]));

  const destLabels: Record<string, string> = {
    aeroparque: "Aeroparque",
    puerto: "Cruceros (Quinquela Martín)",
  };
  const serviceLabels: Record<string, string> = {
    drop_go: "Drop & Go",
    larga_estadia: "Larga Estadía",
    cruceros: "Cruceros",
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Tarifas</h1>
            <p className="mt-1 text-sm text-brand-500">
              Configurá el precio por día de cada servicio
            </p>
            <p className="mt-1 text-xs text-brand-500">
              Cargá los precios en la fila que dice <strong>«La usa la web»</strong>: es la que cobra la
              reserva online de ese destino. Las que dicen «No la usa la web» no cambian lo que paga el cliente.
            </p>
          </div>
        </div>

        {/* Add new tariff form */}
        <div className="mb-8 rounded-xl border border-brand-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-400">
            Agregar / actualizar tarifa
          </h2>
          <AddPricingForm />
        </div>

        {/* Existing tariffs */}
        {pricing.length === 0 ? (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 py-16 text-center">
            <p className="text-brand-400">No hay tarifas configuradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-200 text-xs font-semibold uppercase tracking-wider text-brand-500">
                  <th className="px-4 py-3">Destino</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Precio/día</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Actualizado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {pricing.map((p) => (
                  <PricingRow
                    key={p.id}
                    id={p.id}
                    destination={destLabels[p.destination] || p.destination}
                    serviceType={serviceLabels[p.serviceType] || p.serviceType}
                    usedByWeb={webTypeBySlug.get(p.destination) === p.serviceType}
                    pricePerDay={p.pricePerDay}
                    description={p.description}
                    active={p.active}
                    minDays={p.minDays}
                    maxDays={p.maxDays}
                    durationDiscounts={p.durationDiscounts as { fromDays: number; pctOff: number }[] | null}
                    transferIncluded={p.transferIncluded}
                    transferCostPerLeg={p.transferCostPerLeg}
                    priceTable={p.priceTable as { days: number; price: number }[] | null}
                    extraDayPrice={p.extraDayPrice}
                    updatedAt={formatDateTime(p.updatedAt)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
