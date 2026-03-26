import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { Shield, Clock, MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-950">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-500/10 via-transparent to-transparent" />

      <div className="container-main relative z-10 px-4 pb-20 pt-20 sm:px-6 md:pb-28 md:pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-700 bg-brand-800/50 px-4 py-1.5 text-sm text-brand-200">
            <Shield className="h-4 w-4 text-accent-400" />
            Parking seguro con traslado incluido
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Estacioná tranquilo.{" "}
            <span className="text-accent-400">Viajá sin preocupaciones.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-300 md:text-xl">
            Servicios de parking y traslados para Aeroparque y Terminal de
            Cruceros. Dejá tu auto en buenas manos y disfrutá tu viaje.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/#servicios"
              className="w-full rounded-xl bg-accent-500 px-8 py-4 text-center font-semibold text-brand-950 shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 hover:shadow-accent-500/40 sm:w-auto"
            >
              Ver servicios
            </Link>
            <Link
              href="/reservar/cruceros"
              className="w-full rounded-xl border border-brand-600 px-8 py-4 text-center font-semibold text-white transition-colors hover:border-brand-400 hover:bg-brand-800 sm:w-auto"
            >
              Reservar cruceros
            </Link>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              label: "Parking vigilado 24hs",
            },
            {
              icon: Clock,
              label: "Reserva en minutos",
            },
            {
              icon: MapPin,
              label: "Traslado incluido",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-center gap-3 text-sm text-brand-300"
            >
              <item.icon className="h-5 w-5 text-accent-400" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
