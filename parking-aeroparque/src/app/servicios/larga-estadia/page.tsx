import type { Metadata } from "next";
import { SERVICES, BRAND_NAME } from "@/lib/constants";
import { ExternalBookingSection } from "@/components/services/ExternalBookingSection";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFeatures } from "@/components/services/ServiceFeatures";
import { Clock } from "lucide-react";

const service = SERVICES.longStay;

export const metadata: Metadata = {
  title: `${service.name} — ${BRAND_NAME}`,
  description: service.description,
};

function LongStayFallbackContent() {
  return (
    <div className="space-y-8">
      {/* Service intro */}
      <div>
        <h3 className="text-lg font-bold text-brand-900">
          Estacionamiento Larga Estadía con Transfer
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-600">
          Dejá tu vehículo en el estacionamiento de Costa Salguero y tomá el
          transfer incluido hasta Aeroparque Jorge Newbery. Al regresar, el
          transfer te lleva de vuelta al parking donde te espera tu auto.
          Ideal para viajes de 4 a 14 días.
        </p>
      </div>

      {/* Key info */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Duración", value: "4 a 14 días" },
          { label: "Transfer", value: "Incluido ida y vuelta" },
          { label: "Ubicación", value: "Costa Salguero" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
              {item.label}
            </p>
            <p className="mt-1 text-base font-bold text-emerald-900">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
          Cómo funciona
        </h4>
        <ServiceSteps steps={service.steps} />
      </div>

      {/* Features */}
      <ServiceFeatures features={service.features} />

      {/* Note */}
      <div className="rounded-xl bg-amber-50 p-5">
        <p className="text-sm text-amber-800">
          <strong>Importante:</strong> La reserva y el pago se realizan a
          través del sistema oficial de Aeropuertos Argentina. Al hacer clic
          en &quot;Continuar reserva&quot; serás redirigido para completar el
          proceso.
        </p>
      </div>
    </div>
  );
}

export default function LargaEstadiaPage() {
  return (
    <div className="section-padding">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <Clock className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">
            {service.name}
          </h1>
          <p className="mt-2 text-lg text-brand-500">{service.tagline}</p>
        </div>

        {/* External booking integration */}
        <ExternalBookingSection
          externalUrl={service.externalUrl}
          serviceName={service.shortName}
          fallbackContent={<LongStayFallbackContent />}
        />
      </div>
    </div>
  );
}
