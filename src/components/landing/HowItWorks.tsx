import { CalendarCheck, Car, Plane, Smile, Clock } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: CalendarCheck,
    title: "Reservá online",
    description: "Elegí destino, fechas y horarios. 2 minutos y listo.",
    time: "2 min",
  },
  {
    n: "02",
    icon: Car,
    title: "Llegás a Costa Salguero",
    description: "Te recibe el personal uniformado, registra tu auto y te subís al traslado.",
    time: "5 min",
  },
  {
    n: "03",
    icon: Plane,
    title: "Te dejamos en el aeropuerto",
    description: "Aeroparque, Ezeiza o Cruceros. Mientras viajás, tu auto queda bajo techo con cámaras.",
    time: "15 min",
  },
  {
    n: "04",
    icon: Smile,
    title: "Volvés y tu auto te espera",
    description: "Avisanos por WhatsApp al aterrizar. Te buscamos y volvés a casa sin esperas.",
    time: "Al regresar",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section-padding bg-brand-50">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            El proceso
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-brand-900 text-balance sm:text-4xl lg:text-5xl">
            Es así de fácil
          </h2>
          <p className="mt-3 text-base text-brand-600 sm:text-lg">
            Sin formularios largos. Sin filas. Sin estrés. Empieza a relajarte desde que dejás el auto.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <div
              key={step.n}
              className="group relative overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              {/* Número de fondo */}
              <span
                className="pointer-events-none absolute -right-2 -top-4 font-display text-[100px] font-extrabold leading-none text-brand-50 select-none"
                aria-hidden="true"
              >
                {step.n}
              </span>

              <div className="relative">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-900 text-accent-400 shadow-soft transition-transform group-hover:scale-110">
                  <step.icon className="h-6 w-6" />
                </div>

                <h3 className="font-display text-lg font-bold leading-tight text-brand-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-600">
                  {step.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
                  <Clock className="h-3 w-3" />
                  {step.time}
                </div>
              </div>

              {/* Flecha conectora (desktop) */}
              {index < steps.length - 1 && (
                <span
                  className="pointer-events-none absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-soft lg:flex"
                  aria-hidden="true"
                >
                  <svg className="h-3 w-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
