import Link from "next/link";
import { Shield, Clock, MapPin, Star, BadgePercent, Plane, Ship } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-brand-950 flex items-center">
      {/* Background image */}
      <img
        src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiLRRz6M8aujZyPeO9sj5UATUV_oNdGTojo_yBYG2zAuyQVoKq533RQEf4ak08pWbvo1sy7MvzQ7S6DBuv3vxu3cawTYYp2JSFL5-NEk18MGkhLEjud1Bdq_F-90i_S54uB9BflYGsPdKFVBU3-k-fMOxNhz-HePsZUox5PdG6IehaV8lk5Z6DJkmUY9Pk/s1600/IMG-20240710-WA0038.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-950/70 to-brand-950/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/60 to-transparent" />

      <div className="container-main relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-500/20 px-5 py-2 text-sm font-semibold text-accent-300 backdrop-blur-sm">
            <BadgePercent className="h-4 w-4" />
            Estacionamiento propio · Traslado incluido
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Estacioná seguro.
            <br />
            <span className="bg-gradient-to-r from-accent-400 via-accent-300 to-yellow-300 bg-clip-text text-transparent">
              Viajá sin preocupaciones.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-200 sm:text-xl">
            Estacionamiento propio en Costa Salguero con traslado incluido a{" "}
            <strong className="text-white">Aeroparque</strong>,{" "}
            <strong className="text-white">Ezeiza</strong> y{" "}
            <strong className="text-white">Terminal de Cruceros</strong>.
            Atención las 24 horas.
          </p>

          {/* Destination selector */}
          <p className="mt-8 text-sm font-medium uppercase tracking-widest text-brand-400">
            Elegí tu destino
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3 sm:max-w-3xl sm:mx-auto">
            <Link
              href="/reservar?destino=aeroparque"
              className="group flex items-center gap-4 rounded-2xl border-2 border-white/15 bg-white/10 px-5 py-5 text-left backdrop-blur-sm transition-all hover:border-blue-400/50 hover:bg-blue-500/20 hover:scale-[1.03]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/80">
                <Plane className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white">Aeroparque</span>
                <span className="text-xs text-blue-200">Jorge Newbery</span>
              </div>
            </Link>

            <Link
              href="/reservar?destino=ezeiza"
              className="group flex items-center gap-4 rounded-2xl border-2 border-white/15 bg-white/10 px-5 py-5 text-left backdrop-blur-sm transition-all hover:border-sky-400/50 hover:bg-sky-500/20 hover:scale-[1.03]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-500/80">
                <Plane className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white">Ezeiza</span>
                <span className="text-xs text-sky-200">Aeropuerto Internacional</span>
              </div>
            </Link>

            <Link
              href="/reservar?destino=cruceros"
              className="group flex items-center gap-4 rounded-2xl border-2 border-white/15 bg-white/10 px-5 py-5 text-left backdrop-blur-sm transition-all hover:border-violet-400/50 hover:bg-violet-500/20 hover:scale-[1.03]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/80">
                <Ship className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="block text-lg font-extrabold text-white">Cruceros</span>
                <span className="text-xs text-violet-200">Terminal Buenos Aires</span>
              </div>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-accent-400 text-accent-400" />
              ))}
              <span className="ml-2 text-sm text-brand-300">
                Servicio avalado por nuestra experiencia
              </span>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mx-auto mt-14 max-w-3xl rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "Seguridad 24hs", sub: "Vehículos propios" },
              { icon: Clock, label: "Atención 24/7", sub: "Personal calificado" },
              { icon: MapPin, label: "Traslado incluido", sub: "Sin costo extra" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 text-center"
              >
                <item.icon className="h-6 w-6 text-accent-400" />
                <span className="text-xs font-semibold text-white sm:text-sm">
                  {item.label}
                </span>
                <span className="hidden text-[11px] text-brand-400 sm:block">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
