import {
  ShieldCheck,
  Camera,
  Truck,
  Headphones,
  Wallet,
  KeyRound,
} from "lucide-react";

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
    <section id="beneficios" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            Por qué confiar en nosotros
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 text-balance sm:text-4xl lg:text-5xl">
            No somos cualquier estacionamiento
          </h2>
          <p className="mt-3 text-base text-brand-600 sm:text-lg">
            Más de 2.000 viajeros eligieron Aeroparking porque hacemos las cosas como las haríamos con nuestro propio auto.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all hover:border-brand-200 hover:shadow-elevated hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-accent-400 transition-transform group-hover:scale-110">
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-brand-900">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 gap-6 rounded-2xl border border-brand-100 bg-brand-50 p-6 sm:grid-cols-4 sm:p-8">
          {[
            { value: "+2.000", label: "Viajeros atendidos" },
            { value: "4.8★", label: "Rating promedio" },
            { value: "24/7", label: "Atención" },
            { value: "5 años", label: "Operando en Buenos Aires" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-2xl font-extrabold text-brand-900 sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs font-medium text-brand-600 sm:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
