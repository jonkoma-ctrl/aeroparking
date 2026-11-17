import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/** Cierre de la portada: bloque azul limpio (sin foto ni texturas). */
export function CTA() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="container-main">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-600 px-6 py-14 text-center shadow-elevated sm:px-12 md:py-20">
          {/* Dos líneas celestes, como las del logo */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-accent-400" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-3 h-1 bg-accent-400/50" aria-hidden="true" />

          <div className="relative mx-auto max-w-3xl">
            <Reveal>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-accent-300 text-accent-300" />
                  ))}
                </div>
                <span className="text-xs font-semibold text-white/90 tabular-nums sm:text-sm">4.8/5 · +2.000 reservas</span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h2 className="font-display text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white text-balance">
                Tu próximo viaje empieza en <span className="text-accent-200">BA Ferial</span>.
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/85 text-pretty sm:text-lg">
                Reservá y pagá en 2 minutos. Te llevamos, te traemos y volvés a casa sin esperas.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/reservar"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-soft transition-transform hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
                >
                  Reservar ahora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="https://wa.me/5491131606994"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white ring-1 ring-white/40 transition-colors hover:bg-white/10 sm:w-auto"
                >
                  <MessageCircle className="h-5 w-5" />
                  Hablar por WhatsApp
                </Link>
              </div>
            </Reveal>

            <Reveal delay={280}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/80 sm:text-sm">
                {["Devolución del 100 % hasta 24 h antes", "Sin cargos ocultos", "Seguro incluido"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-accent-300" />
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
