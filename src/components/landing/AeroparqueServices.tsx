import {
  Plane,
  Car,
  Clock,
  ExternalLink,
  Check,
  Zap,
  CalendarDays,
  BadgePercent,
  TrendingDown,
} from "lucide-react";
import { EXTERNAL_URLS } from "@/lib/constants";

export function AeroparqueServices() {
  return (
    <section id="aeroparque" className="section-padding relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="container-main">
        {/* Section header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <Plane className="h-4 w-4" />
            Aeroparque Jorge Newbery
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Elegí cómo estacionar en Aeroparque
          </h2>
          <p className="mt-3 text-brand-500">
            Dos opciones según tu tipo de viaje. Ambas al{" "}
            <strong className="text-accent-600">mejor precio del mercado</strong>.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          {/* VALET PARKING */}
          <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-all hover:shadow-2xl">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://tienda.aeropuertosargentina.com/aeroparque/wp-content/uploads/2023/05/dropgoaep.png"
                alt="Drop & Go — Valet Parking Aeroparque"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />

              {/* Badges on image */}
              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-bold text-brand-950 shadow-lg">
                <TrendingDown className="h-3.5 w-3.5" />
                Mejor precio
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-lg backdrop-blur-sm">
                <Zap className="mr-1 inline h-3 w-3" />
                Rápido
              </div>

              {/* Title on image */}
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-white" />
                  <h3 className="text-xl font-extrabold text-white">Drop & Go</h3>
                </div>
                <p className="text-xs text-blue-200">Valet Parking Aeroparque</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="text-sm leading-relaxed text-brand-600">
                Llegás a Aeroparque, entregás las llaves en el punto indicado y
                nuestro personal estaciona tu auto. Al volver, tu vehículo te
                espera listo. <strong>Sin vueltas.</strong>
              </p>

              {/* Steps mini */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  "Llegás a Aeroparque",
                  "Entregás las llaves",
                  "Volás tranquilo",
                  "Retirás al volver",
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      {i + 1}
                    </span>
                    <span className="text-xs text-brand-600">{step}</span>
                  </div>
                ))}
              </div>

              <ul className="mt-5 space-y-2">
                {[
                  "Entrega en puerta del aeropuerto",
                  "Personal especializado",
                  "Reserva anticipada online",
                  "Seguro incluido",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-brand-700">
                    <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <a
                  href={EXTERNAL_URLS.valet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:scale-[1.01]"
                >
                  Reservar Valet Parking
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-2 text-center text-[11px] text-brand-400">
                  Se abre en el sistema oficial de Aeropuertos Argentina
                </p>
              </div>
            </div>
          </div>

          {/* LARGA ESTADÍA */}
          <div className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-md transition-all hover:shadow-2xl">
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80"
                alt="Estacionamiento cubierto vigilado"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent" />

              <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-bold text-brand-950 shadow-lg">
                <TrendingDown className="h-3.5 w-3.5" />
                Mejor precio
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-lg backdrop-blur-sm">
                <CalendarDays className="mr-1 inline h-3 w-3" />
                4 a 14 días
              </div>

              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-white" />
                  <h3 className="text-xl font-extrabold text-white">Larga Estadía</h3>
                </div>
                <p className="text-xs text-emerald-200">Estacionamiento + Transfer incluido</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="text-sm leading-relaxed text-brand-600">
                Dejá tu auto en Costa Salguero y tomá el transfer incluido
                hasta Aeroparque. Al regresar, el transfer te lleva de vuelta.
                <strong> Ideal para viajes de 4 a 14 días.</strong>
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  "Dejás el auto",
                  "Transfer a Aeroparque",
                  "Viajás tranquilo",
                  "Transfer de vuelta",
                ].map((step, i) => (
                  <div key={step} className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <span className="text-xs text-brand-600">{step}</span>
                  </div>
                ))}
              </div>

              <ul className="mt-5 space-y-2">
                {[
                  "Estadías de 4 a 14 días",
                  "Transfer ida y vuelta incluido",
                  "Parking vigilado 24hs",
                  "Reserva anticipada online",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-brand-700">
                    <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                <a
                  href={EXTERNAL_URLS.longStay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-xl hover:scale-[1.01]"
                >
                  Reservar Larga Estadía
                  <ExternalLink className="h-4 w-4" />
                </a>
                <p className="mt-2 text-center text-[11px] text-brand-400">
                  Se abre en el sistema oficial de Aeropuertos Argentina
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison + price promise */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="rounded-2xl border border-accent-200 bg-gradient-to-r from-accent-50 to-amber-50 p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-100">
                <BadgePercent className="h-6 w-6 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-brand-900">
                  Garantía de mejor precio
                </p>
                <p className="mt-1 text-xs text-brand-500">
                  Ofrecemos los precios más competitivos del mercado. Si encontrás un precio menor,
                  lo igualamos.{" "}
                  <strong>Drop & Go</strong> para viajes cortos, <strong>Larga Estadía</strong> para 4+ días con transfer incluido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
