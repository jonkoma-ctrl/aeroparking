import {
  Shield,
  Clock,
  MapPin,
  Headphones,
  CreditCard,
  Star,
} from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Seguridad garantizada",
    description:
      "Vigilancia 24 horas, cámaras de seguridad y seguro incluido para tu vehículo.",
  },
  {
    icon: Clock,
    title: "Reserva rápida",
    description:
      "Proceso simple y rápido. Reservá en minutos desde cualquier dispositivo.",
  },
  {
    icon: MapPin,
    title: "Traslado incluido",
    description:
      "Te llevamos al aeropuerto o terminal de cruceros sin costo adicional.",
  },
  {
    icon: Headphones,
    title: "Atención personalizada",
    description:
      "Equipo disponible para coordinar cualquier cambio o necesidad especial.",
  },
  {
    icon: CreditCard,
    title: "Precios transparentes",
    description:
      "Sin costos ocultos. Sabés exactamente lo que pagás antes de reservar.",
  },
  {
    icon: Star,
    title: "Experiencia confiable",
    description:
      "Miles de viajeros confían en nosotros para cuidar su vehículo.",
  },
];

export function Benefits() {
  return (
    <section id="beneficios" className="section-padding bg-white">
      <div className="container-main">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-brand-900 sm:text-4xl">
            ¿Por qué elegirnos?
          </h2>
          <p className="mt-4 text-lg text-brand-500">
            Nos especializamos en que tu viaje empiece y termine sin
            complicaciones.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-brand-100 p-6 transition-colors hover:border-brand-200 hover:bg-brand-50"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900">
                <benefit.icon className="h-5 w-5 text-accent-400" />
              </div>
              <h3 className="text-base font-bold text-brand-900">
                {benefit.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-500">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
