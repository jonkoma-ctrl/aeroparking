import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export function CTA() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1920&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-brand-950/85" />

      <div className="container-main relative z-10 px-4 py-20 text-center sm:px-6 md:py-28 lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Reservá hoy. Viajá tranquilo.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-brand-300">
          Atención las 24 horas. Pago al dejar el vehículo.
          Reservá online o llamanos.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/reservar"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 px-10 py-4 text-lg font-bold text-brand-950 shadow-xl shadow-accent-500/30 transition-all hover:bg-accent-400 hover:shadow-accent-500/50 hover:scale-[1.03] sm:w-auto"
          >
            Reservar online
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href={`tel:+${CONTACT.whatsapp}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-10 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20 sm:w-auto"
          >
            <Phone className="h-5 w-5" />
            {CONTACT.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
