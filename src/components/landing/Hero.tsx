import Link from "next/link";
import {
  Shield,
  Clock,
  Camera,
  BadgePercent,
  Plane,
  Ship,
  Bus,
  Car,
  Train,
  ArrowRight,
  Star,
} from "lucide-react";
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
  blue: "hover:border-blue-300/70",
  sky: "hover:border-sky-300/70",
  violet: "hover:border-violet-300/70",
  amber: "hover:border-amber-300/70",
  emerald: "hover:border-emerald-300/70",
  rose: "hover:border-rose-300/70",
  indigo: "hover:border-indigo-300/70",
};

const ACCENT_BG: Record<string, string> = {
  blue: "bg-blue-500",
  sky: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  indigo: "bg-indigo-500",
};

export async function Hero() {
  const [settings, destinations] = await Promise.all([
    getSiteSettings(),
    listActiveDestinations(),
  ]);

  const heroImage = settings.heroImageUrl;
  const heroAlt = settings.heroImageAlt || "Estacionamiento Aeroparking en Costa Salguero";
  const title = settings.heroTitle;
  const subtitle = settings.heroSubtitle;

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden bg-brand-950 flex items-center">
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
      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/90 via-brand-950/70 to-brand-950/95" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/60 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" aria-hidden="true" />

      <div className="container-main relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Micro-trust badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-accent-500/15 px-4 py-1.5 text-xs font-semibold text-accent-200 backdrop-blur-sm sm:text-sm">
            <BadgePercent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Costa Salguero · Traslado incluido · Atención 24h
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
            {title || (
              <>
                Tu auto, en{" "}
                <span className="text-accent-400">buenas manos</span>.
                <br className="hidden sm:block" />
                <span className="block text-3xl font-bold text-brand-100/95 sm:text-4xl lg:text-5xl mt-2 sm:mt-4">
                  Empezás las vacaciones desde que lo dejás.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-brand-100/90 text-balance sm:text-lg">
            {subtitle ||
              "Estacionamiento propio en Costa Salguero con traslado directo a Aeroparque, Ezeiza y Terminal de Cruceros. Personal uniformado, seguro y cámaras 24h."}
          </p>

          {/* CTA principal */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10">
            <Link
              href="/reservar"
              className="group inline-flex items-center gap-2 rounded-2xl bg-accent-400 px-8 py-4 text-base font-bold text-brand-950 shadow-elevated transition-all hover:bg-accent-300 hover:scale-[1.02] sm:text-lg"
            >
              Reservar ahora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="https://wa.me/5491131606994"
              className="inline-flex items-center gap-1.5 text-sm text-brand-200 underline decoration-brand-300/60 underline-offset-4 transition hover:text-white hover:decoration-white"
            >
              ¿Dudas? Consultanos por WhatsApp
            </a>
          </div>

          {/* Stats overlay — la clave de confianza */}
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md sm:gap-6 sm:p-5">
            <StatItem
              value="+2.000"
              label="viajeros"
              sub="confiaron en nosotros"
            />
            <StatItem
              value="4.8"
              label="★ rating"
              sub="reseñas reales"
              hasStars
            />
            <StatItem value="24/7" label="atención" sub="los 365 días" />
          </div>

          {/* Destinos quick-pick */}
          <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300 sm:text-xs">
            ¿A dónde viajás?
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 sm:max-w-3xl sm:mx-auto">
            {destinations.slice(0, 3).map((d) => (
              <DestinationChip key={d.slug} dest={d} />
            ))}
          </div>
        </div>

        {/* Trust ribbon */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <TrustItem icon={Shield} label="Seguro incluido" sub="Cobertura total" />
            <TrustItem icon={Camera} label="Cámaras 24h" sub="Vigilancia continua" />
            <TrustItem icon={Clock} label="Auto listo" sub="Apenas regresás" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({
  value,
  label,
  sub,
  hasStars = false,
}: {
  value: string;
  label: string;
  sub: string;
  hasStars?: boolean;
}) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-extrabold text-white sm:text-3xl">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider text-accent-300 sm:text-sm">
        {label}
      </div>
      {hasStars && (
        <div className="mt-0.5 flex justify-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-2.5 w-2.5 fill-accent-400 text-accent-400 sm:h-3 sm:w-3" />
          ))}
        </div>
      )}
      <div className="mt-1 text-[10px] text-brand-300 sm:text-[11px]">{sub}</div>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-5 w-5 text-accent-400 sm:h-6 sm:w-6" />
      <span className="text-xs font-bold text-white sm:text-sm">{label}</span>
      <span className="hidden text-[10px] text-brand-300 sm:block sm:text-[11px]">{sub}</span>
    </div>
  );
}

function DestinationChip({ dest }: { dest: DestinationMeta }) {
  const Icon = ICON_BY_KEY[dest.iconKey] ?? Plane;
  const hoverClass = ACCENT_HOVER[dest.accentColor] ?? ACCENT_HOVER.blue;
  const iconBg = ACCENT_BG[dest.accentColor] ?? ACCENT_BG.blue;

  return (
    <Link
      href={`/reservar?destino=${dest.slug}`}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-left backdrop-blur-sm transition-all hover:scale-[1.02] ${hoverClass}`}
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
      <div className="absolute inset-0 bg-gradient-to-r from-brand-950/40 to-transparent" />
      <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="relative min-w-0 flex-1">
        <span className="block text-sm font-extrabold text-white">{dest.shortLabel}</span>
        <span className="text-[10px] text-brand-200 sm:text-xs">{dest.label.split("—")[0].trim()}</span>
      </div>
      <ArrowRight className="relative h-4 w-4 text-brand-200 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
