"use client";

import { Plane, Ship, BadgePercent } from "lucide-react";
import Link from "next/link";

export function ServiceSelector() {
  return (
    <section id="servicios" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl lg:text-5xl">
            ¿A dónde viajás?
          </h2>
          <p className="mt-3 text-lg text-brand-500">
            Elegí tu destino y te mostramos el servicio ideal para vos.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2">
          {/* AEROPARQUE CARD */}
          <Link
            href="#aeroparque"
            className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            {/* Background image */}
            <img
              src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLRRz6M8aujZyPeO9sj5UATUV_oNdGTojo_yBYG2zAuyQVoKq533RQEf4ak08pWbvo1sy7MvzQ7S6DBuv3vxu3cawTYYp2JSFL5-NEk18MGkhLEjud1Bdq_F-90i_S54uB9BflYGsPdKFVBU3-k-fMOxNhz-HePsZUox5PdG6IehaV8lk5Z6DJkmUY9Pk/s1600/IMG-20240710-WA0038.jpg"
              alt="Aeroparque Jorge Newbery"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/40 to-transparent" />

            {/* Price badge */}
            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-bold text-brand-950 shadow-lg">
              <BadgePercent className="h-3.5 w-3.5" />
              Mejor precio
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 sm:p-8">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/80 backdrop-blur-sm">
                <Plane className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-3xl font-extrabold text-white">
                Aeroparque
              </h3>
              <p className="text-sm font-medium text-blue-200">
                Jorge Newbery &middot; 2 servicios disponibles
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-blue-100/80">
                Valet Parking o Larga Estadía con transfer incluido. Volá sin preocuparte por el auto.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-lg transition-all group-hover:bg-blue-50 group-hover:shadow-xl">
                Ver opciones
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* CRUCEROS CARD */}
          <Link
            href="#cruceros"
            className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
          >
            <img
              src="https://www.cronista.com/resizer/v2/L3YSXJLA2JCINILIDSFOXV6KPE.jpg?auth=507cbc1ca9b88afd772181a0ffb9349a408709904b339198a2d4a533db0b409c&height=899&width=1200&quality=70&smart=true"
              alt="Terminal de Cruceros Buenos Aires"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-950/90 via-violet-950/40 to-transparent" />

            <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-bold text-brand-950 shadow-lg">
              <BadgePercent className="h-3.5 w-3.5" />
              Mejor precio
            </div>

            <div className="relative z-10 p-6 sm:p-8">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/80 backdrop-blur-sm">
                <Ship className="h-7 w-7 text-white" />
              </div>

              <h3 className="text-3xl font-extrabold text-white">
                Cruceros
              </h3>
              <p className="text-sm font-medium text-violet-200">
                Terminal de Buenos Aires &middot; Reserva directa
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-violet-100/80">
                Dejá tu auto seguro y te llevamos al puerto. Disfrutá tu crucero sin complicaciones.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-violet-700 shadow-lg transition-all group-hover:bg-violet-50 group-hover:shadow-xl">
                Reservar ahora
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
