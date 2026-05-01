"use client";

import { Plane, Ship, Truck } from "lucide-react";
import Link from "next/link";

const destinations = [
  {
    slug: "aeroparque",
    name: "Aeroparque",
    subtitle: "Jorge Newbery",
    description:
      "A 5 minutos del aeropuerto. Te recibimos, estacionamos tu auto y te trasladamos. A tu regreso, te buscamos.",
    image:
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLRRz6M8aujZyPeO9sj5UATUV_oNdGTojo_yBYG2zAuyQVoKq533RQEf4ak08pWbvo1sy7MvzQ7S6DBuv3vxu3cawTYYp2JSFL5-NEk18MGkhLEjud1Bdq_F-90i_S54uB9BflYGsPdKFVBU3-k-fMOxNhz-HePsZUox5PdG6IehaV8lk5Z6DJkmUY9Pk/s1600/IMG-20240710-WA0038.jpg",
    icon: Plane,
    accent: "blue",
  },
  {
    slug: "ezeiza",
    name: "Ezeiza",
    subtitle: "Aeropuerto Internacional",
    description:
      "Olvidate del estacionamiento del aeropuerto. Te llevamos cómodamente y te buscamos al regreso. Ideal para viajes largos.",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Aeropuerto_Internacional_de_Ezeiza_-_Terminal_A.jpg/1200px-Aeropuerto_Internacional_de_Ezeiza_-_Terminal_A.jpg",
    icon: Plane,
    accent: "sky",
  },
  {
    slug: "cruceros",
    name: "Terminal de Cruceros",
    subtitle: "Puerto de Buenos Aires",
    description:
      "Dejá tu auto seguro mientras estás de viaje. Te trasladamos a la terminal y te esperamos cuando vuelvas.",
    image:
      "https://www.cronista.com/resizer/v2/L3YSXJLA2JCINILIDSFOXV6KPE.jpg?auth=507cbc1ca9b88afd772181a0ffb9349a408709904b339198a2d4a533db0b409c&height=899&width=1200&quality=70&smart=true",
    icon: Ship,
    accent: "violet",
  },
];

const accentClasses: Record<string, { gradient: string; iconBg: string; textHover: string; cta: string }> = {
  blue: {
    gradient: "from-blue-950/90 via-blue-950/40 to-transparent",
    iconBg: "bg-blue-500/80",
    textHover: "text-blue-200",
    cta: "text-blue-700 group-hover:bg-blue-50",
  },
  sky: {
    gradient: "from-sky-950/90 via-sky-950/40 to-transparent",
    iconBg: "bg-sky-500/80",
    textHover: "text-sky-200",
    cta: "text-sky-700 group-hover:bg-sky-50",
  },
  violet: {
    gradient: "from-violet-950/90 via-violet-950/40 to-transparent",
    iconBg: "bg-violet-500/80",
    textHover: "text-violet-200",
    cta: "text-violet-700 group-hover:bg-violet-50",
  },
};

export function ServiceSelector() {
  return (
    <section id="servicios" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
            ¿A dónde viajás?
          </h2>
          <p className="mt-3 text-lg text-brand-500">
            Cubrimos los tres destinos principales con traslado incluido.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          {destinations.map((dest) => {
            const styles = accentClasses[dest.accent];
            const Icon = dest.icon;
            return (
              <Link
                key={dest.slug}
                href={`/reservar?destino=${dest.slug}`}
                className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${styles.gradient}`} />

                <div className="relative z-10 p-6 sm:p-8">
                  <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${styles.iconBg} backdrop-blur-sm`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-white sm:text-3xl">
                    {dest.name}
                  </h3>
                  <p className={`text-sm font-medium ${styles.textHover}`}>
                    {dest.subtitle}
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
                    {dest.description}
                  </p>

                  <div className={`mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold ${styles.cta} shadow-lg transition-all group-hover:shadow-xl`}>
                    Reservar
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Valet eventos */}
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-brand-900">
                Valet Parking para eventos
              </h3>
              <p className="mt-1 text-sm text-brand-600">
                Personal propio uniformado para galas, fiestas, shows y eventos privados. Cotizamos cada caso.
              </p>
            </div>
            <Link
              href="/valet-eventos"
              className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Cotizar
            </Link>
          </div>
          <Link
            href="/valet-eventos"
            className="sm:hidden mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Cotizar evento
          </Link>
        </div>
      </div>
    </section>
  );
}
