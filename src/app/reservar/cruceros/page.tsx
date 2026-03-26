import type { Metadata } from "next";
import Link from "next/link";
import { BRAND_NAME } from "@/lib/constants";
import { CruiseBookingForm } from "@/components/booking/CruiseBookingForm";
import { Ship, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: `Reservar — Terminal de Cruceros — ${BRAND_NAME}`,
  description:
    "Reservá tu lugar de estacionamiento con traslado a la terminal de cruceros de Buenos Aires.",
};

export default function CruiseBookingPage() {
  return (
    <div className="section-padding">
      <div className="container-main max-w-3xl">
        <Link
          href="/servicios/terminal-cruceros"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al servicio
        </Link>

        <div className="mb-8">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <Ship className="h-6 w-6 text-violet-600" />
          </div>
          <h1 className="text-3xl font-bold text-brand-900">
            Reservar — Terminal de Cruceros
          </h1>
          <p className="mt-2 text-brand-500">
            Completá tus datos para reservar el estacionamiento con traslado
            a la terminal de cruceros.
          </p>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm md:p-8">
          <CruiseBookingForm />
        </div>
      </div>
    </div>
  );
}
