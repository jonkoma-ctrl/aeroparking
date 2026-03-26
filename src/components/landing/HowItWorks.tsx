import { CalendarCheck, Car, Plane, Smile } from "lucide-react";

const steps = [
  {
    icon: CalendarCheck,
    title: "1. Reservá",
    description:
      "Elegí tu servicio y completá la reserva online en minutos.",
  },
  {
    icon: Car,
    title: "2. Dejá tu auto",
    description:
      "Llevá tu vehículo al punto indicado o entregalo al personal.",
  },
  {
    icon: Plane,
    title: "3. Viajá tranquilo",
    description:
      "Nosotros cuidamos tu auto. Incluimos traslado según el servicio.",
  },
  {
    icon: Smile,
    title: "4. Retirá al volver",
    description:
      "Coordinamos el retiro para que tu auto te espere listo.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section-padding bg-brand-50">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-4 text-lg text-brand-500">
            En 4 pasos simples, tu auto queda seguro y vos viajás sin estrés.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Connector line (desktop) */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-brand-200 lg:block" />
              )}

              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-brand-100">
                <step.icon className="h-7 w-7 text-brand-700" />
              </div>
              <h3 className="text-lg font-bold text-brand-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
