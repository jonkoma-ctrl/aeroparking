import Link from "next/link";
import {
  ShieldCheck,
  Camera,
  BadgePercent,
  Plane,
  Ship,
  Bus,
  Car,
  Train,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { listActiveDestinations, type DestinationMeta } from "@/lib/destinos";
import { Reveal } from "@/components/ui/Reveal";

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
  const heroAlt = settings.heroImageAlt || "Estacionamiento Aeroparking en BA Ferial (ex Costa Salguero)";
  const customTitle = settings.heroTitle;
  const customSubtitle = settings.heroSubtitle;

  return (
    <section className="relative isolate min-h-[94vh] overflow-hidden bg-brand-950 flex items-center pt-8 pb-20 sm:pt-12 sm:pb-24">
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
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/95 via-brand-950/75 to-brand-950" />
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/70 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-mesh-hero opacity-60 mix-blend-soft-light" aria-hidden="true" />
      <div className="absolute inset-0 bg-grid-brand opacity-50" aria-hidden="true" />
      <div className="absolute inset-0 bg-noise opacity-[0.06] mix-blend-overlay" aria-hidden="true" />

      <div className="container-main relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Badge — alineado izquierda sutil (no centrado) en desktop */}
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-accent-500/15 px-3.5 py-1.5 text-xs font-semibold text-accent-200 backdrop-blur-sm shadow-inner-soft sm:px-4 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              BA Ferial · Frente al río · 24h
            </div>
          </Reveal>

          {/* Title — huge type */}
          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-white text-balance sm:mt-6">
              Tu auto, en{" "}
              <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-uniform-500 bg-clip-text text-transparent">
                buenas manos
              </span>
              .
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-brand-100/85 text-pretty sm:text-lg lg:text-xl">
              {customSubtitle ||
                "Estacioná en BA Ferial (ex Costa Salguero) y volá tranquilo. Sector cubierto, vigilancia 24h, traslado en nuestras unidades a Aeroparque, Ezeiza o Cruceros."}
            </p>
          </Reveal>

          {/* CTAs — alineados a la izquierda */}
          <Reveal delay={200}>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="/reservar"
                className="group inline-flex items-center gap-2 rounded-2xl bg-cta-gradient px-7 py-4 text-base font-bold text-brand-950 shadow-cta transition-all hover:shadow-cta-hover hover:scale-[1.03] active:scale-[0.98] sm:text-lg"
              >
                Reservar ahora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://wa.me/5491131606994"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 sm:text-base"
              >
                ¿Dudas? WhatsApp
                <ArrowRight className="h-4 w-4 opacity-60" />
              </a>
            </div>
          </Reveal>

          {/* Quick stats — inline, no card */}
          <Reveal delay={280}>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:max-w-2xl sm:gap-8 sm:pt-8">
              <StatBlock value="+2.000" label="Viajeros" sub="atendidos" />
              <StatBlock value="4.8★" label="Rating" sub="reseñas reales" />
              <StatBlock value="24h" label="Atención" sub="los 365 días" />
            </dl>
          </Reveal>

          {/* Destinos — más compactos, alineados */}
          <Reveal delay={360}>
            <div className="mt-10 sm:mt-12">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-300 sm:text-xs">
                ¿A dónde viajás?
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3 sm:max-w-3xl">
                {destinations.slice(0, 3).map((d, i) => (
                  <Reveal key={d.slug} delay={400 + i * 80}>
                    <DestinationChip dest={d} />
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Trust ribbon — full width abajo */}
        <Reveal delay={500}>
          <div className="mt-12 sm:mt-16">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <TrustItem icon={ShieldCheck} label="Seguro incluido" sub="Cobertura total" />
                <TrustItem icon={Camera} label="Cámaras 24h" sub="Sector privado monitoreado" />
                <TrustItem icon={BadgePercent} label="Sin sorpresas" sub="Pagás lo cotizado" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Hidden non-Hero overlap on bottom */}
      {customTitle && <span className="sr-only">{customTitle}</span>}
    </section>
  );
}

function StatBlock({ value, label, sub }: { value: string; label: string; sub: string }) {
  return (
    <div>
      <div className="text-stat-xl font-display text-white tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent-300 sm:text-xs">
        {label}
      </div>
      <div className="text-[10px] text-brand-300 sm:text-[11px]">{sub}</div>
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
    <div className="flex items-center gap-2.5 text-left">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 text-accent-300 ring-1 ring-accent-300/20 sm:h-10 sm:w-10">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>
      <div>
        <div className="text-xs font-bold leading-tight text-white sm:text-sm">{label}</div>
        <div className="hidden text-[10px] text-brand-300 sm:block sm:text-[11px]">{sub}</div>
      </div>
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
      className={`group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] px-3 py-3 text-left backdrop-blur-sm transition-all hover:scale-[1.02] hover:bg-white/[0.1] ${hoverClass}`}
    >
      {dest.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dest.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15 transition-opacity duration-500 group-hover:opacity-25"
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
      <ArrowRight className="relative h-4 w-4 text-brand-300 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-300" />
    </Link>
  );
}
