import Link from "next/link";
import { Shield, Clock, MapPin, BadgePercent, Plane, Ship, Bus, Car, Train, ArrowRight } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { listActiveDestinations, type DestinationMeta } from "@/lib/destinos";

const ICON_BY_KEY: Record<string, typeof Plane> = {
  plane: Plane,
  ship: Ship,
  bus: Bus,
  car: Car,
  train: Train,
};

const ACCENT_HOVER: Record<string, string> = {
  blue: "hover:border-blue-300 hover:bg-blue-500/15",
  sky: "hover:border-sky-300 hover:bg-sky-500/15",
  violet: "hover:border-violet-300 hover:bg-violet-500/15",
  amber: "hover:border-amber-300 hover:bg-amber-500/15",
  emerald: "hover:border-emerald-300 hover:bg-emerald-500/15",
  rose: "hover:border-rose-300 hover:bg-rose-500/15",
  indigo: "hover:border-indigo-300 hover:bg-indigo-500/15",
};

const ACCENT_BG: Record<string, string> = {
  blue: "bg-blue-500/80",
  sky: "bg-sky-500/80",
  violet: "bg-violet-500/80",
  amber: "bg-amber-500/80",
  emerald: "bg-emerald-500/80",
  rose: "bg-rose-500/80",
  indigo: "bg-indigo-500/80",
};

const ACCENT_SUB: Record<string, string> = {
  blue: "text-blue-200",
  sky: "text-sky-200",
  violet: "text-violet-200",
  amber: "text-amber-200",
  emerald: "text-emerald-200",
  rose: "text-rose-200",
  indigo: "text-indigo-200",
};

export async function Hero() {
  const [settings, destinations] = await Promise.all([
    getSiteSettings(),
    listActiveDestinations(),
  ]);

  const heroImage = settings.heroImageUrl;
  const heroAlt = settings.heroImageAlt || "Estacionamiento Aeroparking en Costa Salguero";

  const title = settings.heroTitle || null;
  const subtitle = settings.heroSubtitle || null;

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-brand-950 flex items-center">
      {/* Background image */}
      {heroImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroImage}
          alt={heroAlt}
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />
      )}
      {/* Layered overlays — más sofisticado que un solo gradiente plano */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/85 via-brand-950/65 to-brand-950/95" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/50 via-transparent to-transparent" />
      {/* Noise texture sutil */}
      <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" aria-hidden="true" />

      <div className="container-main relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-accent-500/15 px-5 py-2 text-sm font-semibold text-accent-200 backdrop-blur-sm">
            <BadgePercent className="h-4 w-4" />
            Estacionamiento propio · Traslado incluido
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
            {title ? (
              title
            ) : (
              <>
                Estacioná seguro.
                <br />
                <span className="text-accent-400">Viajá sin preocupaciones.</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-100/90 text-balance sm:text-xl">
            {subtitle ? (
              subtitle
            ) : (
              <>
                Estacionamiento propio en Costa Salguero con traslado incluido a{" "}
                {destinations.slice(0, 3).map((d, i) => (
                  <span key={d.slug}>
                    <strong className="text-white">{d.shortLabel}</strong>
                    {i < Math.min(destinations.length, 3) - 1 ? (i === destinations.length - 2 ? " y " : ", ") : "."}
                  </span>
                ))}{" "}
                Atención las 24 horas.
              </>
            )}
          </p>

          {/* CTA principal */}
          <div className="mt-10 flex flex-col items-center justify-center gap-3">
            <Link
              href="/reservar"
              className="group inline-flex items-center gap-2 rounded-2xl bg-accent-400 px-7 py-4 text-base font-bold text-brand-950 shadow-elevated transition-all hover:bg-accent-300 hover:scale-[1.02]"
            >
              Reservar ahora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/5491131606994"
              className="inline-flex items-center gap-1.5 text-sm text-brand-200 underline decoration-brand-300/60 underline-offset-4 transition hover:text-white hover:decoration-white"
            >
              ¿Dudas? Consultanos por WhatsApp al 11 3160 6994
            </a>
          </div>

          {/* Destination selector */}
          <p className="mt-12 text-xs font-semibold uppercase tracking-widest text-brand-300">
            O elegí tu destino
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:max-w-3xl sm:mx-auto">
            {destinations.slice(0, 3).map((d) => (
              <DestinationChip key={d.slug} dest={d} />
            ))}
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
                <span className="hidden text-[11px] text-brand-200 sm:block">
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

function DestinationChip({ dest }: { dest: DestinationMeta }) {
  const Icon = ICON_BY_KEY[dest.iconKey] ?? Plane;
  const hoverClass = ACCENT_HOVER[dest.accentColor] ?? ACCENT_HOVER.blue;
  const iconBg = ACCENT_BG[dest.accentColor] ?? ACCENT_BG.blue;
  const subClass = ACCENT_SUB[dest.accentColor] ?? ACCENT_SUB.blue;

  return (
    <Link
      href={`/reservar?destino=${dest.slug}`}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-4 text-left backdrop-blur-sm transition-all hover:scale-[1.03] ${hoverClass}`}
    >
      {dest.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dest.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 transition-opacity group-hover:opacity-30"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/30 to-transparent" />
      <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="relative min-w-0">
        <span className="block text-base font-extrabold text-white">{dest.shortLabel}</span>
        <span className={`text-xs ${subClass}`}>{dest.label.split("—")[0].trim()}</span>
      </div>
    </Link>
  );
}
