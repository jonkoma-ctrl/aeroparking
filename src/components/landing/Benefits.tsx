import {
  Shield,
  Truck,
  Headphones,
  Award,
  MapPin,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: Award,
    title: "Avalado por nuestra experiencia",
    description:
      "Años cuidando vehículos y trasladando pasajeros. Conocemos cada detalle del servicio.",
  },
  {
    icon: MapPin,
    title: "Sector de estacionamiento propio",
    description:
      "Edificio cubierto en Costa Salguero. Tu auto queda guardado, no en la calle.",
  },
  {
    icon: Truck,
    title: "Vehículos propios para traslado",
    description:
      "No subcontratamos. Te lleva y te trae nuestra propia flota, siempre.",
  },
  {
    icon: Shield,
    title: "Seguridad las 24 horas",
    description:
      "Vigilancia permanente. Ingreso y egreso registrados. Tu vehículo siempre controlado.",
  },
  {
    icon: Users,
    title: "Personal calificado y uniformado",
    description:
      "Equipo formado en atención al cliente, con antecedentes verificados y uniforme.",
  },
  {
    icon: Headphones,
    title: "Atención personalizada",
    description:
      "Hablás con personas, no con bots. Coordinamos cualquier cambio o pedido especial.",
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
            Operación propia de punta a punta. Sin intermediarios, sin sorpresas.
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
