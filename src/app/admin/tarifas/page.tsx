import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { PricingRow } from "./PricingRow";
import { AddPricingForm } from "./AddPricingForm";

export const metadata: Metadata = {
  title: `Admin — Tarifas — ${BRAND_NAME}`,
};

export const dynamic = "force-dynamic";

export default async function AdminTarifasPage() {
  const pricing = await prisma.servicePricing.findMany({
    orderBy: [{ destination: "asc" }, { serviceType: "asc" }],
  });

  const destLabels: Record<string, string> = {
    aeroparque: "Aeroparque",
    puerto: "Puerto de BA",
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
                    pricePerDay={p.pricePerDay}
                    description={p.description}
                    active={p.active}
                    isReference={p.isReference}
                    externalCheckoutUrl={p.externalCheckoutUrl}
                    minDays={p.minDays}
                    maxDays={p.maxDays}
                    durationDiscounts={p.durationDiscounts as { fromDays: number; pctOff: number }[] | null}
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
