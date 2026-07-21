import { CalendarCheck, Car, Plane, Smile, Clock } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    n: "01",
    icon: CalendarCheck,
    title: "Reservá online",
    description: "Elegí destino, fechas y horarios. En 2 minutos te llega la confirmación al mail.",
    time: "2 min",
  },
  {
    n: "02",
    icon: Car,
    title: "Llegás a BA Ferial (ex Costa Salguero)",
    description: "Te recibe el personal, registra tu vehículo y guarda las llaves en caja fuerte.",
    time: "5–10 min",
  },
  {
    n: "03",
    icon: Plane,
    title: "Te llevamos al destino",
    description: "Aeroparque o Cruceros: 15 min. Ezeiza: 45–60 min según tráfico. Coordinamos para llegar con tiempo.",
    time: "Según destino",
  },
  {
    n: "04",
    icon: Smile,
    title: "Volvés y tu auto te espera",
    description: "Avisanos por WhatsApp al aterrizar. Te buscamos en la terminal y volvés a casa sin esperas.",
    time: "Al regresar",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="relative section-padding bg-brand-50">
      {/* Patrón sutil de fondo */}
      <div className="absolute inset-0 bg-dots-brand opacity-50" aria-hidden="true" />

      <div className="container-main relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-500">
              El proceso
            </p>
            <h2 className="font-display text-huge-2 text-brand-900 text-balance">
              Es así de fácil
            </h2>
            <p className="mt-4 text-base text-brand-600 text-pretty sm:text-lg">
              Sin formularios largos, sin filas, sin estrés. Empieza a relajarte desde que dejás el auto.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <Reveal key={step.n} delay={index * 100}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all duration-300 hover:shadow-elevated hover:-translate-y-1.5 hover:border-brand-200">
                {/* Número de fondo XL */}
                <span
                  className="pointer-events-none absolute -right-4 -top-8 font-display text-[140px] font-black leading-none text-brand-50 select-none transition-colors group-hover:text-accent-100/60"
                  aria-hidden="true"
                >
                  {step.n}
                </span>

                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-accent-400 shadow-soft transition-transform group-hover:scale-110 group-hover:rotate-3">
                    <step.icon className="h-6 w-6" />
                  </div>

                  <h3 className="font-display text-lg font-bold leading-tight text-brand-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-600">
                    {step.description}
                  </p>

                  <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand-900/5 px-2.5 py-1 text-[11px] font-semibold text-brand-700 ring-1 ring-brand-900/5">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </div>
                </div>

                {/* Flecha conectora desktop */}
                {index < steps.length - 1 && (
                  <span
                    className="pointer-events-none absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-soft ring-1 ring-brand-100 lg:flex"
                    aria-hidden="true"
                  >
                    <svg className="h-3 w-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
