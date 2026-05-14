import { Plane, Ship, Bus, Car, Train, Truck } from "lucide-react";
import Link from "next/link";
import { listActiveDestinations, type DestinationMeta } from "@/lib/destinos";

const ICON_BY_KEY: Record<string, typeof Plane> = {
  plane: Plane,
  ship: Ship,
  bus: Bus,
  car: Car,
  train: Train,
};

const ACCENT_STYLES: Record<
  string,
  { gradient: string; iconBg: string; textHover: string; cta: string }
> = {
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
  amber: {
    gradient: "from-amber-950/90 via-amber-950/40 to-transparent",
    iconBg: "bg-amber-500/80",
    textHover: "text-amber-200",
    cta: "text-amber-700 group-hover:bg-amber-50",
  },
  emerald: {
    gradient: "from-emerald-950/90 via-emerald-950/40 to-transparent",
    iconBg: "bg-emerald-500/80",
    textHover: "text-emerald-200",
    cta: "text-emerald-700 group-hover:bg-emerald-50",
  },
  rose: {
    gradient: "from-rose-950/90 via-rose-950/40 to-transparent",
    iconBg: "bg-rose-500/80",
    textHover: "text-rose-200",
    cta: "text-rose-700 group-hover:bg-rose-50",
  },
  indigo: {
    gradient: "from-indigo-950/90 via-indigo-950/40 to-transparent",
    iconBg: "bg-indigo-500/80",
    textHover: "text-indigo-200",
    cta: "text-indigo-700 group-hover:bg-indigo-50",
  },
};

export async function ServiceSelector() {
  const destinations = await listActiveDestinations();

  return (
    <section id="servicios" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 text-balance sm:text-4xl lg:text-5xl">
            ¿A dónde viajás?
          </h2>
          <p className="mt-3 text-lg text-brand-500">
            {destinations.length === 3
              ? "Cubrimos los tres destinos principales con traslado incluido."
              : `Cubrimos ${destinations.length} destinos con traslado incluido.`}
          </p>
        </div>

        <div
          className={`mx-auto mt-10 grid max-w-6xl gap-6 ${
            destinations.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {destinations.map((dest) => (
            <DestinationCard key={dest.slug} dest={dest} />
          ))}
        </div>

        {/* Valet eventos */}
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
              <Truck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-brand-900">
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

function DestinationCard({ dest }: { dest: DestinationMeta }) {
  const Icon = ICON_BY_KEY[dest.iconKey] ?? Plane;
  const styles = ACCENT_STYLES[dest.accentColor] ?? ACCENT_STYLES.blue;
  const subtitle = dest.label.split("—")[1]?.trim() || dest.label.split("—")[0].trim();

  return (
    <Link
      href={`/reservar?destino=${dest.slug}`}
      className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl shadow-soft transition-all duration-300 hover:shadow-elevated hover:scale-[1.02]"
    >
      {dest.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dest.imageUrl}
          alt={dest.imageAlt || dest.label}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient}`} />
      )}
      <div className={`absolute inset-0 bg-gradient-to-t ${styles.gradient}`} />

      <div className="relative z-10 p-6 sm:p-8">
        <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${styles.iconBg} backdrop-blur-sm`}>
          <Icon className="h-7 w-7 text-white" />
        </div>

        <h3 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          {dest.shortLabel}
        </h3>
        <p className={`text-sm font-medium ${styles.textHover}`}>{subtitle}</p>
        {dest.description && (
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/80">
            {dest.description}
          </p>
        )}

        <div
          className={`mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold ${styles.cta} shadow-lg transition-all group-hover:shadow-xl`}
        >
          Reservar
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
