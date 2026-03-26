import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="section-padding bg-brand-900">
      <div className="container-main text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ¿Listo para viajar sin preocupaciones?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-300">
          Reservá tu lugar ahora y empezá tu viaje con la tranquilidad de saber
          que tu auto está en buenas manos.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/#servicios"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-8 py-4 font-semibold text-brand-950 shadow-lg shadow-accent-500/25 transition-all hover:bg-accent-400 sm:w-auto"
          >
            Ver servicios
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/reservar/cruceros"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-brand-800 sm:w-auto"
          >
            Reservar para cruceros
          </Link>
        </div>
      </div>
    </section>
  );
}
