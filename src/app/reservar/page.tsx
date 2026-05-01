import Link from "next/link";
import { Phone, Mail, ArrowRight } from "lucide-react";
import { CONTACT, BRAND_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Reservar — ${BRAND_NAME}`,
  description:
    "Reservá tu estacionamiento con traslado a Aeroparque, Ezeiza o Terminal de Cruceros.",
};

const destinationLabels: Record<string, string> = {
  aeroparque: "Aeroparque Jorge Newbery",
  ezeiza: "Aeropuerto de Ezeiza",
  cruceros: "Terminal de Cruceros",
};

interface PageProps {
  searchParams: Promise<{ destino?: string }>;
}

export default async function ReservarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const destino = params.destino;
  const destinoLabel = destino ? destinationLabels[destino] : null;

  return (
    <main className="min-h-[80vh] bg-brand-50 py-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-brand-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-500">
            Reservá tu estacionamiento
          </div>
          <h1 className="text-3xl font-extrabold text-brand-900 sm:text-4xl">
            {destinoLabel ? `Viajás a ${destinoLabel}` : "Elegí tu destino"}
          </h1>
          <p className="mt-3 text-base text-brand-600">
            Estamos terminando el formulario online. Mientras tanto, podés
            reservar de forma directa por teléfono o WhatsApp — atendemos las
            24 horas.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={`tel:+${CONTACT.whatsapp}`}
              className="group flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 transition-all hover:border-brand-900 hover:bg-brand-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-brand-500">
                  Llamar / WhatsApp
                </div>
                <div className="font-bold text-brand-900">
                  {CONTACT.phone}
                </div>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT.email}?subject=Reserva%20${destino ?? ""}`}
              className="group flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-5 transition-all hover:border-brand-900 hover:bg-brand-100"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-900 text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wide text-brand-500">
                  Mail
                </div>
                <div className="truncate font-bold text-brand-900">
                  {CONTACT.email}
                </div>
              </div>
            </a>
          </div>

          {destino === "cruceros" && (
            <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <p className="text-sm text-violet-900">
                Para reservas de Terminal de Cruceros también podés usar
                nuestro formulario actual:
              </p>
              <Link
                href="/reservar/cruceros"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                Reservar Cruceros online
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          <div className="mt-8 rounded-xl bg-brand-50 p-5 text-sm leading-relaxed text-brand-600">
            <strong className="text-brand-900">Datos que vamos a pedirte:</strong>{" "}
            nombre, teléfono, mail, patente, marca y modelo del auto, fecha y
            hora de ingreso/salida, datos del vuelo. Las reservas se aceptan
            con al menos 24 horas de anticipación. Para urgencias,
            llamanos.
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-900"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
