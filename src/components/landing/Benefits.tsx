import {
  ShieldCheck,
  Camera,
  Truck,
  Headphones,
  Wallet,
  KeyRound,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Tu auto, totalmente cubierto",
    description:
      "Sector privado, bajo techo, con seguro de responsabilidad civil incluido desde el momento que dejás las llaves.",
  },
  {
    icon: Camera,
    title: "Vigilancia 24/7",
    description:
      "Cámaras de monitoreo continuo y personal en sede las 24 horas, los 365 días del año.",
  },
  {
    icon: Truck,
    title: "Traslado sin esperas",
    description:
      "Vehículos propios listos. Coordinamos el horario para que llegues con tiempo y sin estrés.",
  },
  {
    icon: KeyRound,
    title: "Tus llaves, tu tranquilidad",
    description:
      "Las llaves se guardan en una caja fuerte numerada con protocolo de entrega y retiro firmado.",
  },
  {
    icon: Wallet,
    title: "Sin sorpresas en el precio",
    description:
      "Pagás lo que te cotizamos. Traslado incluido (Aeroparque y Cruceros), sin cargos ocultos al regresar.",
  },
  {
    icon: Headphones,
    title: "WhatsApp directo",
    description:
      "Si tu vuelo se retrasa, nos avisás por WhatsApp y coordinamos el retiro. Una persona, no un bot.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="relative section-padding bg-brand-50">
      {/* Patrón sutil */}
      <div className="absolute inset-0 bg-dots-brand opacity-40" aria-hidden="true" />

      <div className="container-main relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              Por qué confiar en nosotros
            </p>
            <h2 className="font-display text-huge-2 text-brand-900 text-balance">
              No somos cualquier estacionamiento
            </h2>
            <p className="mt-4 text-base text-brand-600 text-pretty sm:text-lg">
              Más de 2.000 viajeros eligieron Aeroparking porque hacemos las cosas como las haríamos con nuestro propio auto.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <Reveal key={benefit.title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all duration-300 hover:border-brand-200 hover:shadow-elevated hover:-translate-y-1.5">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-accent-400 transition-all group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-cta">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold leading-tight text-brand-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-600">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Stats strip rediseñado */}
        <Reveal delay={200}>
          <div className="mt-16 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 shadow-elevated">
            <div className="relative bg-grid-brand bg-noise px-6 py-8 sm:px-10 sm:py-10">
              <div className="absolute inset-0 bg-stripes-accent opacity-100" aria-hidden="true" />
              <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
                {[
                  { value: "+2.000", label: "Viajeros atendidos" },
                  { value: "4.8★", label: "Rating promedio" },
                  { value: "24/7", label: "Atención" },
                  { value: "5 años", label: "Operando en BA" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-stat-xl font-display text-white tabular-nums">
                      {s.value}
                    </div>
                    <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-accent-300 sm:text-sm">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
