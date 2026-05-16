import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950/95 via-brand-950/85 to-brand-900/90" />
      <div className="absolute inset-0 bg-grid-brand opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay" aria-hidden="true" />

      <div className="container-main relative z-10 px-4 py-20 sm:px-6 md:py-28 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-300/40 bg-accent-500/15 px-4 py-1.5 backdrop-blur-sm">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-accent-200 tabular-nums sm:text-sm">
                4.8/5 · +2.000 reservas
              </span>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h2 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] font-extrabold leading-[1] tracking-[-0.035em] text-white text-balance">
              Tu próximo viaje empieza en{" "}
              <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-uniform-500 bg-clip-text text-transparent">
                Costa Salguero
              </span>
              .
            </h2>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-brand-200/90 text-pretty sm:text-lg">
              Reservá en 2 minutos. Pagás cuando dejás el auto. Y volvés a casa sin esperas, garantizado.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <Link
                href="/reservar"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cta-gradient px-8 py-4 text-base font-bold text-brand-950 shadow-cta transition-all hover:shadow-cta-hover hover:scale-[1.03] sm:w-auto sm:text-lg"
              >
                Reservar ahora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="https://wa.me/5491131606994"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20 sm:w-auto"
              >
                <MessageCircle className="h-5 w-5" />
                Hablar por WhatsApp
              </Link>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-brand-200 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-400" />
                Cancelación gratis antes de dejar el auto
              </span>
              <span className="hidden text-brand-500 sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-400" />
                Sin cargos ocultos
              </span>
              <span className="hidden text-brand-500 sm:inline">·</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-400" />
                Seguro incluido
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
