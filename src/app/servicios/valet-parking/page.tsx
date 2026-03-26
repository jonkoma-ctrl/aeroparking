import type { Metadata } from "next";
import { SERVICES, BRAND_NAME } from "@/lib/constants";
import { ExternalBookingSection } from "@/components/services/ExternalBookingSection";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFeatures } from "@/components/services/ServiceFeatures";
import { Car } from "lucide-react";

const service = SERVICES.valet;

export const metadata: Metadata = {
  title: `${service.name} — ${BRAND_NAME}`,
  description: service.description,
};

function ValetFallbackContent() {
  return (
    <div className="space-y-8">
      {/* Service intro */}
      <div>
        <h3 className="text-lg font-bold text-brand-900">
          ¿Qué es el Valet Parking de Aeroparque?
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-brand-600">
          El servicio de Valet Parking te permite entregar tu vehículo
          directamente en Aeroparque Jorge Newbery. El personal especializado
          retira tu auto, lo estaciona de forma segura y lo tiene listo para
          cuando regreses.
        </p>
      </div>

      {/* Steps */}
      <div>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
          Cómo funciona
        </h4>
        <ServiceSteps steps={service.steps} />
      </div>

      {/* What you'll need */}
      <div className="rounded-xl bg-blue-50 p-5">
        <h4 className="text-sm font-semibold text-blue-900">
          Datos que vas a necesitar para la reserva:
        </h4>
        <ul className="mt-3 grid gap-2 text-sm text-blue-800 sm:grid-cols-2">
          {[
            "Patente del vehículo",
            "Marca y modelo",
            "Cantidad de pasajeros",
            "Línea aérea",
            "Número de vuelo",
            "Horario de arribo estimado",
            "Horario de ingreso",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Features */}
      <ServiceFeatures features={service.features} />
    </div>
  );
}

export default function ValetParkingPage() {
  return (
    <div className="section-padding">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Car className="h-6 w-6 text-blue-600" />
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
          fallbackContent={<ValetFallbackContent />}
        />
      </div>
    </div>
  );
}
