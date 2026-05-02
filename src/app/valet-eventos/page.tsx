import Link from "next/link";
import { Phone, Mail, Truck, Users, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { CONTACT, BRAND_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Valet Parking para eventos | ${BRAND_NAME}`,
  description:
    "Servicio de Valet Parking con personal propio uniformado para galas, fiestas, shows y eventos privados.",
};

const eventTypes = [
  "Gala",
  "Fiesta",
  "Show / Sector VIP",
  "Desfile",
  "Cocktail",
  "Cena",
  "Muestra",
  "Otro",
];

const features = [
  {
    icon: Users,
    title: "Personal propio uniformado",
    description: "Equipo formado, con vestimenta acorde al tipo de evento.",
  },
  {
    icon: Truck,
    title: "Vehículos propios",
    description: "Flota propia para mover y custodiar las unidades.",
  },
  {
    icon: MapPin,
    title: "Logística adaptada",
    description: "Coordinamos según el espacio y la distancia al evento.",
  },
  {
    icon: Calendar,
    title: "Cotización por evento",
    description: "Cada caso se cotiza según duración, vehículos esperados y locación.",
  },
];

export default function ValetEventosPage() {
  return (
    <main className="min-h-[80vh] bg-brand-50">
      {/* Hero */}
      <section className="bg-brand-950 py-16 text-white sm:py-24">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-500/20 px-5 py-2 text-sm font-semibold text-accent-300">
              <Truck className="h-4 w-4" />
              Valet Parking para eventos
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Tu evento, sin preocuparte por dónde estacionan tus invitados
            </h1>
            <p className="mt-4 text-lg text-brand-200">
              Operamos con personal propio uniformado para galas, fiestas, shows,
              desfiles y eventos privados. Cada caso se cotiza según el tipo y la
              escala del evento.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-brand-200 bg-white p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-900 text-accent-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-brand-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-500">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA contacto */}
      <section className="pb-20">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-brand-200 bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">
              Pedí tu cotización
            </h2>
            <p className="mt-2 text-brand-600">
              Contanos lugar del evento, fecha, horario, cantidad de vehículos y
              de personas. Volvemos con una propuesta a medida.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <a
                href={`tel:+${CONTACT.whatsapp}`}
                className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 transition-colors hover:border-brand-900 hover:bg-brand-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-brand-500">
                    Teléfono / WhatsApp
                  </div>
                  <div className="font-bold text-brand-900">{CONTACT.phone}</div>
                </div>
              </a>
              <a
                href={`mailto:${CONTACT.email}?subject=Cotizaci%C3%B3n%20Valet%20Eventos`}
                className="flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 transition-colors hover:border-brand-900 hover:bg-brand-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-brand-500">Mail</div>
                  <div className="truncate font-bold text-brand-900">{CONTACT.email}</div>
                </div>
              </a>
            </div>

            <div className="mt-6 rounded-xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-600">
              <strong className="text-brand-900">Tipos de evento que cubrimos:</strong>{" "}
              {eventTypes.join(", ")}.
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 transition-colors hover:text-brand-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
