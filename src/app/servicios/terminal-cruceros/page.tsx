import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES, BRAND_NAME } from "@/lib/constants";
import { ServiceSteps } from "@/components/services/ServiceSteps";
import { ServiceFeatures } from "@/components/services/ServiceFeatures";
import { BookingWidget } from "@/components/booking-widget/BookingWidget";
import { Ship, ArrowRight } from "lucide-react";

const service = SERVICES.cruises;

export const metadata: Metadata = {
  title: `${service.name} — ${BRAND_NAME}`,
  description: service.description,
};

export default function TerminalCrucerosPage() {
  return (
    <div className="section-padding">
      <div className="container-main">
        {/* Page header */}
        <div className="mb-10">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <Ship className="h-6 w-6 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">
            {service.name}
          </h1>
          <p className="mt-2 text-lg text-brand-500">{service.tagline}</p>
        </div>

        {/* Quick quote widget */}
        <div className="mb-10">
          <BookingWidget
            variant="compact"
            defaultDestino="puerto"
            defaultServiceType="puerto_cruceros"
            entryPoint="service_terminal_cruceros"
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left: Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-brand-900">
                Parking + traslado a la terminal de cruceros
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">
                Dejá tu auto en nuestro parking vigilado 24hs y nosotros te
                trasladamos hasta la terminal de cruceros de Buenos Aires.
                Al regresar de tu crucero, coordinamos tu retiro para que
                tu vehículo te espere listo.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-500">
                Paso a paso
              </h4>
              <ServiceSteps steps={service.steps} />
            </div>

            <ServiceFeatures features={service.features} />
          </div>

          {/* Right: CTA Card */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-violet-100 bg-violet-50 p-8">
              <h3 className="text-xl font-bold text-brand-900">
                Reservá tu lugar
              </h3>
              <p className="mt-2 text-sm text-brand-600">
                Completá el formulario con tus datos de viaje y vehículo.
                Te confirmamos la reserva por email.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Parking vigilado 24hs",
                  "Traslado incluido al puerto",
                  "Estadías flexibles",
                  "Sin costos ocultos",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-brand-700"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="/reservar/cruceros"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 py-4 font-semibold text-white transition-colors hover:bg-brand-800"
              >
                Reservar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-4 text-center text-xs text-brand-400">
                Reserva sujeta a confirmación. Sin cargo hasta confirmar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
